import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CoordinatorModule } from './coordinator/coordinator.module';
import { EditorialModule } from './editorial/editorial.module';
import { EventsModule } from './events/events.module';
import { HealthController } from './health/health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { ProvidersModule } from './providers/providers.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    PrismaModule,
    EventsModule,
    ProvidersModule,
    CoordinatorModule,
    EditorialModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
