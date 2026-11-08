import React from 'react';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle,
  CheckSquare,
  Clock,
  Database,
  Globe,
  HardDrive,
  Headphones,
  Info,
  Laptop,
  Network,
  Server,
  Shield,
  ShieldAlert,
  Users,
  XCircle,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Badge } from '../components/ui/Badge.tsx';
import { Card } from '../components/ui/Card.tsx';
import { Customer, Incident, MonitoringEvent, ActionApproval, AIAgent } from '../types/index.ts';
import { PlatformKpiSummary } from '../utils/opsLogic.ts';
import { NavItemKey } from '../components/layout/Sidebar.tsx';

interface OverviewPageProps {
  kpis: PlatformKpiSummary;
  customers: Customer[];
  recentEvents: MonitoringEvent[];
  recentIncidents: Incident[];
  recentApprovals: ActionApproval[];
  agents: AIAgent[];
  chartData: {
    networkAvailability: { time: string; availability: number; latency: number }[];
    incidentTrends: { day: string; critical: number; high: number; medium: number }[];
    ticketStatusDistribution: { name: string; value: number; color: string }[];
  };
  onNavigate: (tab: NavItemKey) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  kpis,
  customers,
  recentEvents,
  recentIncidents,
  recentApprovals,
  agents,
  chartData,
  onNavigate,
}) => {
  return (
    <div className="space-y-6">
      {/* Page Title & Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Central IT Operations Dashboard
            <Badge variant="success" dot pulse>
              Operations Healthy
            </Badge>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time multi-tenant telemetry, autonomous agent orchestration, and incident correlation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('approvals')}
            className="flex items-center gap-2 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>{kpis.pendingApprovals} Approvals Pending</span>
          </button>
          <button
            onClick={() => onNavigate('agents')}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Agent Control Centre</span>
          </button>
        </div>
      </div>

      {/* 10 Required KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* 1. Managed Customers */}
        <div
          onClick={() => onNavigate('settings')}
          className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium">Managed Customers</span>
            <Users className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">
            {kpis.managedCustomersCount}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
            <span className="text-emerald-600 font-semibold">100% Active</span> tenants
          </div>
        </div>

        {/* 2. Total Devices */}
        <div
          onClick={() => onNavigate('monitoring')}
          className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium">Total Devices</span>
            <Server className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">
            {kpis.totalDevices}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            <span className="font-semibold text-blue-600">{kpis.fleetHealthPercent}%</span> fleet health
          </div>
        </div>

        {/* 3. Devices Online */}
        <div
          onClick={() => onNavigate('monitoring')}
          className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium">Devices Online</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 tracking-tight">
            {kpis.devicesOnline}
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-medium">Reporting heartbeat</div>
        </div>

        {/* 4. Devices Offline */}
        <div
          onClick={() => onNavigate('monitoring')}
          className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium">Devices Offline</span>
            <XCircle className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-700 tracking-tight">
            {kpis.devicesOffline}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Trading WKSTN idle</div>
        </div>

        {/* 5. Critical Incidents */}
        <div
          onClick={() => onNavigate('incidents')}
          className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-red-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium">Critical Incidents</span>
            <AlertOctagon className="w-4 h-4 text-red-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-red-600 tracking-tight">
            {kpis.criticalIncidents}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-red-600 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            Active containment
          </div>
        </div>

        {/* 6. Open Helpdesk Tickets */}
        <div
          onClick={() => onNavigate('helpdesk')}
          className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium">Open Tickets</span>
            <Headphones className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">
            {kpis.openHelpdeskTickets}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Auto-triaged by AI</div>
        </div>

        {/* 7. SLA Breaches */}
        <div
          onClick={() => onNavigate('helpdesk')}
          className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-red-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium">SLA Breaches</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600 tracking-tight">
            {kpis.slaBreaches}
          </div>
          <div className="mt-1 text-[11px] text-amber-700 font-medium">Warehouse Wi-Fi ticket</div>
        </div>

        {/* 8. Security Threats */}
        <div
          onClick={() => onNavigate('security')}
          className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-red-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium">Security Threats</span>
            <ShieldAlert className="w-4 h-4 text-red-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-red-600 tracking-tight">
            {kpis.securityThreats}
          </div>
          <div className="mt-1 text-[11px] text-red-600 font-medium">SentinelOne EDR isolated</div>
        </div>

        {/* 9. Failed Backup Jobs */}
        <div
          onClick={() => onNavigate('backup')}
          className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-orange-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium">Failed Backups</span>
            <HardDrive className="w-4 h-4 text-orange-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-orange-600 tracking-tight">
            {kpis.failedBackupJobs}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {kpis.backupSuccessRatePercent}% success rate
          </div>
        </div>

        {/* 10. Pending Approvals */}
        <div
          onClick={() => onNavigate('approvals')}
          className="bg-white p-3.5 rounded-xl border border-amber-300/80 bg-amber-50/20 shadow-2xs hover:border-amber-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-amber-800 text-xs">
            <span className="font-bold">Pending Approvals</span>
            <CheckSquare className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-700 tracking-tight">
            {kpis.pendingApprovals}
          </div>
          <div className="mt-1 text-[11px] text-amber-700 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Human gate required
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Network Availability & Latency Chart */}
        <Card
          title="Network Availability & Latency"
          subtitle="Real-time multi-site WAN uptime and latency trend"
          className="lg:col-span-2"
          action={
            <button
              onClick={() => onNavigate('network')}
              className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
            >
              <span>NetOps Telemetry</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          }
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.networkAvailability}>
                <defs>
                  <linearGradient id="availColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284C7" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0284C7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  domain={[97, 100]}
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  unit="%"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="availability"
                  name="WAN Availability (%)"
                  stroke="#0284C7"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#availColor)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
            <span>Overall Fleet WAN Uptime: <strong className="text-slate-800">99.82%</strong></span>
            <span>Avg Latency: <strong className="text-slate-800">18.4ms</strong></span>
            <span>SFP Optical Link Flap Dampened: <strong className="text-emerald-600">Yes</strong></span>
          </div>
        </Card>

        {/* Ticket Status Breakdown Donut */}
        <Card
          title="Helpdesk Ticket Status"
          subtitle="Real-time ticket load across PSA"
          action={
            <button
              onClick={() => onNavigate('helpdesk')}
              className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
            >
              <span>Zoho Desk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          }
        >
          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.ticketStatusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {chartData.ticketStatusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
            {chartData.ticketStatusDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 truncate">{item.name}:</span>
                <span className="font-semibold text-slate-900 ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Row 2: Customer Health Table + Pending Approval Summary Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer & Site Health Table */}
        <Card
          title="Customer & Site Operations Health"
          subtitle="Status, SLA compliance, and device count by tenant"
          className="lg:col-span-2"
          action={
            <button
              onClick={() => onNavigate('monitoring')}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              View All Devices
            </button>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Customer Tenant</th>
                  <th className="py-2.5 px-3">Tier</th>
                  <th className="py-2.5 px-3">SLA Commitment</th>
                  <th className="py-2.5 px-3">Devices</th>
                  <th className="py-2.5 px-3 text-right">Health Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-900 flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>{c.name}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                        {c.tier}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{c.slaTier}</td>
                    <td className="py-3 px-3 font-mono font-medium text-slate-800">
                      {c.activeDevicesCount}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex items-center gap-1.5 font-bold">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            c.healthScore >= 95
                              ? 'bg-emerald-500'
                              : c.healthScore >= 90
                              ? 'bg-blue-500'
                              : 'bg-amber-500'
                          }`}
                        />
                        <span
                          className={
                            c.healthScore >= 95
                              ? 'text-emerald-600'
                              : c.healthScore >= 90
                              ? 'text-blue-600'
                              : 'text-amber-600'
                          }
                        >
                          {c.healthScore}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Pending Approval Summary Card */}
        <Card
          title="Pending Action Approvals"
          subtitle="AI-proposed remediation actions awaiting human sign-off"
          action={
            <button
              onClick={() => onNavigate('approvals')}
              className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
            >
              <span>Approval Centre</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          }
        >
          {recentApprovals.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
              All proposed actions have been reviewed and executed.
            </div>
          ) : (
            <div className="space-y-3">
              {recentApprovals.map((appr) => (
                <div
                  key={appr.id}
                  className="p-3 bg-slate-50 hover:bg-slate-100/70 rounded-lg border border-slate-200 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-slate-900">{appr.actionNumber}</span>
                    <Badge
                      variant={
                        appr.riskLevel === 'Critical'
                          ? 'critical'
                          : appr.riskLevel === 'High'
                          ? 'high'
                          : 'medium'
                      }
                    >
                      {appr.riskLevel} Risk
                    </Badge>
                  </div>
                  <div className="text-xs font-semibold text-slate-800 mt-1 line-clamp-1">
                    {appr.proposedAction}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center justify-between">
                    <span>{appr.targetDeviceName}</span>
                    <span className="text-blue-600 font-medium">{appr.requestingAgentName}</span>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-end gap-2">
                    <button
                      onClick={() => onNavigate('approvals')}
                      className="px-2.5 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                    >
                      Review & Decide
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Row 3: Recent Events & Recent Agent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Monitoring Events */}
        <Card
          title="Recent Monitoring Telemetry"
          subtitle="Live stream from SentinelOne, PRTG, FortiGate, and Datto"
          action={
            <button
              onClick={() => onNavigate('monitoring')}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              Live Telemetry
            </button>
          }
        >
          <div className="space-y-2.5">
            {recentEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors text-xs"
              >
                <div className="mt-0.5 shrink-0">
                  {event.severity === 'Critical' && (
                    <AlertOctagon className="w-4 h-4 text-red-600" />
                  )}
                  {event.severity === 'High' && (
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                  )}
                  {event.severity === 'Medium' && (
                    <Activity className="w-4 h-4 text-amber-500" />
                  )}
                  {event.severity === 'Low' && <Info className="w-4 h-4 text-blue-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 truncate">{event.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
                      {new Date(event.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">{event.message}</p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                    <span className="font-semibold text-slate-600">{event.source}</span>
                    <span>•</span>
                    <span>{event.customerName}</span>
                    {event.correlatedIncidentId && (
                      <span className="text-blue-600 font-medium bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                        Correlated to Incident
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* AI Agent Operational Status */}
        <Card
          title="Autonomous AI Agent Readiness"
          subtitle="7 Specialized agents monitoring and investigating IT workloads"
          action={
            <button
              onClick={() => onNavigate('agents')}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              Control Centre
            </button>
          }
        >
          <div className="space-y-2.5">
            {agents.map((agent) => (
              <div
                key={agent.id}
                onClick={() => onNavigate('agents')}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-colors cursor-pointer group text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${agent.avatarColor} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs`}
                  >
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {agent.name}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">{agent.title}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-2">
                  <div className="text-right hidden sm:block">
                    <div className="text-[11px] font-semibold text-slate-800">
                      {agent.successRate}% Success
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {agent.completedInvestigationsCount} closed
                    </div>
                  </div>
                  <Badge
                    variant={
                      agent.status === 'Investigating'
                        ? 'high'
                        : agent.status === 'Awaiting Approval'
                        ? 'warning'
                        : 'success'
                    }
                    dot
                  >
                    {agent.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
