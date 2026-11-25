import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { AgentRuntimeId } from '@socratech/contracts';
import { EventsService } from '../events/events.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto, StageActionDto, UpdateProjectDto, UpdateProjectStatusDto } from './dto';
import { QueueService } from './queue.service';
import { WorkspaceSyncService } from './workspace-sync.service';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventsService,
    private readonly workspaceSync: WorkspaceSyncService,
    private readonly queue: QueueService,
  ) {}

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60);
  }

  private resolveWorkspacesRoot(): string {
    const configured = process.env.WORKSPACES_ROOT ?? path.resolve(process.cwd(), '../../workspaces');
    return path.resolve(configured);
  }

  async list() {
    return this.prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { tasks: true, scriptDrafts: true, deliverables: true } },
      },
    });
  }

  async getById(id: string) {
    const exists = await this.prisma.project.findUnique({ where: { id } });
    if (!exists) {
      throw new NotFoundException(`Project ${id} not found`);
    }

    await this.workspaceSync.syncProjectWorkspace(id);

    return this.prisma.project.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: { createdAt: 'desc' },
          include: {
            agentRuns: { orderBy: { startedAt: 'desc' } },
          },
        },
        scriptDrafts: {
          orderBy: [{ variant: 'asc' }, { version: 'desc' }],
        },
        deliverables: {
          orderBy: [{ stage: 'asc' }, { createdAt: 'desc' }],
        },
      },
    });
  }

  async create(dto: CreateProjectDto) {
    const baseSlug = dto.slug ? this.slugify(dto.slug) : this.slugify(dto.title);
    const slug = baseSlug || `project-${Date.now()}`;
    const existing = await this.prisma.project.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException(`Ya existe una temática con el identificador "${slug}"`);
    }

    const workspacePath = path.join(this.resolveWorkspacesRoot(), slug);
    fs.mkdirSync(workspacePath, { recursive: true });

    const project = await this.prisma.project.create({
      data: {
        slug,
        title: dto.title,
        description: dto.description ?? null,
        editorialContext: dto.editorialContext ?? null,
        editorialStage: 'TOPIC',
        workspacePath,
      },
    });

    await this.events.publish('project.created', project.id, {
      slug: project.slug,
      title: project.title,
      workspacePath: project.workspacePath,
    });

    return project;
  }

  async update(id: string, dto: UpdateProjectDto) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) {
      throw new NotFoundException(`Project ${id} not found`);
    }

    const updated = await this.prisma.project.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.editorialContext !== undefined ? { editorialContext: dto.editorialContext } : {}),
        ...(dto.editorialStage !== undefined ? { editorialStage: dto.editorialStage } : {}),
      },
    });

    await this.events.publish('project.updated', updated.id, {
      editorialStage: updated.editorialStage,
      title: updated.title,
    });

    return updated;
  }

  async updateStatus(id: string, dto: UpdateProjectStatusDto) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) {
      throw new NotFoundException(`Project ${id} not found`);
    }

    const updated = await this.prisma.project.update({
      where: { id },
      data: { status: dto.status },
    });

    await this.events.publish('project.updated', updated.id, {
      status: updated.status,
    });

    return updated;
  }

  async readFile(id: string, relativePath: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) {
      throw new NotFoundException(`Project ${id} not found`);
    }
    return this.workspaceSync.readWorkspaceFile(project.workspacePath, relativePath);
  }

  async selectScript(projectId: string, scriptId: string) {
    const script = await this.prisma.scriptDraft.findFirst({
      where: { id: scriptId, projectId },
    });
    if (!script) {
      throw new NotFoundException('Guion no encontrado para esta temática.');
    }

    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }

    await this.prisma.$transaction([
      this.prisma.scriptDraft.updateMany({
        where: { projectId, status: 'SELECTED' },
        data: { status: 'DRAFT', isSelected: false },
      }),
      this.prisma.scriptDraft.updateMany({
        where: { projectId, id: { not: scriptId } },
        data: { isSelected: false },
      }),
      this.prisma.scriptDraft.update({
        where: { id: scriptId },
        data: {
          status: script.status === 'APPROVED' ? 'APPROVED' : 'SELECTED',
          isSelected: true,
        },
      }),
      this.prisma.project.update({
        where: { id: projectId },
        data: {
          activeScriptId: scriptId,
          editorialStage:
            project.editorialStage === 'TOPIC' ||
            project.editorialStage === 'RESEARCH' ||
            project.editorialStage === 'SCRIPTS'
              ? 'SCRIPT_REVIEW'
              : project.editorialStage,
        },
      }),
    ]);

    await this.events.publish('project.updated', projectId, {
      activeScriptId: scriptId,
      scriptTitle: script.title,
    });

    return this.getById(projectId);
  }

  async approveScript(projectId: string, scriptId: string) {
    const script = await this.prisma.scriptDraft.findFirst({
      where: { id: scriptId, projectId },
    });
    if (!script) {
      throw new NotFoundException('Guion no encontrado para esta temática.');
    }

    await this.prisma.$transaction([
      this.prisma.scriptDraft.updateMany({
        where: { projectId, id: { not: scriptId }, status: { in: ['SELECTED', 'APPROVED'] } },
        data: { status: 'DRAFT', isSelected: false },
      }),
      this.prisma.scriptDraft.update({
        where: { id: scriptId },
        data: { status: 'APPROVED', isSelected: true },
      }),
      this.prisma.project.update({
        where: { id: projectId },
        data: {
          activeScriptId: scriptId,
          approvedScriptId: scriptId,
          editorialStage: 'VISUAL_PLANNING',
        },
      }),
    ]);

    await this.events.publish('project.updated', projectId, {
      approvedScriptId: scriptId,
      editorialStage: 'VISUAL_PLANNING',
    });

    return this.getById(projectId);
  }

  async requestScriptRevision(
    projectId: string,
    scriptId: string,
    notes: string,
    runtime: AgentRuntimeId = 'agy-cli',
  ) {
    const script = await this.prisma.scriptDraft.findFirst({
      where: { id: scriptId, projectId },
    });
    if (!script) {
      throw new NotFoundException('Guion no encontrado para esta temática.');
    }

    const activeTask = await this.prisma.task.findFirst({
      where: { projectId, status: { in: ['QUEUED', 'RUNNING'] } },
    });
    if (activeTask) {
      throw new ConflictException(
        `Ya hay un proceso en curso ("${activeTask.title}"). Esperá a que finalice antes de solicitar otro.`,
      );
    }

    await this.prisma.scriptDraft.update({
      where: { id: scriptId },
      data: { revisionNotes: notes },
    });

    const targetFile = script.filePath ?? `guion-${script.variant.toLowerCase()}-v${script.version + 1}.md`;
    const newVersionFile = targetFile.replace(/(\.v\d+)?\.md$/i, `.v${script.version + 1}.md`);

    return this.queue.enqueueTask({
      projectId,
      type: 'SCRIPT_REVISION',
      title: `Revisión de guion: ${script.title}`,
      runtime,
      prompt: [
        `Revisá el guion "${script.title}" (${script.filePath ?? 'ver contenido adjunto'}) aplicando estas modificaciones solicitadas:`,
        notes,
        `Guardá la nueva versión en "${newVersionFile}" dentro del workspace sin borrar la versión anterior.`,
      ].join('\n\n'),
    });
  }

  async triggerStageAction(
    projectId: string,
    action: 'research' | 'generate-scripts' | 'plan-visual' | 'produce',
    dto: StageActionDto,
  ) {
    const project = await this.getById(projectId);
    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }

    const activeTask = project.tasks.find((t) => t.status === 'QUEUED' || t.status === 'RUNNING');
    if (activeTask) {
      throw new ConflictException(
        `Ya hay un proceso en curso ("${activeTask.title}"). Esperá a que finalice antes de iniciar otro.`,
      );
    }

    const runtime: AgentRuntimeId = dto.runtime ?? 'agy-cli';
    const extra = dto.instructions ? `\n\nIndicaciones adicionales:\n${dto.instructions}` : '';

    if (action === 'research') {
      return this.queue.enqueueTask({
        projectId,
        type: 'EDITORIAL_RESEARCH',
        title: `Investigación editorial: ${project.title}`,
        runtime,
        prompt: [
          `Realizá una investigación editorial concisa y accionable sobre la temática "${project.title}" pensada para un video corto estilo infografía vertical (Reels / TikTok, 9:16, 45–60 segundos).`,
          project.description ? `Descripción: ${project.description}` : '',
          project.editorialContext ? `Contexto editorial: ${project.editorialContext}` : '',
          `Incluí: 1) gancho inicial de 3 segundos, 2) 3 a 4 ideas visuales/datos clave representables como infografía animada, 3) metáfora o ejemplo concreto, 4) cierre/CTA.`,
          `Guardá el documento de investigación en formato Markdown dentro del workspace (por ejemplo "investigacion-${project.slug}.md").`,
        ]
          .filter(Boolean)
          .join('\n') + extra,
      });
    }

    if (action === 'generate-scripts') {
      const researchDocs = project.deliverables.filter((d) => d.kind === 'RESEARCH_DOC').map((d) => d.filePath);
      return this.queue.enqueueTask({
        projectId,
        type: 'SCRIPT_GENERATION',
        title: `Generación de alternativas de guion: ${project.title}`,
        runtime,
        prompt: [
          `Generá DOS alternativas de guion independientes (A y B) en el workspace para "${project.title}".`,
          `REGLA OBLIGATORIA: TODOS los guiones deben ser exclusivamente para videos cortos estilo **infografía animada para Reels / TikTok (vertical 9:16, duración total entre 45 y 60 segundos, ~110–140 palabras de locución, ritmo ágil y Visual-First)**.`,
          `No generes guiones largos ni formatos 16:9.`,
          `Archivos a crear en el workspace:`,
          `1. "borrador-guion-a.md" — Enfoque A (Problema cotidiano → solución visual en infografía, 9:16, 45-60s).`,
          `2. "borrador-guion-b.md" — Enfoque B (Dato/pregunta disruptiva → paso a paso infográfico, 9:16, 45-60s).`,
          `Cada archivo debe incluir al inicio los metadatos exactos: **Formato:** Infografía vertical Reels / TikTok (9:16), **Duración estimada:** 45 – 60 segundos, **Objetivo:** ..., y una tabla por escenas con Tiempo (ej. 0:00–0:05), Visual / Infografía Motion Graphics, y Locución.`,
          researchDocs.length > 0 ? `Basate en la investigación existente: ${researchDocs.join(', ')}.` : '',
        ]
          .filter(Boolean)
          .join('\n') + extra,
      });
    }

    // Visual planning & Production strictly require an active/selected script
    const activeScript =
      project.scriptDrafts.find((s) => s.id === project.approvedScriptId) ??
      project.scriptDrafts.find((s) => s.id === project.activeScriptId);

    if (!activeScript) {
      throw new BadRequestException(
        'Debés seleccionar un guion activo antes de iniciar la planificación visual o producción.',
      );
    }

    if (action === 'plan-visual') {
      return this.queue.enqueueTask({
        projectId,
        type: 'STORYBOARD',
        title: `Planificación visual: ${activeScript.title}`,
        runtime,
        prompt: [
          `Creá la planificación visual y storyboard escena por escena usando EXCLUSIVAMENTE el guion activo:`,
          `- Título: ${activeScript.title}`,
          `- Formato: ${activeScript.format}`,
          `- Archivo en workspace: ${activeScript.filePath ?? 'inline'}`,
          `Guardá el resultado en "storyboard-visual.md" dentro del workspace detallando escenas, motion graphics de Socratech, recursos visuales y pautas de locución.`,
        ].join('\n') + extra,
      });
    }

    return this.queue.enqueueTask({
      projectId,
      type: 'HYPERFRAMES_RENDER',
      title: `Producción audiovisual: ${activeScript.title}`,
      runtime,
      prompt: [
        `Prepará los recursos de producción y composición HyperFrames para el guion activo "${activeScript.title}" (${activeScript.filePath ?? 'inline'}).`,
      ].join('\n') + extra,
    });
  }
}
