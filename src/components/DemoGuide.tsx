import { DEMO_STEPS, TABS } from '../content';

interface Props {
  index: number;
  onBack: () => void;
  onNext: () => void;
  onExit: () => void;
}

export function DemoGuide({ index, onBack, onNext, onExit }: Props) {
  const step = DEMO_STEPS[index];
  const total = DEMO_STEPS.length;
  const last = index === total - 1;
  const tabLabel = TABS.find((t) => t.id === step.tab)?.label ?? '';

  return (
    <aside className="guide" aria-label="Guided walkthrough" aria-live="polite">
      <div className="guide-head">
        <p className="guide-step">
          Walkthrough · {tabLabel}
        </p>
        <button
          type="button"
          className="guide-close"
          onClick={onExit}
          aria-label="Exit walkthrough"
        >
          ✕
        </button>
      </div>

      <h2 className="guide-title">{step.title}</h2>
      <p className="guide-body">{step.body}</p>
      {step.tryIt && (
        <p className="guide-try">
          <span>Try it</span>
          {step.tryIt}
        </p>
      )}

      <div className="guide-foot">
        <ol className="guide-dots" aria-hidden="true">
          {DEMO_STEPS.map((s, i) => (
            <li key={s.title} className={i === index ? 'on' : undefined} />
          ))}
        </ol>
        <div className="guide-controls">
          <button
            type="button"
            className="btn-secondary btn-sm"
            onClick={onBack}
            disabled={index === 0}
          >
            Back
          </button>
          <button type="button" className="btn-primary btn-sm" onClick={onNext}>
            {last ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
      <p className="guide-count">
        Step {index + 1} of {total}
      </p>
    </aside>
  );
}
