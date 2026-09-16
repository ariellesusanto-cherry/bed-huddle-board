import { HUDDLE_TIME } from '../content';
import { NO_BLOCKER, type PatientRecord } from '../mockPatients';
import { isUnresolved, rankPatients, scenario, tallyImpacts } from '../priority';
import { HeadStat, PageHeader } from '../components/PageHeader';

export interface LogEntry {
  patientId: string;
  owner: string;
  kind: 'Assigned' | 'Cleared';
}

interface Props {
  patients: PatientRecord[];
  log: LogEntry[];
  scenarioOn: boolean;
  onToggleScenario: (next: boolean) => void;
}

export function Handoff({
  patients,
  log,
  scenarioOn,
  onToggleScenario,
}: Props) {
  const stillOpen = rankPatients(
    patients.filter((p) => p.blocker !== NO_BLOCKER && isUnresolved(p)),
  );
  const result = scenario(patients);
  const count = scenarioOn ? result.improvedCount : result.baselineCount;
  const resolved = tallyImpacts(result.resolvedImpacts);
  const remaining = tallyImpacts(result.remainingImpacts);

  const assigned = log.filter((e) => e.kind === 'Assigned').length;
  const cleared = log.filter((e) => e.kind === 'Cleared').length;

  return (
    <div className="panel" data-tour="handoff">
      <PageHeader
        title="Handoff"
        note={`Started at ${HUDDLE_TIME}. Read this out, then hand it to the next shift.`}
        meta={<HeadStat value={log.length} label="actions this huddle" />}
      />
      <section className="block">
        <h3 className="sec-title">What this huddle decided</h3>

        <div className="handoff-tally">
          <div>
            <p className="handoff-num">{assigned}</p>
            <p className="handoff-lbl">Assigned to a team</p>
          </div>
          <div>
            <p className="handoff-num">{cleared}</p>
            <p className="handoff-lbl">Cleared</p>
          </div>
          <div>
            <p className={stillOpen.length > 0 ? 'handoff-num warn' : 'handoff-num'}>
              {stillOpen.length}
            </p>
            <p className="handoff-lbl">Still open</p>
          </div>
        </div>

        {log.length === 0 ? (
          <p className="block-note">
            Nothing worked yet. Assign or clear a card on the board and
            it lands here.
          </p>
        ) : (
          <ol className="handoff-log">
            {log.map((entry, i) => (
              <li key={`${entry.patientId}-${entry.kind}-${i}`}>
                <span
                  className={
                    entry.kind === 'Cleared'
                      ? 'status-pill status-cleared'
                      : 'status-pill status-progress'
                  }
                >
                  {entry.kind}
                </span>
                <span className="handoff-log-id">{entry.patientId}</span>
                <span className="handoff-log-owner">{entry.owner}</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="block">
        <h3 className="sec-title">Carry forward</h3>
        {stillOpen.length === 0 ? (
          <p className="block-note" style={{ marginTop: 0 }}>
            Nothing outstanding. Every blocker on the floor is cleared.
          </p>
        ) : (
          <ul className="carry-list">
            {stillOpen.map((p) => (
              <li key={p.id}>
                <span className="carry-id">{p.id}</span>
                <span className="carry-blocker">{p.blocker}</span>
                <span className="carry-owner">{p.blockerOwner}</span>
                <span className="carry-due">{p.actionDeadline}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="block">
        <h3 className="sec-title">Delays this huddle can still move</h3>
        <div className="scenario">
          <label className="switch">
            <input
              type="checkbox"
              id="scenario-switch"
              checked={scenarioOn}
              onChange={(e) => onToggleScenario(e.target.checked)}
            />
            <span className="switch-track">
              <span className="switch-knob" />
            </span>
            <span>If the top three are finished on time</span>
          </label>

          <p
            className={
              scenarioOn ? 'scenario-headline improved' : 'scenario-headline'
            }
          >
            {count} {count === 1 ? 'delay' : 'delays'}{' '}
            {scenarioOn ? 'would remain likely' : 'likely'} before 9:00 PM.
          </p>

          <div className="impact-lists">
            <div>
              <h4>Cleared by the top three</h4>
              {resolved.length === 0 ? (
                <p className="section-note">Nothing on the board.</p>
              ) : (
                <ul>
                  {resolved.map(([impact, n]) => (
                    <li key={impact}>
                      {impact} &times; {n}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h4>Still likely either way</h4>
              {remaining.length === 0 ? (
                <p className="section-note">None.</p>
              ) : (
                <ul>
                  {remaining.map(([impact, n]) => (
                    <li key={impact}>
                      {impact} &times; {n}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <p className="scenario-caveat">
            Arithmetic on the twelve records on this board, not a forecast. A
            likely delay is an unresolved blocker that lands on a real delay
            type. Nothing here has been measured against outcomes.
          </p>
        </div>
      </section>
    </div>
  );
}
