import React from 'react';
import type { Scheme } from '../../engine/types';

interface NavItem {
  scheme: Scheme;
  label: string;
  sublabel: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { scheme: 'NB',      label: 'New Building',       sublabel: 'NB',      icon: 'apartment' },
  { scheme: 'EB',      label: 'Existing Building',  sublabel: 'EB',      icon: 'domain' },
  { scheme: 'IS',      label: 'Interior Space',     sublabel: 'IS',      icon: 'meeting_room' },
  { scheme: 'TS',      label: 'Transit Station',    sublabel: 'TS',      icon: 'train' },
  { scheme: 'HOMES_A', label: 'Homes — Individual', sublabel: 'Homes A', icon: 'home' },
  { scheme: 'HOMES_B', label: 'Homes — Developer',  sublabel: 'Homes B', icon: 'holiday_village' },
  { scheme: 'NH_PLAN', label: 'Neighborhood',       sublabel: 'NH',      icon: 'map' },
];

interface SideNavProps {
  selected: Scheme | null;
  onSelect: (scheme: Scheme) => void;
  onNew: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const SideNav: React.FC<SideNavProps> = ({ selected, onSelect, onNew, isOpen, onClose }) => {
  const isActive = (scheme: Scheme) =>
    selected === scheme || (scheme === 'NH_PLAN' && selected === 'NH_BUILT');

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full z-30 w-64 bg-[#1B4E4D] flex flex-col
        transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Pure typography logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="flex flex-col leading-none">
            <span className="text-[#D3FEAB] font-bold text-base tracking-widest uppercase">GREENSHIP</span>
            <span className="text-white/40 text-[10px] tracking-wider uppercase mt-0.5">Fee Calculator</span>
          </div>
          <button onClick={onClose} className="ml-auto text-white/40 hover:text-white lg:hidden transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* New Calculation CTA */}
        <div className="px-4 pt-4 pb-2">
          <button
            onClick={() => { onNew(); onClose(); }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#D3FEAB] text-[#1B4E4D] text-sm font-semibold hover:bg-[#c5f89c] transition-colors duration-200"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            Kalkulasi Baru
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
          <p className="label-sm text-white/30 px-3 pt-3 pb-2">SKEMA SERTIFIKASI</p>
          {NAV_ITEMS.map(item => {
            const active = isActive(item.scheme);
            return (
              <button
                key={item.scheme}
                onClick={() => { onSelect(item.scheme); onClose(); }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left
                  transition-all duration-200 group
                  ${active ? 'bg-white/15 text-white' : 'text-white/60 hover:bg-white/8 hover:text-white/90'}
                `}
              >
                <span className={`material-symbols-outlined text-xl ${active ? 'text-[#D3FEAB]' : 'text-white/40 group-hover:text-white/60'}`}>
                  {item.icon}
                </span>
                <div className="min-w-0">
                  <p className={`text-sm leading-tight truncate ${active ? 'font-medium' : ''}`}>{item.label}</p>
                  <p className={`text-xs ${active ? 'text-[#D3FEAB]' : 'text-white/30'}`}>{item.sublabel}</p>
                </div>
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#D3FEAB] shrink-0" />}
              </button>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <p className="text-xs text-white/30 text-center">GBCI © 2026</p>
        </div>
      </aside>
    </>
  );
};

export default SideNav;
