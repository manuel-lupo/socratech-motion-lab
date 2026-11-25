import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CreateTaskDto } from './dto';
import { QueueService } from './queue.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly queue: QueueService) {}

  @Get()
  list(@Query('projectId') projectId?: string) {
    return this.queue.listTasks(projectId);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.queue.getTask(id);
  }

  @Post()
  create(@Body() dto: CreateTaskDto) {
    return this.queue.enqueueTask(dto);
  }

  @Post(':id/recover')
  recover(@Param('id') id: string) {
    return this.queue.recoverTask(id);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.queue.cancelTask(id);
  }
}
