import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { EditorialDivider } from '@socratech/brand';
import { api } from '../lib/api';

export const EditorialPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [category, setCategory] = useState('Servicios');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const knowledgeQuery = useQuery({ queryKey: ['knowledge'], queryFn: api.listKnowledge });

  const createKnowledge = useMutation({
    mutationFn: api.createKnowledge,
    onSuccess: () => {
      setTitle('');
      setContent('');
      void queryClient.invalidateQueries({ queryKey: ['knowledge'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    createKnowledge.mutate({ category, title: title.trim(), content: content.trim() });
  };

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <section className="st-card" style={{ padding: 22 }}>
        <h2 style={{ margin: '0 0 10px', fontSize: 22 }}>Base de conocimiento institucional</h2>
        <EditorialDivider width={72} />
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14, marginTop: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 14 }}>
            <div>
              <label className="st-label" htmlFor="kb-category">
                Categoría
              </label>
              <select
                id="kb-category"
                className="st-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Servicios">Servicios</option>
                <option value="Soluciones">Soluciones</option>
                <option value="Casos">Casos</option>
                <option value="Posicionamiento">Posicionamiento</option>
              </select>
            </div>
            <div>
              <label className="st-label" htmlFor="kb-title">
                Título
              </label>
              <input
                id="kb-title"
                className="st-input"
                placeholder="Ej. Automatización operativa para PyMEs"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label className="st-label" htmlFor="kb-content">
              Contenido
            </label>
            <textarea
              id="kb-content"
              className="st-textarea"
              rows={3}
              placeholder="Detalle de servicio, público objetivo, problema resuelto..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>
          <div>
            <button type="submit" className="st-btn st-btn-primary" disabled={createKnowledge.isPending}>
              Guardar entrada
            </button>
          </div>
        </form>
      </section>

      <section style={{ display: 'grid', gap: 12 }}>
        {(knowledgeQuery.data ?? []).map((entry) => (
          <div key={entry.id} className="st-card" style={{ padding: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--st-muted-light)' }}>
              {entry.category}
            </div>
            <div style={{ fontWeight: 700, fontSize: 16, margin: '4px 0 6px' }}>{entry.title}</div>
            <div style={{ fontSize: 14, lineHeight: 1.5 }}>{entry.content}</div>
          </div>
        ))}
      </section>
    </div>
  );
};
