import { PREDICTION_TOOLTIP, type PatientRecord } from '../mockPatients';
import { explainPriority, whyPrioritized } from '../priority';
import { formatWait } from '../format';

interface Props {
  patient: PatientRecord;
  rank: number;
  confirmation: string | null;
  onAssign: (id: string) => void;
  onClear: (id: string) => void;
}

const VERB: Record<PatientRecord['expectedTransition'], string> = {
  Admit: 'Likely admission',
  Discharge: 'Likely discharge',
  Transfer: 'Likely transfer',
  'Alternative Care': 'Likely move to hospital-at-home',
};

export function ActionRow({
  patient,
  rank,
  confirmation,
  onAssign,
  onClear,
}: Props) {
  const factors = explainPriority(patient);
  const inProgress = patient.status === 'In progress';

  return (
    <article className={`arow rank-${rank}${inProgress ? ' in-progress' : ''}`}>
      <div className="arow-rank" aria-label={`Priority ${rank}`}>
        <span className="arow-rank-num">{rank}</span>
      </div>

      <div className="arow-body">
        <div className="arow-grid">
          <div className="arow-who">
            <h3 className="arow-id">{patient.id}</h3>
            <p className="arow-loc">{patient.currentLocation}</p>
            {patient.boardingMinutes !== undefined && (
              <p className="arow-wait">
                waiting {formatWait(patient.boardingMinutes)}
              </p>
            )}
          </div>

          <div className="arow-cell">
            <p className="cell-head" title={PREDICTION_TOOLTIP}>
              Expected transition
            </p>
            <p className="arow-transition">
              {VERB[patient.expectedTransition]} within{' '}
              {patient.expectedWithinHours}h
            </p>
            <p className="arow-sub">
              by {patient.expectedAt} · confidence {patient.confidence}%
            </p>
          </div>

          <div className="arow-cell arow-blocker">
            <p className="cell-head">Blocker</p>
            <p className="arow-blocker-text">{patient.blocker}</p>
            <p className="arow-consequence">
              If missed: {patient.consequence}
            </p>
          </div>

          <div className="arow-cell">
            <p className="cell-head">Owner</p>
            <p className="arow-owner">{patient.blockerOwner}</p>
            <p className="arow-due">
              by {patient.actionDeadline}
              <span> {patient.minutesToDeadline} min</span>
            </p>
          </div>

        </div>

        <div className="arow-foot">
          <p className="arow-next">
            <span>Next action</span>
            {patient.action}
          </p>
          <details className="why">
            <summary>Why this is ranked {rank}</summary>
            <p>{whyPrioritized(patient)}</p>
            <p className="factors">
              timing {factors.timing} + blocker {factors.blocker} + constrained
              area {factors.impact} = {factors.total} · confidence is not part of
              the score
            </p>
          </details>
        </div>

        {confirmation && <p className="confirmation">{confirmation}</p>}
      </div>

      <div className="arow-side">
        <span
          className={
            inProgress
              ? 'status-pill status-progress'
              : 'status-pill status-needs'
          }
        >
          {patient.status}
        </span>
        <button
          type="button"
          className="btn-primary"
          onClick={() => onAssign(patient.id)}
          disabled={inProgress}
        >
          {inProgress ? 'Assigned' : 'Assign / start'}
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => onClear(patient.id)}
        >
          Mark cleared
        </button>
      </div>
    </article>
  );
}
