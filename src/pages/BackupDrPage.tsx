import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  HardDrive,
  HardDriveDownload,
  Lock,
  RefreshCw,
  Server,
  Shield,
  XCircle,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge.tsx';
import { Card } from '../components/ui/Card.tsx';
import { BackupJob } from '../types/index.ts';

interface BackupDrPageProps {
  backupJobs: BackupJob[];
  onOpenApprovals?: () => void;
}

export const BackupDrPage: React.FC<BackupDrPageProps> = ({ backupJobs, onOpenApprovals }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Backup & Disaster Recovery (BDR)
            <Badge variant="info">Veeam VBR V12 REST API</Badge>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Enterprise workload protection, hardened immutable storage, and automated SureBackup recovery testing.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Active Backup Jobs</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{backupJobs.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Physical & VM Workloads</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Backup Success Rate</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">75%</div>
          <div className="text-[11px] text-amber-600 font-medium mt-0.5">1 Job Failed, 1 Warning</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Immutable Repositories</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">100% Locked</div>
          <div className="text-[11px] text-blue-600 font-medium mt-0.5">Hardened Linux (No SSH)</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Recovery Readiness</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">Boot Verified</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Instant VM Recovery tested</div>
        </div>
      </div>

      {/* Backup Jobs Table */}
      <Card title="Veeam Backup & Replication Jobs" subtitle="Job status, transferred payload, repository utilization, and readiness">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Job Name & Workload</th>
                <th className="py-2.5 px-3">Customer Tenant</th>
                <th className="py-2.5 px-3">Last Run Status</th>
                <th className="py-2.5 px-3">Data Transferred</th>
                <th className="py-2.5 px-3">Repository Storage</th>
                <th className="py-2.5 px-3">Recovery Readiness</th>
                <th className="py-2.5 px-3 text-right">Last Successful Run</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {backupJobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900">{job.jobName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{job.workload}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-700 font-medium">
                    {job.customerName}
                  </td>
                  <td className="py-3 px-3">
                    <Badge
                      variant={
                        job.lastRunStatus === 'Success'
                          ? 'success'
                          : job.lastRunStatus === 'Warning'
                          ? 'warning'
                          : 'critical'
                      }
                      dot
                    >
                      {job.lastRunStatus}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-700">
                    {job.dataTransferredGb > 0 ? `${job.dataTransferredGb} GB` : '0 GB (Halted)'}
                  </td>
                  <td className="py-3 px-3">
                    <div className="w-28">
                      <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                        <span>{job.repositoryCapacityUsedPercent}% Used</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            job.repositoryCapacityUsedPercent > 90
                              ? 'bg-red-500'
                              : job.repositoryCapacityUsedPercent > 80
                              ? 'bg-amber-500'
                              : 'bg-blue-600'
                          }`}
                          style={{ width: `${job.repositoryCapacityUsedPercent}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-1 font-semibold ${
                        job.recoveryReadiness === 'Verified Bootable'
                          ? 'text-emerald-600'
                          : job.recoveryReadiness === 'Needs Testing'
                          ? 'text-amber-600'
                          : 'text-red-600'
                      }`}
                    >
                      {job.recoveryReadiness === 'Verified Bootable' ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      )}
                      <span>{job.recoveryReadiness}</span>
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-[11px] text-slate-500">
                    {new Date(job.lastSuccessfulBackup).toLocaleTimeString([], {
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
    </div>
  );
};
