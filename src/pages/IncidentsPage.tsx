import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Bell,
  Bot,
  CheckCircle2,
  Clock,
  Filter,
  Info,
  Mail,
  MessageSquare,
  RefreshCw,
  Search,
  Send,
  Shield,
  User,
  Wrench,
  XCircle,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge.tsx';
import { Card } from '../components/ui/Card.tsx';
import { Modal } from '../components/ui/Modal.tsx';
import { Incident, IncidentStatus } from '../types/index.ts';

interface IncidentsPageProps {
  incidents: Incident[];
  onUpdateStatus: (id: number, status: IncidentStatus, engineer?: string) => Promise<void>;
  onAcknowledgeIncident?: (id: number, engineer?: string) => Promise<void>;
  onTriggerFollowUp?: (id: number) => Promise<{ actionTaken: string; details: string }>;
  onOpenApprovals?: () => void;
}

export const IncidentsPage: React.FC<IncidentsPageProps> = ({
  incidents,
  onUpdateStatus,
  onAcknowledgeIncident,
  onTriggerFollowUp,
  onOpenApprovals,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [followUpFeedback, setFollowUpFeedback] = useState<string | null>(null);

  const filteredIncidents = incidents.filter((inc) => {
    if (statusFilter !== 'All' && inc.status !== statusFilter) return false;
    if (severityFilter !== 'All' && inc.severity !== severityFilter) return false;
    if (
      searchQuery &&
      !inc.incidentNumber.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !inc.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !inc.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleStatusChange = async (newStatus: IncidentStatus) => {
    if (!selectedIncident || isUpdating) return;
    setIsUpdating(true);
    try {
      await onUpdateStatus(selectedIncident.id, newStatus);
      setSelectedIncident({
        ...selectedIncident,
        status: newStatus,
        resolvedAt: newStatus === 'Resolved' ? new Date().toISOString() : selectedIncident.resolvedAt,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAcknowledge = async (incidentId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!onAcknowledgeIncident || isUpdating) return;
    setIsUpdating(true);
    try {
      await onAcknowledgeIncident(incidentId, 'On-Call Engineer');
      if (selectedIncident && selectedIncident.id === incidentId) {
        setSelectedIncident({
          ...selectedIncident,
          acknowledged: true,
          acknowledgedBy: 'On-Call Engineer',
          acknowledgedAt: new Date().toISOString(),
          status: selectedIncident.status === 'New' ? 'Investigating' : selectedIncident.status,
        });
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFollowUpTrigger = async (incidentId: number) => {
    if (!onTriggerFollowUp || isUpdating) return;
    setIsUpdating(true);
    setFollowUpFeedback(null);
    try {
      const res = await onTriggerFollowUp(incidentId);
      setFollowUpFeedback(res.details);
      // Refresh selected incident from latest prop data if available
      const updated = incidents.find((i) => i.id === incidentId);
      if (updated) setSelectedIncident(updated);
    } catch {
      setFollowUpFeedback('Failed to execute automated follow-up check.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Incident Operations Management
            <Badge variant="critical" dot pulse>
              Live Triage
            </Badge>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            AI-correlated incident lifecycles, root-cause diagnostics, and remediation workflows.
          </p>
        </div>
      </div>

      {/* Filter Row */}
      <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-800"
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="Investigating">Investigating</option>
              <option value="Awaiting Approval">Awaiting Approval</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-800"
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        <div className="relative w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search INC #, title, tenant..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 pl-8 pr-3 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Incidents Data Table */}
      <Card title={`Active Incident Queue (${filteredIncidents.length})`} subtitle="Click row to open root cause investigation & remediation drawer">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Incident ID</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Title & Summary</th>
                <th className="py-2.5 px-3">Customer & Site</th>
                <th className="py-2.5 px-3">Assigned AI Agent</th>
                <th className="py-2.5 px-3">Team & Engineer</th>
                <th className="py-2.5 px-3">Ack & Escalation</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Age / Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIncidents.map((incident) => (
                <tr
                  key={incident.id}
                  onClick={() => {
                    setSelectedIncident(incident);
                    setFollowUpFeedback(null);
                  }}
                  className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-3 font-mono font-bold text-blue-600">
                    {incident.incidentNumber}
                  </td>
                  <td className="py-3 px-3">
                    <Badge
                      variant={
                        incident.severity === 'Critical'
                          ? 'critical'
                          : incident.severity === 'High'
                          ? 'high'
                          : incident.severity === 'Medium'
                          ? 'medium'
                          : 'low'
                      }
                      dot
                    >
                      {incident.severity}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 max-w-xs">
                    <div className="font-semibold text-slate-900 truncate">{incident.title}</div>
                    <div className="text-[11px] text-slate-500 truncate">{incident.description}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-medium text-slate-800">{incident.customerName}</div>
                    <div className="text-[11px] text-slate-500">{incident.siteName || 'Multi-site'}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200">
                      <Bot className="w-3 h-3 text-blue-600" />
                      <span>{incident.assignedAgentSlug}</span>
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-slate-800 font-medium">{incident.assignedEngineer}</div>
                    <div className="text-[10px] text-slate-500">{incident.responsibleTeam || 'General Ops'}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex flex-col gap-1">
                      {incident.acknowledged ? (
                        <div className="flex items-center gap-1.5">
                          <Badge variant="success" dot>Acked</Badge>
                          <span className="text-[10px] text-slate-400 font-mono truncate max-w-[80px]" title={incident.acknowledgedBy}>
                            {incident.acknowledgedBy ? incident.acknowledgedBy.split(' ')[0] : 'Yes'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <Badge variant="warning" dot pulse>Unack</Badge>
                          {onAcknowledgeIncident && (
                            <button
                              onClick={(e) => handleAcknowledge(incident.id, e)}
                              className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-semibold transition-colors shadow-2xs"
                            >
                              Ack
                            </button>
                          )}
                        </div>
                      )}
                      {incident.escalationLevel && incident.escalationLevel !== 'None' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          {incident.escalationLevel}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <Badge
                      variant={
                        incident.status === 'Resolved' || incident.status === 'Closed'
                          ? 'success'
                          : incident.status === 'Awaiting Approval'
                          ? 'warning'
                          : incident.status === 'Investigating'
                          ? 'info'
                          : 'default'
                      }
                    >
                      {incident.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-[11px] text-slate-500">
                    {new Date(incident.createdAt).toLocaleTimeString([], {
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

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <Modal
          isOpen={Boolean(selectedIncident)}
          onClose={() => {
            setSelectedIncident(null);
            setFollowUpFeedback(null);
          }}
          title={`Incident ${selectedIncident.incidentNumber}: ${selectedIncident.title}`}
          subtitle={`${selectedIncident.customerName} • Severity: ${selectedIncident.severity}`}
          maxWidth="2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Update Status:</span>
                <select
                  value={selectedIncident.status}
                  disabled={isUpdating}
                  onChange={(e) => handleStatusChange(e.target.value as IncidentStatus)}
                  className="text-xs font-semibold bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800"
                >
                  <option value="New">New</option>
                  <option value="Investigating">Investigating</option>
                  <option value="Awaiting Approval">Awaiting Approval</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                {selectedIncident.status === 'Awaiting Approval' && onOpenApprovals && (
                  <button
                    onClick={() => {
                      setSelectedIncident(null);
                      onOpenApprovals();
                    }}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    Open Action Approval
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedIncident(null);
                    setFollowUpFeedback(null);
                  }}
                  className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            {/* Top metadata grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Severity & State</div>
                <div className="mt-1 flex items-center gap-1.5 font-bold">
                  <Badge variant={selectedIncident.severity === 'Critical' ? 'critical' : 'high'}>
                    {selectedIncident.severity}
                  </Badge>
                  <span className="text-slate-800 font-medium text-xs">{selectedIncident.status}</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Responsible Team</div>
                <div className="mt-1 font-semibold text-slate-800">
                  {selectedIncident.responsibleTeam || 'General Operations'}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Escalation Policy</div>
                <div className="mt-1 font-semibold text-amber-800">
                  {selectedIncident.escalationLevel || 'None'}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold">AI Lead Agent</div>
                <div className="mt-1 font-mono text-blue-700 font-semibold">
                  {selectedIncident.assignedAgentSlug}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Assigned Engineer</div>
                <div className="mt-1 font-medium text-slate-800">
                  {selectedIncident.assignedEngineer}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Reminders Dispatched</div>
                <div className="mt-1 font-mono text-slate-700">
                  {selectedIncident.remindersSentCount || 0} automated reminders
                </div>
              </div>
            </div>

            {/* Automated Agent Follow-up and Acknowledgment Controls */}
            <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-800">SLA Lifecycle:</span>
                {selectedIncident.acknowledged ? (
                  <span className="text-xs text-emerald-700 font-medium flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Acknowledged by {selectedIncident.acknowledgedBy || 'Engineer'}
                  </span>
                ) : (
                  <span className="text-xs text-amber-700 font-medium flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Awaiting Engineer Acknowledgement
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!selectedIncident.acknowledged && onAcknowledgeIncident && (
                  <button
                    onClick={() => handleAcknowledge(selectedIncident.id)}
                    disabled={isUpdating}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Acknowledge Incident</span>
                  </button>
                )}
                {onTriggerFollowUp && (
                  <button
                    onClick={() => handleFollowUpTrigger(selectedIncident.id)}
                    disabled={isUpdating}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
                    <span>Simulate Agent Follow-up</span>
                  </button>
                )}
              </div>
            </div>

            {followUpFeedback && (
              <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-lg text-xs font-medium flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{followUpFeedback}</span>
              </div>
            )}

            {/* Description */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-1">Incident Description & Context</h4>
              <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                {selectedIncident.description}
              </p>
            </div>

            {/* Root Cause Findings */}
            {selectedIncident.rootCauseFindings && (
              <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200 space-y-1">
                <h4 className="font-semibold text-blue-900 flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-blue-600" />
                  <span>AI Root Cause Findings</span>
                </h4>
                <p className="text-slate-700 leading-relaxed">
                  {selectedIncident.rootCauseFindings}
                </p>
              </div>
            )}

            {/* Recommended Remediation */}
            {selectedIncident.recommendedRemediation && (
              <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200 space-y-1">
                <h4 className="font-semibold text-emerald-900 flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-emerald-600" />
                  <span>Recommended Remediation Plan</span>
                </h4>
                <p className="text-slate-700 leading-relaxed">
                  {selectedIncident.recommendedRemediation}
                </p>
              </div>
            )}

            {/* Communication & Investigation Timeline */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-1.5">
                <Send className="w-4 h-4 text-blue-600" />
                <span>Unified Communication & Investigation Timeline</span>
              </h4>
              {selectedIncident.events && selectedIncident.events.length > 0 ? (
                <div className="space-y-2.5 border-l-2 border-slate-200 pl-3 ml-2">
                  {selectedIncident.events.map((ev) => (
                    <div key={ev.id} className="relative">
                      <span className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white" />
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                          {ev.eventType === 'Dispatch' ? (
                            <Send className="w-3 h-3 text-blue-600" />
                          ) : ev.eventType === 'Reminder' ? (
                            <Clock className="w-3 h-3 text-amber-600" />
                          ) : ev.eventType === 'Escalation' ? (
                            <AlertTriangle className="w-3 h-3 text-red-600" />
                          ) : ev.eventType === 'Acknowledgement' ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Bot className="w-3 h-3 text-slate-500" />
                          )}
                          <span>
                            {ev.author} ({ev.eventType})
                          </span>
                        </span>
                        <span className="font-mono">
                          {new Date(ev.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-0.5">{ev.content}</p>
                      {ev.deliveryMetadata && (
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px]">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                            {ev.deliveryMetadata.channel === 'teams' ? (
                              <MessageSquare className="w-3 h-3 text-indigo-600" />
                            ) : (
                              <Mail className="w-3 h-3 text-sky-600" />
                            )}
                            <span>{ev.deliveryMetadata.channel.toUpperCase()}</span>
                          </span>
                          <span className="text-slate-500 font-mono">To: {ev.deliveryMetadata.recipient}</span>
                          <Badge variant={ev.deliveryMetadata.status === 'delivered' ? 'success' : 'default'}>
                            {ev.deliveryMetadata.status}
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 italic">No detailed telemetry events attached.</p>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
