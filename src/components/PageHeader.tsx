import type { ReactNode } from 'react';

interface Props {
  title: string;
  note: string;
  /** Right-aligned live context, such as a count or a status line. */
  meta?: ReactNode;
}

export function PageHeader({ title, note, meta }: Props) {
  return (
    <header className="pagehead">
      <div className="pagehead-text">
        <h2 className="pagehead-title">{title}</h2>
        <p className="pagehead-note">{note}</p>
      </div>
      {meta && <div className="pagehead-meta">{meta}</div>}
    </header>
  );
}

/** A single figure in a page header, such as "5 open blockers". */
export function HeadStat({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div className="headstat">
      <span className="headstat-value">{value}</span>
      <span className="headstat-label">{label}</span>
    </div>
  );
}
