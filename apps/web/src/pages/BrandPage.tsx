import React from 'react';
import { BRAND_COLORS, SocratechBrandShowcase } from '@socratech/brand';

const SWATCHES = [
  { name: 'Navy BG', hex: BRAND_COLORS.navyBg, role: 'Fondo oscuro oficial' },
  { name: 'Navy Text', hex: BRAND_COLORS.navyText, role: 'Texto principal sobre claro' },
  { name: 'Navy Stroke', hex: BRAND_COLORS.navyStroke, role: 'Contornos e iconos sobre claro' },
  { name: 'Warm Ivory', hex: BRAND_COLORS.ivoryBg, role: 'Fondo claro oficial' },
  { name: 'Lime Accent', hex: BRAND_COLORS.limeAccent, role: 'Acento eléctrico oficial' },
  { name: 'Slate Light', hex: BRAND_COLORS.slateLight, role: 'Secundario sobre oscuro' },
  { name: 'Slate Dark', hex: BRAND_COLORS.slateDark, role: 'Secundario sobre claro' },
  { name: 'Pure White', hex: BRAND_COLORS.white, role: 'Superficies y datos' },
];

export const BrandPage: React.FC = () => {
  return (
    <div style={{ display: 'grid', gap: 28 }}>
      <SocratechBrandShowcase />

      <section className="st-card" style={{ padding: 22 }}>
        <h3 style={{ margin: '0 0 14px', fontSize: 18 }}>Paleta oficial prioritaria</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {SWATCHES.map((s) => (
            <div
              key={s.hex}
              style={{
                borderRadius: 12,
                border: '1px solid var(--st-border-light)',
                overflow: 'hidden',
              }}
            >
              <div style={{ height: 56, backgroundColor: s.hex, borderBottom: '1px solid var(--st-border-light)' }} />
              <div style={{ padding: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{s.name}</div>
                <div style={{ fontFamily: 'var(--st-font-mono)', fontSize: 12 }}>{s.hex}</div>
                <div style={{ fontSize: 11, color: 'var(--st-muted-light)', marginTop: 2 }}>{s.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
