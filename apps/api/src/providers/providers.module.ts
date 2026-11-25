import { Module } from '@nestjs/common';
import { AgentExecutorService } from './agent-executor.service';
import { ProvidersController } from './providers.controller';
import { RuntimeRegistryService } from './runtime-registry.service';

@Module({
  controllers: [ProvidersController],
  providers: [RuntimeRegistryService, AgentExecutorService],
  exports: [RuntimeRegistryService, AgentExecutorService],
})
export class ProvidersModule {}
