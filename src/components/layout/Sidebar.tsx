import React from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  BookOpen,
  Bot,
  CheckSquare,
  Cloud,
  Database,
  HardDriveDownload,
  Headphones,
  Layers,
  LayoutDashboard,
  Network,
  Settings,
  ShieldAlert,
  Zap,
} from 'lucide-react';

export type NavItemKey =
  | 'overview'
  | 'agents'
  | 'monitoring'
  | 'incidents'
  | 'helpdesk'
  | 'network'
  | 'security'
  | 'm365'
  | 'backup'
  | 'automation'
  | 'approvals'
  | 'knowledge'
  | 'reports'
  | 'integrations'
  | 'settings';

import { SystemMode } from '../../types/index.ts';

interface SidebarProps {
  currentTab: NavItemKey;
  onSelectTab: (tab: NavItemKey) => void;
  pendingApprovalsCount?: number;
  criticalIncidentsCount?: number;
  systemMode?: SystemMode;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  pendingApprovalsCount = 2,
  criticalIncidentsCount = 1,
  systemMode = 'demo',
}) => {
  const navItems: {
    key: NavItemKey;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
    badgeVariant?: 'red' | 'amber' | 'blue' | 'neutral';
  }[] = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    {
      key: 'agents',
      label: 'AI Agent Control Centre',
      icon: Bot,
      badge: '7 Active',
      badgeVariant: 'blue',
    },
    { key: 'monitoring', label: 'Live Monitoring', icon: Activity },
    {
      key: 'incidents',
      label: 'Incidents',
      icon: AlertTriangle,
      badge: criticalIncidentsCount > 0 ? `${criticalIncidentsCount} Critical` : undefined,
      badgeVariant: 'red',
    },
    { key: 'helpdesk', label: 'Helpdesk Operations', icon: Headphones, badge: '4', badgeVariant: 'neutral' },
    { key: 'network', label: 'Network Operations', icon: Network },
    { key: 'security', label: 'Security Operations', icon: ShieldAlert, badge: '1 Threat', badgeVariant: 'red' },
    { key: 'm365', label: 'Microsoft 365', icon: Cloud },
    { key: 'backup', label: 'Backup & Disaster Recovery', icon: HardDriveDownload },
    { key: 'automation', label: 'Automation Centre', icon: Zap },
    {
      key: 'approvals',
      label: 'Approval Centre',
      icon: CheckSquare,
      badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} Pending` : undefined,
      badgeVariant: 'amber',
    },
    { key: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
    { key: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { key: 'integrations', label: 'Integrations', icon: Layers, badge: '10', badgeVariant: 'neutral' },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className="w-64 bg-[#0A1224] text-slate-300 flex flex-col shrink-0 border-r border-[#152238] select-none h-screen sticky top-0"
      aria-label="Main Navigation"
    >
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center gap-3 border-b border-[#152238] bg-[#080E1C]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-bold">
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 19 21 12 17 5 21 12 2" />
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-white text-base tracking-tight">OpsPilot</span>
            <span className="px-1.5 py-0.2 bg-blue-500/20 text-blue-400 text-[10px] font-semibold rounded uppercase tracking-wider">
              Core
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-none mt-0.5">AI-Driven IT Operations</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <div className="px-3 pb-1.5 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
          Operations Platform
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onSelectTab(item.key)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-[#121E36]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0 ml-1.5 ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : item.badgeVariant === 'red'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : item.badgeVariant === 'amber'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                      : item.badgeVariant === 'blue'
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Database & System Connectivity Footer */}
      <div className="p-3 border-t border-[#152238] bg-[#070D1A] space-y-2">
        <div className="bg-[#0F1C36] rounded-lg p-2.5 border border-[#1C2C4E]">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-blue-400" />
              <span>Storage Engine</span>
            </span>
            <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Cloud SQL PG
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 truncate">
            Region: <span className="font-mono text-slate-300">asia-southeast1</span>
          </div>
        </div>

        <div className="flex items-center justify-between px-1 text-[10px] text-slate-400">
          <span>v1.0.0-rc3</span>
          {systemMode === 'live' ? (
            <span className="text-emerald-400 font-medium bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-800/40 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE SYSTEM
            </span>
          ) : (
            <span className="text-amber-400 font-medium bg-amber-950/40 px-1 rounded border border-amber-800/30">
              DEMO DATA ACTIVE
            </span>
          )}
        </div>
      </div>
    </aside>
  );
};
