import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
  Optional,
} from '@nestjs/common';
import type { AgentRuntimeId } from '@socratech/contracts';
import { EventsService } from '../events/events.service';
import { PrismaService } from '../prisma/prisma.service';
import { AgentExecutorService } from '../providers/agent-executor.service';
import { CreateTaskDto } from './dto';
import { WorkspaceSyncService } from './workspace-sync.service';

@Injectable()
export class QueueService implements OnModuleInit {
  private readonly logger = new Logger(QueueService.name);
  private readonly activeRunners = new Set<string>();
  private dispatching = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventsService,
    private readonly executor: AgentExecutorService,
    @Optional() private readonly workspaceSync?: WorkspaceSyncService,
  ) {}

  getMaxParallelProjects(): number {
    const parsed = Number(process.env.MAX_PARALLEL_PROJECTS ?? 2);
    return Number.isFinite(parsed) && parsed >= 1 ? Math.floor(parsed) : 2;
  }

  async onModuleInit(): Promise<void> {
    await this.recoverInterruptedTasks();
    // Do NOT auto-execute interrupted tasks; only dispatch explicitly queued tasks if any
    void this.dispatchPendingTasks();
  }

  /**
   * Startup recovery: any task or agentRun left in RUNNING state from a previous crash/restart
   * is marked INTERRUPTED, preserving partial outputs and waiting for human intervention.
   */
  async recoverInterruptedTasks(): Promise<number> {
    const runningTasks = await this.prisma.task.findMany({
      where: { status: 'RUNNING' },
      include: {
        agentRuns: {
          where: { status: 'RUNNING' },
        },
      },
    });

    if (runningTasks.length === 0) {
      return 0;
    }

    const now = new Date();
    for (const task of runningTasks) {
      const latestRun = task.agentRuns[0];
      const partialPayload = {
        status: 'INTERRUPTED',
        summary: 'Ejecución interrumpida por reinicio del coordinador. Esperando intervención humana.',
        filesCreatedOrModified: [],
        validations: [],
        errors: ['Process interrupted by coordinator restart'],
        partialResults: latestRun?.stdout
          ? { partialStdout: latestRun.stdout.slice(0, 4000), agentRunId: latestRun.id }
          : null,
      };

      await this.prisma.$transaction([
        this.prisma.agentRun.updateMany({
          where: { taskId: task.id, status: 'RUNNING' },
          data: {
            status: 'INTERRUPTED',
            finishedAt: now,
          },
        }),
        this.prisma.task.update({
          where: { id: task.id },
          data: {
            status: 'INTERRUPTED',
            interruptedAt: now,
            lockedBy: null,
            error: 'Ejecución interrumpida por reinicio del sistema. Requiere recuperación manual.',
            resultJson: JSON.stringify(partialPayload),
          },
        }),
      ]);

      await this.events.publish(
        'task.interrupted',
        task.projectId,
        {
          taskId: task.id,
          title: task.title,
          reason: 'Coordinator restart recovery',
        },
        task.id,
      );
    }

    this.logger.warn(`Marked ${runningTasks.length} running task(s) as INTERRUPTED on startup.`);
    return runningTasks.length;
  }

  async listTasks(projectId?: string) {
    return this.prisma.task.findMany({
      where: projectId ? { projectId } : undefined,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      include: {
        project: { select: { id: true, slug: true, title: true } },
        agentRuns: { orderBy: { startedAt: 'desc' }, take: 3 },
      },
    });
  }

  async getTask(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        project: true,
        agentRuns: { orderBy: { startedAt: 'desc' } },
      },
    });
    if (!task) {
      throw new NotFoundException(`Task ${id} not found`);
    }
    return task;
  }

  async enqueueTask(dto: CreateTaskDto) {
    const project = await this.prisma.project.findUnique({ where: { id: dto.projectId } });
    if (!project) {
      throw new NotFoundException(`Project ${dto.projectId} not found`);
    }

    const task = await this.prisma.task.create({
      data: {
        projectId: dto.projectId,
        type: dto.type,
        title: dto.title,
        prompt: dto.prompt,
        runtime: dto.runtime,
        priority: dto.priority ?? 0,
        status: 'QUEUED',
      },
    });

    await this.events.publish(
      'task.created',
      task.projectId,
      { title: task.title, runtime: task.runtime, status: task.status },
      task.id,
    );

    void this.dispatchPendingTasks();
    return task;
  }

  async recoverTask(id: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task ${id} not found`);
    }
    if (task.status !== 'INTERRUPTED' && task.status !== 'FAILED') {
      throw new BadRequestException(
        `Solo pueden recuperarse tareas en estado INTERRUPTED o FAILED (actual: ${task.status}).`,
      );
    }

    const updated = await this.prisma.task.update({
      where: { id },
      data: {
        status: 'QUEUED',
        error: null,
        interruptedAt: null,
      },
    });

    await this.events.publish(
      'task.recovered',
      updated.projectId,
      { title: updated.title, previousStatus: task.status },
      updated.id,
    );

    void this.dispatchPendingTasks();
    return updated;
  }

  async cancelTask(id: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task ${id} not found`);
    }
    if (task.status === 'RUNNING') {
      throw new BadRequestException('No se puede cancelar directamente una tarea en ejecución activa.');
    }

    return this.prisma.task.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  /**
   * Dispatches QUEUED tasks respecting:
   * 1. At most 1 RUNNING task per project
   * 2. At most MAX_PARALLEL_PROJECTS active projects concurrently
   */
  async dispatchPendingTasks(): Promise<void> {
    if (this.dispatching) return;
    this.dispatching = true;

    try {
      const maxParallel = this.getMaxParallelProjects();
      const runningTasks = await this.prisma.task.findMany({
        where: { status: 'RUNNING' },
        select: { id: true, projectId: true },
      });

      const busyProjects = new Set(runningTasks.map((t) => t.projectId));
      if (busyProjects.size >= maxParallel) {
        return;
      }

      const queuedTasks = await this.prisma.task.findMany({
        where: { status: 'QUEUED' },
        orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
        include: { project: true },
      });

      for (const candidate of queuedTasks) {
        if (busyProjects.size >= maxParallel) break;
        if (busyProjects.has(candidate.projectId)) continue;
        if (this.activeRunners.has(candidate.id)) continue;

        // Claim atomically only if still QUEUED
        const workerId = `coordinator-${process.pid}`;
        const claimed = await this.prisma.task.updateMany({
          where: { id: candidate.id, status: 'QUEUED' },
          data: {
            status: 'RUNNING',
            lockedBy: workerId,
            startedAt: new Date(),
            attempts: { increment: 1 },
          },
        });

        if (claimed.count === 0) continue;

        busyProjects.add(candidate.projectId);
        this.activeRunners.add(candidate.id);
        void this.runTask(candidate.id, candidate.project.workspacePath);
      }
    } finally {
      this.dispatching = false;
    }
  }

  private async runTask(taskId: string, workspacePath: string): Promise<void> {
    try {
      const task = await this.prisma.task.findUnique({ where: { id: taskId } });
      if (!task) return;

      const agentRun = await this.prisma.agentRun.create({
        data: {
          taskId: task.id,
          runtime: task.runtime,
          command: task.runtime === 'codex-cli' ? 'codex' : 'agy',
          argsJson: '[]',
          status: 'RUNNING',
        },
      });

      await this.events.publish(
        'task.started',
        task.projectId,
        { title: task.title, runtime: task.runtime, agentRunId: agentRun.id },
        task.id,
      );

      const outcome = await this.executor.execute({
        runtime: task.runtime as AgentRuntimeId,
        prompt: task.prompt,
        taskTitle: task.title,
        taskType: task.type,
        workspacePath,
        onOutputChunk: (chunk) => {
          void this.events.publish(
            'task.progress',
            task.projectId,
            { chunk: chunk.slice(0, 500), agentRunId: agentRun.id },
            task.id,
          );
        },
      });

      const finishedAt = new Date();
      const succeeded = outcome.result.status === 'COMPLETED';

      await this.prisma.$transaction([
        this.prisma.agentRun.update({
          where: { id: agentRun.id },
          data: {
            command: outcome.command,
            argsJson: JSON.stringify(outcome.args),
            exitCode: outcome.exitCode,
            stdout: outcome.stdout,
            stderr: outcome.stderr,
            structuredOutputJson: JSON.stringify(outcome.result),
            finishedAt,
            status: succeeded ? 'COMPLETED' : 'FAILED',
          },
        }),
        this.prisma.task.update({
          where: { id: task.id },
          data: {
            status: succeeded ? 'COMPLETED' : 'FAILED',
            completedAt: succeeded ? finishedAt : null,
            lockedBy: null,
            error: succeeded ? null : outcome.result.errors.join(' | ') || outcome.result.summary,
            resultJson: JSON.stringify(outcome.result),
          },
        }),
      ]);

      if (succeeded && this.workspaceSync) {
        await this.workspaceSync.syncProjectWorkspace(task.projectId);
      }

      await this.events.publish(
        succeeded ? 'task.completed' : 'task.failed',
        task.projectId,
        {
          title: task.title,
          summary: outcome.result.summary,
          errors: outcome.result.errors,
        },
        task.id,
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Unexpected error running task ${taskId}: ${message}`);
      const task = await this.prisma.task.findUnique({ where: { id: taskId } });
      if (task) {
        await this.prisma.task.update({
          where: { id: taskId },
          data: {
            status: 'FAILED',
            lockedBy: null,
            error: message,
          },
        });
        await this.events.publish('task.failed', task.projectId, { error: message }, task.id);
      }
    } finally {
      this.activeRunners.delete(taskId);
      void this.dispatchPendingTasks();
    }
  }
}
