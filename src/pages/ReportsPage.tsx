import React from 'react';
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  PieChart as PieIcon,
  Shield,
  TrendingUp,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Badge } from '../components/ui/Badge.tsx';
import { Card } from '../components/ui/Card.tsx';

export const ReportsPage: React.FC = () => {
  const mttrData = [
    { category: 'Endpoint Crash', autonomousAgent: 1.2, humanEngineer: 18.4 },
    { category: 'SFP Link Attenuation', autonomousAgent: 4.5, humanEngineer: 45.0 },
    { category: 'Kerberos Threat Isolation', autonomousAgent: 0.8, humanEngineer: 35.0 },
    { category: 'Snapshot IOPS Throttle', autonomousAgent: 2.1, humanEngineer: 24.0 },
    { category: 'M365 Token Revocation', autonomousAgent: 0.5, humanEngineer: 15.0 },
  ];

  const categoryDistribution = [
    { name: 'Security & EDR', value: 34, color: '#EF4444' },
    { name: 'Network & SD-WAN', value: 28, color: '#0284C7' },
    { name: 'Backup & Storage', value: 18, color: '#8B5CF6' },
    { name: 'Cloud & M365', value: 12, color: '#10B981' },
    { name: 'Endpoint / RMM', value: 8, color: '#F59E0B' },
  ];

  const handleExport = (format: 'pdf' | 'csv') => {
    alert(`Exporting executive ${format.toUpperCase()} compliance report for Q4 2026.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Reports & Executive Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational efficiency benchmarks, Mean Time To Resolution (MTTR), and SLA compliance reporting.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('pdf')}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-slate-600" />
            <span>Export Executive PDF</span>
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV Audit</span>
          </button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Overall SLA Compliance</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">99.82%</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Target: 99.50%</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">MTTR Autonomous vs Human</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">1.8m vs 27m</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">15x speed multiplier</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Autonomous Resolutions 30d</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">1,248</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across all 5 tenants</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Security Incidents Contained</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">100%</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Zero customer ransomware impact</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MTTR Comparison Bar Chart */}
        <Card
          title="Mean Time To Resolution (Minutes)"
          subtitle="AI Agent Investigation vs Traditional Manual Escalation"
          className="lg:col-span-2"
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mttrData}>
                <XAxis dataKey="category" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit="m" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar
                  dataKey="autonomousAgent"
                  name="OpsPilot Autonomous (Min)"
                  fill="#0284C7"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="humanEngineer"
                  name="Manual Baseline (Min)"
                  fill="#94A3B8"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Breakdown Pie */}
        <Card title="Incident Category Distribution" subtitle="Workload distribution by domain">
          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
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
          <div className="space-y-1 pt-2 border-t border-slate-100 text-xs">
            {categoryDistribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </span>
                <span className="font-semibold text-slate-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
