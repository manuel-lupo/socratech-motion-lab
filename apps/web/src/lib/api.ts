import type {
  AgentRuntimeId,
  EditorialStage,
  KnowledgeEntryDto,
  ProjectDeliverableDto,
  ProjectDto,
  RuntimeCapability,
  ScriptDraftDto,
  TaskDto,
  TaskType,
} from '@socratech/contracts';

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export type ProjectDetailResponse = ProjectDto & {
  tasks: TaskDto[];
  scriptDrafts: ScriptDraftDto[];
  deliverables: ProjectDeliverableDto[];
};

export const api = {
  health: () => request<{ status: string; database: string; timestamp: string }>('/health'),
  listRuntimes: () => request<RuntimeCapability[]>('/providers/runtimes'),
  listProjects: () => request<ProjectDto[]>('/projects'),
  getProject: (id: string) => request<ProjectDetailResponse>(`/projects/${id}`),
  createProject: (body: { title: string; description?: string; editorialContext?: string; slug?: string }) =>
    request<ProjectDto>('/projects', { method: 'POST', body: JSON.stringify(body) }),
  updateProject: (
    id: string,
    body: { title?: string; description?: string; editorialContext?: string; editorialStage?: EditorialStage },
  ) => request<ProjectDto>(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  readProjectFile: (id: string, filePath: string) =>
    request<{ filePath: string; content: string }>(
      `/projects/${id}/files/content?path=${encodeURIComponent(filePath)}`,
    ),
  selectScript: (projectId: string, scriptId: string) =>
    request<ProjectDetailResponse>(`/projects/${projectId}/scripts/${scriptId}/select`, { method: 'POST' }),
  approveScript: (projectId: string, scriptId: string) =>
    request<ProjectDetailResponse>(`/projects/${projectId}/scripts/${scriptId}/approve`, { method: 'POST' }),
  reviseScript: (projectId: string, scriptId: string, body: { notes: string; runtime?: AgentRuntimeId }) =>
    request<TaskDto>(`/projects/${projectId}/scripts/${scriptId}/revise`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  triggerStageAction: (
    projectId: string,
    action: 'research' | 'generate-scripts' | 'plan-visual' | 'produce',
    body: { runtime?: AgentRuntimeId; instructions?: string } = {},
  ) =>
    request<TaskDto>(`/projects/${projectId}/actions/${action}`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  listTasks: (projectId?: string) =>
    request<TaskDto[]>(projectId ? `/tasks?projectId=${encodeURIComponent(projectId)}` : '/tasks'),
  createTask: (body: {
    projectId: string;
    type: TaskType;
    title: string;
    prompt: string;
    runtime: AgentRuntimeId;
    priority?: number;
  }) => request<TaskDto>('/tasks', { method: 'POST', body: JSON.stringify(body) }),
  recoverTask: (id: string) => request<TaskDto>(`/tasks/${id}/recover`, { method: 'POST' }),
  cancelTask: (id: string) => request<TaskDto>(`/tasks/${id}/cancel`, { method: 'POST' }),
  listKnowledge: () => request<KnowledgeEntryDto[]>('/editorial/knowledge'),
  createKnowledge: (body: { category: string; title: string; content: string; tags?: string[] }) =>
    request<KnowledgeEntryDto>('/editorial/knowledge', { method: 'POST', body: JSON.stringify(body) }),
};
