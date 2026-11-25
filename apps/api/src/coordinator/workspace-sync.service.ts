import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { PrismaService } from '../prisma/prisma.service';

interface ParsedScriptMeta {
  title: string;
  format: string;
  estimatedDuration: string | null;
  description: string | null;
  variant: 'A' | 'B';
}

@Injectable()
export class WorkspaceSyncService {
  constructor(private readonly prisma: PrismaService) {}

  parseMarkdownTitle(content: string, fallbackName: string): string {
    const match = content.match(/^#\s+(.+)$/m);
    return match ? match[1].trim() : fallbackName;
  }

  parseScriptMetadata(content: string, fileName: string): ParsedScriptMeta {
    const title = this.parseMarkdownTitle(content, fileName.replace(/\.md$/i, ''));
    const formatMatch = content.match(/\*\*Formato:\*\*\s*(.+)/i);
    const durationMatch = content.match(/\*\*Duraci[oó]n estimada:\*\*\s*(.+)/i);
    const objectiveMatch = content.match(/\*\*Objetivo:\*\*\s*(.+)/i);
    const audienceMatch = content.match(/\*\*P[uú]blico objetivo:\*\*\s*(.+)/i);

    const isVariantB = /guion-b|corto|short|\bB\b/i.test(fileName);

    return {
      title,
      format: formatMatch?.[1]?.trim() || 'Infografía vertical Reels / TikTok (9:16)',
      estimatedDuration: durationMatch?.[1]?.trim() || '45 – 60 segundos',
      description: objectiveMatch?.[1]?.trim() || audienceMatch?.[1]?.trim() || null,
      variant: isVariantB ? 'B' : 'A',
    };
  }

  async syncProjectWorkspace(projectId: string): Promise<void> {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project || !fs.existsSync(project.workspacePath)) {
      return;
    }

    const entries = fs.readdirSync(project.workspacePath, { withFileTypes: true });
    let foundResearch = false;
    let foundScripts = 0;

    for (const entry of entries) {
      if (!entry.isFile()) continue;
      const fileName = entry.name;
      const lower = fileName.toLowerCase();
      const fullPath = path.join(project.workspacePath, fileName);

      if (lower.endsWith('.md')) {
        const content = fs.readFileSync(fullPath, 'utf-8');

        if (lower.includes('guion') || lower.includes('script')) {
          foundScripts += 1;
          const meta = this.parseScriptMetadata(content, fileName);
          const existing = await this.prisma.scriptDraft.findFirst({
            where: { projectId: project.id, filePath: fileName },
            orderBy: { version: 'desc' },
          });

          if (!existing) {
            await this.prisma.scriptDraft.create({
              data: {
                projectId: project.id,
                variant: meta.variant,
                version: 1,
                title: meta.title,
                format: meta.format,
                estimatedDuration: meta.estimatedDuration,
                description: meta.description,
                filePath: fileName,
                body: content,
                status: 'DRAFT',
                isSelected: false,
              },
            });
          } else if (existing.body !== content) {
            await this.prisma.scriptDraft.update({
              where: { id: existing.id },
              data: {
                title: meta.title,
                format: meta.format,
                estimatedDuration: meta.estimatedDuration,
                description: meta.description,
                body: content,
              },
            });
          }

          await this.prisma.projectDeliverable.upsert({
            where: { projectId_filePath: { projectId: project.id, filePath: fileName } },
            create: {
              projectId: project.id,
              stage: 'SCRIPTS',
              kind: 'SCRIPT_DOC',
              title: meta.title,
              filePath: fileName,
              summary: `${meta.format}${meta.estimatedDuration ? ` · ${meta.estimatedDuration}` : ''}`,
              status: 'READY',
            },
            update: {
              title: meta.title,
              summary: `${meta.format}${meta.estimatedDuration ? ` · ${meta.estimatedDuration}` : ''}`,
            },
          });
          continue;
        }

        if (lower.includes('investigacion') || lower.includes('research')) {
          foundResearch = true;
          const title = this.parseMarkdownTitle(content, fileName);
          await this.prisma.projectDeliverable.upsert({
            where: { projectId_filePath: { projectId: project.id, filePath: fileName } },
            create: {
              projectId: project.id,
              stage: 'RESEARCH',
              kind: 'RESEARCH_DOC',
              title,
              filePath: fileName,
              summary: content.slice(0, 220).replace(/\s+/g, ' ').trim(),
              status: 'READY',
            },
            update: {
              title,
              summary: content.slice(0, 220).replace(/\s+/g, ' ').trim(),
            },
          });
          continue;
        }

        if (lower.includes('storyboard') || lower.includes('visual') || lower.includes('escena')) {
          const title = this.parseMarkdownTitle(content, fileName);
          await this.prisma.projectDeliverable.upsert({
            where: { projectId_filePath: { projectId: project.id, filePath: fileName } },
            create: {
              projectId: project.id,
              stage: 'VISUAL_PLANNING',
              kind: 'STORYBOARD_DOC',
              title,
              filePath: fileName,
              summary: content.slice(0, 220).replace(/\s+/g, ' ').trim(),
              status: 'READY',
            },
            update: {
              title,
            },
          });
        }
      } else if (lower.endsWith('.mp4')) {
        await this.prisma.projectDeliverable.upsert({
          where: { projectId_filePath: { projectId: project.id, filePath: fileName } },
          create: {
            projectId: project.id,
            stage: 'VIDEO_REVIEW',
            kind: 'VIDEO_RENDER',
            title: fileName,
            filePath: fileName,
            summary: 'Archivo de video generado en el workspace',
            status: 'PENDING_REVIEW',
          },
          update: {},
        });
      }
    }

    // Infer minimum editorial stage when existing artifacts are discovered, without auto-approving
    if (project.editorialStage === 'TOPIC') {
      if (foundScripts > 0) {
        await this.prisma.project.update({
          where: { id: project.id },
          data: { editorialStage: 'SCRIPTS' },
        });
      } else if (foundResearch) {
        await this.prisma.project.update({
          where: { id: project.id },
          data: { editorialStage: 'RESEARCH' },
        });
      }
    }
  }

  readWorkspaceFile(workspacePath: string, relativePath: string): { filePath: string; content: string } {
    const resolvedBase = path.resolve(workspacePath);
    const resolvedTarget = path.resolve(resolvedBase, relativePath);
    if (!resolvedTarget.startsWith(resolvedBase + path.sep)) {
      throw new BadRequestException('Ruta de archivo inválida fuera del workspace.');
    }
    if (!fs.existsSync(resolvedTarget)) {
      throw new NotFoundException(`Archivo no encontrado: ${relativePath}`);
    }
    return {
      filePath: relativePath,
      content: fs.readFileSync(resolvedTarget, 'utf-8'),
    };
  }
}
