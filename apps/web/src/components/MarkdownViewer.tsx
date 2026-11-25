import React from 'react';

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code
          key={idx}
          style={{
            fontFamily: 'var(--st-font-mono)',
            fontSize: '0.9em',
            backgroundColor: 'rgba(16, 26, 57, 0.07)',
            padding: '1px 5px',
            borderRadius: 4,
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return <strong key={idx}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return <em key={idx}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

function parseTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

function isSeparatorRow(line: string): boolean {
  const cells = parseTableRow(line);
  return cells.length > 0 && cells.every((c) => /^:?-{2,}:?$/.test(c));
}

export const MarkdownViewer: React.FC<{ content: string; maxHeight?: number }> = ({
  content,
  maxHeight = 520,
}) => {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const blocks: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    // Fenced code block
    if (trimmed.startsWith('```')) {
      const codeLines: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i += 1;
      }
      i += 1;
      blocks.push(
        <pre
          key={`code-${i}`}
          style={{
            backgroundColor: 'var(--st-ink)',
            color: 'var(--st-ink-fg-pure)',
            fontFamily: 'var(--st-font-mono)',
            fontSize: 12,
            padding: 12,
            borderRadius: 10,
            overflowX: 'auto',
            margin: '10px 0',
          }}
        >
          {codeLines.join('\n')}
        </pre>,
      );
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,})$/.test(trimmed)) {
      blocks.push(
        <hr
          key={`hr-${i}`}
          style={{ border: 'none', borderTop: '1px solid var(--st-border-light)', margin: '14px 0' }}
        />,
      );
      i += 1;
      continue;
    }

    // Headings
    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      const sizes: Record<number, number> = { 1: 21, 2: 17, 3: 15 };
      blocks.push(
        <div
          key={`h-${i}`}
          style={{
            fontWeight: 700,
            fontSize: sizes[level] ?? 15,
            color: 'var(--st-ink-text)',
            margin: '14px 0 6px',
            lineHeight: 1.25,
          }}
        >
          {renderInline(text)}
        </div>,
      );
      i += 1;
      continue;
    }

    // Markdown table
    if (trimmed.startsWith('|') && i + 1 < lines.length && isSeparatorRow(lines[i + 1])) {
      const headers = parseTableRow(trimmed);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        rows.push(parseTableRow(lines[i]));
        i += 1;
      }
      blocks.push(
        <div key={`tbl-${i}`} style={{ overflowX: 'auto', margin: '12px 0' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 13,
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--st-border-light)',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: 'var(--st-ink)', color: 'var(--st-ink-fg)' }}>
                {headers.map((h, idx) => (
                  <th
                    key={idx}
                    style={{
                      textAlign: 'left',
                      padding: '8px 10px',
                      fontWeight: 700,
                      borderBottom: '1px solid var(--st-border-light)',
                    }}
                  >
                    {renderInline(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rIdx) => (
                <tr key={rIdx} style={{ backgroundColor: rIdx % 2 === 1 ? 'var(--st-bg-light)' : '#FFFFFF' }}>
                  {row.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      style={{
                        padding: '8px 10px',
                        verticalAlign: 'top',
                        borderBottom: '1px solid var(--st-border-light)',
                        lineHeight: 1.5,
                      }}
                    >
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    // Bullet list
    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ''));
        i += 1;
      }
      blocks.push(
        <ul key={`ul-${i}`} style={{ margin: '8px 0', paddingLeft: 20, display: 'grid', gap: 4 }}>
          {items.map((item, idx) => (
            <li key={idx} style={{ fontSize: 14, lineHeight: 1.55 }}>
              {renderInline(item)}
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    // Numbered list
    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
        i += 1;
      }
      blocks.push(
        <ol key={`ol-${i}`} style={{ margin: '8px 0', paddingLeft: 20, display: 'grid', gap: 4 }}>
          {items.map((item, idx) => (
            <li key={idx} style={{ fontSize: 14, lineHeight: 1.55 }}>
              {renderInline(item)}
            </li>
          ))}
        </ol>,
      );
      continue;
    }

    // Paragraph
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].trim().startsWith('#') &&
      !lines[i].trim().startsWith('|') &&
      !lines[i].trim().startsWith('```') &&
      !/^[-*]\s+/.test(lines[i].trim()) &&
      !/^\d+\.\s+/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i].trim());
      i += 1;
    }
    blocks.push(
      <p key={`p-${i}`} style={{ margin: '8px 0', fontSize: 14, lineHeight: 1.6 }}>
        {renderInline(paraLines.join(' '))}
      </p>,
    );
  }

  return (
    <div
      style={{
        padding: 16,
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--st-border-light)',
        maxHeight,
        overflowY: 'auto',
      }}
    >
      {blocks}
    </div>
  );
};
