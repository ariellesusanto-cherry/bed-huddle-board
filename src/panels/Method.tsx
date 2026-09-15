import { BLOCKER_POINTS, IMPACT_POINTS, TIMING_POINTS } from '../priority';
import { PageHeader } from '../components/PageHeader';

const PREDICTION_FIELDS = [
  ['Expected transition', 'Admit, discharge, transfer, or hospital-at-home'],
  ['Expected window', 'Within 2, 4, or 6 hours'],
  ['Confidence', 'How sure that expectation is'],
];

const HOSPITAL_FIELDS = [
  ['Current location', 'Bed board and admission records'],
  [
    'Blocker and owner',
    'Environmental Services, transport, imaging, pharmacy, case management, and authorization work queues',
  ],
  ['Action and deadline', "The hospital's own escalation playbook"],
  ['Status', 'This board, written back to wherever the team already works'],
];

const VALIDATION = [
  'The weights below. They were chosen to be readable, not because they are correct.',
  'Which areas count as constrained. Here that is ED boarding and PACU holds. Elsewhere it might be the transfer centre or weekend imaging.',
  'Whether three is the right number to put in front of a huddle.',
  'Whether the owners, deadlines, and escalation paths match real teams and real pagers.',
  'Whether working the board actually reduces delays, measured before and after.',
];

export function Method() {
  return (
    <div className="panel">
      <PageHeader
        title="Method"
        note="How the queue is ordered, where each field would come from, and what a hospital would settle before trusting any of it."
      />
      <section className="block" data-tour="rule">
        <div className="sec-head">
          <h3 className="sec-title">How the queue is ordered</h3>
          <p className="sec-note">
            Three numbers added together, printed on every card.
          </p>
        </div>
        <div className="rule-grid">
          <div className="rule-card">
            <p className="rule-head">How soon the move is expected</p>
            <dl className="rule-rows">
              <div>
                <dt>Within 2 hours</dt>
                <dd>{TIMING_POINTS[2]}</dd>
              </div>
              <div>
                <dt>Within 4 hours</dt>
                <dd>{TIMING_POINTS[4]}</dd>
              </div>
              <div>
                <dt>Within 6 hours</dt>
                <dd>{TIMING_POINTS[6]}</dd>
              </div>
            </dl>
          </div>
          <div className="rule-card">
            <p className="rule-head">Whether a blocker is open</p>
            <dl className="rule-rows">
              <div>
                <dt>Needs action</dt>
                <dd>{BLOCKER_POINTS['Needs action']}</dd>
              </div>
              <div>
                <dt>In progress</dt>
                <dd>{BLOCKER_POINTS['In progress']}</dd>
              </div>
              <div>
                <dt>Cleared</dt>
                <dd>{BLOCKER_POINTS.Cleared}</dd>
              </div>
            </dl>
          </div>
          <div className="rule-card">
            <p className="rule-head">Where a miss lands</p>
            <dl className="rule-rows">
              <div>
                <dt>ED boarding</dt>
                <dd>{IMPACT_POINTS['ED boarding']}</dd>
              </div>
              <div>
                <dt>PACU hold</dt>
                <dd>{IMPACT_POINTS['PACU hold']}</dd>
              </div>
              <div>
                <dt>Discharge or transfer</dt>
                <dd>{IMPACT_POINTS['discharge delay']}</dd>
              </div>
            </dl>
          </div>
        </div>
        <p className="callout">
          Confidence never raises priority. A patient is not pushed up the queue
          for being uncertain. Confidence breaks exact ties only, and the more
          confident record wins.
        </p>
      </section>

      <div className="split">
        <section className="block">
          <h3 className="sec-title">What a prediction system supplies</h3>
          <dl className="source-list">
            {PREDICTION_FIELDS.map(([field, note]) => (
              <div key={field}>
                <dt>{field}</dt>
                <dd>{note}</dd>
              </div>
            ))}
          </dl>
          <p className="block-note">
            Three fields per patient. It supplies no blockers, no owners, and no
            actions.
          </p>
        </section>

        <section className="block">
          <h3 className="sec-title">What the hospital supplies</h3>
          <dl className="source-list">
            {HOSPITAL_FIELDS.map(([field, note]) => (
              <div key={field}>
                <dt>{field}</dt>
                <dd>{note}</dd>
              </div>
            ))}
          </dl>
          <p className="block-note">
            A prediction says what is likely. This board decides what to do about
            it, and that half stays editable by the hospital.
          </p>
        </section>
      </div>

      <section className="block">
        <h3 className="sec-title">Everything on this board is invented</h3>
        <p className="block-note" style={{ marginTop: 0 }}>
          All twelve records are hard-coded in one file. There is no database, no
          health-record connection, no external service, and no model call
          anywhere in this prototype. Patients appear only as bed labels such as
          ED-04 and 7W-12. There are no names, dates of birth, record numbers,
          ages, addresses, or diagnoses. Blockers are deliberately operational
          rather than clinical. The clock is frozen at 3:00 PM so every time on
          screen agrees with every other.
        </p>
      </section>

      <section className="block">
        <h3 className="sec-title">What a hospital would settle first</h3>
        <ul className="plain-list">
          {VALIDATION.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
