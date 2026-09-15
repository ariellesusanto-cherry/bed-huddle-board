/**
 * Synthetic demonstration data. Not for clinical use.
 *
 * Every record below is invented. There are no names, dates of birth, MRNs,
 * addresses, or any other personal detail. Patients are referred to only by an
 * operational bed/track label such as "ED-04" or "7W-12".
 *
 * `expectedTransition` is labelled "Expected transition" everywhere in the UI.
 * It represents an illustrative input that a patient-flow prediction system
 * would supply. This prototype does not predict anything itself.
 */

export type CurrentLocation = string;

export type ExpectedTransition =
  | 'Admit'
  | 'Discharge'
  | 'Transfer'
  | 'Alternative Care';

export type ExpectedWithinHours = 2 | 4 | 6;

export type BlockerOwner =
  | 'Case Management'
  | 'Environmental Services'
  | 'Transport'
  | 'Imaging'
  | 'Pharmacy'
  | 'Receiving Unit'
  | 'Home Health'
  | 'Payer Authorization'
  | 'Unassigned';

export type DelayImpact =
  | 'ED boarding'
  | 'discharge delay'
  | 'transfer delay'
  | 'PACU hold'
  | 'none';

export type PatientStatus = 'Needs action' | 'In progress' | 'Cleared';

/** A coarse grouping of `currentLocation`, used for the capacity strip. */
export type LocationKind = 'ED' | 'Inpatient' | 'PACU' | 'Transfer Center';

export const NO_BLOCKER = 'None identified';

export interface PatientRecord {
  id: string;
  currentLocation: CurrentLocation;
  locationKind: LocationKind;
  expectedTransition: ExpectedTransition;
  expectedWithinHours: ExpectedWithinHours;
  /** Percentage, 62-94. Shown quietly. Never used to raise priority. */
  confidence: number;
  blocker: string;
  blockerOwner: BlockerOwner;
  action: string;
  /** Clock time the move itself is expected, inside the stated window. */
  expectedAt: string;
  /** Minutes from 3:00 PM until `expectedAt`. Drives the six-hour timeline. */
  expectedAtMinutes: number;
  /** For ED patients only: how long they have already waited for a bed. */
  boardingMinutes?: number;
  /** Clock time within the next 15-120 minutes of the 3:00 PM huddle. */
  actionDeadline: string;
  /** Minutes from 3:00 PM until `actionDeadline`. Used for display only. */
  minutesToDeadline: number;
  /** What goes wrong if the action is missed. */
  consequence: string;
  delayImpact: DelayImpact;
  /** Integer used only to order the queue. Recomputed in priority.ts. */
  priorityScore: number;
  status: PatientStatus;
}

