import { useEffect, useMemo, useState } from 'react';
import {
  DEMO_STEPS,
  HUDDLE_LABEL,
  HUDDLE_TIME,
  type TabId,
} from './content';
import { MOCK_PATIENTS, type PatientRecord } from './mockPatients';
import { actNowQueue, capacityCounts, isUnresolved } from './priority';
import { buildTimeline, groupByTeam, tightHours } from './timeline';
import { DemoGuide } from './components/DemoGuide';
import { HeadStat, PageHeader } from './components/PageHeader';
import { Rail, type RailBadge } from './components/Rail';
import {
  TransitionsTable,
  type StatusFilter,
  type WindowFilter,
} from './components/TransitionsTable';
import { Board } from './panels/Board';
import { Handoff, type LogEntry } from './panels/Handoff';
import { Method } from './panels/Method';
import { Teams } from './panels/Teams';
import { Timeline } from './panels/Timeline';

function freshPatients(): PatientRecord[] {
  return MOCK_PATIENTS.map((p) => ({ ...p }));
}

export default function App() {
  const [tab, setTab] = useState<TabId>('board');
  const [demoStep, setDemoStep] = useState<number | null>(null);

  const [patients, setPatients] = useState<PatientRecord[]>(freshPatients);
  // The board order is pinned once computed, so starting a job does not
  // reshuffle cards mid-call. It recalculates when something is cleared.
  const [queueIds, setQueueIds] = useState<string[]>(() =>
    actNowQueue(freshPatients()).map((p) => p.id),
  );
  const [confirmations, setConfirmations] = useState<Record<string, string>>({});
  const [log, setLog] = useState<LogEntry[]>([]);
  const [scenarioOn, setScenarioOn] = useState(false);
  const [windowFilter, setWindowFilter] = useState<WindowFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [blockersOnly, setBlockersOnly] = useState(false);

  const counts = useMemo(() => capacityCounts(patients), [patients]);
  const topThree = useMemo(
    () =>
      queueIds
        .map((id) => patients.find((p) => p.id === id))
        .filter((p): p is PatientRecord => p !== undefined && isUnresolved(p)),
    [patients, queueIds],
  );
  const topThreeIds = useMemo(
    () => new Set(topThree.map((p) => p.id)),
    [topThree],
  );

  // Walkthrough: follow the step to its tab, then ring and scroll its region.
  useEffect(() => {
    document
      .querySelectorAll('[data-tour].tour-target')
      .forEach((el) => el.classList.remove('tour-target'));
    if (demoStep === null) return;

    const step = DEMO_STEPS[demoStep];
    setTab(step.tab);

    const timer = window.setTimeout(() => {
      if (!step.target) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const el = document.querySelector(`[data-tour="${step.target}"]`);
      if (!el) return;
      el.classList.add('tour-target');
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);

    return () => window.clearTimeout(timer);
  }, [demoStep]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && demoStep !== null) setDemoStep(null);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [demoStep]);

  function assign(id: string) {
    const patient = patients.find((p) => p.id === id);
    if (!patient || patient.status !== 'Needs action') return;
    setPatients((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'In progress' } : p)),
    );
    setConfirmations((prev) => ({
      ...prev,
      [id]: `Assigned to ${patient.blockerOwner}. Due by ${patient.actionDeadline}.`,
    }));
    setLog((prev) => [
      ...prev,
      { patientId: id, owner: patient.blockerOwner, kind: 'Assigned' },
    ]);
  }

  function clear(id: string) {
    const patient = patients.find((p) => p.id === id);
    if (!patient || patient.status === 'Cleared') return;
    const next = patients.map((p): PatientRecord =>
      p.id === id ? { ...p, status: 'Cleared' } : p,
    );
    setPatients(next);
    // Clearing is the moment the board refills, so recalculate it here.
    setQueueIds(actNowQueue(next).map((p) => p.id));
    setConfirmations((prev) => {
      const rest = { ...prev };
      delete rest[id];
      return rest;
    });
    setLog((prev) => [
      ...prev,
      { patientId: id, owner: patient.blockerOwner, kind: 'Cleared' },
    ]);
  }

  function reset() {
    const fresh = freshPatients();
    setPatients(fresh);
    setQueueIds(actNowQueue(fresh).map((p) => p.id));
    setConfirmations({});
    setLog([]);
    setScenarioOn(false);
    setWindowFilter('all');
    setStatusFilter('all');
    setBlockersOnly(false);
    setDemoStep(null);
    setTab('board');
  }

  function nextStep() {
    setDemoStep((i) =>
      i === null ? null : i + 1 >= DEMO_STEPS.length ? null : i + 1,
    );
  }

  const badges: Partial<Record<TabId, RailBadge>> = {
    board: { value: counts.unresolvedBlockers, tone: 'amber' },
    timeline: {
      value: tightHours(buildTimeline(patients)).length,
      tone: 'amber',
    },
    patients: { value: patients.length, tone: 'quiet' },
    teams: {
      value: groupByTeam(patients).filter(
        (g) => g.open.length + g.inProgress.length > 0,
      ).length,
      tone: 'quiet',
    },
    handoff: { value: log.length, tone: 'accent' },
  };

  return (
    <div className="shell">
      <Rail active={tab} badges={badges} onSelect={setTab} />

      <div className="content">
        <header className="topbar">
          <div className="topbar-shift">
            <span className="shift-dot" aria-hidden="true" />
            <span className="shift-time">{HUDDLE_TIME}</span>
            <span className="shift-label">{HUDDLE_LABEL}</span>
          </div>
          <div className="topbar-actions">
            <span className="demo-tag">Demo · synthetic data</span>
            <button
              type="button"
              className="btn-secondary btn-sm"
              onClick={() => setDemoStep(0)}
            >
              Guided tour
            </button>
            <button
              type="button"
              className="btn-secondary btn-sm"
              onClick={reset}
            >
              Reset
            </button>
          </div>
        </header>

      <main className="page">
        {tab === 'board' && (
          <Board
            patients={patients}
            counts={counts}
            topThree={topThree}
            confirmations={confirmations}
            onAssign={assign}
            onClear={clear}
            onReset={reset}
          />
        )}

        {tab === 'timeline' && <Timeline patients={patients} />}

        {tab === 'patients' && (
          <div className="panel">
            <PageHeader
              title="Patients"
              note="Every expected move before 9:00 PM, ordered the same way the board is. A blue edge marks a patient currently on the board."
              meta={
                <HeadStat value={patients.length} label="expected moves" />
              }
            />
            <section className="block">
              <TransitionsTable
                patients={patients}
                topThreeIds={topThreeIds}
                windowFilter={windowFilter}
                statusFilter={statusFilter}
                blockersOnly={blockersOnly}
                onWindowFilter={setWindowFilter}
                onStatusFilter={setStatusFilter}
                onBlockersOnly={setBlockersOnly}
              />
            </section>
          </div>
        )}

        {tab === 'teams' && (
          <Teams patients={patients} onAssign={assign} onClear={clear} />
        )}

        {tab === 'handoff' && (
          <Handoff
            patients={patients}
            log={log}
            scenarioOn={scenarioOn}
            onToggleScenario={setScenarioOn}
          />
        )}

        {tab === 'method' && <Method />}

          <footer>
            <p>
              Demo environment · synthetic data only · not for clinical use ·
              clock fixed at {HUDDLE_TIME}
            </p>
          </footer>
        </main>
      </div>

      {demoStep !== null && (
        <DemoGuide
          index={demoStep}
          onBack={() =>
            setDemoStep((i) => (i === null ? null : Math.max(0, i - 1)))
          }
          onNext={nextStep}
          onExit={() => setDemoStep(null)}
        />
      )}
    </div>
  );
}
