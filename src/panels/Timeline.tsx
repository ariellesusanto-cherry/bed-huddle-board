import { NO_BLOCKER, type PatientRecord } from '../mockPatients';
import { isUnresolved } from '../priority';
import { buildTimeline, tightHours } from '../timeline';
import { HeadStat, PageHeader } from '../components/PageHeader';

interface Props {
  patients: PatientRecord[];
}

function Chip({ p }: { p: PatientRecord }) {
  const blocked = p.blocker !== NO_BLOCKER && isUnresolved(p);
  return (
    <li className={blocked ? 'tl-chip blocked' : 'tl-chip'}>
      <span className="tl-chip-id">{p.id}</span>
      <span className="tl-chip-at">{p.expectedAt}</span>
      <span className="tl-chip-note">
        {blocked ? p.blockerOwner : p.expectedTransition}
      </span>
    </li>
  );
}

export function Timeline({ patients }: Props) {
  const buckets = buildTimeline(patients);
  const tight = tightHours(buckets);

  return (
    <div className="panel">
      <PageHeader
        title="Next 6 hours"
        note="Every expected move placed in the hour it is expected. Amber means the move still has an open blocker, so that hour is not safe to count on."
        meta={
          <HeadStat
            value={tight.length}
            label={tight.length === 1 ? 'tight hour' : 'tight hours'}
          />
        }
      />
      <section className="block" data-tour="timeline">

        <div className="tl-wrap">
          <div className="tl">
            <div className="tl-rowhead">
              <span className="tl-lane-label frees">Beds freeing up</span>
              <span className="tl-lane-label needs">Patients needing a bed</span>
            </div>
            {buckets.map((b) => {
              const short = b.needs.length > b.frees.length;
              return (
                <div className={short ? 'tl-col short' : 'tl-col'} key={b.label}>
                  <p className="tl-hour">{b.label}</p>
                  <ul className="tl-lane">
                    {b.frees.length === 0 ? (
                      <li className="tl-none">—</li>
                    ) : (
                      b.frees.map((p) => <Chip key={p.id} p={p} />)
                    )}
                  </ul>
                  <ul className="tl-lane">
                    {b.needs.length === 0 ? (
                      <li className="tl-none">—</li>
                    ) : (
                      b.needs.map((p) => <Chip key={p.id} p={p} />)
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {tight.length > 0 && (
          <p className="callout amber">
            {tight.length === 1
              ? `More patients need a bed than free up in one hour: ${tight[0].label}.`
              : `More patients need a bed than free up in ${tight.length} hours: ${tight
                  .map((b) => b.label)
                  .join(', ')}.`}{' '}
            Clearing the blockers in the hour before is what moves this.
          </p>
        )}
      </section>
    </div>
  );
}
