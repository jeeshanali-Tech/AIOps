import React from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Bot,
  CheckCircle,
  Eye,
  Lock,
  Radio,
  Search,
  Shield,
  ShieldAlert,
  Terminal,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge.tsx';
import { Card } from '../components/ui/Card.tsx';
import { SecurityAlert } from '../types/index.ts';

interface SecurityOpsPageProps {
  alerts: SecurityAlert[];
  onOpenApprovals?: () => void;
}

export const SecurityOpsPage: React.FC<SecurityOpsPageProps> = ({ alerts, onOpenApprovals }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Security Operations Centre (SOC)
            <Badge variant="critical" dot pulse>
              SentinelOne Singularity Live
            </Badge>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Behavioral EDR threat lineage, MITRE ATT&CK mapping, and automated quarantine containment.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onOpenApprovals && (
            <button
              onClick={onOpenApprovals}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Review Active Containment Approval</span>
            </button>
          )}
        </div>
      </div>

      {/* Security Threat Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Active Threat Severity</div>
          <div className="text-2xl font-bold text-red-600 mt-1">1 Critical</div>
          <div className="text-[11px] text-red-600 font-medium mt-0.5">LSASS Memory Dump Attempt</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Quarantined Endpoints</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">1 Device</div>
          <div className="text-[11px] text-slate-500 mt-0.5">WKSTN-TRADING-41 isolated</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">EDR Behavioral Engine</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">Online</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">142 Endpoints Protected</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Mitigated Incidents 30d</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">28</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Zero lateral movement detected</div>
        </div>
      </div>

      {/* Active Threats Table */}
      <Card
        title="SentinelOne Threat Lineage & MITRE ATT&CK Matrix"
        subtitle="Detected malicious processes, IOCs, and automated containment actions"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Threat ID</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Threat Classification</th>
                <th className="py-2.5 px-3">MITRE Tactic</th>
                <th className="py-2.5 px-3">Target Device & Customer</th>
                <th className="py-2.5 px-3">EDR Engine</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Detected At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {alerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-red-600">
                    {alert.threatId}
                  </td>
                  <td className="py-3 px-3">
                    <Badge
                      variant={
                        alert.severity === 'Critical'
                          ? 'critical'
                          : alert.severity === 'High'
                          ? 'high'
                          : 'medium'
                      }
                      dot
                    >
                      {alert.severity}
                    </Badge>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900">{alert.classification}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                      {alert.mitreTactic}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-mono font-medium text-slate-800">{alert.deviceName}</div>
                    <div className="text-[11px] text-slate-500">{alert.customerName}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-medium">
                    {alert.sentinelOneEngine}
                  </td>
                  <td className="py-3 px-3">
                    <Badge
                      variant={
                        alert.status === 'Active Threat'
                          ? 'critical'
                          : alert.status === 'Quarantined'
                          ? 'warning'
                          : 'success'
                      }
                      dot={alert.status === 'Active Threat'}
                      pulse={alert.status === 'Active Threat'}
                    >
                      {alert.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-[11px] text-slate-500">
                    {new Date(alert.detectedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Security Investigation Deep-Dive Box */}
      <div className="p-4 bg-slate-900 rounded-xl text-white space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-sm tracking-tight">
              Security Operations Agent Investigation Log: Threat S1-THR-882
            </h3>
          </div>
          <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold">
            Action Approval Pending (ACT-4902)
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-mono">
          [12:05:12] EDR HOOK: Process powershell.exe (PID 8412) requested OpenProcessToken on LSASS (PID 684).
          <br />
          [12:05:15] BEHAVIORAL AI: Heuristic confidence 96% match for Mimikatz sekurlsa::logonpasswords.
          <br />
          [12:05:40] ISOLATION: Dispatched network quarantine command to agent endpoint WKSTN-TRADING-41.
          <br />
          [12:07:05] ESCALATION: Created Approval Request ACT-4902 for FortiGate WAN Port 2 egress IP block.
        </p>
      </div>
    </div>
  );
};
