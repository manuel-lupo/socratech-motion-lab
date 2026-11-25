import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { EditorialService } from './editorial.service';

@Controller('editorial')
export class EditorialController {
  constructor(private readonly editorial: EditorialService) {}

  @Get('knowledge')
  listKnowledge() {
    return this.editorial.listKnowledge();
  }

  @Post('knowledge')
  createKnowledge(@Body() body: { category: string; title: string; content: string; tags?: string[] }) {
    return this.editorial.createKnowledge(body);
  }

  @Get('scripts')
  listScripts(@Query('projectId') projectId?: string) {
    return this.editorial.listScripts(projectId);
  }

  @Post('scripts')
  createScript(@Body() body: { projectId: string; variant: 'A' | 'B'; title: string; body: string }) {
    return this.editorial.createScript(body);
  }

  @Patch('scripts/:id/select')
  selectScript(@Param('id') id: string) {
    return this.editorial.selectScript(id);
  }
}
