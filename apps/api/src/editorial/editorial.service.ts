import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EditorialService {
  constructor(private readonly prisma: PrismaService) {}

  async listKnowledge() {
    const rows = await this.prisma.knowledgeEntry.findMany({
      orderBy: { updatedAt: 'desc' },
    });
    return rows.map((row) => ({
      ...row,
      tags: JSON.parse(row.tagsJson) as string[],
    }));
  }

  async createKnowledge(input: { category: string; title: string; content: string; tags?: string[] }) {
    const row = await this.prisma.knowledgeEntry.create({
      data: {
        category: input.category,
        title: input.title,
        content: input.content,
        tagsJson: JSON.stringify(input.tags ?? []),
      },
    });
    return {
      ...row,
      tags: JSON.parse(row.tagsJson) as string[],
    };
  }

  async listScripts(projectId?: string) {
    return this.prisma.scriptDraft.findMany({
      where: projectId ? { projectId } : undefined,
      orderBy: [{ projectId: 'asc' }, { variant: 'asc' }, { version: 'desc' }],
    });
  }

  async createScript(input: { projectId: string; variant: 'A' | 'B'; title: string; body: string }) {
    const latest = await this.prisma.scriptDraft.findFirst({
      where: { projectId: input.projectId, variant: input.variant },
      orderBy: { version: 'desc' },
    });
    const nextVersion = (latest?.version ?? 0) + 1;
    return this.prisma.scriptDraft.create({
      data: {
        projectId: input.projectId,
        variant: input.variant,
        version: nextVersion,
        title: input.title,
        body: input.body,
      },
    });
  }

  async selectScript(id: string) {
    const draft = await this.prisma.scriptDraft.findUnique({ where: { id } });
    if (!draft) {
      throw new NotFoundException(`ScriptDraft ${id} not found`);
    }
    await this.prisma.$transaction([
      this.prisma.scriptDraft.updateMany({
        where: { projectId: draft.projectId },
        data: { isSelected: false },
      }),
      this.prisma.scriptDraft.update({
        where: { id },
        data: { isSelected: true },
      }),
    ]);
    return this.prisma.scriptDraft.findUnique({ where: { id } });
  }
}
