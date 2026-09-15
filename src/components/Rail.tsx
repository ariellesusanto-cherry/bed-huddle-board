import type { ReactNode } from 'react';
import { PRODUCT_NAME, TABS, USER, type TabId } from '../content';
import {
  IconBed,
  IconClock,
  IconHandoff,
  IconList,
  IconMethod,
  IconTeams,
} from './Icons';

const ICONS: Record<TabId, ReactNode> = {
  board: <IconBed />,
  timeline: <IconClock />,
  patients: <IconList />,
  teams: <IconTeams />,
  handoff: <IconHandoff />,
  method: <IconMethod />,
};

export interface RailBadge {
  value: number;
  tone: 'accent' | 'amber' | 'quiet';
}

interface Props {
  active: TabId;
  badges: Partial<Record<TabId, RailBadge>>;
  onSelect: (tab: TabId) => void;
}

export function Rail({ active, badges, onSelect }: Props) {
  return (
    <div className="rail">
      <div className="rail-brand">
        <span className="rail-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none">
            <path
              d="M3 7v11M3 12h18v6M21 18v-5.5a2.5 2.5 0 0 0-2.5-2.5H11v2.5"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="7" cy="11" r="1.7" fill="currentColor" />
          </svg>
        </span>
        <span className="rail-name">{PRODUCT_NAME}</span>
      </div>

      <nav className="rail-nav" aria-label="Sections">
        {TABS.map((tab) => {
          const badge = badges[tab.id];
          return (
            <button
              key={tab.id}
              type="button"
              className="rail-item"
              aria-current={active === tab.id ? 'page' : undefined}
              onClick={() => onSelect(tab.id)}
            >
              <span className="rail-icon" aria-hidden="true">
                {ICONS[tab.id]}
              </span>
              <span className="rail-label">{tab.label}</span>
              {badge && badge.value > 0 && (
                <span className={`rail-badge ${badge.tone}`}>
                  {badge.value}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="rail-user">
        <span className="rail-avatar" aria-hidden="true">
          {USER.initials}
        </span>
        <div className="rail-user-text">
          <p className="rail-user-name">{USER.name}</p>
          <p className="rail-user-title">{USER.title}</p>
        </div>
      </div>
    </div>
  );
}
