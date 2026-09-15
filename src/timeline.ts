/**
 * The six-hour horizon: beds freeing up against beds needed, hour by hour.
 * Everything is derived from the records. Nothing here is typed in.
 */

import type { PatientRecord } from './mockPatients';
import { hasBlocker, isUnresolved } from './priority';

export type Lane = 'frees' | 'needs';

/**
 * A patient in the ED or at the transfer centre needs a bed. A patient already
 * in an inpatient bed or a PACU bay frees one when they move.
 */
export function laneFor(p: PatientRecord): Lane {
  return p.locationKind === 'ED' || p.locationKind === 'Transfer Center'
    ? 'needs'
    : 'frees';
}

export interface HourBucket {
  /** Minutes from 3:00 PM at which the hour starts. */
  startMinutes: number;
  label: string;
  frees: PatientRecord[];
  needs: PatientRecord[];
}

const HOUR_LABELS = [
  '3–4 PM',
  '4–5 PM',
  '5–6 PM',
  '6–7 PM',
  '7–8 PM',
  '8–9 PM',
];

export function buildTimeline(patients: PatientRecord[]): HourBucket[] {
  const buckets: HourBucket[] = HOUR_LABELS.map((label, i) => ({
    startMinutes: i * 60,
    label,
    frees: [],
    needs: [],
  }));

  for (const p of patients) {
    const index = Math.min(
      buckets.length - 1,
      Math.floor(p.expectedAtMinutes / 60),
    );
    buckets[index][laneFor(p)].push(p);
  }

  for (const bucket of buckets) {
    bucket.frees.sort((a, b) => a.expectedAtMinutes - b.expectedAtMinutes);
    bucket.needs.sort((a, b) => a.expectedAtMinutes - b.expectedAtMinutes);
  }

  return buckets;
}

/** Hours where more patients need a bed than beds free up. */
export function tightHours(buckets: HourBucket[]): HourBucket[] {
  return buckets.filter((b) => b.needs.length > b.frees.length);
}

// --- Work grouped by the team that owns it --------------------------------

export interface TeamGroup {
  owner: string;
  open: PatientRecord[];
  inProgress: PatientRecord[];
  cleared: PatientRecord[];
  /** Earliest action deadline across the team's unfinished work. */
  nextDeadline: string | null;
  nextDeadlineMinutes: number;
}

export function groupByTeam(patients: PatientRecord[]): TeamGroup[] {
  const withBlockers = patients.filter(hasBlocker);
  const owners = [...new Set(withBlockers.map((p) => p.blockerOwner))];

  const groups = owners.map((owner): TeamGroup => {
    const mine = withBlockers.filter((p) => p.blockerOwner === owner);
    const open = mine.filter((p) => p.status === 'Needs action');
    const inProgress = mine.filter((p) => p.status === 'In progress');
    const cleared = mine.filter((p) => p.status === 'Cleared');
    const unfinished = mine.filter(isUnresolved);
    const soonest = unfinished.reduce<PatientRecord | null>(
      (best, p) =>
        best === null || p.minutesToDeadline < best.minutesToDeadline ? p : best,
      null,
    );
    return {
      owner,
      open,
      inProgress,
      cleared,
      nextDeadline: soonest ? soonest.actionDeadline : null,
      nextDeadlineMinutes: soonest ? soonest.minutesToDeadline : Infinity,
    };
  });

  // Teams with work still outstanding first, soonest deadline at the top.
  return groups.sort((a, b) => {
    if (a.nextDeadlineMinutes !== b.nextDeadlineMinutes) {
      return a.nextDeadlineMinutes - b.nextDeadlineMinutes;
    }
    return a.owner.localeCompare(b.owner);
  });
}
