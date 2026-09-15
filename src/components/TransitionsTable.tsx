import { NO_BLOCKER, type PatientRecord, type PatientStatus } from '../mockPatients';
import { PREDICTION_TOOLTIP } from '../mockPatients';
import { hasBlocker, rankPatients } from '../priority';
import { formatWait } from '../format';

export type WindowFilter = 'all' | 2 | 4 | 6;
export type StatusFilter = 'all' | PatientStatus;

interface Props {
  patients: PatientRecord[];
  topThreeIds: Set<string>;
  windowFilter: WindowFilter;
  statusFilter: StatusFilter;
  blockersOnly: boolean;
  onWindowFilter: (value: WindowFilter) => void;
  onStatusFilter: (value: StatusFilter) => void;
  onBlockersOnly: (value: boolean) => void;
}

const WINDOWS: { value: WindowFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 2, label: '2h' },
  { value: 4, label: '4h' },
  { value: 6, label: '6h' },
];

const STATUSES: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'Needs action', label: 'Needs action' },
  { value: 'In progress', label: 'In progress' },
  { value: 'Cleared', label: 'Cleared' },
];

function statusClass(status: PatientStatus) {
  if (status === 'Needs action') return 'status-pill status-needs';
  if (status === 'In progress') return 'status-pill status-progress';
  return 'status-pill status-cleared';
}

export function TransitionsTable({
  patients,
  topThreeIds,
  windowFilter,
  statusFilter,
  blockersOnly,
  onWindowFilter,
  onStatusFilter,
  onBlockersOnly,
}: Props) {
  const rows = rankPatients(patients).filter((p) => {
    if (windowFilter !== 'all' && p.expectedWithinHours !== windowFilter) {
      return false;
    }
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (blockersOnly && !hasBlocker(p)) return false;
    return true;
  });

  return (
    <>
      <div className="filters" data-tour="filters">
        <div className="filter-group">
          <span id="window-filter-label">Window</span>
          <div role="group" aria-labelledby="window-filter-label">
            {WINDOWS.map((w) => (
              <button
                key={String(w.value)}
                type="button"
                className="chip"
                aria-pressed={windowFilter === w.value}
                onClick={() => onWindowFilter(w.value)}
                style={{ marginRight: 6 }}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <span id="status-filter-label">Status</span>
          <div role="group" aria-labelledby="status-filter-label">
            {STATUSES.map((s) => (
              <button
                key={String(s.value)}
                type="button"
                className="chip"
                aria-pressed={statusFilter === s.value}
                onClick={() => onStatusFilter(s.value)}
                style={{ marginRight: 6 }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <label className="checkbox">
          <input
            type="checkbox"
            checked={blockersOnly}
            onChange={(e) => onBlockersOnly(e.target.checked)}
          />
          Show only records with blockers
        </label>
      </div>

      <div className="table-wrap">
        {rows.length === 0 ? (
          <p className="table-empty">No records match these filters.</p>
        ) : (
          <table>
            <caption className="sr-only">
              All expected transitions in the next six hours, ordered by queue
              priority.
            </caption>
            <thead>
              <tr>
                <th scope="col">Patient</th>
                <th scope="col">Location</th>
                <th scope="col" title={PREDICTION_TOOLTIP}>
                  Expected transition
                </th>
                <th scope="col">Window</th>
                <th scope="col">Blocker</th>
                <th scope="col">Owner</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className={topThreeIds.has(p.id) ? 'top3' : ''}>
                  <td className="cell-id">{p.id}</td>
                  <td>
                    {p.currentLocation}
                    {p.boardingMinutes !== undefined && (
                      <span className="cell-sub">
                        waiting {formatWait(p.boardingMinutes)}
                      </span>
                    )}
                  </td>
                  <td>
                    {p.expectedTransition}
                    <span className="cell-sub">by {p.expectedAt}</span>
                  </td>
                  <td>
                    <span className="window-pill">
                      &le; {p.expectedWithinHours}h
                    </span>
                  </td>
                  <td className={p.blocker === NO_BLOCKER ? 'cell-muted' : ''}>
                    {p.blocker}
                  </td>
                  <td className={p.blockerOwner === 'Unassigned' ? 'cell-muted' : ''}>
                    {p.blockerOwner === 'Unassigned' ? '—' : p.blockerOwner}
                  </td>
                  <td>
                    <span className={statusClass(p.status)}>{p.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <p className="table-count">
        Showing {rows.length} of {patients.length} records. A blue edge marks a
        record currently in the Act now queue.
      </p>
    </>
  );
}
