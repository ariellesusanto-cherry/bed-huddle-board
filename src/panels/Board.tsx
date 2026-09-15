import { NO_BLOCKER, type PatientRecord } from '../mockPatients';
import { hasBlocker, isUnresolved, rankPatients, type CapacityCounts } from '../priority';
import { buildTimeline, tightHours } from '../timeline';
import { formatWait } from '../format';
import { ActionRow } from '../components/ActionRow';
import { CapacityStrip } from '../components/CapacityStrip';
import { HeadStat, PageHeader } from '../components/PageHeader';

interface Props {
  patients: PatientRecord[];
  counts: CapacityCounts;
  topThree: PatientRecord[];
  confirmations: Record<string, string>;
  onAssign: (id: string) => void;
  onClear: (id: string) => void;
  onReset: () => void;
}

export function Board({
  patients,
  counts,
  topThree,
  confirmations,
  onAssign,
  onClear,
  onReset,
}: Props) {
  const onBoard = new Set(topThree.map((p) => p.id));
  const nextUp = rankPatients(
    patients.filter(
      (p) => isUnresolved(p) && hasBlocker(p) && !onBoard.has(p.id),
    ),
  );

  const soonest = [...patients]
    .filter((p) => hasBlocker(p) && isUnresolved(p))
    .sort((a, b) => a.minutesToDeadline - b.minutesToDeadline)[0];

  const longestWait = [...patients]
    .filter((p) => p.boardingMinutes !== undefined)
    .sort((a, b) => (b.boardingMinutes ?? 0) - (a.boardingMinutes ?? 0))[0];

  const tight = tightHours(buildTimeline(patients));

  return (
    <div className="panel">
      <PageHeader
        title="Huddle board"
        note="The three open blockers most likely to cost a bed in the next six hours."
        meta={
          <HeadStat value={counts.unresolvedBlockers} label="open blockers" />
        }
      />

      <section data-tour="capacity">
        <CapacityStrip counts={counts} />
      </section>

      <div className="console">
        <section className="block console-main">
          <div className="sec-head">
            <h3 className="sec-title">Act now</h3>
            <p className="sec-note">One blocker, one team, one deadline each.</p>
          </div>

          {topThree.length === 0 ? (
            <div className="empty-queue">
              <p style={{ margin: 0 }}>
                Every blocker is cleared. Nothing is waiting on a push.
              </p>
              <button
                type="button"
                className="btn-secondary"
                onClick={onReset}
                style={{ marginTop: 14 }}
              >
                Reset the shift
              </button>
            </div>
          ) : (
            <div className="arows">
              {topThree.map((patient, index) => (
                <div
                  key={patient.id}
                  data-tour={index === 0 ? 'top-card' : undefined}
                >
                  <ActionRow
                    patient={patient}
                    rank={index + 1}
                    confirmation={confirmations[patient.id] ?? null}
                    onAssign={onAssign}
                    onClear={onClear}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        <aside className="block console-aside">
          <h3 className="sec-title">Shift watch</h3>

          <div className="watch">
            <div className="watch-item">
              <p className="watch-label">Next deadline</p>
              {soonest ? (
                <>
                  <p className="watch-value amber">{soonest.actionDeadline}</p>
                  <p className="watch-note">
                    {soonest.id} · {soonest.blockerOwner} ·{' '}
                    {soonest.minutesToDeadline} min
                  </p>
                </>
              ) : (
                <p className="watch-value quiet">None</p>
              )}
            </div>

            <div className="watch-item">
              <p className="watch-label">Longest ED wait</p>
              {longestWait?.boardingMinutes !== undefined ? (
                <>
                  <p className="watch-value">
                    {formatWait(longestWait.boardingMinutes)}
                  </p>
                  <p className="watch-note">
                    {longestWait.id} · {longestWait.currentLocation}
                  </p>
                </>
              ) : (
                <p className="watch-value quiet">None</p>
              )}
            </div>

            <div className="watch-item">
              <p className="watch-label">Hours short on beds</p>
              {tight.length > 0 ? (
                <>
                  <p className="watch-value amber">
                    {tight.map((b) => b.label).join(', ')}
                  </p>
                  <p className="watch-note">
                    More patients need a bed than free up
                  </p>
                </>
              ) : (
                <p className="watch-value quiet">None</p>
              )}
            </div>
          </div>

          <div className="nextup">
            <p className="nextup-head">Behind the top three</p>
            {nextUp.length === 0 ? (
              <p className="watch-note">Nothing else is blocked.</p>
            ) : (
              <ul>
                {nextUp.map((p) => (
                  <li key={p.id}>
                    <span className="nextup-id">{p.id}</span>
                    <span className="nextup-owner">
                      {p.blocker === NO_BLOCKER ? '—' : p.blockerOwner}
                    </span>
                    <span className="nextup-due">{p.actionDeadline}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
