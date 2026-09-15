/**
 * Queue ordering for "Next 6 Hours".
 *
 * This is a plain, readable rule. It is not a model, not proprietary, and not
 * tuned on any real data. It exists so a bed manager can look at the queue and
 * immediately understand why a patient is at the top.
 *
 * Three factors add together:
 *   1. How soon the expected transition is.
 *   2. Whether there is an unresolved operational blocker.
 *   3. Whether a miss lands on a constrained area (ED boarding or PACU hold).
 *
 * Confidence deliberately does NOT raise priority. A low-confidence record is
 * never pushed up the queue just for being uncertain. Confidence is used only
 * to break exact ties, and when it does, the HIGHER confidence record sorts
 * first.
 */

import {
  NO_BLOCKER,
  type DelayImpact,
  type PatientRecord,
  type PatientStatus,
} from './mockPatients';

/** Sooner expected transition = higher priority. */
export const TIMING_POINTS: Record<number, number> = {
  2: 50,
  4: 30,
  6: 15,
};

/** An unresolved blocker is what makes a record actionable at all. */
export const BLOCKER_POINTS: Record<PatientStatus, number> = {
  'Needs action': 25,
  'In progress': 10,
  Cleared: 0,
};

/** A miss on a constrained area costs more than a miss elsewhere. */
export const IMPACT_POINTS: Record<DelayImpact, number> = {
  'ED boarding': 20,
  'PACU hold': 20,
  'transfer delay': 10,
  'discharge delay': 10,
  none: 0,
};

export interface PriorityBreakdown {
  timing: number;
  blocker: number;
  impact: number;
  total: number;
}

export function hasBlocker(p: PatientRecord): boolean {
  return p.blocker !== NO_BLOCKER;
}

/** A record is unresolved while its status is anything other than Cleared. */
export function isUnresolved(p: PatientRecord): boolean {
  return p.status !== 'Cleared';
}

export function explainPriority(p: PatientRecord): PriorityBreakdown {
  const timing = TIMING_POINTS[p.expectedWithinHours] ?? 0;
  const blocker = hasBlocker(p) ? BLOCKER_POINTS[p.status] : 0;
  const impact = hasBlocker(p) && isUnresolved(p) ? IMPACT_POINTS[p.delayImpact] : 0;
  return { timing, blocker, impact, total: timing + blocker + impact };
}

export function computePriority(p: PatientRecord): number {
  return explainPriority(p).total;
}

/**
 * One plain-English sentence for the "Why this is prioritized" disclosure.
 * Built from the same three factors the score uses, so the sentence and the
 * number can never drift apart.
 */
export function whyPrioritized(p: PatientRecord): string {
  const parts: string[] = [];

  parts.push(
    `the expected transition is inside ${p.expectedWithinHours} hours`,
  );

  if (hasBlocker(p)) {
    parts.push(
      p.status === 'In progress'
        ? 'the blocker is being worked but is not cleared'
        : 'an operational blocker is still open',
    );
  } else {
    parts.push('no blocker has been identified');
  }

  if (p.delayImpact === 'ED boarding') {
    parts.push('a miss adds to ED boarding');
  } else if (p.delayImpact === 'PACU hold') {
    parts.push('a miss holds a PACU bay');
  } else if (p.delayImpact === 'none') {
    parts.push('no constrained area is affected');
  } else {
    parts.push(`a miss causes a ${p.delayImpact}`);
  }

  return `Ranked here because ${parts[0]}, ${parts[1]}, and ${parts[2]}.`;
}

/**
 * Order the queue. Highest score first. Exact ties fall back to higher
 * confidence, then to the sooner deadline, then to the id, so the order is
 * fully deterministic on every render.
 */
export function rankPatients(patients: PatientRecord[]): PatientRecord[] {
  return [...patients].sort((a, b) => {
    const diff = computePriority(b) - computePriority(a);
    if (diff !== 0) return diff;
    if (b.confidence !== a.confidence) return b.confidence - a.confidence;
    if (a.minutesToDeadline !== b.minutesToDeadline) {
      return a.minutesToDeadline - b.minutesToDeadline;
    }
    return a.id.localeCompare(b.id);
  });
}

/** The three records the huddle should work first. */
export function actNowQueue(patients: PatientRecord[]): PatientRecord[] {
  return rankPatients(patients.filter(isUnresolved)).slice(0, 3);
}

// --- Capacity strip -------------------------------------------------------
// Every number below is derived from the records. None of them are typed in.

export interface CapacityCounts {
  edWaitingForBeds: number;
  bedsExpectedToOpen: number;
  unresolvedBlockers: number;
  pacuAtRiskOfHold: number;
}

export function capacityCounts(patients: PatientRecord[]): CapacityCounts {
  return {
    // ED patients whose expected transition is an admission, still open.
    edWaitingForBeds: patients.filter(
      (p) =>
        p.locationKind === 'ED' &&
        p.expectedTransition === 'Admit' &&
        isUnresolved(p),
    ).length,

    // Occupied beds and bays whose patient is expected to leave within 6h.
    bedsExpectedToOpen: patients.filter(
      (p) =>
        (p.locationKind === 'Inpatient' || p.locationKind === 'PACU') &&
        p.expectedTransition !== 'Admit',
    ).length,

    // Records with a named blocker that nobody has cleared yet.
    unresolvedBlockers: patients.filter((p) => hasBlocker(p) && isUnresolved(p))
      .length,

    // PACU bays whose onward move is not yet settled.
    pacuAtRiskOfHold: patients.filter(
      (p) => p.locationKind === 'PACU' && isUnresolved(p),
    ).length,
  };
}

// --- Illustrative scenario ------------------------------------------------

export interface ScenarioResult {
  baselineCount: number;
  improvedCount: number;
  resolvedImpacts: DelayImpact[];
  remainingImpacts: DelayImpact[];
}

/**
 * A likely delay is an unresolved blocker that lands on a real delay type.
 * The "if the top 3 are completed on time" view simply removes the three
 * records currently in the Act now queue. It is arithmetic on this page's own
 * data, not a forecast.
 */
export function scenario(patients: PatientRecord[]): ScenarioResult {
  const likely = patients.filter(
    (p) => hasBlocker(p) && isUnresolved(p) && p.delayImpact !== 'none',
  );
  const topThreeIds = new Set(actNowQueue(patients).map((p) => p.id));
  const resolved = likely.filter((p) => topThreeIds.has(p.id));
  const remaining = likely.filter((p) => !topThreeIds.has(p.id));

  return {
    baselineCount: likely.length,
    improvedCount: remaining.length,
    resolvedImpacts: resolved.map((p) => p.delayImpact),
    remainingImpacts: remaining.map((p) => p.delayImpact),
  };
}

export function tallyImpacts(impacts: DelayImpact[]): [DelayImpact, number][] {
  const counts = new Map<DelayImpact, number>();
  for (const impact of impacts) {
    counts.set(impact, (counts.get(impact) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}
