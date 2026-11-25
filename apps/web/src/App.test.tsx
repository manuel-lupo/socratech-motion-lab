import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { BRAND_COLORS, SocratechBrandShowcase, ThinkerMark } from '@socratech/brand';
import { getScriptStatusLabel, getStageLabel, getTaskStatusLabel, getTaskTypeLabel } from '@socratech/contracts';
import { BrandPage } from './pages/BrandPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { api } from './lib/api';

describe('Socratech Brand UI integration', () => {
  it('renders official ThinkerMark SVG with immutable viewBox', () => {
    render(<ThinkerMark size={48} tone="dark-bg" />);
    const svg = screen.getByRole('img', { name: /Isotipo Socratech/i });
    expect(svg).toHaveAttribute('viewBox', '0 0 580 590');
  });

  it('renders BrandPage with official priority palette colors', () => {
    render(<BrandPage />);
    expect(screen.getByText(/Paleta oficial prioritaria/i)).toBeInTheDocument();
    expect(screen.getByText(BRAND_COLORS.navyBg)).toBeInTheDocument();
    expect(screen.getByText(BRAND_COLORS.limeAccent)).toBeInTheDocument();
  });

  it('renders SocratechBrandShowcase with official slogan', () => {
    render(<SocratechBrandShowcase />);
    expect(screen.getAllByText(/Entender primero\./i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Resolver mejor\./i).length).toBeGreaterThanOrEqual(1);
  });
});

describe('Centralized Spanish labels & editorial flow', () => {
  it('translates internal task types, statuses, stages, and script states to Spanish', () => {
    expect(getTaskTypeLabel('EDITORIAL_RESEARCH')).toBe('Investigación');
    expect(getTaskTypeLabel('SCRIPT_GENERATION')).toBe('Generación de guion');
    expect(getTaskTypeLabel('STORYBOARD')).toBe('Planificación visual');
    expect(getTaskStatusLabel('RUNNING')).toBe('En curso');
    expect(getTaskStatusLabel('FAILED')).toBe('Requiere atención');
    expect(getStageLabel('SCRIPT_REVIEW')).toBe('Revisión del guion');
    expect(getScriptStatusLabel('SELECTED')).toBe('Seleccionado');
  });

  it('renders both que-es-un-erp scripts, allows reading, and hides technical task enums by default', async () => {
    const getProjectSpy = vi.spyOn(api, 'getProject').mockResolvedValue({
      id: 'proj-erp',
      slug: 'que-es-un-erp',
      title: 'Que es un ERP?',
      description: 'Video explicativo sobre ERP',
      editorialContext: null,
      editorialStage: 'SCRIPTS',
      activeScriptId: null,
      approvedScriptId: null,
      status: 'PLANNING',
      workspacePath: '/workspaces/que-es-un-erp',
      createdAt: '2026-11-25T01:30:00Z',
      updatedAt: '2026-11-25T01:30:00Z',
      tasks: [],
      deliverables: [],
      scriptDrafts: [
        {
          id: 's-long',
          projectId: 'proj-erp',
          variant: 'A',
          version: 1,
          title: 'Borrador de Guion Principal: ¿Qué es un ERP?',
          format: 'Video divulgativo / Motion Graphics (16:9)',
          estimatedDuration: '3 min 45 seg – 4 min 15 seg',
          description: 'Emprendedores y PyMEs',
          filePath: 'borrador-guion-principal.md',
          body: '# Guion largo completo',
          status: 'DRAFT',
          revisionNotes: null,
          isSelected: false,
          createdAt: '2026-11-25T01:53:00Z',
          updatedAt: '2026-11-25T01:53:00Z',
        },
        {
          id: 's-short',
          projectId: 'proj-erp',
          variant: 'B',
          version: 1,
          title: 'Borrador de Guion Corto: ¿Qué es un ERP en 60 segundos?',
          format: 'Vertical / Short-form (9:16)',
          estimatedDuration: '55 – 60 segundos',
          description: 'Versión ágil para redes',
          filePath: 'borrador-guion-corto.md',
          body: '# Guion corto completo',
          status: 'DRAFT',
          revisionNotes: null,
          isSelected: false,
          createdAt: '2026-11-25T01:53:00Z',
          updatedAt: '2026-11-25T01:53:00Z',
        },
      ],
    });
    vi.spyOn(api, 'listRuntimes').mockResolvedValue([]);

    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter initialEntries={['/projects/proj-erp']}>
          <Routes>
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Borrador de Guion Principal/i)).toBeInTheDocument();
    expect(screen.getByText(/Borrador de Guion Corto/i)).toBeInTheDocument();
    expect(screen.getByText(/3 min 45 seg/i)).toBeInTheDocument();
    expect(screen.getByText(/55 – 60 segundos/i)).toBeInTheDocument();

    const readButtons = screen.getAllByRole('button', { name: /Leer guion/i });
    fireEvent.click(readButtons[0]);
    expect(screen.getByText('Guion largo completo')).toBeInTheDocument();

    getProjectSpy.mockRestore();
  });
});
