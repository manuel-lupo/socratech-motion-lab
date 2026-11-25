import { Module } from '@nestjs/common';
import { ProvidersModule } from '../providers/providers.module';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { QueueService } from './queue.service';
import { TasksController } from './tasks.controller';
import { WorkspaceSyncService } from './workspace-sync.service';

@Module({
  imports: [ProvidersModule],
  controllers: [ProjectsController, TasksController],
  providers: [ProjectsService, QueueService, WorkspaceSyncService],
  exports: [ProjectsService, QueueService, WorkspaceSyncService],
})
export class CoordinatorModule {}
