import { BadRequestException } from '@nestjs/common';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { ProjectsService } from '../src/coordinator/projects.service';
import { WorkspaceSyncService } from '../src/coordinator/workspace-sync.service';
import type { QueueService } from '../src/coordinator/queue.service';
import type { EventsService } from '../src/events/events.service';
import type { PrismaService } from '../src/prisma/prisma.service';

describe('WorkspaceSyncService & Editorial Flow', () => {
  it('parses vertical Reels/TikTok infographic script metadata accurately', () => {
    const sync = new WorkspaceSyncService({} as PrismaService);

    const metaA = sync.parseScriptMetadata(
      '# Guion A: ¿Qué es un ERP?\n**Formato:** Infografía vertical Reels / TikTok (9:16)\n**Duración estimada:** 45 – 60 segundos',
      'borrador-guion-a.md',
    );
    expect(metaA.variant).toBe('A');
    expect(metaA.format).toContain('9:16');
    expect(metaA.estimatedDuration).toContain('45 – 60 segundos');

    const metaB = sync.parseScriptMetadata(
      '# Guion B: Tu empresa en una pantalla\n**Formato:** Infografía vertical Reels / TikTok (9:16)\n**Duración estimada:** 45 – 55 segundos',
      'borrador-guion-b.md',
    );
    expect(metaB.variant).toBe('B');
    expect(metaB.format).toContain('9:16');
    expect(metaB.estimatedDuration).toContain('45 – 55 segundos');
  });

  it('reads workspace script file and blocks path traversal', () => {
    const sync = new WorkspaceSyncService({} as PrismaService);
    const tmpWs = fs.mkdtempSync(path.join(os.tmpdir(), 'st-ws-test-'));
    try {
      fs.writeFileSync(path.join(tmpWs, 'borrador-guion-a.md'), '# Guion A\nContenido Reels 9:16', 'utf-8');
      const file = sync.readWorkspaceFile(tmpWs, 'borrador-guion-a.md');
      expect(file.content).toContain('Contenido Reels 9:16');
      expect(() => sync.readWorkspaceFile(tmpWs, '../secret.txt')).toThrow(BadRequestException);
    } finally {
      fs.rmSync(tmpWs, { recursive: true, force: true });
    }
  });

  it('requires an active script before planning visual stage and uses active script when selected', async () => {
    const prisma = {
      project: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'p1',
          slug: 'que-es-un-erp',
          title: 'Que es un ERP?',
          editorialStage: 'SCRIPTS',
          activeScriptId: null,
          approvedScriptId: null,
          workspacePath: '/tmp/nonexistent-ws',
          tasks: [],
          scriptDrafts: [
            { id: 's1', title: 'Guion Principal', format: '16:9', filePath: 'borrador-guion-principal.md', status: 'DRAFT' },
          ],
          deliverables: [],
        }),
      },
    } as unknown as PrismaService;

    const events = { publish: jest.fn() } as unknown as EventsService;
    const sync = { syncProjectWorkspace: jest.fn() } as unknown as WorkspaceSyncService;
    const queue = { enqueueTask: jest.fn().mockResolvedValue({ id: 'task-99' }) } as unknown as QueueService;

    const service = new ProjectsService(prisma, events, sync, queue);

    await expect(service.triggerStageAction('p1', 'plan-visual', {})).rejects.toThrow(BadRequestException);

    (prisma.project.findUnique as jest.Mock).mockResolvedValue({
      id: 'p1',
      slug: 'que-es-un-erp',
      title: 'Que es un ERP?',
      editorialStage: 'SCRIPT_REVIEW',
      activeScriptId: 's1',
      approvedScriptId: null,
      workspacePath: '/tmp/nonexistent-ws',
      tasks: [],
      scriptDrafts: [
        { id: 's1', title: 'Guion Principal', format: '16:9', filePath: 'borrador-guion-principal.md', status: 'SELECTED' },
      ],
      deliverables: [],
    });

    const task = await service.triggerStageAction('p1', 'plan-visual', { runtime: 'agy-cli' });
    expect(task.id).toBe('task-99');
    expect(queue.enqueueTask).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'STORYBOARD',
        prompt: expect.stringContaining('borrador-guion-principal.md'),
      }),
    );
  });
});
