import type { CapacityCounts } from '../priority';

interface Props {
  counts: CapacityCounts;
}

export function CapacityStrip({ counts }: Props) {
  const cells = [
    {
      value: counts.edWaitingForBeds,
      label: 'ED patients waiting for beds',
      def: 'In the ED with an expected admission',
      warn: false,
    },
    {
      value: counts.bedsExpectedToOpen,
      label: 'Beds expected to open by 9:00 PM',
      def: 'Inpatient and PACU patients expected to move out',
      warn: false,
    },
    {
      value: counts.unresolvedBlockers,
      label: 'Patients with an unresolved blocker',
      def: 'A named blocker that nobody has cleared yet',
      warn: counts.unresolvedBlockers > 0,
    },
    {
      value: counts.pacuAtRiskOfHold,
      label: 'PACU patients at risk of hold',
      def: 'In PACU with an onward move not yet settled',
      warn: counts.pacuAtRiskOfHold > 0,
    },
  ];

  return (
    <div className="capacity">
      {cells.map((cell) => (
        <div
          className={cell.warn ? 'capacity-cell warn' : 'capacity-cell'}
          key={cell.label}
        >
          <p className="capacity-label">{cell.label}</p>
          <p className="capacity-value">{cell.value}</p>
          <p className="capacity-def">{cell.def}</p>
        </div>
      ))}
    </div>
  );
}
