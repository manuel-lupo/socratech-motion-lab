import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { WsTaskEvent } from '@socratech/contracts';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly prisma: PrismaService,
  ) {}

  async publish(
    event: WsTaskEvent['event'],
    projectId: string,
    payload: Record<string, unknown>,
    taskId?: string,
  ): Promise<void> {
    const envelope: WsTaskEvent = {
      event,
      projectId,
      taskId,
      timestamp: new Date().toISOString(),
      payload,
    };

    await this.prisma.eventLog.create({
      data: {
        projectId,
        taskId: taskId ?? null,
        eventType: event,
        payloadJson: JSON.stringify(payload),
      },
    });

    this.eventEmitter.emit('socratech.event', envelope);
  }
}
