import type { PatientRecord } from '../mockPatients';
import { groupByTeam } from '../timeline';
import { HeadStat, PageHeader } from '../components/PageHeader';

interface Props {
  patients: PatientRecord[];
  onAssign: (id: string) => void;
  onClear: (id: string) => void;
}

export function Teams({ patients, onAssign, onClear }: Props) {
  const groups = groupByTeam(patients);
  const waiting = groups.filter(
    (g) => g.open.length + g.inProgress.length > 0,
  ).length;

  return (
    <div className="panel">
      <PageHeader
        title="Teams"
        note="The same work grouped by the team that owns it, soonest deadline first. One call per team instead of one call per patient."
        meta={
          <HeadStat
            value={waiting}
            label={waiting === 1 ? 'team outstanding' : 'teams outstanding'}
          />
        }
      />
      <section className="block" data-tour="teams">

        <div className="team-list">
          {groups.map((g) => {
            const outstanding = g.open.length + g.inProgress.length;
            return (
              <article
                className={outstanding === 0 ? 'team done' : 'team'}
                key={g.owner}
              >
                <header className="team-head">
                  <div>
                    <h4 className="team-name">{g.owner}</h4>
                    <p className="team-sub">
                      {outstanding === 0
                        ? 'All clear'
                        : `${outstanding} outstanding · ${g.cleared.length} cleared`}
                    </p>
                  </div>
                  {g.nextDeadline && (
                    <p className="team-deadline">
                      <span>By</span>
                      {g.nextDeadline}
                    </p>
                  )}
                </header>

                <ul className="team-items">
                  {[...g.open, ...g.inProgress, ...g.cleared].map((p) => (
                    <li key={p.id}>
                      <div className="team-item-main">
                        <p className="team-item-id">
                          {p.id}
                          <span className="team-item-loc">
                            {p.currentLocation}
                          </span>
                        </p>
                        <p className="team-item-action">{p.action}</p>
                      </div>
                      <div className="team-item-side">
                        <span className={statusClass(p)}>{p.status}</span>
                        {p.status !== 'Cleared' && (
                          <div className="team-item-buttons">
                            <button
                              type="button"
                              className="btn-secondary btn-sm"
                              onClick={() => onAssign(p.id)}
                              disabled={p.status === 'In progress'}
                            >
                              {p.status === 'In progress' ? 'Assigned' : 'Assign'}
                            </button>
                            <button
                              type="button"
                              className="btn-secondary btn-sm"
                              onClick={() => onClear(p.id)}
                            >
                              Clear
                            </button>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function statusClass(p: PatientRecord) {
  if (p.status === 'Needs action') return 'status-pill status-needs';
  if (p.status === 'In progress') return 'status-pill status-progress';
  return 'status-pill status-cleared';
}
