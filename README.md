# Bed Huddle Board

**Live demo:** https://bed-huddle-board.vercel.app


A working prototype of the board a nurse manager would have open
during the bed huddle. It is built to be demoed end to end by
one person, with a guided tour built in.

The board answers one question and organises everything else around it:

> **Which three patients need an operational push right now, so a bed does not
> sit blocked for the next six hours?**

---

## Running it

```bash
npm install
npm run dev                          # http://localhost:5173
npm run build                        # type-check and build to dist/
node scripts/build-standalone.mjs    # one self-contained HTML file
```

## Demoing it

Press **Guided tour** in the top bar. Eight steps move you between sections,
ring the region being discussed, and on four of them name the exact thing to
click. `Esc` exits. **Reset** puts the shift back to 3:00 PM.

## The six sections

Navigation is a fixed dark rail down the left, with a live count against each
section: open blockers, hours short on beds, patients, teams outstanding, and
actions taken this huddle.

| Section | What it holds |
| --- | --- |
| **Huddle board** | Four capacity figures, then the three queue rows to work now, with a Shift watch rail carrying the next deadline, the longest ED wait, the hours short on beds, and what sits behind the top three. |
| **Next 6 hours** | Every expected move placed in the hour it is expected, in two lanes: beds freeing up against patients needing a bed. Amber marks a move with an open blocker. Hours where demand exceeds supply are tinted. |
| **Patients** | All twelve expected moves, with window, status, and blockers-only filters. |
| **Teams** | The same work grouped by the team that owns it, soonest deadline first, so it is one call per team instead of one call per patient. Assign and clear from here too. |
| **Handoff** | What was assigned, what was cleared, what is carried forward, and the delay types this huddle can still move. |
| **Method** | The ranking rule, the data sources, and what would need validating. |

## The ranking rule

Three numbers added together, printed on every card and set out in full on the
Method tab.

| Factor | Points |
| --- | --- |
| Expected within 2h / 4h / 6h | 50 / 30 / 15 |
| Blocker needs action / in progress / cleared | 25 / 10 / 0 |
| Miss lands on ED boarding or PACU hold / discharge or transfer / nothing | 20 / 10 / 0 |

**Confidence never raises priority.** A patient is not pushed up the queue for
being uncertain. Confidence breaks exact ties only, and the more confident
record wins.

The board order is pinned once computed, so assigning a job does not reshuffle
cards mid-call. It recalculates when a card is cleared, which is when a new
patient should be pulled in.

## What is synthetic

Everything. All twelve records are hard-coded in `src/mockPatients.ts`. There is
no backend, database, health-record connection, external service, or model call
anywhere in this prototype.

Patients appear only as bed labels such as `ED-04` and `7W-12`. There are no
names, dates of birth, record numbers, ages, addresses, or diagnoses. Blockers
are deliberately operational rather than clinical: room turnover, an unbooked
transport, an unscheduled imaging slot, medications not yet at the bedside, a
pending home oxygen confirmation, a case-management review, a payer
authorization. The clock is frozen at 3:00 PM so every time on screen agrees.

**The board does not predict anything.** The expected transition is an input,
labelled as such, with the tooltip "Illustrative input from a patient-flow
prediction system."

## What a prediction system would supply in a real deployment

Three fields per patient, and only three: the **expected transition** (admit,
discharge, transfer, or hospital-at-home), the **expected window** (within 2, 4,
or 6 hours), and the **confidence**.

Everything else comes from hospital operational systems. Current location from
the bed board. Blockers and owners from the service work queues. Actions and
deadlines from the hospital's own escalation playbook. Status from this board,
written back to wherever the team already works.

A prediction says what is likely. The board decides what to do about it, and
that half stays visible and editable by the hospital.

## What would require validation with a hospital partner

- The weights in `src/priority.ts`. They were chosen to be readable, not because
  they are correct.
- Which areas count as constrained. Here that is ED boarding and PACU holds.
- Whether three is the right number to put in front of a huddle.
- Whether the owners, deadlines, and escalation paths match real teams.
- Whether working the board actually reduces delays, measured before and after.

## Project layout

```
src/
  content.ts              shell copy, the tab list, the guided-tour script
  mockPatients.ts         the twelve synthetic records and their types
  priority.ts             ranking, capacity counts, scenario arithmetic
  timeline.ts             the six-hour horizon and the team grouping
  App.tsx                 tab, tour, patient, and huddle-log state
  styles.css              design tokens and layout
  format.ts               shared duration formatting
  components/
    Rail.tsx              the dark navigation rail with live counts
    Icons.tsx             the rail icon set
    PageHeader.tsx        the per-section header and its live figure
    DemoGuide.tsx         the guided-tour card
    CapacityStrip.tsx     the four derived numbers
    ActionRow.tsx         one queue row on the board
    TransitionsTable.tsx  all twelve records, with filters
  panels/
    Board.tsx             capacity plus the three cards
    Timeline.tsx          beds freeing up against beds needed
    Teams.tsx             work grouped by owning team
    Handoff.tsx           the huddle log, carry-forward, and what-if
    Method.tsx            the rule, the sources, the caveats
```

All state is local to the browser session.
