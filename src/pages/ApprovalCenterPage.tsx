import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Bot,
  Check,
  CheckCircle2,
  Clock,
  Filter,
  Info,
  Lock,
  Search,
  Shield,
  ShieldAlert,
  ThumbsDown,
  ThumbsUp,
  X,
  XCircle,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge.tsx';
import { Card } from '../components/ui/Card.tsx';
import { Modal } from '../components/ui/Modal.tsx';
import { ActionApproval, ApprovalStatus } from '../types/index.ts';

interface ApprovalCenterPageProps {
  approvals: ActionApproval[];
  onDecideApproval: (
    id: number,
    decision: 'Approved' | 'Rejected',
    approverName: string,
    reason?: string
  ) => Promise<void>;
}

export const ApprovalCenterPage: React.FC<ApprovalCenterPageProps> = ({
  approvals,
  onDecideApproval,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedApproval, setSelectedApproval] = useState<ActionApproval | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const filtered = approvals.filter((a) => {
    if (statusFilter !== 'All' && a.status !== statusFilter) return false;
    return true;
  });

  const pendingCount = approvals.filter((a) => a.status === 'Pending Approval').length;

  const handleApprove = async (approval: ActionApproval) => {
    setIsProcessing(true);
    try {
      await onDecideApproval(approval.id, 'Approved', 'Operations Engineer');
      setNotificationMsg(`Action ${approval.actionNumber} approved and sent to Execution Gateway.`);
      setTimeout(() => setNotificationMsg(null), 4000);
      if (selectedApproval?.id === approval.id) {
        setSelectedApproval({
          ...selectedApproval,
          status: 'Approved',
          approver: 'Operations Engineer',
          decidedAt: new Date().toISOString(),
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!selectedApproval) return;
    setIsProcessing(true);
    try {
      await onDecideApproval(
        selectedApproval.id,
        'Rejected',
        'Operations Engineer',
        rejectReason || 'Risk threshold exceeded'
      );
      setNotificationMsg(`Action ${selectedApproval.actionNumber} was rejected.`);
      setTimeout(() => setNotificationMsg(null), 4000);
      setIsRejectModalOpen(false);
      setRejectReason('');
      setSelectedApproval({
        ...selectedApproval,
        status: 'Rejected',
        approver: 'Operations Engineer',
        rejectionReason: rejectReason,
        decidedAt: new Date().toISOString(),
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Action Approval Centre
            <Badge variant="warning" dot pulse>
              Human-in-the-Loop Gateway
            </Badge>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographic governance gateway enforcing dual-control authorization before AI agent remediation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            <span>Execution Gateway: Simulation Mode Active</span>
          </span>
        </div>
      </div>

      {notificationMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{notificationMsg}</span>
          </div>
          <button onClick={() => setNotificationMsg(null)} className="text-emerald-600 hover:text-emerald-800">
            ✕
          </button>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <div className="p-3.5 bg-white rounded-xl border border-amber-200 shadow-2xs bg-amber-50/20">
          <div className="text-xs text-amber-900 font-semibold">Pending Decisions</div>
          <div className="text-2xl font-bold text-amber-700 mt-1">{pendingCount}</div>
          <div className="text-[11px] text-amber-800 font-medium mt-0.5">Awaiting human sign-off</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Approved Today</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">1</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Passed to gateway</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Executed Actions</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">1</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Audited in ledger</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Average Review Time</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">4.2m</div>
          <div className="text-[11px] text-slate-400 mt-0.5">SLA Target &lt; 15m</div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-medium">Status Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-800"
          >
            <option value="All">All Actions</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Executed">Executed</option>
          </select>
        </div>
        <div className="text-[11px] text-slate-500">
          Showing {filtered.length} approval records
        </div>
      </div>

      {/* Approvals Table */}
      <Card title="Action Approval Registry" subtitle="Review AI proposals, examine evidence, and execute decisions">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Action ID</th>
                <th className="py-2.5 px-3">Risk Level</th>
                <th className="py-2.5 px-3">Proposed Action & Justification</th>
                <th className="py-2.5 px-3">Customer & Target Device</th>
                <th className="py-2.5 px-3">Requesting Agent</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">
                    {item.actionNumber}
                  </td>
                  <td className="py-3 px-3">
                    <Badge
                      variant={
                        item.riskLevel === 'Critical'
                          ? 'critical'
                          : item.riskLevel === 'High'
                          ? 'high'
                          : 'medium'
                      }
                      dot
                    >
                      {item.riskLevel}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 max-w-sm">
                    <div className="font-semibold text-slate-900">{item.proposedAction}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                      {item.technicalJustification}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-mono font-medium text-slate-800">{item.targetDeviceName}</div>
                    <div className="text-[11px] text-slate-500">{item.customerName}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      <Bot className="w-3 h-3 text-blue-600" />
                      <span>{item.requestingAgentName}</span>
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <Badge
                      variant={
                        item.status === 'Approved' || item.status === 'Executed'
                          ? 'success'
                          : item.status === 'Rejected'
                          ? 'critical'
                          : 'warning'
                      }
                    >
                      {item.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-right">
                    {item.status === 'Pending Approval' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleApprove(item)}
                          disabled={isProcessing}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedApproval(item);
                            setIsRejectModalOpen(true);
                          }}
                          disabled={isProcessing}
                          className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <ThumbsDown className="w-3 h-3" />
                          <span>Reject</span>
                        </button>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 font-mono">
                        {item.approver ? `By ${item.approver}` : 'Decided'}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Reject Confirmation Modal */}
      {isRejectModalOpen && selectedApproval && (
        <Modal
          isOpen={isRejectModalOpen}
          onClose={() => setIsRejectModalOpen(false)}
          title={`Reject Action ${selectedApproval.actionNumber}`}
          subtitle={`Proposed: ${selectedApproval.proposedAction}`}
          footer={
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={isProcessing}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold"
              >
                Confirm Rejection
              </button>
            </div>
          }
        >
          <div className="space-y-3 text-xs">
            <p className="text-slate-600">
              Please enter the technical or operational justification for declining this AI-proposed
              action. This feedback will be indexed into the agent telemetry memory.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., Target host is undergoing maintenance window; postpone until 18:00 UTC."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
            />
          </div>
        </Modal>
      )}
    </div>
  );
};
