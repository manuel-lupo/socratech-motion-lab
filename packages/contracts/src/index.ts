export * from './labels';

export type ProjectStatus =
  | 'PLANNING'
  | 'VISUAL_PRODUCTION'
  | 'VISUAL_REVIEW'
  | 'AUDIO_PRODUCTION'
  | 'FINAL_REVIEW'
  | 'APPROVED'
  | 'DELIVERED';

export type TaskStatus =
  | 'QUEUED'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'INTERRUPTED'
  | 'CANCELLED';

export type AgentRuntimeId = 'codex-cli' | 'agy-cli';

export type TaskType =
  | 'EDITORIAL_RESEARCH'
  | 'SCRIPT_GENERATION'
  | 'SCRIPT_REVISION'
  | 'VISUAL_DIRECTION'
  | 'STORYBOARD'
  | 'ASSET_GENERATION'
  | 'HYPERFRAMES_RENDER'
  | 'VALIDATION'
  | 'CUSTOM_AGENT_TASK';

export interface AgentExecutionResult {
  status: 'COMPLETED' | 'FAILED' | 'INTERRUPTED';
  summary: string;
  filesCreatedOrModified: string[];
  validations: Array<{
    name: string;
    passed: boolean;
    details?: string;
  }>;
  errors: string[];
  partialResults?: Record<string, unknown> | null;
  rawOutput?: string;
}

export interface RuntimeCapability {
  id: AgentRuntimeId;
  name: string;
  binary: string;
  available: boolean;
  version: string | null;
  authenticated: boolean | null;
  authDetails: string;
  headlessSupported: boolean;
  headlessCommandExample: string;
  notes: string[];
}

export interface ProjectDeliverableDto {
  id: string;
  projectId: string;
  stage: import('./labels').EditorialStage;
  kind: import('./labels').DeliverableKind;
  title: string;
  filePath: string;
  summary: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDto {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  editorialContext: string | null;
  editorialStage: import('./labels').EditorialStage;
  activeScriptId: string | null;
  approvedScriptId: string | null;
  status: ProjectStatus;
  workspacePath: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    tasks: number;
    scriptDrafts?: number;
    deliverables?: number;
  };
}

export interface AgentRunDto {
  id: string;
  taskId: string;
  runtime: string;
  command: string;
  argsJson: string;
  exitCode: number | null;
  stdout: string;
  stderr: string;
  structuredOutputJson: string | null;
  startedAt: string;
  finishedAt: string | null;
  status: string;
}

export interface TaskDto {
  id: string;
  projectId: string;
  type: TaskType;
  title: string;
  prompt: string;
  runtime: AgentRuntimeId;
  status: TaskStatus;
  priority: number;
  attempts: number;
  lockedBy: string | null;
  startedAt: string | null;
  completedAt: string | null;
  interruptedAt: string | null;
  error: string | null;
  resultJson: string | null;
  createdAt: string;
  updatedAt: string;
  agentRuns?: AgentRunDto[];
}

export interface KnowledgeEntryDto {
  id: string;
  category: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ScriptDraftDto {
  id: string;
  projectId: string;
  variant: 'A' | 'B' | string;
  version: number;
  title: string;
  format: string;
  estimatedDuration: string | null;
  description: string | null;
  filePath: string | null;
  body: string;
  status: import('./labels').ScriptStatus;
  revisionNotes: string | null;
  isSelected: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WsTaskEvent {
  event:
    | 'task.created'
    | 'task.started'
    | 'task.progress'
    | 'task.completed'
    | 'task.failed'
    | 'task.interrupted'
    | 'task.recovered'
    | 'project.created'
    | 'project.updated';
  projectId: string;
  taskId?: string;
  timestamp: string;
  payload: Record<string, unknown>;
}
