import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getStageLabel, getTaskStatusLabel } from '@socratech/contracts';
import {
  ConsoleBlock,
  EditorialDivider,
  EditorialTitle,
  OrbitMotif,
  ThinkerMark,
} from '@socratech/brand';
import { api } from '../lib/api';
import { useUiStore } from '../store/ui.store';

export const DashboardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const events = useUiStore((s) => s.events);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editorialContext, setEditorialContext] = useState('');
  const [showTechnical, setShowTechnical] = useState(false);

  const projectsQuery = useQuery({ queryKey: ['projects'], queryFn: api.listProjects });
  const runtimesQuery = useQuery({ queryKey: ['runtimes'], queryFn: api.listRuntimes });
  const tasksQuery = useQuery({ queryKey: ['tasks'], queryFn: () => api.listTasks() });

  const createProject = useMutation({
    mutationFn: api.createProject,
    onSuccess: () => {
      setTitle('');
      setDescription('');
      setEditorialContext('');
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    createProject.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      editorialContext: editorialContext.trim() || undefined,
    });
  };

  const attentionTasks = (tasksQuery.data ?? []).filter(
    (t) => t.status === 'INTERRUPTED' || t.status === 'FAILED',
  );

  return (
    <div style={{ display: 'grid', gap: 28 }}>
      <section
        className="st-theme-dark"
        style={{
          borderRadius: 'var(--st-radius-panel)',
          padding: '28px 32px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
        }}
      >
        <div style={{ flex: '1 1 420px' }}>
          <EditorialTitle
            eyebrow="ESTUDIO DE PRODUCCIÓN · SOCRATECH"
            baseText="De una temática"
            accentText="a un video terminado."
            description="Iniciá un proyecto definiendo el tema, revisá la investigación, elegí el guion definitivo y acompañá cada etapa hasta la entrega final."
            tone="dark"
            size="md"
          />
        </div>
        <OrbitMotif size={132} tone="dark">
          <ThinkerMark size={56} tone="dark-bg" withRing />
        </OrbitMotif>
      </section>

      {attentionTasks.length > 0 && (
        <section
          className="st-card"
          style={{
            padding: 18,
            borderColor: '#D39E00',
            backgroundColor: '#FFFBEB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <strong style={{ color: '#7A4F01' }}>
              Hay {attentionTasks.length} proceso(s) editorial(es) que requieren tu atención
            </strong>
            <div style={{ fontSize: 13, color: '#7A4F01' }}>
              Podés revisar el detalle y reanudar desde la temática correspondiente.
            </div>
          </div>
          <Link to={`/projects/${attentionTasks[0].projectId}`} className="st-btn st-btn-primary">
            Revisar temática
          </Link>
        </section>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
        <section className="st-card" style={{ padding: 22 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 18 }}>Nueva temática</h3>
          <EditorialDivider width={64} />
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14, marginTop: 16 }}>
            <div>
              <label className="st-label" htmlFor="project-title">
                Tema del video
              </label>
              <input
                id="project-title"
                className="st-input"
                placeholder="Ej. ¿Cómo automatizar la gestión de pedidos en una PyME?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="st-label" htmlFor="project-desc">
                Objetivo o enfoque principal
              </label>
              <textarea
                id="project-desc"
                className="st-textarea"
                rows={2}
                placeholder="Qué problema resuelve o qué idea central queremos comunicar..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <label className="st-label" htmlFor="project-context">
                Contexto editorial (audiencia, tono, notas)
              </label>
              <textarea
                id="project-context"
                className="st-textarea"
                rows={2}
                placeholder="Opcional: público objetivo, tono divulgativo, formato deseado..."
                value={editorialContext}
                onChange={(e) => setEditorialContext(e.target.value)}
              />
            </div>
            {createProject.isError && (
              <div style={{ color: 'var(--st-destructive)', fontSize: 13 }}>
                {(createProject.error as Error).message}
              </div>
            )}
            <button type="submit" className="st-btn st-btn-primary" disabled={createProject.isPending}>
              {createProject.isPending ? 'Creando temática...' : 'Crear temática'}
            </button>
          </form>
        </section>

        <section className="st-card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 18 }}>Temáticas en producción ({projectsQuery.data?.length ?? 0})</h3>
          </div>
          <EditorialDivider width={64} />
          <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
            {projectsQuery.isLoading && <div>Cargando temáticas...</div>}
            {projectsQuery.data && projectsQuery.data.length === 0 && (
              <div style={{ color: 'var(--st-muted-light)', fontSize: 14 }}>
                Todavía no hay temáticas creadas. Definí la primera para comenzar el recorrido editorial.
              </div>
            )}
            {(projectsQuery.data ?? []).map((p) => (
              <Link
                key={p.id}
                to={`/projects/${p.id}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12,
                  padding: 16,
                  borderRadius: 12,
                  border: '1px solid var(--st-border-light)',
                  backgroundColor: 'var(--st-bg-light)',
                }}
              >
                <div style={{ flex: '1 1 220px' }}>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{p.title}</div>
                  {p.description && (
                    <div style={{ fontSize: 13, color: 'var(--st-muted-light)', marginTop: 4 }}>{p.description}</div>
                  )}
                  <div style={{ fontSize: 12, color: 'var(--st-muted-light)', marginTop: 6 }}>
                    Etapa actual: <strong>{getStageLabel(p.editorialStage)}</strong>
                    {p.approvedScriptId
                      ? ' · Guion aprobado'
                      : p.activeScriptId
                        ? ' · Guion seleccionado'
                        : ' · Sin guion seleccionado'}
                  </div>
                </div>
                <span className="st-btn st-btn-secondary-light" style={{ padding: '7px 14px', fontSize: 12 }}>
                  Abrir recorrido →
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <section className="st-card" style={{ padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--st-muted-light)' }}>
            Sección técnica avanzada (motores y eventos del sistema)
          </span>
          <button
            type="button"
            className="st-btn st-btn-secondary-light"
            style={{ padding: '6px 12px', fontSize: 12 }}
            onClick={() => setShowTechnical((v) => !v)}
          >
            {showTechnical ? 'Ocultar detalle técnico' : 'Mostrar detalle técnico'}
          </button>
        </div>

        {showTechnical && (
          <div style={{ display: 'grid', gap: 16, marginTop: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
              {(runtimesQuery.data ?? []).map((rt) => (
                <div
                  key={rt.id}
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    border: '1px solid var(--st-border-light)',
                    backgroundColor: 'var(--st-bg-light)',
                    fontSize: 13,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>{rt.name}</strong>
                    <span style={{ fontWeight: 700 }}>
                      {rt.available ? getTaskStatusLabel('COMPLETED') : getTaskStatusLabel('FAILED')}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--st-muted-light)', marginTop: 4 }}>
                    Versión: {rt.version ?? 'No disponible'} · {rt.authDetails}
                  </div>
                </div>
              ))}
            </div>

            <ConsoleBlock
              filename="eventos-en-vivo"
              lines={
                events.length > 0
                  ? events.slice(0, 8).map((ev) => `[${ev.timestamp}] ${ev.event} -> ${JSON.stringify(ev.payload)}`)
                  : ['// Sin eventos recientes en esta sesión.']
              }
            />
          </div>
        )}
      </section>
    </div>
  );
};
