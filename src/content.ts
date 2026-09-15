/**
 * Shell copy, the tab list, and the guided walkthrough script.
 * The board speaks to the person operating it. It does not explain itself.
 */

export const PRODUCT_NAME = 'Bed Huddle Board';

export const HUDDLE_TIME = '3:00 PM';
export const HUDDLE_LABEL = 'Evening bed huddle';

/** The signed-in operator. Shown the way any working tool shows its user. */
export const USER = {
  initials: 'RA',
  name: 'R. Alvarez, RN',
  title: 'Nurse Manager',
};

export type TabId = 'board' | 'timeline' | 'patients' | 'teams' | 'handoff' | 'method';

export const TABS: { id: TabId; label: string; blurb: string }[] = [
  { id: 'board', label: 'Huddle board', blurb: 'What to work now' },
  { id: 'timeline', label: 'Next 6 hours', blurb: 'Beds freeing up against beds needed' },
  { id: 'patients', label: 'Patients', blurb: 'All twelve expected moves' },
  { id: 'teams', label: 'Teams', blurb: 'Who owes you a call back' },
  { id: 'handoff', label: 'Handoff', blurb: 'What this huddle decided' },
  { id: 'method', label: 'Method', blurb: 'How the ranking works' },
];

export interface DemoStep {
  tab: TabId;
  title: string;
  body: string;
  /** Optional concrete thing to click. */
  tryIt?: string;
  /** data-tour value of the region to scroll to and ring. */
  target?: string;
}

export const DEMO_STEPS: DemoStep[] = [
  {
    tab: 'board',
    target: 'capacity',
    title: 'Start with where you stand',
    body: 'Three patients are holding ED beds waiting to come up. Eight beds should free up before 9:00 PM. Five patients are stuck behind something operational, and two PACU bays cannot turn over.',
  },
  {
    tab: 'board',
    target: 'top-card',
    title: 'Work the top of the queue',
    body: 'ED-04 sits first: the admission is expected within two hours, the blocker is still open, and a miss lands on ED boarding. The room is assigned but nobody has started cleaning it.',
    tryIt: 'Press Assign / start. Environmental Services now owns it, due 3:20 PM.',
  },
  {
    tab: 'board',
    target: 'top-card',
    title: 'Clear it when the team calls back',
    body: 'Clearing a card drops it off the board and pulls in the next patient who needs a push. The queue only reshuffles on a clear, so cards never move under your hand mid-call.',
    tryIt: 'Press Mark cleared. 7W-12 takes the empty slot.',
  },
  {
    tab: 'timeline',
    target: 'timeline',
    title: 'Check supply against demand',
    body: 'Two ED admits need a bed between 4:00 and 5:00, and only one bay frees up in that hour. Amber chips are the moves with an open blocker, which is where an hour can quietly disappear.',
  },
  {
    tab: 'teams',
    target: 'teams',
    title: 'Make one call per team, not per patient',
    body: 'The same work grouped by who owns it, with the earliest deadline against each team. This is the list you read down during the huddle.',
    tryIt: 'Assign every open item for one team at once.',
  },
  {
    tab: 'patients',
    target: 'filters',
    title: 'The rest of the floor',
    body: 'All twelve expected moves, ordered by the same rule. Seven have no blocker, so they are context rather than work. Filter by window, by status, or down to blockers only.',
    tryIt: 'Tick Show only records with blockers.',
  },
  {
    tab: 'handoff',
    target: 'handoff',
    title: 'Close the huddle',
    body: 'What was assigned, what was cleared, what is still open, and the delay types this huddle can still move. Read it out, then hand it to the next shift.',
  },
  {
    tab: 'method',
    target: 'rule',
    title: 'Nothing here is a black box',
    body: 'The ranking is three numbers added together and printed on every card. Low confidence never pushes a patient up the queue. This page also lists what is synthetic and what would need validating in a real hospital.',
  },
];
