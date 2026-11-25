import { BadRequestException } from '@nestjs/common';
import { QueueService } from '../src/coordinator/queue.service';
import type { EventsService } from '../src/events/events.service';
import type { PrismaService } from '../src/prisma/prisma.service';
import type { AgentExecutorService } from '../src/providers/agent-executor.service';

describe('QueueService', () => {
  const createMocks = () => {
    const prisma = {
      task: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      agentRun: {
        updateMany: jest.fn(),
      },
      project: {
        findUnique: jest.fn(),
      },
      $transaction: jest.fn().mockResolvedValue([]),
    } as unknown as PrismaService;

    const events = {
      publish: jest.fn().mockResolvedValue(undefined),
    } as unknown as EventsService;

    const executor = {
      execute: jest.fn(),
    } as unknown as AgentExecutorService;

    return { prisma, events, executor };
  };

  it('marks RUNNING tasks as INTERRUPTED on startup and preserves partial stdout without auto-retrying', async () => {
    const { prisma, events, executor } = createMocks();
    (prisma.task.findMany as jest.Mock).mockResolvedValueOnce([
      {
        id: 'task-1',
        projectId: 'proj-1',
        title: 'Render scene',
        agentRuns: [{ id: 'run-1', stdout: 'partial frame 12/60' }],
      },
    ]);

    const service = new QueueService(prisma, events, executor);
    const count = await service.recoverInterruptedTasks();

    expect(count).toBe(1);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(events.publish).toHaveBeenCalledWith(
      'task.interrupted',
      'proj-1',
      expect.objectContaining({ taskId: 'task-1' }),
      'task-1',
    );
    expect(executor.execute).not.toHaveBeenCalled();
  });

  it('rejects recoverTask when task is not INTERRUPTED or FAILED', async () => {
    const { prisma, events, executor } = createMocks();
    (prisma.task.findUnique as jest.Mock).mockResolvedValueOnce({
      id: 'task-2',
      status: 'COMPLETED',
    });

    const service = new QueueService(prisma, events, executor);
    await expect(service.recoverTask('task-2')).rejects.toThrow(BadRequestException);
  });

  it('re-queues an INTERRUPTED task only on explicit human recoverTask call', async () => {
    const { prisma, events, executor } = createMocks();
    (prisma.task.findUnique as jest.Mock).mockResolvedValueOnce({
      id: 'task-3',
      projectId: 'proj-1',
      title: 'Generate script',
      status: 'INTERRUPTED',
    });
    (prisma.task.update as jest.Mock).mockResolvedValueOnce({
      id: 'task-3',
      projectId: 'proj-1',
      title: 'Generate script',
      status: 'QUEUED',
    });

    const service = new QueueService(prisma, events, executor);
    const updated = await service.recoverTask('task-3');

    expect(updated.status).toBe('QUEUED');
    expect(events.publish).toHaveBeenCalledWith(
      'task.recovered',
      'proj-1',
      expect.objectContaining({ previousStatus: 'INTERRUPTED' }),
      'task-3',
    );
  });
});
