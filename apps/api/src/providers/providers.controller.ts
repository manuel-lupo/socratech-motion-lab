import { Controller, Get } from '@nestjs/common';
import { RuntimeRegistryService } from './runtime-registry.service';

@Controller('providers')
export class ProvidersController {
  constructor(private readonly registry: RuntimeRegistryService) {}

  @Get('runtimes')
  listRuntimes() {
    return this.registry.listRuntimes();
  }
}