export const MOCK_PATIENTS: PatientRecord[] = [
  {
    id: 'ED-04',
    expectedAt: '4:15 PM',
    expectedAtMinutes: 75,
    boardingMinutes: 210,
    currentLocation: 'ED bay 4',
    locationKind: 'ED',
    expectedTransition: 'Admit',
    expectedWithinHours: 2,
    confidence: 88,
    blocker: 'Receiving inpatient bed assigned but room cleaning not started',
    blockerOwner: 'Environmental Services',
    action: 'Escalate 7W room turnover to the EVS lead and confirm a start time',
    actionDeadline: '3:20 PM',
    minutesToDeadline: 20,
    consequence: 'ED bay stays occupied and the next ambulance offload backs up',
    delayImpact: 'ED boarding',
    priorityScore: 95,
    status: 'Needs action',
  },
  {
    id: 'PACU-03',
    expectedAt: '4:00 PM',
    expectedAtMinutes: 60,
    currentLocation: 'PACU bay 3',
    locationKind: 'PACU',
    expectedTransition: 'Transfer',
    expectedWithinHours: 2,
    confidence: 81,
    blocker: 'Step-down bed accepted but transport has not been booked',
    blockerOwner: 'Transport',
    action: 'Book transport to 5E and confirm pickup window with the PACU charge nurse',
    actionDeadline: '3:25 PM',
    minutesToDeadline: 25,
    consequence: 'PACU bay is held and the next two OR cases lose their recovery slot',
    delayImpact: 'PACU hold',
    priorityScore: 95,
    status: 'Needs action',
  },
  {
    id: 'ED-11',
    expectedAt: '4:45 PM',
    expectedAtMinutes: 105,
    boardingMinutes: 145,
    currentLocation: 'ED bay 11',
    locationKind: 'ED',
    expectedTransition: 'Admit',
    expectedWithinHours: 2,
    confidence: 74,
    blocker: 'Imaging needed before disposition and no slot is scheduled',
    blockerOwner: 'Imaging',
    action: 'Schedule the CT slot before 4:15 PM and notify the ED charge nurse',
    actionDeadline: '3:35 PM',
    minutesToDeadline: 35,
    consequence: 'Disposition slips past shift change and the patient boards overnight',
    delayImpact: 'ED boarding',
    priorityScore: 95,
    status: 'Needs action',
  },
  {
    id: '7W-12',
    expectedAt: '6:00 PM',
    expectedAtMinutes: 180,
    currentLocation: '7W Medical',
    locationKind: 'Inpatient',
    expectedTransition: 'Discharge',
    expectedWithinHours: 4,
    confidence: 86,
    blocker: 'Discharge expected in 3 hours but home oxygen confirmation is pending',
    blockerOwner: 'Home Health',
    action: 'Confirm the home oxygen delivery window with the DME vendor',
    actionDeadline: '4:00 PM',
    minutesToDeadline: 60,
    consequence: 'Discharge slides to tomorrow and the bed does not open tonight',
    delayImpact: 'discharge delay',
    priorityScore: 65,
    status: 'Needs action',
  },
  {
    id: '5E-09',
    expectedAt: '5:30 PM',
    expectedAtMinutes: 150,
    currentLocation: '5E Surgical',
    locationKind: 'Inpatient',
    expectedTransition: 'Discharge',
    expectedWithinHours: 4,
    confidence: 79,
    blocker: 'Discharge medications not yet sent to bedside',
    blockerOwner: 'Pharmacy',
    action: 'Confirm discharge medications are released and delivered to the bedside',
    actionDeadline: '4:10 PM',
    minutesToDeadline: 70,
    consequence: 'Patient waits in the room after the ride arrives, holding the bed',
    delayImpact: 'discharge delay',
    priorityScore: 50,
    status: 'In progress',
  },
  {
    id: '4N-07',
    expectedAt: '8:00 PM',
    expectedAtMinutes: 300,
    currentLocation: '4N Telemetry',
    locationKind: 'Inpatient',
    expectedTransition: 'Alternative Care',
    expectedWithinHours: 6,
    confidence: 67,
    blocker: 'Hospital-at-home eligibility review is waiting for case management',
    blockerOwner: 'Case Management',
    action: 'Complete the hospital-at-home eligibility review and post the decision',
    actionDeadline: '4:40 PM',
    minutesToDeadline: 100,
    consequence: 'Patient stays inpatient overnight instead of moving to home care',
    delayImpact: 'discharge delay',
    priorityScore: 15,
    status: 'Cleared',
  },
  {
    id: 'TC-02',
    expectedAt: '7:45 PM',
    expectedAtMinutes: 285,
    currentLocation: 'Transfer Center',
    locationKind: 'Transfer Center',
    expectedTransition: 'Transfer',
    expectedWithinHours: 6,
    confidence: 72,
    blocker: 'Accepted transfer has no confirmed receiving unit bed',
    blockerOwner: 'Receiving Unit',
    action: 'Confirm the 4N bed assignment with the receiving charge nurse',
    actionDeadline: '4:50 PM',
    minutesToDeadline: 110,
    consequence: 'Accepted transfer is turned away and the referral goes elsewhere',
    delayImpact: 'transfer delay',
    priorityScore: 15,
    status: 'Cleared',
  },
  {
    id: 'ED-07',
    expectedAt: '6:30 PM',
    expectedAtMinutes: 210,
    boardingMinutes: 80,
    currentLocation: 'ED bay 7',
    locationKind: 'ED',
    expectedTransition: 'Admit',
    expectedWithinHours: 4,
    confidence: 70,
    blocker: NO_BLOCKER,
    blockerOwner: 'Unassigned',
    action: 'Confirm the bed request is posted and watch for a 5E assignment',
    actionDeadline: '5:00 PM',
    minutesToDeadline: 120,
    consequence: 'No blocker identified. Monitor only.',
    delayImpact: 'none',
    priorityScore: 30,
    status: 'Needs action',
  },
  {
    id: 'PACU-06',
    expectedAt: '5:45 PM',
    expectedAtMinutes: 165,
    currentLocation: 'PACU bay 6',
    locationKind: 'PACU',
    expectedTransition: 'Transfer',
    expectedWithinHours: 4,
    confidence: 77,
    blocker: NO_BLOCKER,
    blockerOwner: 'Unassigned',
    action: 'Confirm the 7W bed is still held for this post-op arrival',
    actionDeadline: '4:20 PM',
    minutesToDeadline: 80,
    consequence: 'No blocker identified. Monitor only.',
    delayImpact: 'none',
    priorityScore: 30,
    status: 'Needs action',
  },
  {
    id: '5E-14',
    expectedAt: '8:30 PM',
    expectedAtMinutes: 330,
    currentLocation: '5E Surgical',
    locationKind: 'Inpatient',
    expectedTransition: 'Transfer',
    expectedWithinHours: 6,
    confidence: 64,
    blocker: 'Payer authorization for post-acute placement is still pending',
    blockerOwner: 'Payer Authorization',
    action: 'Confirm the authorization decision and record the reference number',
    actionDeadline: '4:45 PM',
    minutesToDeadline: 105,
    consequence: 'Post-acute placement is lost for today and the bed stays occupied',
    delayImpact: 'transfer delay',
    priorityScore: 15,
    status: 'Cleared',
  },
  {
    id: '7W-18',
    expectedAt: '7:30 PM',
    expectedAtMinutes: 270,
    currentLocation: '7W Medical',
    locationKind: 'Inpatient',
    expectedTransition: 'Discharge',
    expectedWithinHours: 6,
    confidence: 90,
    blocker: NO_BLOCKER,
    blockerOwner: 'Unassigned',
    action: 'Confirm the ride home is arranged for late afternoon',
    actionDeadline: '4:55 PM',
    minutesToDeadline: 115,
    consequence: 'No blocker identified. Monitor only.',
    delayImpact: 'none',
    priorityScore: 15,
    status: 'Needs action',
  },
  {
    id: '4N-15',
    expectedAt: '8:15 PM',
    expectedAtMinutes: 315,
    currentLocation: '4N Telemetry',
    locationKind: 'Inpatient',
    expectedTransition: 'Discharge',
    expectedWithinHours: 6,
    confidence: 93,
    blocker: NO_BLOCKER,
    blockerOwner: 'Unassigned',
    action: 'Confirm the discharge paperwork packet is assembled',
    actionDeadline: '5:00 PM',
    minutesToDeadline: 120,
    consequence: 'No blocker identified. Monitor only.',
    delayImpact: 'none',
    priorityScore: 15,
    status: 'Needs action',
  },
];

export const PREDICTION_TOOLTIP =
  'Illustrative input from a patient-flow prediction system.';
