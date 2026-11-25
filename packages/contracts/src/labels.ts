export type EditorialStage =
  | 'TOPIC'
  | 'RESEARCH'
  | 'SCRIPTS'
  | 'SCRIPT_REVIEW'
  | 'VISUAL_PLANNING'
  | 'PRODUCTION'
  | 'VIDEO_REVIEW'
  | 'COMPLETED';

export type ScriptStatus = 'DRAFT' | 'SELECTED' | 'APPROVED' | 'REPLACED';

export type DeliverableKind =
  | 'RESEARCH_DOC'
  | 'SCRIPT_DOC'
  | 'VISUAL_PLAN'
  | 'STORYBOARD_DOC'
  | 'AUDIO_DOC'
  | 'VIDEO_RENDER';

export interface StageDefinition {
  id: EditorialStage;
  order: number;
  label: string;
  shortDescription: string;
}

export const EDITORIAL_STAGES: StageDefinition[] = [
  { id: 'TOPIC', order: 1, label: 'Temática', shortDescription: 'Definir tema y contexto editorial' },
  { id: 'RESEARCH', order: 2, label: 'Investigación', shortDescription: 'Fuentes y análisis del tema' },
  { id: 'SCRIPTS', order: 3, label: 'Guiones', shortDescription: 'Alternativas disponibles para elegir' },
  { id: 'SCRIPT_REVIEW', order: 4, label: 'Revisión del guion', shortDescription: 'Lectura, ajustes y aprobación' },
  { id: 'VISUAL_PLANNING', order: 5, label: 'Planificación visual', shortDescription: 'Escenas, motion graphics y locución' },
  { id: 'PRODUCTION', order: 6, label: 'Producción', shortDescription: 'Generación de recursos y renderizado' },
  { id: 'VIDEO_REVIEW', order: 7, label: 'Revisión del video', shortDescription: 'Reproducción, ajustes y aprobación' },
  { id: 'COMPLETED', order: 8, label: 'Finalizado', shortDescription: 'Entrega definitiva aprobada' },
];

export const EDITORIAL_STAGE_LABELS: Record<EditorialStage, string> = {
  TOPIC: 'Temática',
  RESEARCH: 'Investigación',
  SCRIPTS: 'Guiones',
  SCRIPT_REVIEW: 'Revisión del guion',
  VISUAL_PLANNING: 'Planificación visual',
  PRODUCTION: 'Producción',
  VIDEO_REVIEW: 'Revisión del video',
  COMPLETED: 'Finalizado',
};

export const SCRIPT_STATUS_LABELS: Record<ScriptStatus, string> = {
  DRAFT: 'Borrador',
  SELECTED: 'Seleccionado',
  APPROVED: 'Aprobado',
  REPLACED: 'Reemplazado',
};

export const TASK_TYPE_LABELS: Record<string, string> = {
  RESEARCH: 'Investigación',
  EDITORIAL_RESEARCH: 'Investigación',
  SCRIPT_GENERATION: 'Generación de guion',
  SCRIPT_REVISION: 'Revisión del guion',
  STORYBOARD: 'Planificación visual',
  VISUAL_DIRECTION: 'Planificación visual',
  ASSET_GENERATION: 'Generación de recursos',
  RENDER: 'Renderizado',
  HYPERFRAMES_RENDER: 'Renderizado',
  VALIDATION: 'Validación',
  CUSTOM_AGENT_TASK: 'Tarea asistida',
};

export const TASK_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  QUEUED: 'Pendiente',
  RUNNING: 'En curso',
  COMPLETED: 'Completado',
  FAILED: 'Requiere atención',
  INTERRUPTED: 'Interrumpido',
  CANCELLED: 'Cancelado',
};

export const DELIVERABLE_KIND_LABELS: Record<DeliverableKind, string> = {
  RESEARCH_DOC: 'Documento de investigación',
  SCRIPT_DOC: 'Guion',
  VISUAL_PLAN: 'Planificación visual',
  STORYBOARD_DOC: 'Storyboard',
  AUDIO_DOC: 'Audio y locución',
  VIDEO_RENDER: 'Video renderizado',
};

export function getStageLabel(stage: string): string {
  return EDITORIAL_STAGE_LABELS[stage as EditorialStage] ?? stage;
}

export function getScriptStatusLabel(status: string): string {
  return SCRIPT_STATUS_LABELS[status as ScriptStatus] ?? status;
}

export function getTaskTypeLabel(type: string): string {
  return TASK_TYPE_LABELS[type] ?? type;
}

export function getTaskStatusLabel(status: string): string {
  return TASK_STATUS_LABELS[status] ?? status;
}

export function getDeliverableKindLabel(kind: string): string {
  return DELIVERABLE_KIND_LABELS[kind as DeliverableKind] ?? kind;
}
