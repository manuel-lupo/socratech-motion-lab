import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import {
  CreateProjectDto,
  ReviseScriptDto,
  StageActionDto,
  UpdateProjectDto,
  UpdateProjectStatusDto,
} from './dto';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  list() {
    return this.projects.list();
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.projects.getById(id);
  }

  @Post()
  create(@Body() dto: CreateProjectDto) {
    return this.projects.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projects.update(id, dto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateProjectStatusDto) {
    return this.projects.updateStatus(id, dto);
  }

  @Get(':id/files/content')
  readFile(@Param('id') id: string, @Query('path') filePath: string) {
    return this.projects.readFile(id, filePath);
  }

  @Post(':id/scripts/:scriptId/select')
  selectScript(@Param('id') id: string, @Param('scriptId') scriptId: string) {
    return this.projects.selectScript(id, scriptId);
  }

  @Post(':id/scripts/:scriptId/approve')
  approveScript(@Param('id') id: string, @Param('scriptId') scriptId: string) {
    return this.projects.approveScript(id, scriptId);
  }

  @Post(':id/scripts/:scriptId/revise')
  reviseScript(
    @Param('id') id: string,
    @Param('scriptId') scriptId: string,
    @Body() dto: ReviseScriptDto,
  ) {
    return this.projects.requestScriptRevision(id, scriptId, dto.notes, dto.runtime);
  }

  @Post(':id/actions/:action')
  triggerAction(
    @Param('id') id: string,
    @Param('action') action: 'research' | 'generate-scripts' | 'plan-visual' | 'produce',
    @Body() dto: StageActionDto,
  ) {
    return this.projects.triggerStageAction(id, action, dto);
  }
}
