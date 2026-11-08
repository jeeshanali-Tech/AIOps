import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Play,
  RotateCw,
  Search,
  Terminal,
  Zap,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge.tsx';
import { Card } from '../components/ui/Card.tsx';
import { AutomationRun } from '../types/index.ts';

interface AutomationPageProps {
  runs: AutomationRun[];
}

export const AutomationPage: React.FC<AutomationPageProps> = ({ runs }) => {
  const [selectedRun, setSelectedRun] = useState<AutomationRun | null>(runs[0] || null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Automation Centre
            <Badge variant="info">Autonomous Playbooks</Badge>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Event-driven remediations, automated health sweeps, and approved action execution logs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Playbook History Table */}
        <Card
          title="Automation Execution History"
          subtitle="Recent playbook invocations"
          className="lg:col-span-2"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Playbook Name</th>
                  <th className="py-2.5 px-3">Trigger Type</th>
                  <th className="py-2.5 px-3">Executed By</th>
                  <th className="py-2.5 px-3">Target Entity</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {runs.map((run) => (
                  <tr
                    key={run.id}
                    onClick={() => setSelectedRun(run)}
                    className={`hover:bg-slate-50/70 cursor-pointer transition-colors ${
                      selectedRun?.id === run.id ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <td className="py-3 px-3 font-semibold text-slate-900">{run.name}</td>
                    <td className="py-3 px-3 text-slate-600">{run.triggerType}</td>
                    <td className="py-3 px-3 text-blue-600 font-medium">{run.executedBy}</td>
                    <td className="py-3 px-3 font-mono text-slate-700">{run.targetEntity}</td>
                    <td className="py-3 px-3">
                      <Badge
                        variant={
                          run.status === 'Success'
                            ? 'success'
                            : run.status === 'Running'
                            ? 'info'
                            : 'critical'
                        }
                      >
                        {run.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-500">
                      {run.durationMs}ms
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Execution Log Inspector */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-700" />
              <span>Playbook Execution Terminal</span>
            </div>
          }
          subtitle={selectedRun ? selectedRun.name : 'Select a playbook run'}
        >
          {selectedRun ? (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-500 pb-2 border-b border-slate-100">
                <span>Trigger: <strong>{selectedRun.triggerType}</strong></span>
                <span className="font-mono">{new Date(selectedRun.executedAt).toLocaleTimeString()}</span>
              </div>
              <div className="bg-slate-900 text-slate-200 p-3.5 rounded-lg font-mono text-[11px] leading-relaxed overflow-x-auto min-h-[220px]">
                <div className="text-emerald-400 font-bold mb-2">
                  [SYSTEM:EXECUTION_GATEWAY] Target: {selectedRun.targetEntity}
                </div>
                <div>{selectedRun.executionLog}</div>
                <div className="mt-3 text-slate-500">
                  --- Execution completed in {selectedRun.durationMs}ms with status {selectedRun.status} ---
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Select an execution run to inspect stdout/stderr logs.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
