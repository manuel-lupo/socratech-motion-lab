import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import {
  EDITORIAL_STAGES,
  type AgentRuntimeId,
  type EditorialStage,
  type ScriptDraftDto,
  getDeliverableKindLabel,
  getScriptStatusLabel,
  getStageLabel,
  getTaskStatusLabel,
  getTaskTypeLabel,
} from '@socratech/contracts';
import { EditorialDivider } from '@socratech/brand';
import { MarkdownViewer } from '../components/MarkdownViewer';
import { api } from '../lib/api';
import { useUiStore } from '../store/ui.store';

function statusBadgeStyle(status: string): React.CSSProperties {
  switch (status) {
    case 'APPROVED':
    case 'COMPLETED':
      return { backgroundColor: '#CEEF62', color: '#101A39', border: '1px solid #10204D' };
    case 'SELECTED':
    case 'RUNNING':
      return { backgroundColor: '#10204D', color: '#CEEF62', border: '1px solid #CEEF62' };
    case 'FAILED':
    case 'INTERRUPTED':
      return { backgroundColor: '#FDE8E8', color: '#C0392B', border: '1px solid #C0392B' };
    case 'REPLACED':
      return { backgroundColor: '#EEF1F6', color: '#56607B', border: '1px solid #949EB9' };
    default:
      return { backgroundColor: 'rgba(148, 158, 185, 0.16)', color: '#121D42', border: '1px solid #949EB9' };
  }
}

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const projectQuery = useQuery({
    queryKey: ['project', id],
    queryFn: () => api.getProject(id!),
    enabled: Boolean(id),
    refetchInterval: (query) => {
      const tasks = query.state.data?.tasks ?? [];
      const running = tasks.some((t) => t.status === 'RUNNING' || t.status === 'QUEUED');
      return running ? 1500 : 5000;
    },
  });

  const runtimesQuery = useQuery({ queryKey: ['runtimes'], queryFn: api.listRuntimes });
  const liveEvents = useUiStore((s) => s.events);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const [viewedStage, setViewedStage] = useState<EditorialStage | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editContext, setEditContext] = useState('');
  const [readerDoc, setReaderDoc] = useState<{ title: string; content: string } | null>(null);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [selectedRuntime, setSelectedRuntime] = useState<AgentRuntimeId>('agy-cli');
  const [showTechnical, setShowTechnical] = useState(false);

  const project = projectQuery.data;

  useEffect(() => {
    if (project) {
      setEditTitle(project.title);
      setEditDescription(project.description ?? '');
      setEditContext(project.editorialContext ?? '');
      if (!viewedStage) {
        setViewedStage(project.editorialStage);
      }
    }
  }, [project?.id]);

  const invalidateProject = () => {
    void queryClient.invalidateQueries({ queryKey: ['project', id] });
    void queryClient.invalidateQueries({ queryKey: ['projects'] });
  };

  const updateProject = useMutation({
    mutationFn: (body: { title?: string; description?: string; editorialContext?: string; editorialStage?: EditorialStage }) =>
      api.updateProject(id!, body),
    onSuccess: invalidateProject,
  });

  const selectScript = useMutation({
    mutationFn: (scriptId: string) => api.selectScript(id!, scriptId),
    onSuccess: (updated) => {
      invalidateProject();
      setViewedStage(updated.editorialStage);
    },
  });

  const approveScript = useMutation({
    mutationFn: (scriptId: string) => api.approveScript(id!, scriptId),
    onSuccess: (updated) => {
      invalidateProject();
      setViewedStage(updated.editorialStage);
    },
  });

  const reviseScript = useMutation({
    mutationFn: ({ scriptId, notes }: { scriptId: string; notes: string }) =>
      api.reviseScript(id!, scriptId, { notes, runtime: selectedRuntime }),
    onSuccess: () => {
      setRevisionNotes('');
      invalidateProject();
    },
  });

  const triggerAction = useMutation({
    mutationFn: (action: 'research' | 'generate-scripts' | 'plan-visual' | 'produce') =>
      api.triggerStageAction(id!, action, { runtime: selectedRuntime }),
    onSuccess: invalidateProject,
  });

  const recoverTask = useMutation({
    mutationFn: api.recoverTask,
    onSuccess: invalidateProject,
  });

  const openWorkspaceFile = async (title: string, filePath: string) => {
    const res = await api.readProjectFile(id!, filePath);
    setReaderDoc({ title, content: res.content });
  };

  if (projectQuery.isLoading) return <div>Cargando temática...</div>;
  if (projectQuery.isError || !project) {
    return (
      <div className="st-card" style={{ padding: 24 }}>
        No se pudo cargar la temática. <Link to="/">Volver al inicio</Link>
      </div>
    );
  }

  const currentStage = viewedStage ?? project.editorialStage;
  const activeTasks = project.tasks.filter((t) => t.status === 'RUNNING' || t.status === 'QUEUED');
  const hasActiveTask = activeTasks.length > 0;
  const isActionBusy = hasActiveTask || triggerAction.isPending || reviseScript.isPending;
  const attentionTasks = project.tasks.filter((t) => t.status === 'FAILED' || t.status === 'INTERRUPTED');
  const latestProjectEvent = liveEvents.find((ev) => ev.projectId === project.id);

  useEffect(() => {
    if (!hasActiveTask) return;
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [hasActiveTask]);

  const formatElapsed = (iso: string | null): string => {
    if (!iso) return '0s';
    const secs = Math.max(0, Math.floor((nowMs - new Date(iso).getTime()) / 1000));
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const researchDocs = project.deliverables.filter((d) => d.kind === 'RESEARCH_DOC');
  const visualDocs = project.deliverables.filter(
    (d) => d.kind === 'STORYBOARD_DOC' || d.kind === 'VISUAL_PLAN',
  );
  const videoDocs = project.deliverables.filter((d) => d.kind === 'VIDEO_RENDER');

  const activeScript: ScriptDraftDto | undefined =
    project.scriptDrafts.find((s) => s.id === project.approvedScriptId) ??
    project.scriptDrafts.find((s) => s.id === project.activeScriptId);

  const stageHasDeliverable = (stage: EditorialStage): boolean => {
    switch (stage) {
      case 'TOPIC':
        return Boolean(project.title);
      case 'RESEARCH':
        return researchDocs.length > 0;
      case 'SCRIPTS':
        return project.scriptDrafts.length > 0;
      case 'SCRIPT_REVIEW':
        return Boolean(project.activeScriptId || project.approvedScriptId);
      case 'VISUAL_PLANNING':
        return visualDocs.length > 0;
      case 'PRODUCTION':
      case 'VIDEO_REVIEW':
      case 'COMPLETED':
        return videoDocs.length > 0;
      default:
        return false;
    }
  };

  return (
    <div style={{ display: 'grid', gap: 22 }}>
      {/* Editorial Header */}
      <section className="st-theme-dark" style={{ borderRadius: 'var(--st-radius-panel)', padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Link to="/" style={{ fontSize: 13, color: 'var(--st-ink-muted)', fontWeight: 700 }}>
              ← Todas las temáticas
            </Link>
            <h1 style={{ margin: '8px 0 6px', fontSize: 28, color: 'var(--st-ink-fg)' }}>{project.title}</h1>
            {project.description && (
              <p style={{ margin: 0, fontSize: 14, color: 'var(--st-ink-muted)', maxWidth: 720 }}>
                {project.description}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            <span
              style={{
                borderRadius: 9999,
                padding: '5px 14px',
                fontSize: 12,
                fontWeight: 700,
                backgroundColor: 'var(--st-accent)',
                color: 'var(--st-accent-fg)',
              }}
            >
              Etapa actual: {getStageLabel(project.editorialStage)}
            </span>
            {activeScript && (
              <span style={{ fontSize: 12, color: 'var(--st-ink-fg)' }}>
                Guion activo: <strong>{activeScript.title}</strong> ({getScriptStatusLabel(activeScript.status)})
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Active background process or human-attention banner */}
      {hasActiveTask && (
        <div
          className="st-card"
          role="status"
          aria-live="polite"
          style={{
            padding: '16px 20px',
            borderColor: '#10204D',
            borderWidth: 2,
            backgroundColor: '#101A39',
            color: '#FBFBF4',
            display: 'grid',
            gap: 6,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: '#CEEF62',
                  display: 'inline-block',
                }}
              />
              <strong>
                {getTaskTypeLabel(activeTasks[0].type)} — {getTaskStatusLabel(activeTasks[0].status)}
              </strong>
            </div>
            <span style={{ fontSize: 12, color: '#CEEF62', fontFamily: 'var(--st-font-mono)' }}>
              Tiempo transcurrido: {formatElapsed(activeTasks[0].startedAt ?? activeTasks[0].createdAt)}
            </span>
          </div>
          <div style={{ fontSize: 13, color: '#949EB9' }}>
            {activeTasks[0].title}
            {latestProjectEvent?.payload?.chunk
              ? ` · Última actividad: ${String(latestProjectEvent.payload.chunk).slice(0, 120)}...`
              : ' · Esperando respuesta del motor de producción...'}
          </div>
        </div>
      )}

      {(triggerAction.isError || reviseScript.isError) && (
        <div
          className="st-card"
          style={{
            padding: 14,
            borderColor: '#C0392B',
            backgroundColor: '#FDE8E8',
            color: '#C0392B',
            fontSize: 13,
          }}
        >
          <strong>No se pudo iniciar la acción:</strong>{' '}
          {((triggerAction.error || reviseScript.error) as Error)?.message}
        </div>
      )}

      {attentionTasks.length > 0 && (
        <div
          className="st-card"
          style={{
            padding: 14,
            borderColor: '#C0392B',
            backgroundColor: '#FDE8E8',
            color: '#C0392B',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10,
            fontSize: 13,
          }}
        >
          <div>
            <strong>Requiere atención:</strong> {attentionTasks[0].title} — {attentionTasks[0].error}
          </div>
          <button
            type="button"
            className="st-btn st-btn-primary"
            style={{ padding: '6px 12px', fontSize: 12 }}
            onClick={() => recoverTask.mutate(attentionTasks[0].id)}
          >
            Reintentar proceso
          </button>
        </div>
      )}

      {/* 8-Stage Visual Stepper */}
      <nav aria-label="Etapas editoriales" className="st-card" style={{ padding: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 }}>
          {EDITORIAL_STAGES.map((stage) => {
            const isViewing = currentStage === stage.id;
            const isCurrent = project.editorialStage === stage.id;
            const hasArtifacts = stageHasDeliverable(stage.id);
            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => setViewedStage(stage.id)}
                style={{
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderRadius: 10,
                  cursor: 'pointer',
                  border: isViewing ? '2px solid #101A39' : '1px solid var(--st-border-light)',
                  backgroundColor: isViewing ? '#101A39' : hasArtifacts ? '#FBFBF4' : '#FFFFFF',
                  color: isViewing ? '#FBFBF4' : '#121D42',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
                  <span style={{ fontWeight: 700, opacity: 0.75 }}>0{stage.order}</span>
                  {isCurrent && (
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: '#CEEF62',
                        border: '1px solid #10204D',
                      }}
                      title="Etapa actual"
                    />
                  )}
                </div>
                <div style={{ fontWeight: 700, fontSize: 13, marginTop: 4 }}>{stage.label}</div>
                <div style={{ fontSize: 11, opacity: 0.75, marginTop: 2 }}>
                  {hasArtifacts ? 'Con entregables' : 'Sin entregables'}
                </div>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Stage Content */}
      <section className="st-card" style={{ padding: 24 }}>
        {/* 1. TEMÁTICA */}
        {currentStage === 'TOPIC' && (
          <div style={{ display: 'grid', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <h2 style={{ margin: 0, fontSize: 20 }}>1. Temática y contexto editorial</h2>
              <button
                type="button"
                className="st-btn st-btn-primary"
                disabled={isActionBusy}
                onClick={() => triggerAction.mutate('research')}
              >
                {hasActiveTask ? 'Proceso en curso...' : 'Iniciar investigación →'}
              </button>
            </div>
            <EditorialDivider width={72} />
            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <label className="st-label" htmlFor="edit-topic-title">
                  Título de la temática
                </label>
                <input
                  id="edit-topic-title"
                  className="st-input"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="st-label" htmlFor="edit-topic-desc">
                  Descripción / Objetivo
                </label>
                <textarea
                  id="edit-topic-desc"
                  className="st-textarea"
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
              </div>
              <div>
                <label className="st-label" htmlFor="edit-topic-context">
                  Contexto editorial (audiencia, tono, referencias)
                </label>
                <textarea
                  id="edit-topic-context"
                  className="st-textarea"
                  rows={3}
                  value={editContext}
                  onChange={(e) => setEditContext(e.target.value)}
                  placeholder="Agregá público objetivo, enfoque narrativo, tono o restricciones..."
                />
              </div>
              <div>
                <button
                  type="button"
                  className="st-btn st-btn-secondary-light"
                  disabled={updateProject.isPending}
                  onClick={() =>
                    updateProject.mutate({
                      title: editTitle,
                      description: editDescription,
                      editorialContext: editContext,
                    })
                  }
                >
                  {updateProject.isPending ? 'Guardando...' : 'Guardar contexto editorial'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. INVESTIGACIÓN */}
        {currentStage === 'RESEARCH' && (
          <div style={{ display: 'grid', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <h2 style={{ margin: 0, fontSize: 20 }}>2. Investigación editorial</h2>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="st-btn st-btn-secondary-light"
                  disabled={isActionBusy}
                  onClick={() => triggerAction.mutate('research')}
                >
                  {hasActiveTask ? 'Proceso en curso...' : 'Generar nueva investigación'}
                </button>
                <button
                  type="button"
                  className="st-btn st-btn-primary"
                  disabled={isActionBusy}
                  onClick={() => triggerAction.mutate('generate-scripts')}
                >
                  {hasActiveTask ? 'Proceso en curso...' : 'Generar alternativas de guion →'}
                </button>
              </div>
            </div>
            <EditorialDivider width={72} />

            {researchDocs.length === 0 ? (
              <div style={{ fontSize: 14, color: 'var(--st-muted-light)' }}>
                Aún no hay documentos de investigación en este proyecto. Iniciá la investigación para generar el documento base.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {researchDocs.map((doc) => (
                  <div
                    key={doc.id}
                    style={{
                      padding: 16,
                      borderRadius: 12,
                      border: '1px solid var(--st-border-light)',
                      backgroundColor: 'var(--st-bg-light)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 12,
                    }}
                  >
                    <div style={{ flex: '1 1 300px' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--st-muted-light)' }}>
                        {getDeliverableKindLabel(doc.kind)} · <code>{doc.filePath}</code>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 16, marginTop: 4 }}>{doc.title}</div>
                      {doc.summary && (
                        <div style={{ fontSize: 13, color: 'var(--st-muted-light)', marginTop: 4 }}>{doc.summary}...</div>
                      )}
                    </div>
                    <button
                      type="button"
                      className="st-btn st-btn-primary"
                      onClick={() => void openWorkspaceFile(doc.title, doc.filePath)}
                    >
                      Leer documento
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. GUIONES */}
        {currentStage === 'SCRIPTS' && (
          <div style={{ display: 'grid', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 20 }}>3. Alternativas de guion</h2>
                <div style={{ fontSize: 13, color: 'var(--st-muted-light)', marginTop: 4 }}>
                  Elegí cuál guion querés usar como base activa antes de avanzar a planificación visual.
                </div>
              </div>
              <button
                type="button"
                className="st-btn st-btn-secondary-light"
                disabled={isActionBusy}
                onClick={() => triggerAction.mutate('generate-scripts')}
              >
                {hasActiveTask ? 'Generando guiones...' : 'Generar nuevas alternativas'}
              </button>
            </div>
            <EditorialDivider width={72} />

            {project.scriptDrafts.length === 0 ? (
              <div style={{ fontSize: 14, color: 'var(--st-muted-light)' }}>
                Todavía no hay guiones generados. Podés generar las alternativas a partir de la investigación.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
                {project.scriptDrafts.map((script) => {
                  const isActive =
                    project.activeScriptId === script.id || project.approvedScriptId === script.id;
                  return (
                    <article
                      key={script.id}
                      style={{
                        padding: 18,
                        borderRadius: 14,
                        border: isActive ? '2px solid #101A39' : '1px solid var(--st-border-light)',
                        backgroundColor: 'var(--st-bg-light)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: 14,
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--st-muted-light)' }}>
                            OPCIÓN {script.variant} · v{script.version}
                          </span>
                          <span
                            style={{
                              ...statusBadgeStyle(script.status),
                              borderRadius: 9999,
                              padding: '2px 10px',
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                          >
                            {getScriptStatusLabel(script.status)}
                          </span>
                        </div>
                        <h3 style={{ margin: '8px 0 6px', fontSize: 17 }}>{script.title}</h3>
                        <div style={{ fontSize: 13, color: 'var(--st-ink-text)' }}>
                          <strong>Formato:</strong> {script.format}
                        </div>
                        {script.estimatedDuration && (
                          <div style={{ fontSize: 13, color: 'var(--st-ink-text)', marginTop: 2 }}>
                            <strong>Duración estimada:</strong> {script.estimatedDuration}
                          </div>
                        )}
                        {script.description && (
                          <p style={{ fontSize: 13, color: 'var(--st-muted-light)', margin: '8px 0 0' }}>
                            {script.description}
                          </p>
                        )}
                        {script.filePath && (
                          <div style={{ fontSize: 11, color: 'var(--st-muted-light)', marginTop: 8 }}>
                            Archivo: <code>{script.filePath}</code>
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        <button
                          type="button"
                          className="st-btn st-btn-secondary-light"
                          style={{ padding: '7px 14px', fontSize: 12 }}
                          onClick={() => setReaderDoc({ title: script.title, content: script.body })}
                        >
                          Leer guion
                        </button>
                        <button
                          type="button"
                          className="st-btn st-btn-primary"
                          style={{ padding: '7px 14px', fontSize: 12 }}
                          disabled={selectScript.isPending}
                          onClick={() => selectScript.mutate(script.id)}
                        >
                          {isActive ? 'Guion seleccionado ✓' : 'Seleccionar este guion'}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 4. REVISIÓN DEL GUION */}
        {currentStage === 'SCRIPT_REVIEW' && (
          <div style={{ display: 'grid', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 20 }}>4. Revisión y aprobación del guion</h2>
                <div style={{ fontSize: 13, color: 'var(--st-muted-light)', marginTop: 4 }}>
                  Decisión humana requerida: aprobá el guion definitivo o solicitá modificaciones antes de pasar a planificación visual.
                </div>
              </div>
              {activeScript && (
                <button
                  type="button"
                  className="st-btn st-btn-primary"
                  disabled={approveScript.isPending}
                  onClick={() => approveScript.mutate(activeScript.id)}
                >
                  {activeScript.status === 'APPROVED' ? 'Guion aprobado ✓' : 'Aprobar guion definitivo →'}
                </button>
              )}
            </div>
            <EditorialDivider width={72} />

            {!activeScript ? (
              <div style={{ display: 'grid', gap: 12 }}>
                <div style={{ fontSize: 14, color: 'var(--st-muted-light)' }}>
                  Todavía no seleccionaste ningún guion. Elegí una de las alternativas disponibles para revisarlo.
                </div>
                <div>
                  <button
                    type="button"
                    className="st-btn st-btn-primary"
                    onClick={() => setViewedStage('SCRIPTS')}
                  >
                    Ir a Guiones
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 16 }}>
                <div
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    border: '1px solid var(--st-border-light)',
                    backgroundColor: 'var(--st-bg-light)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <strong>{activeScript.title}</strong> · {activeScript.format}
                      {activeScript.estimatedDuration ? ` · ${activeScript.estimatedDuration}` : ''}
                    </div>
                    <span
                      style={{
                        ...statusBadgeStyle(activeScript.status),
                        borderRadius: 9999,
                        padding: '2px 10px',
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {getScriptStatusLabel(activeScript.status)}
                    </span>
                  </div>
                  <div style={{ marginTop: 14 }}>
                    <MarkdownViewer content={activeScript.body} maxHeight={420} />
                  </div>
                </div>

                <div style={{ display: 'grid', gap: 10 }}>
                  <label className="st-label" htmlFor="revision-notes">
                    Solicitar modificaciones (se creará una nueva versión conservando la anterior)
                  </label>
                  <textarea
                    id="revision-notes"
                    className="st-textarea"
                    rows={3}
                    placeholder="Ej. Acortar la escena 2 a 15 segundos y enfatizar el ejemplo de stock..."
                    value={revisionNotes}
                    onChange={(e) => setRevisionNotes(e.target.value)}
                  />
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      type="button"
                      className="st-btn st-btn-secondary-light"
                      disabled={!revisionNotes.trim() || isActionBusy}
                      onClick={() =>
                        reviseScript.mutate({ scriptId: activeScript.id, notes: revisionNotes.trim() })
                      }
                    >
                      {hasActiveTask || reviseScript.isPending ? 'Procesando revisión...' : 'Solicitar nueva versión'}
                    </button>
                    <button
                      type="button"
                      className="st-btn st-btn-secondary-light"
                      onClick={() => setViewedStage('SCRIPTS')}
                    >
                      Comparar con otras alternativas
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. PLANIFICACIÓN VISUAL */}
        {currentStage === 'VISUAL_PLANNING' && (
          <div style={{ display: 'grid', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <h2 style={{ margin: 0, fontSize: 20 }}>5. Planificación visual y storyboard</h2>
              {activeScript && (
                <button
                  type="button"
                  className="st-btn st-btn-primary"
                  disabled={isActionBusy}
                  onClick={() => triggerAction.mutate('plan-visual')}
                >
                  {hasActiveTask ? 'Generando planificación...' : 'Generar planificación visual con guion activo →'}
                </button>
              )}
            </div>
            <EditorialDivider width={72} />

            {!activeScript ? (
              <div style={{ display: 'grid', gap: 10 }}>
                <div style={{ fontSize: 14, color: 'var(--st-muted-light)' }}>
                  Para planificar las escenas y motion graphics primero debés seleccionar un guion activo.
                </div>
                <div>
                  <button type="button" className="st-btn st-btn-primary" onClick={() => setViewedStage('SCRIPTS')}>
                    Elegir guion ahora
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 14 }}>
                <div
                  style={{
                    padding: 14,
                    borderRadius: 12,
                    border: '1px solid var(--st-border-light)',
                    backgroundColor: 'var(--st-bg-light)',
                    fontSize: 13,
                  }}
                >
                  <strong>Guion utilizado para planificación visual:</strong> {activeScript.title} (
                  {activeScript.format}) · Estado: <strong>{getScriptStatusLabel(activeScript.status)}</strong>
                </div>

                {visualDocs.length === 0 ? (
                  <div style={{ fontSize: 14, color: 'var(--st-muted-light)' }}>
                    Todavía no se generó un storyboard o planificación visual para este guion.
                  </div>
                ) : (
                  visualDocs.map((doc) => (
                    <div
                      key={doc.id}
                      style={{
                        padding: 14,
                        borderRadius: 12,
                        border: '1px solid var(--st-border-light)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <strong>{doc.title}</strong> · <code>{doc.filePath}</code>
                      </div>
                      <button
                        type="button"
                        className="st-btn st-btn-primary"
                        onClick={() => void openWorkspaceFile(doc.title, doc.filePath)}
                      >
                        Abrir planificación
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* 6. PRODUCCIÓN */}
        {currentStage === 'PRODUCTION' && (
          <div style={{ display: 'grid', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <h2 style={{ margin: 0, fontSize: 20 }}>6. Producción de recursos y renderizado</h2>
              {activeScript && (
                <button
                  type="button"
                  className="st-btn st-btn-primary"
                  disabled={isActionBusy}
                  onClick={() => triggerAction.mutate('produce')}
                >
                  {hasActiveTask ? 'Producción en curso...' : 'Iniciar producción'}
                </button>
              )}
            </div>
            <EditorialDivider width={72} />
            <div style={{ fontSize: 14, color: 'var(--st-muted-light)' }}>
              {activeScript
                ? `Preparado para producir recursos y composición HyperFrames en base a "${activeScript.title}".`
                : 'Seleccioná y aprobá un guion antes de iniciar la producción.'}
            </div>
          </div>
        )}

        {/* 7. REVISIÓN DEL VIDEO */}
        {currentStage === 'VIDEO_REVIEW' && (
          <div style={{ display: 'grid', gap: 16 }}>
            <h2 style={{ margin: 0, fontSize: 20 }}>7. Revisión del video</h2>
            <EditorialDivider width={72} />
            {videoDocs.length === 0 ? (
              <div style={{ fontSize: 14, color: 'var(--st-muted-light)' }}>
                Aún no hay un archivo de video renderizado en el workspace. Completá la etapa de Producción para revisar el resultado aquí.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {videoDocs.map((v) => (
                  <div key={v.id} style={{ padding: 14, borderRadius: 12, border: '1px solid var(--st-border-light)' }}>
                    <strong>{v.title}</strong> · <code>{v.filePath}</code>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 8. FINALIZADO */}
        {currentStage === 'COMPLETED' && (
          <div style={{ display: 'grid', gap: 16 }}>
            <h2 style={{ margin: 0, fontSize: 20 }}>8. Entrega definitiva</h2>
            <EditorialDivider width={72} />
            {videoDocs.length === 0 ? (
              <div style={{ fontSize: 14, color: 'var(--st-muted-light)' }}>
                Esta temática todavía no cuenta con un video final aprobado.
              </div>
            ) : (
              <div style={{ fontSize: 14 }}>
                Video aprobado y listo para entrega definitiva.
              </div>
            )}
          </div>
        )}
      </section>

      {/* Full Markdown Document Reader Modal/Panel */}
      {readerDoc && (
        <section
          className="st-card"
          style={{
            padding: 24,
            border: '2px solid #101A39',
            backgroundColor: '#FFFFFF',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 18 }}>{readerDoc.title}</h3>
            <button
              type="button"
              className="st-btn st-btn-secondary-light"
              style={{ padding: '6px 14px', fontSize: 12 }}
              onClick={() => setReaderDoc(null)}
            >
              Cerrar lectura
            </button>
          </div>
          <EditorialDivider width={64} />
          <div style={{ marginTop: 14 }}>
            <MarkdownViewer content={readerDoc.content} maxHeight={520} />
          </div>
        </section>
      )}

      {/* Collapsible Advanced Technical Panel */}
      <section className="st-card" style={{ padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--st-muted-light)' }}>
            Sección técnica avanzada (historial de ejecuciones y selección de motor)
          </span>
          <button
            type="button"
            className="st-btn st-btn-secondary-light"
            style={{ padding: '6px 12px', fontSize: 12 }}
            onClick={() => setShowTechnical((v) => !v)}
          >
            {showTechnical ? 'Ocultar vista técnica' : 'Ver vista técnica'}
          </button>
        </div>

        {showTechnical && (
          <div style={{ display: 'grid', gap: 14, marginTop: 16 }}>
            <div style={{ maxWidth: 340 }}>
              <label className="st-label" htmlFor="advanced-runtime">
                Motor de ejecución para nuevas acciones
              </label>
              <select
                id="advanced-runtime"
                className="st-select"
                value={selectedRuntime}
                onChange={(e) => setSelectedRuntime(e.target.value as AgentRuntimeId)}
              >
                {(runtimesQuery.data ?? []).map((rt) => (
                  <option key={rt.id} value={rt.id}>
                    {rt.name} ({rt.available ? 'Disponible' : 'No disponible'})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gap: 8 }}>
              {project.tasks.map((t) => (
                <div
                  key={t.id}
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    border: '1px solid var(--st-border-light)',
                    backgroundColor: 'var(--st-bg-light)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 8,
                    fontSize: 13,
                  }}
                >
                  <div>
                    <strong>{t.title}</strong> · {getTaskTypeLabel(t.type)}
                    <div style={{ fontSize: 11, color: 'var(--st-muted-light)' }}>
                      Motor: {t.runtime} · Intentos: {t.attempts}
                    </div>
                  </div>
                  <span
                    style={{
                      ...statusBadgeStyle(t.status),
                      borderRadius: 9999,
                      padding: '2px 10px',
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {getTaskStatusLabel(t.status)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
