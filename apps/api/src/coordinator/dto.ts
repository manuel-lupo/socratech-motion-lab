import { IsIn, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';
import type { AgentRuntimeId, EditorialStage, ProjectStatus, TaskType } from '@socratech/contracts';

export class CreateProjectDto {
  @IsString()
  @MinLength(2)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  editorialContext?: string;

  @IsOptional()
  @IsString()
  slug?: string;
}

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  editorialContext?: string;

  @IsOptional()
  @IsIn([
    'TOPIC',
    'RESEARCH',
    'SCRIPTS',
    'SCRIPT_REVIEW',
    'VISUAL_PLANNING',
    'PRODUCTION',
    'VIDEO_REVIEW',
    'COMPLETED',
  ])
  editorialStage?: EditorialStage;
}

export class UpdateProjectStatusDto {
  @IsIn([
    'PLANNING',
    'VISUAL_PRODUCTION',
    'VISUAL_REVIEW',
    'AUDIO_PRODUCTION',
    'FINAL_REVIEW',
    'APPROVED',
    'DELIVERED',
  ])
  status!: ProjectStatus;
}

export class CreateTaskDto {
  @IsString()
  projectId!: string;

  @IsIn([
    'EDITORIAL_RESEARCH',
    'SCRIPT_GENERATION',
    'SCRIPT_REVISION',
    'VISUAL_DIRECTION',
    'STORYBOARD',
    'ASSET_GENERATION',
    'HYPERFRAMES_RENDER',
    'VALIDATION',
    'CUSTOM_AGENT_TASK',
  ])
  type!: TaskType;

  @IsString()
  @MinLength(2)
  title!: string;

  @IsString()
  @MinLength(2)
  prompt!: string;

  @IsIn(['codex-cli', 'agy-cli'])
  runtime!: AgentRuntimeId;

  @IsOptional()
  @IsInt()
  @Min(0)
  priority?: number;
}

export class ReviseScriptDto {
  @IsString()
  @MinLength(3)
  notes!: string;

  @IsOptional()
  @IsIn(['codex-cli', 'agy-cli'])
  runtime?: AgentRuntimeId;
}

export class StageActionDto {
  @IsOptional()
  @IsIn(['codex-cli', 'agy-cli'])
  runtime?: AgentRuntimeId;

  @IsOptional()
  @IsString()
  instructions?: string;
}
