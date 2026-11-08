import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Cloud,
  Key,
  Mail,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge.tsx';
import { Card } from '../components/ui/Card.tsx';
import { M365TenantHealth } from '../types/index.ts';

interface M365PageProps {
  tenants: M365TenantHealth[];
}

export const M365Page: React.FC<M365PageProps> = ({ tenants }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Microsoft 365 & Cloud Identity
            <Badge variant="info">Microsoft Graph Synchronized</Badge>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Entra ID sync health, license optimization, Exchange Online transport, and Conditional Access audits.
          </p>
        </div>
      </div>

      {/* Tenant Health Cards */}
      <div className="grid grid-cols-1 gap-4">
        {tenants.map((t) => (
          <Card key={t.customerId} title={t.customerName} subtitle="Enterprise M365 Tenant Topology">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-[11px] text-slate-500">Users & Licenses</div>
                <div className="text-base font-bold text-slate-900 mt-0.5">
                  {t.assignedLicenses} / {t.totalUsers}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {t.unassignedLicenses} unassigned pool
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-[11px] text-slate-500">Entra ID Sync</div>
                <div className="mt-1 flex items-center gap-1 font-semibold">
                  <Badge variant={t.entraIdSyncStatus === 'Healthy' ? 'success' : 'warning'}>
                    {t.entraIdSyncStatus}
                  </Badge>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-[11px] text-slate-500">Exchange Online</div>
                <div className="mt-1 font-semibold flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t.exchangeServiceHealth}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-[11px] text-slate-500">MFA Adoption</div>
                <div className="text-base font-bold text-emerald-600 mt-0.5">
                  {t.mfaAdoptionPercent}%
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Enforced via Conditional Access</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-[11px] text-slate-500">Risky Sign-Ins 24h</div>
                <div
                  className={`text-base font-bold mt-0.5 ${
                    t.suspiciousSignIns24h > 0 ? 'text-red-600' : 'text-slate-800'
                  }`}
                >
                  {t.suspiciousSignIns24h}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {t.suspiciousSignIns24h > 0 ? 'Remediated & Revoked' : 'All clear'}
                </div>
              </div>
            </div>

            {/* Note on Risky Sign-ins */}
            {t.suspiciousSignIns24h > 0 && (
              <div className="mt-3 p-2.5 bg-blue-50/70 rounded-lg border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
                <span>
                  <strong>M365 Admin Agent Audit:</strong> Detected and contained impossible travel
                  sign-in from Frankfurt for account <code className="font-mono text-blue-800">finance_svc</code>. Refresh tokens invalidated.
                </span>
                <span className="font-semibold text-blue-700">Audit #ACT-4895</span>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
