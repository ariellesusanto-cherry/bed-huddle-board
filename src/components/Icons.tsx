/** Small stroke icons for the navigation rail. 20px on a 24 grid. */

const common = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function IconBed() {
  return (
    <svg {...common}>
      <path d="M3 7v11M3 12h18v6M21 18v-5.5a2.5 2.5 0 0 0-2.5-2.5H11v2.5" />
      <circle cx="7" cy="11" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconClock() {
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

export function IconList() {
  return (
    <svg {...common}>
      <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />
    </svg>
  );
}

export function IconTeams() {
  return (
    <svg {...common}>
      <circle cx="9" cy="8.5" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 6.2a3 3 0 0 1 0 5.6M18 19a5.2 5.2 0 0 0-2.4-4.4" />
    </svg>
  );
}

export function IconHandoff() {
  return (
    <svg {...common}>
      <path d="M9 4h6v3H9zM7 5.5H5.5A1.5 1.5 0 0 0 4 7v12a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 20 19V7a1.5 1.5 0 0 0-1.5-1.5H17" />
      <path d="M8.5 13.5l2.5 2.5 4.5-5" />
    </svg>
  );
}

export function IconMethod() {
  return (
    <svg {...common}>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10a2 2 0 0 1 2 2v13a1.8 1.8 0 0 0-1.8-1.5H5.5A1.5 1.5 0 0 1 4 16zM20 5.5A1.5 1.5 0 0 0 18.5 4H14a2 2 0 0 0-2 2v13a1.8 1.8 0 0 1 1.8-1.5h4.7A1.5 1.5 0 0 0 20 16z" />
    </svg>
  );
}
