import React from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import { ThinkerMark } from '@socratech/brand';
import { useSocketEvents } from './hooks/useSocketEvents';
import { BrandPage } from './pages/BrandPage';
import { DashboardPage } from './pages/DashboardPage';
import { EditorialPage } from './pages/EditorialPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { useUiStore } from './store/ui.store';

export const App: React.FC = () => {
  useSocketEvents();
  const wsConnected = useUiStore((s) => s.wsConnected);

  return (
    <div className="app-shell st-brand-root">
      <header className="app-header">
        <div className="app-header-inner">
          <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ThinkerMark size={34} tone="dark-bg" />
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: '0.12em' }}>SOCRATECH</div>
              <div style={{ fontSize: 10, letterSpacing: '0.16em', color: 'var(--st-ink-muted)' }}>
                MOTION LAB
              </div>
            </div>
          </NavLink>

          <nav className="app-nav">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `app-nav-link ${isActive ? 'app-nav-link--active' : ''}`}
            >
              Temáticas
            </NavLink>
            <NavLink
              to="/editorial"
              className={({ isActive }) => `app-nav-link ${isActive ? 'app-nav-link--active' : ''}`}
            >
              Conocimiento
            </NavLink>
            <NavLink
              to="/brand"
              className={({ isActive }) => `app-nav-link ${isActive ? 'app-nav-link--active' : ''}`}
            >
              Identidad
            </NavLink>
          </nav>

          <div style={{ fontSize: 12, color: wsConnected ? 'var(--st-accent)' : 'var(--st-ink-muted)' }}>
            ● {wsConnected ? 'WS Conectado' : 'WS Desconectado'}
          </div>
        </div>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/editorial" element={<EditorialPage />} />
          <Route path="/brand" element={<BrandPage />} />
        </Routes>
      </main>
    </div>
  );
};
