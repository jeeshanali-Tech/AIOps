import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  Globe,
  Info,
  LogOut,
  RefreshCw,
  Search,
  Shield,
  User,
} from 'lucide-react';
import { Customer, GitHubConnectionState, SystemMode } from '../../types/index.ts';

interface HeaderProps {
  customers: Customer[];
  selectedCustomerId: number | 'all';
  onSelectCustomer: (id: number | 'all') => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  pendingApprovalsCount?: number;
  onOpenApprovals?: () => void;
  systemMode?: SystemMode;
  onToggleMode?: (mode: SystemMode) => void;
  gitHubStatus?: GitHubConnectionState;
  onOpenGitHubModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  customers,
  selectedCustomerId,
  onSelectCustomer,
  onRefresh,
  isRefreshing = false,
  pendingApprovalsCount = 0,
  onOpenApprovals,
  systemMode = 'demo',
  onToggleMode,
  gitHubStatus,
  onOpenGitHubModal,
}) => {
  const [showDemoInfo, setShowDemoInfo] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const selectedCustomer =
    selectedCustomerId === 'all'
      ? null
      : customers.find((c) => c.id === selectedCustomerId);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      {/* Left: Customer Context Selector & Breadcrumb */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="customer-select" className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span>Tenant:</span>
          </label>
          <div className="relative">
            <select
              id="customer-select"
              value={selectedCustomerId}
              onChange={(e) => {
                const val = e.target.value;
                onSelectCustomer(val === 'all' ? 'all' : Number(val));
              }}
              className="text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-lg py-1.5 pl-3 pr-8 focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-colors cursor-pointer appearance-none"
            >
              <option value="all">All Managed Customers ({customers.length} Tenants)</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {selectedCustomer && (
          <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-200 text-xs">
            <span className="text-slate-500">SLA:</span>
            <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
              {selectedCustomer.slaTier}
            </span>
            <span className="text-slate-500 ml-1">Health:</span>
            <span className="font-semibold text-emerald-600">{selectedCustomer.healthScore}%</span>
          </div>
        )}
      </div>

      {/* Center: Search Bar */}
      <div className="hidden lg:flex items-center relative w-72">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search devices, alerts, IPs, tickets..."
          className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs border border-slate-200 rounded-lg py-1.5 pl-8 pr-10 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all"
        />
        <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs">
          ⌘K
        </kbd>
      </div>

      {/* Right: Actions, Demo/Live Mode Switch, GitHub Badge & User Profile */}
      <div className="flex items-center gap-3">
        {/* GitHub Live Status Badge */}
        {gitHubStatus?.connected ? (
          <button
            onClick={onOpenGitHubModal}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 hover:bg-black text-white rounded-md text-[11px] font-medium transition-colors shadow-2xs"
            title={`Connected to GitHub as @${gitHubStatus.user?.login || 'user'}`}
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span className="font-mono truncate max-w-[100px]">@{gitHubStatus.user?.login}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        ) : (
          <button
            onClick={onOpenGitHubModal}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[11px] font-medium transition-colors"
            title="Connect with GitHub for real IaC & runbook tracking"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>Connect GitHub</span>
          </button>
        )}

        {/* DEMO DATA / LIVE SYSTEM Mode Switch */}
        <div className="relative">
          {systemMode === 'live' ? (
            <button
              onClick={() => setShowDemoInfo(!showDemoInfo)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-md text-[11px] font-semibold transition-colors"
              title="Real production operations mode active"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE SYSTEM</span>
              <Info className="w-3 h-3 text-emerald-600" />
            </button>
          ) : (
            <button
              onClick={() => setShowDemoInfo(!showDemoInfo)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-md text-[11px] font-semibold transition-colors"
              title="Sample dataset notice - Click to switch to Real System"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>DEMO DATA</span>
              <Info className="w-3 h-3 text-amber-600" />
            </button>
          )}

          {showDemoInfo && (
            <div className="absolute right-0 mt-2 w-84 bg-white rounded-xl shadow-xl border border-slate-200 p-4 text-xs text-slate-600 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 font-semibold text-slate-900">
                <span className="flex items-center gap-1.5 text-slate-800">
                  <Shield className="w-4 h-4 text-blue-600" /> Operations Mode Control
                </span>
                <button
                  onClick={() => setShowDemoInfo(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              </div>
              <p className="mt-2 text-slate-600 leading-relaxed">
                Currently running in <strong className={systemMode === 'live' ? 'text-emerald-700' : 'text-amber-700'}>{systemMode === 'live' ? 'Live Real-System Mode' : 'Synthetic Demo Mode'}</strong>.
                {systemMode === 'live'
                  ? ' Real external integration probes, GitHub DevOps repository sync, and Cloud SQL storage are actively streaming.'
                  : ' Realistic synthetic telemetry is loaded for all 5 enterprise tenants and 7 autonomous AI agents.'}
              </p>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Toggle Environment:</span>
                <button
                  onClick={() => {
                    const nextMode = systemMode === 'live' ? 'demo' : 'live';
                    onToggleMode?.(nextMode);
                    setShowDemoInfo(false);
                  }}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors shadow-2xs ${
                    systemMode === 'live'
                      ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {systemMode === 'live' ? 'Switch to Demo Data' : 'Activate Real Live System'}
                </button>
              </div>
            </div>
          )}
        </div>


        {/* Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            title="Poll telemetry updates"
            aria-label="Refresh telemetry data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        )}

        {/* Pending Approvals Bell Alert */}
        <button
          onClick={onOpenApprovals}
          className="relative p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          title={`${pendingApprovalsCount} Actions awaiting human approval`}
          aria-label="View action approvals"
        >
          <Bell className="w-4 h-4" />
          {pendingApprovalsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
              {pendingApprovalsCount}
            </span>
          )}
        </button>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            aria-expanded={showUserMenu}
            aria-label="User profile menu"
          >
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-semibold text-xs flex items-center justify-center shadow-2xs">
              OE
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-slate-800 leading-tight">Ops Engineer</div>
              <div className="text-[10px] text-slate-500 leading-tight">Super Admin</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 text-xs text-slate-700 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3.5 py-2 border-b border-slate-100">
                <div className="font-semibold text-slate-900">Operations Control</div>
                <div className="text-[11px] text-slate-500 truncate">ops.engineer@opspilot.internal</div>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                  <CheckCircle2 className="w-3 h-3" /> Firebase Auth Verified
                </div>
              </div>
              <button
                onClick={() => setShowUserMenu(false)}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>My Profile & Session</span>
              </button>
              <button
                onClick={() => setShowUserMenu(false)}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
              >
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                <span>RBAC Permissions</span>
              </button>
              <div className="border-t border-slate-100 my-1" />
              <button
                onClick={() => setShowUserMenu(false)}
                className="w-full text-left px-3.5 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
