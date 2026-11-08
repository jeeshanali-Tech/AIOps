import React, { useState } from 'react';
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Database,
  Edit2,
  Globe,
  Key,
  Lock,
  Mail,
  MessageSquare,
  Play,
  Plus,
  RefreshCw,
  Send,
  Server,
  Shield,
  Trash2,
  User,
  Users,
  X,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge.tsx';
import { Card } from '../components/ui/Card.tsx';
import { Modal } from '../components/ui/Modal.tsx';
import {
  AlertSeverity,
  AuditRecord,
  NotificationChannelType,
  NotificationDispatch,
  NotificationRule,
  ResponsibleTeam,
} from '../types/index.ts';

interface SettingsPageProps {
  auditRecords: AuditRecord[];
  notificationRules?: NotificationRule[];
  notificationDispatches?: NotificationDispatch[];
  onCreateRule?: (rule: Omit<NotificationRule, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateRule?: (id: number, updates: Partial<NotificationRule>) => Promise<void>;
  onDeleteRule?: (id: number) => Promise<void>;
  onTestRule?: (id: number) => Promise<{ success: boolean; message: string }>;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  auditRecords,
  notificationRules = [],
  notificationDispatches = [],
  onCreateRule,
  onUpdateRule,
  onDeleteRule,
  onTestRule,
}) => {
  const [activeTab, setActiveTab] = useState<
    'general' | 'notifications' | 'database' | 'rbac' | 'audit'
  >('general');

  // Notification Rule Modal & Form State
  const [ruleModalOpen, setRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<NotificationRule | null>(null);
  const [testingRuleId, setTestingRuleId] = useState<number | null>(null);
  const [testFeedback, setTestFeedback] = useState<{ success: boolean; message: string } | null>(
    null
  );

  // Form Fields
  const [ruleName, setRuleName] = useState('');
  const [ruleSources, setRuleSources] = useState<string[]>(['sentinelone', 'fortigate']);
  const [ruleSeverities, setRuleSeverities] = useState<AlertSeverity[]>(['Critical', 'High']);
  const [ruleCategories, setRuleCategories] = useState('Security Incident, Malware / Ransomware');
  const [ruleTeam, setRuleTeam] = useState<ResponsibleTeam>('Security Operations');
  const [ruleAgentSlug, setRuleAgentSlug] = useState('security_ops');
  const [ruleChannels, setRuleChannels] = useState<NotificationChannelType>('both');
  const [ruleTeamsChannel, setRuleTeamsChannel] = useState('#security-alerts');
  const [rulePrimaryEmail, setRulePrimaryEmail] = useState('secops-lead@ops.internal');
  const [ruleManagerEmail, setRuleManagerEmail] = useState('it-sec-director@ops.internal');
  const [ruleAckTimeout, setRuleAckTimeout] = useState(15);
  const [ruleReminderInterval, setRuleReminderInterval] = useState(10);
  const [ruleMaxReminders, setRuleMaxReminders] = useState(3);
  const [ruleCooldown, setRuleCooldown] = useState(15);
  const [ruleBusinessHoursOnly, setRuleBusinessHoursOnly] = useState(false);
  const [ruleEnabled, setRuleEnabled] = useState(true);

  const openCreateRuleModal = () => {
    setEditingRule(null);
    setRuleName('');
    setRuleSources(['sentinelone', 'fortigate']);
    setRuleSeverities(['Critical', 'High']);
    setRuleCategories('Security Incident, Threat Outbreak');
    setRuleTeam('Security Operations');
    setRuleAgentSlug('security_ops');
    setRuleChannels('both');
    setRuleTeamsChannel('#security-alerts');
    setRulePrimaryEmail('secops-lead@ops.internal');
    setRuleManagerEmail('it-sec-director@ops.internal');
    setRuleAckTimeout(15);
    setRuleReminderInterval(10);
    setRuleMaxReminders(3);
    setRuleCooldown(15);
    setRuleBusinessHoursOnly(false);
    setRuleEnabled(true);
    setRuleModalOpen(true);
  };

  const openEditRuleModal = (rule: NotificationRule) => {
    setEditingRule(rule);
    setRuleName(rule.name);
    setRuleSources([...(rule.sources || rule.sourceIntegrations || [])]);
    setRuleSeverities([...(rule.severityLevels || (rule.minSeverity ? [rule.minSeverity] : ['High']))]);
    setRuleCategories((rule.categories || rule.alertCategories || []).join(', '));
    setRuleTeam(rule.responsibleTeam);
    setRuleAgentSlug(rule.assignedAgentSlug || rule.responsibleAgentSlug || 'central_ops');
    setRuleChannels(rule.channels || 'both');
    setRuleTeamsChannel(rule.teamsChannel || '#general-ops');
    setRulePrimaryEmail(rule.primaryEmail || (rule.recipientEmails?.[0] ?? ''));
    setRuleManagerEmail(rule.managerEmail || rule.escalationContact || '');
    setRuleAckTimeout(rule.ackTimeoutMinutes ?? 15);
    setRuleReminderInterval(rule.reminderIntervalMinutes ?? 10);
    setRuleMaxReminders(rule.maxReminders ?? 3);
    setRuleCooldown(rule.cooldownMinutes ?? 15);
    setRuleBusinessHoursOnly(Boolean(rule.businessHoursOnly));
    setRuleEnabled(rule.enabled ?? rule.isActive ?? true);
    setRuleModalOpen(true);
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    const categoriesArray = ruleCategories
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    const rulePayload = {
      name: ruleName || 'Untitled Operational Rule',
      enabled: ruleEnabled,
      sources: ruleSources,
      severityLevels: ruleSeverities,
      categories: categoriesArray,
      responsibleTeam: ruleTeam,
      assignedAgentSlug: ruleAgentSlug,
      channels: ruleChannels,
      teamsChannel: ruleTeamsChannel,
      primaryEmail: rulePrimaryEmail,
      managerEmail: ruleManagerEmail,
      ackTimeoutMinutes: Number(ruleAckTimeout),
      reminderIntervalMinutes: Number(ruleReminderInterval),
      maxReminders: Number(ruleMaxReminders),
      cooldownMinutes: Number(ruleCooldown),
      businessHoursOnly: ruleBusinessHoursOnly,
    };

    if (editingRule && onUpdateRule) {
      await onUpdateRule(editingRule.id, rulePayload);
    } else if (onCreateRule) {
      await onCreateRule(rulePayload);
    }
    setRuleModalOpen(false);
  };

  const handleTestRuleDispatch = async (ruleId: number) => {
    if (!onTestRule) return;
    setTestingRuleId(ruleId);
    setTestFeedback(null);
    try {
      const res = await onTestRule(ruleId);
      setTestFeedback(res);
    } catch {
      setTestFeedback({ success: false, message: 'Failed to dispatch test notification' });
    } finally {
      setTestingRuleId(null);
    }
  };

  const roles = [
    {
      name: 'Super Admin',
      description: 'Unrestricted administrative access to all customer tenants, gateway policies, and integrations.',
      permissions: ['ALL_PERMISSIONS', 'GATEWAY_APPROVE', 'INTEGRATION_CONFIG', 'AUDIT_READ'],
    },
    {
      name: 'Senior Network Engineer',
      description: 'Full telemetry, diagnostics, and remediation approvals for FortiGate, PRTG, and switches.',
      permissions: ['NETWORK_READ', 'NETWORK_REMEDIATE', 'GATEWAY_APPROVE_NET'],
    },
    {
      name: 'Security Operations Analyst',
      description: 'SentinelOne threat containment, endpoint quarantine approvals, and MITRE forensics.',
      permissions: ['SECOPS_READ', 'SECOPS_CONTAINMENT', 'GATEWAY_APPROVE_SEC'],
    },
    {
      name: 'Helpdesk Tier 2',
      description: 'Zoho Desk ticket resolution, user password resets, and endpoint spooler healing.',
      permissions: ['HELPDESK_READ_WRITE', 'RMM_REMOTE_ASSIST'],
    },
    {
      name: 'Read-Only Compliance Auditor',
      description: 'Audits SLA adherence, immutable backup verification, and tamper-evident logs.',
      permissions: ['READ_ONLY_ALL', 'AUDIT_EXPORT'],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Platform Settings & Governance
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cloud SQL parameters, notification rules, escalation timeouts, RBAC roles, and immutable audit logs.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('general')}
          className={`pb-2.5 px-3 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'general'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          General & Organization
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'notifications'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Notification & Escalation Rules</span>
          <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded-full text-[10px]">
            {notificationRules.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`pb-2.5 px-3 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'database'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Cloud SQL & Architecture
        </button>
        <button
          onClick={() => setActiveTab('rbac')}
          className={`pb-2.5 px-3 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'rbac'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          RBAC Roles & Permissions
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-2.5 px-3 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'audit'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Security Audit Ledger ({auditRecords.length})
        </button>
      </div>

      {/* Tab 1: General */}
      {activeTab === 'general' && (
        <div className="space-y-4">
          <Card title="MSP Platform Profile" subtitle="Organization settings and operations schedule">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">MSP Organization Name</label>
                <input
                  type="text"
                  defaultValue="OpsPilot Managed IT Services Corp"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Primary Operations NOC Timezone</label>
                <select
                  defaultValue="America/New_York"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="America/New_York">Eastern Time (US & Canada) - UTC-5</option>
                  <option value="UTC">Coordinated Universal Time (UTC)</option>
                  <option value="Europe/London">London (GMT/BST)</option>
                  <option value="Asia/Singapore">Singapore / Hong Kong (UTC+8)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">NOC Escalation Hotline</label>
                <input
                  type="text"
                  defaultValue="+1 (800) 555-OPSP"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Emergency Notification Webhook</label>
                <input
                  type="text"
                  defaultValue="https://hooks.slack.com/services/OPSPILOT/ONCALL"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Notification & Escalation Rules */}
      {activeTab === 'notifications' && (
        <div className="space-y-5">
          {/* Action bar & test feedback */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Intelligent Alert Routing & Escalation Engine</span>
                <Badge variant="outline">{notificationRules.length} Active Policies</Badge>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluates source telemetry, customer context, severity, and business hours to dispatch Graph emails and Teams cards.
              </p>
            </div>
            <button
              onClick={openCreateRuleModal}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Notification Rule</span>
            </button>
          </div>

          {testFeedback && (
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-medium ${
                testFeedback.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-red-50 border-red-200 text-red-900'
              }`}
            >
              <div className="flex items-center gap-2">
                {testFeedback.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{testFeedback.message}</span>
              </div>
              <button
                onClick={() => setTestFeedback(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Rules Table */}
          <Card
            title="Configured Routing & Escalation Rules"
            subtitle="Automated routing matrix across Microsoft Graph Mail and Microsoft Teams"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Rule Name & Status</th>
                    <th className="py-2.5 px-3">Source & Severities</th>
                    <th className="py-2.5 px-3">Team & Specialist Agent</th>
                    <th className="py-2.5 px-3">Notification Channels</th>
                    <th className="py-2.5 px-3">SLA Timeouts & Limits</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {notificationRules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              onUpdateRule && onUpdateRule(rule.id, { enabled: !rule.enabled })
                            }
                            className={`w-7 h-4 flex items-center rounded-full p-0.5 transition-colors ${
                              rule.enabled ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'
                            }`}
                            title={rule.enabled ? 'Click to disable' : 'Click to enable'}
                          >
                            <span className="w-3 h-3 rounded-full bg-white shadow-xs" />
                          </button>
                          <div>
                            <div className="font-semibold text-slate-900">{rule.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {rule.businessHoursOnly ? '8x5 Business Hours Only' : '24x7 Unrestricted'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1 mb-1">
                          {(rule.sources || rule.sourceIntegrations || []).map((s) => (
                            <span
                              key={s}
                              className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-700 font-mono font-medium border border-slate-200"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-1">
                          {(rule.severityLevels || (rule.minSeverity ? [rule.minSeverity] : [])).map((sev) => (
                            <Badge
                              key={sev}
                              variant={
                                sev === 'Critical'
                                  ? 'critical'
                                  : sev === 'High'
                                  ? 'high'
                                  : sev === 'Medium'
                                  ? 'medium'
                                  : 'low'
                              }
                            >
                              {sev}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">{rule.responsibleTeam}</div>
                        <div className="text-[10px] text-blue-600 font-mono mt-0.5">
                          @{rule.assignedAgentSlug}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-col gap-1">
                          {(rule.channels === 'teams' || rule.channels === 'both') && (
                            <div className="flex items-center gap-1.5 text-[11px] text-indigo-700 font-medium">
                              <MessageSquare className="w-3 h-3 text-indigo-600" />
                              <span>{rule.teamsChannel || '#general-ops'}</span>
                            </div>
                          )}
                          {(rule.channels === 'email' || rule.channels === 'both') && (
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-600 truncate max-w-[160px]">
                              <Mail className="w-3 h-3 text-sky-600 shrink-0" />
                              <span className="truncate">{rule.primaryEmail}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                        <div>Ack: <span className="font-bold text-slate-800">{rule.ackTimeoutMinutes}m</span></div>
                        <div className="text-[10px] text-slate-400">
                          Remind: {rule.reminderIntervalMinutes}m (max {rule.maxReminders}) • CD: {rule.cooldownMinutes}m
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleTestRuleDispatch(rule.id)}
                            disabled={testingRuleId === rule.id}
                            className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs font-semibold flex items-center gap-1 transition-colors border border-blue-200"
                            title="Dispatch test payload via Graph and Teams"
                          >
                            <Play className={`w-3 h-3 ${testingRuleId === rule.id ? 'animate-spin' : ''}`} />
                            <span>Test</span>
                          </button>
                          <button
                            onClick={() => openEditRuleModal(rule)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors"
                            title="Edit Rule"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {onDeleteRule && (
                            <button
                              onClick={() => onDeleteRule(rule.id)}
                              className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-600 transition-colors"
                              title="Delete Rule"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Dead-Letter Queue (DLQ) & Dispatch Log */}
          <Card
            title={`Notification Dispatch Telemetry & Dead-Letter Queue (DLQ)`}
            subtitle="Real-time delivery verification, payload inspection, and retry tracking"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Dispatched Time</th>
                    <th className="py-2.5 px-3">Channel</th>
                    <th className="py-2.5 px-3">Recipient / Target</th>
                    <th className="py-2.5 px-3">Subject & Content Summary</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Delivery Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {notificationDispatches.map((disp) => (
                    <tr key={disp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                        {new Date(disp.sentAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {disp.channel === 'teams' || disp.channelType === 'Teams' ? (
                            <MessageSquare className="w-3 h-3 text-indigo-600" />
                          ) : (
                            <Mail className="w-3 h-3 text-sky-600" />
                          )}
                          <span>{(disp.channel || disp.channelType || 'Email').toUpperCase()}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-medium text-slate-800">
                        {disp.recipient}
                      </td>
                      <td className="py-3 px-3 max-w-sm">
                        <div className="font-semibold text-slate-900 truncate">{disp.subject}</div>
                        <div className="text-[11px] text-slate-500 truncate">{disp.payloadPreview}</div>
                      </td>
                      <td className="py-3 px-3">
                        <Badge
                          variant={
                            disp.status === 'delivered'
                              ? 'success'
                              : disp.status === 'failed'
                              ? 'critical'
                              : 'warning'
                          }
                        >
                          {disp.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-[11px] text-emerald-700">
                        {disp.deliveredAt ? 'Handshake ACK (200 OK)' : 'Awaiting confirmation'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Rule Modal */}
          {ruleModalOpen && (
            <Modal
              isOpen={ruleModalOpen}
              onClose={() => setRuleModalOpen(false)}
              title={editingRule ? `Edit Rule: ${editingRule.name}` : 'Create Notification Routing Rule'}
              subtitle="Configure alert correlation, multi-channel dispatch, and SLA escalation thresholds"
              maxWidth="xl"
              footer={
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setRuleModalOpen(false)}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveRule}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                  >
                    {editingRule ? 'Save Changes' : 'Create Rule'}
                  </button>
                </div>
              }
            >
              <form onSubmit={handleSaveRule} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Rule Name</label>
                  <input
                    type="text"
                    value={ruleName}
                    onChange={(e) => setRuleName(e.target.value)}
                    placeholder="e.g. SecOps Immediate Threat Containment"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Responsible Team</label>
                    <select
                      value={ruleTeam}
                      onChange={(e) => setRuleTeam(e.target.value as ResponsibleTeam)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800"
                    >
                      <option value="Security Operations">Security Operations</option>
                      <option value="Network Operations">Network Operations</option>
                      <option value="Infrastructure Operations">Infrastructure Operations</option>
                      <option value="M365 & Cloud Identity">M365 & Cloud Identity</option>
                      <option value="Backup & DR">Backup & DR</option>
                      <option value="Helpdesk & Client Systems">Helpdesk & Client Systems</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Assigned AI Agent</label>
                    <select
                      value={ruleAgentSlug}
                      onChange={(e) => setRuleAgentSlug(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 font-mono"
                    >
                      <option value="security_ops">security_ops (SecOps Lead)</option>
                      <option value="network_engineer">network_engineer (NetOps Lead)</option>
                      <option value="tech_support">tech_support (TechSupport)</option>
                      <option value="backup_dr">backup_dr (BDR Specialist)</option>
                      <option value="m365_admin">m365_admin (M365 Administrator)</option>
                      <option value="helpdesk_admin">helpdesk_admin (Helpdesk Lead)</option>
                      <option value="central_ops">central_ops (Central Ops Manager)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Notification Channels</label>
                    <select
                      value={ruleChannels}
                      onChange={(e) => setRuleChannels(e.target.value as NotificationChannelType)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800"
                    >
                      <option value="both">Both (Teams & Graph Email)</option>
                      <option value="teams">Microsoft Teams Only</option>
                      <option value="email">Microsoft Graph Email Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Microsoft Teams Channel</label>
                    <select
                      value={ruleTeamsChannel}
                      onChange={(e) => setRuleTeamsChannel(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 font-mono"
                    >
                      <option value="#security-alerts">#security-alerts</option>
                      <option value="#network-ops">#network-ops</option>
                      <option value="#infra-ops">#infra-ops</option>
                      <option value="#m365-governance">#m365-governance</option>
                      <option value="#bdr-resilience">#bdr-resilience</option>
                      <option value="#helpdesk-ops">#helpdesk-ops</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Primary Email / Distribution List</label>
                    <input
                      type="email"
                      value={rulePrimaryEmail}
                      onChange={(e) => setRulePrimaryEmail(e.target.value)}
                      placeholder="team-lead@ops.internal"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Management Escalation Email</label>
                    <input
                      type="email"
                      value={ruleManagerEmail}
                      onChange={(e) => setRuleManagerEmail(e.target.value)}
                      placeholder="it-manager@ops.internal"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Ack SLA (min)</label>
                    <input
                      type="number"
                      value={ruleAckTimeout}
                      onChange={(e) => setRuleAckTimeout(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs text-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Remind (min)</label>
                    <input
                      type="number"
                      value={ruleReminderInterval}
                      onChange={(e) => setRuleReminderInterval(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs text-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Max Reminders</label>
                    <input
                      type="number"
                      value={ruleMaxReminders}
                      onChange={(e) => setRuleMaxReminders(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs text-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Cooldown (min)</label>
                    <input
                      type="number"
                      value={ruleCooldown}
                      onChange={(e) => setRuleCooldown(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs text-slate-800 font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ruleEnabled}
                      onChange={(e) => setRuleEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                    <span className="font-semibold text-slate-800">Rule Enabled</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ruleBusinessHoursOnly}
                      onChange={(e) => setRuleBusinessHoursOnly(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                    <span className="text-slate-700">Only during Business Hours (8x5)</span>
                  </label>
                </div>
              </form>
            </Modal>
          )}
        </div>
      )}

      {/* Tab 3: Database & Architecture */}
      {activeTab === 'database' && (
        <div className="space-y-4">
          <Card title="Relational Database Architecture" subtitle="Cloud SQL PostgreSQL connection and schema topology">
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-3">
                <Database className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-emerald-950 text-sm">
                    Cloud SQL PostgreSQL Instance Provisioned
                  </h4>
                  <p className="text-emerald-800 mt-1 leading-relaxed">
                    Instance: <code className="font-mono font-bold">ai-studio-4b7cf159</code> in region{' '}
                    <code className="font-mono font-bold">asia-southeast1</code>. All 18 database
                    tables have been verified in the public schema via Drizzle ORM migrations.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-slate-500">Database Engine</div>
                  <div className="font-bold text-slate-900 mt-1">PostgreSQL 15+</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-slate-500">Active Tables</div>
                  <div className="font-bold text-slate-900 mt-1">18 Verified Tables</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-slate-500">ORM Dialect</div>
                  <div className="font-bold text-slate-900 mt-1">Drizzle ORM (node-postgres)</div>
                </div>
              </div>

              <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto">
                <div className="text-blue-400 font-bold mb-1">// Drizzle ORM Schema Tables Registered</div>
                <div>1. users (Firebase UID auth mapping)</div>
                <div>2. roles (RBAC permissions)</div>
                <div>3. customers (Multi-tenant governance)</div>
                <div>4. sites (Physical & cloud branch locations)</div>
                <div>5. devices (Datto RMM & network hardware inventory)</div>
                <div>6. integrations (9 adapters: Datto, Zoho, S1, PRTG, FortiGate, M365, Veeam, Outlook, Teams)</div>
                <div>7. monitoring_events (Cross-system alert telemetry)</div>
                <div>8. incidents (Correlated incident lifecycle with acknowledgement & escalation)</div>
                <div>9. incident_events (Timeline telemetry and communication events)</div>
                <div>10. ai_agents (The 7 specialized autonomous operational agents)</div>
                <div>11. agent_tasks (Multi-agent task decomposition)</div>
                <div>12. agent_findings (Diagnostic hypotheses & recommendations)</div>
                <div>13. action_approvals (Human-in-the-loop authorization gates)</div>
                <div>14. automation_history (Executed playbook audit)</div>
                <div>15. audit_records (Tamper-evident operations log)</div>
                <div>16. knowledge_articles (SOPs and runbook repository)</div>
                <div>17. notification_rules (Intelligent routing policies, channel mappings & SLA timeouts)</div>
                <div>18. notification_dispatches (Audit log of email/Teams notifications & DLQ entries)</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 3: RBAC */}
      {activeTab === 'rbac' && (
        <Card title="Role-Based Access Control (RBAC)" subtitle="Internal user authorization matrix">
          <div className="space-y-3">
            {roles.map((r, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div>
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span>{r.name}</span>
                  </h4>
                  <p className="text-slate-600 mt-0.5">{r.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {r.permissions.map((p, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-white text-slate-700 border border-slate-200"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="shrink-0">
                  <Badge variant="success">Active Policy</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab 4: Audit */}
      {activeTab === 'audit' && (
        <Card title="Security & Action Audit Ledger" subtitle="Immutable operational log of all human and agent actions">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Actor & Identity</th>
                  <th className="py-2.5 px-3">Action Type</th>
                  <th className="py-2.5 px-3">Entity Type & Target</th>
                  <th className="py-2.5 px-3">Details</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{rec.actor}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{rec.actorEmail}</div>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-blue-700">
                      {rec.action}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-800">{rec.entityType}</span>
                      <span className="text-slate-500 font-mono ml-1">({rec.entityId})</span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 max-w-xs truncate">
                      {rec.details}
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant="success">{rec.status}</Badge>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-[11px] text-slate-500">
                      {new Date(rec.timestamp).toLocaleTimeString([], {
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
      )}
    </div>
  );
};
