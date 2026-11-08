import {
  AIAgent,
  ActionApproval,
  AuditRecord,
  AutomationRun,
  BackupJob,
  ChatMessage,
  Customer,
  Device,
  HelpdeskTicket,
  Incident,
  IncidentEvent,
  Integration,
  KnowledgeArticle,
  M365TenantHealth,
  MonitoringEvent,
  NetworkInterfaceMetric,
  NotificationDispatch,
  NotificationRule,
  SecurityAlert,
  Site,
} from '../types/index.ts';
import {
  DEMO_ACTION_APPROVALS,
  DEMO_AI_AGENTS,
  DEMO_AUDIT_RECORDS,
  DEMO_AUTOMATION_RUNS,
  DEMO_BACKUP_JOBS,
  DEMO_CUSTOMERS,
  DEMO_DEVICES,
  DEMO_HELPDESK_TICKETS,
  DEMO_INCIDENTS,
  DEMO_INTEGRATIONS,
  DEMO_KNOWLEDGE_ARTICLES,
  DEMO_M365_HEALTH,
  DEMO_MONITORING_EVENTS,
  DEMO_NETWORK_METRICS,
  DEMO_NOTIFICATION_DISPATCHES,
  DEMO_NOTIFICATION_RULES,
  DEMO_SECURITY_ALERTS,
  DEMO_SITES,
} from './seedData.ts';
import { calculateKpis } from '../utils/opsLogic.ts';
import {
  evaluateIncidentFollowUp,
  formatIncidentEmailHtml,
  formatTeamsAdaptiveCard,
} from '../utils/notificationLogic.ts';

// In-memory synchronized state for fast responsive UI mutations & simulation
class OpsPilotRepository {
  private customers: Customer[] = [...DEMO_CUSTOMERS];
  private sites: Site[] = [...DEMO_SITES];
  private devices: Device[] = [...DEMO_DEVICES];
  private aiAgents: AIAgent[] = [...DEMO_AI_AGENTS];
  private integrations: Integration[] = [...DEMO_INTEGRATIONS];
  private incidents: Incident[] = [...DEMO_INCIDENTS];
  private approvals: ActionApproval[] = [...DEMO_ACTION_APPROVALS];
  private monitoringEvents: MonitoringEvent[] = [...DEMO_MONITORING_EVENTS];
  private helpdeskTickets: HelpdeskTicket[] = [...DEMO_HELPDESK_TICKETS];
  private networkMetrics: NetworkInterfaceMetric[] = [...DEMO_NETWORK_METRICS];
  private securityAlerts: SecurityAlert[] = [...DEMO_SECURITY_ALERTS];
  private m365Health: M365TenantHealth[] = [...DEMO_M365_HEALTH];
  private backupJobs: BackupJob[] = [...DEMO_BACKUP_JOBS];
  private automationRuns: AutomationRun[] = [...DEMO_AUTOMATION_RUNS];
  private auditRecords: AuditRecord[] = [...DEMO_AUDIT_RECORDS];
  private knowledgeArticles: KnowledgeArticle[] = [...DEMO_KNOWLEDGE_ARTICLES];
  private notificationRules: NotificationRule[] = [...DEMO_NOTIFICATION_RULES];
  private notificationDispatches: NotificationDispatch[] = [...DEMO_NOTIFICATION_DISPATCHES];

  private agentChatLogs: Record<string, ChatMessage[]> = {
    central_ops: [
      {
        id: 'msg-c1',
        sender: 'agent',
        agentSlug: 'central_ops',
        content:
          'Central AI Operations Manager is actively cross-correlating 5 monitoring streams. Correlated 2 active incidents with high confidence across Apex Financial and Meridian Logistics.',
        timestamp: '2026-11-07T12:00:00Z',
      },
    ],
    security_ops: [
      {
        id: 'msg-s1',
        sender: 'agent',
        agentSlug: 'security_ops',
        content:
          'Investigation summary for INC-2026-0841: Heuristic telemetry from SentinelOne confirms anomalous LSASS memory access on WKSTN-TRADING-41. Outbound command-and-control connection staged to 185.220.101.44.',
        timestamp: '2026-11-07T12:06:00Z',
        findings: {
          category: 'Credential Dumping & C2 Beaconing',
          summary: 'Mimikatz variant attempted credential harvesting; C2 channel established over TCP 443.',
          evidence: [
            'SentinelOne Alert ID: S1-THR-882 (LSASS handle PROCESS_VM_READ)',
            'Windows Event Log 4768: 6 Kerberos pre-auth failures in 4 seconds',
            'FortiGate Flow: 3.2 MB exfiltration session initiated to 185.220.101.44',
          ],
          recommendation:
            'Execute immediate endpoint quarantine and submit FortiGate edge firewall drop rule for IP 185.220.101.44.',
          riskLevel: 'Critical',
        },
        approvalRequest: {
          actionNumber: 'ACT-4902',
          proposedAction: 'Quarantine WAN port 2 and apply dynamic block rule for IP 185.220.101.44',
          targetDevice: 'FW-APEX-EDGE-01 (FortiGate 200E)',
          technicalJustification: 'Halts active exfiltration without severing legitimate LAN financial feeds.',
          riskLevel: 'Critical',
        },
      },
    ],
    network_engineer: [
      {
        id: 'msg-n1',
        sender: 'agent',
        agentSlug: 'network_engineer',
        content:
          'Diagnostics complete for INC-2026-0839: PRTG Sensor #4018 optical attenuation on Central Intermodal Freight Hub core switch has degraded to -24.2 dBm.',
        timestamp: '2026-11-07T11:44:00Z',
        findings: {
          category: 'Physical Layer / Optical Loss',
          summary: 'SFP+ receive power loss causing 8.4% frame drops on primary uplink Gi1/0/48.',
          evidence: [
            'PRTG Sensor: Ping RTT 64.2ms, Packet Loss 8.4%',
            'Cisco DOM Telemetry: Rx Power -24.2 dBm (Alarm threshold -23 dBm)',
          ],
          recommendation: 'Shift hub traffic to backup WAN link (wan2) pending physical patch cord inspection.',
          riskLevel: 'High',
        },
      },
    ],
    tech_support: [
      {
        id: 'msg-t1',
        sender: 'agent',
        agentSlug: 'tech_support',
        content:
          'Technical Support Agent online. Resolved spooler crash on remote print server APEX-DC01. Ready to assist with endpoint diagnostics or patch compliance.',
        timestamp: '2026-11-07T11:50:00Z',
      },
    ],
    helpdesk_admin: [
      {
        id: 'msg-h1',
        sender: 'agent',
        agentSlug: 'helpdesk_admin',
        content:
          'Zoho Desk triage monitor active. Triaged 4 tickets in the last 4 hours. Flagged TKT-2026-4398 for impending SLA breach.',
        timestamp: '2026-11-07T11:35:00Z',
      },
    ],
    m365_admin: [
      {
        id: 'msg-m1',
        sender: 'agent',
        agentSlug: 'm365_admin',
        content:
          'M365 Cloud Identity scan complete across 3 customer tenants. 98.2% MFA enforcement across all enterprise accounts.',
        timestamp: '2026-11-07T10:45:00Z',
      },
    ],
    backup_dr: [
      {
        id: 'msg-b1',
        sender: 'agent',
        agentSlug: 'backup_dr',
        content:
          'Veeam BDR monitor tracking 4 active backup jobs. Warning active on BioVanguard Hospital PACS archive due to storage queue saturation.',
        timestamp: '2026-11-07T10:30:00Z',
      },
    ],
  };

  // Queries
  public getOverview() {
    const kpis = calculateKpis({
      customersCount: this.customers.length,
      devices: this.devices,
      incidents: this.incidents,
      tickets: this.helpdeskTickets,
      alerts: this.securityAlerts,
      backups: this.backupJobs,
      approvals: this.approvals,
    });

    return {
      kpis,
      customers: this.customers,
      recentEvents: this.monitoringEvents.slice(0, 5),
      recentIncidents: this.incidents.slice(0, 5),
      recentApprovals: this.approvals.filter((a) => a.status === 'Pending Approval'),
      agents: this.aiAgents,
      chartData: {
        networkAvailability: [
          { time: '06:00', availability: 99.99, latency: 12 },
          { time: '08:00', availability: 99.95, latency: 14 },
          { time: '10:00', availability: 99.88, latency: 18 },
          { time: '11:40', availability: 98.40, latency: 45 },
          { time: '12:00', availability: 99.82, latency: 22 },
        ],
        incidentTrends: [
          { day: 'Mon', critical: 1, high: 2, medium: 4 },
          { day: 'Tue', critical: 0, high: 3, medium: 6 },
          { day: 'Wed', critical: 2, high: 1, medium: 5 },
          { day: 'Thu', critical: 1, high: 4, medium: 3 },
          { day: 'Fri', critical: 2, high: 2, medium: 4 },
          { day: 'Sat', critical: 1, high: 1, medium: 2 },
          { day: 'Today', critical: 1, high: 2, medium: 2 },
        ],
        ticketStatusDistribution: [
          { name: 'Resolved', value: 14, color: '#10B981' },
          { name: 'In Progress', value: 6, color: '#0284C7' },
          { name: 'Open', value: 5, color: '#F59E0B' },
          { name: 'SLA Breached', value: 1, color: '#EF4444' },
        ],
      },
    };
  }

  public getCustomers() {
    return this.customers;
  }

  public getSites(customerId?: number) {
    if (customerId) {
      return this.sites.filter((s) => s.customerId === customerId);
    }
    return this.sites;
  }

  public getDevices(customerId?: number, type?: string, status?: string) {
    let result = [...this.devices];
    if (customerId) {
      result = result.filter((d) => d.customerId === customerId);
    }
    if (type && type !== 'All') {
      result = result.filter((d) => d.type === type);
    }
    if (status && status !== 'All') {
      result = result.filter((d) => d.status === status);
    }
    return result;
  }

  public getAIAgents() {
    return this.aiAgents;
  }

  public getAgentBySlug(slug: string) {
    return this.aiAgents.find((a) => a.slug === slug);
  }

  public getIncidents(customerId?: number, status?: string, severity?: string) {
    let list = [...this.incidents];
    if (customerId) list = list.filter((i) => i.customerId === customerId);
    if (status && status !== 'All') list = list.filter((i) => i.status === status);
    if (severity && severity !== 'All') list = list.filter((i) => i.severity === severity);
    return list;
  }

  public getIncidentById(id: number) {
    return this.incidents.find((i) => i.id === id);
  }

  public updateIncidentStatus(id: number, status: Incident['status'], engineer?: string) {
    const inc = this.incidents.find((i) => i.id === id);
    if (!inc) return null;
    inc.status = status;
    if (status === 'Resolved' || status === 'Closed') {
      inc.resolvedAt = new Date().toISOString();
    }
    if (engineer) {
      inc.assignedEngineer = engineer;
    }
    this.addAuditRecord({
      actor: engineer || 'Operations Engineer',
      actorEmail: 'ops.engineer@opspilot.internal',
      action: `INCIDENT_STATUS_CHANGED_${status.toUpperCase()}`,
      entityType: 'Incident',
      entityId: inc.incidentNumber,
      details: `Incident ${inc.incidentNumber} status changed to ${status}.`,
      status: 'Success',
    });
    return inc;
  }

  public getApprovals(status?: string) {
    if (status && status !== 'All') {
      return this.approvals.filter((a) => a.status === status);
    }
    return this.approvals;
  }

  public updateApproval(id: number, decision: 'Approved' | 'Rejected', approverName: string, reason?: string) {
    const approval = this.approvals.find((a) => a.id === id);
    if (!approval) return null;

    approval.status = decision;
    approval.approver = approverName;
    approval.decidedAt = new Date().toISOString();
    if (reason) approval.rejectionReason = reason;

    // Log to Audit Trail
    this.addAuditRecord({
      actor: approverName,
      actorEmail: `${approverName.toLowerCase().replace(/\s+/g, '.')}@opspilot.internal`,
      action: decision === 'Approved' ? 'ACTION_APPROVAL_GRANTED' : 'ACTION_APPROVAL_REJECTED',
      entityType: 'ActionApproval',
      entityId: approval.actionNumber,
      details: `${decision} action ${approval.actionNumber}: ${approval.proposedAction}. Justification: ${approval.technicalJustification}`,
      status: 'Success',
    });

    // If approved, simulate execution
    if (decision === 'Approved') {
      this.automationRuns.unshift({
        id: Date.now(),
        name: `Automated Execution: ${approval.proposedAction}`,
        triggerType: 'Approval Gate Enacted',
        executedBy: `${approval.requestingAgentName}`,
        targetEntity: approval.targetDeviceName,
        status: 'Success',
        durationMs: 1420,
        executedAt: new Date().toISOString(),
        executionLog: `Enacted technical policy on ${approval.targetDeviceName}. Gateway validated authorization token and applied change without errors.`,
      });
    }

    return approval;
  }

  public getIntegrations() {
    return this.integrations;
  }

  public getIntegrationBySlug(slug: string) {
    return this.integrations.find((item) => item.slug === slug);
  }

  public updateIntegration(
    slug: string,
    updates: {
      status?: Integration['status'];
      config?: Record<string, unknown>;
    }
  ) {
    const integ = this.integrations.find((i) => i.slug === slug);
    if (!integ) return null;
    if (updates.status) integ.status = updates.status;
    if (updates.config) integ.config = { ...integ.config, ...updates.config };
    integ.lastSyncAt = new Date().toISOString();

    this.addAuditRecord({
      actor: 'Admin',
      actorEmail: 'admin@opspilot.internal',
      action: 'INTEGRATION_CONFIG_UPDATED',
      entityType: 'Integration',
      entityId: slug,
      details: `Integration ${integ.name} status updated to ${integ.status}.`,
      status: 'Success',
    });
    return integ;
  }

  public getMonitoringEvents(customerId?: number, severity?: string) {
    let result = [...this.monitoringEvents];
    if (customerId) result = result.filter((e) => e.customerId === customerId);
    if (severity && severity !== 'All') result = result.filter((e) => e.severity === severity);
    return result;
  }

  public getHelpdeskTickets() {
    return this.helpdeskTickets;
  }

  public getNetworkMetrics() {
    return this.networkMetrics;
  }

  public getSecurityAlerts() {
    return this.securityAlerts;
  }

  public getM365Health() {
    return this.m365Health;
  }

  public getBackupJobs() {
    return this.backupJobs;
  }

  public getAutomationRuns() {
    return this.automationRuns;
  }

  public getAuditRecords() {
    return this.auditRecords;
  }

  public addAuditRecord(record: Omit<AuditRecord, 'id' | 'timestamp' | 'ipAddress'>) {
    const newRecord: AuditRecord = {
      ...record,
      id: Date.now(),
      ipAddress: '127.0.0.1 (Internal Mesh)',
      timestamp: new Date().toISOString(),
    };
    this.auditRecords.unshift(newRecord);
    return newRecord;
  }

  public getKnowledgeArticles(search?: string, category?: string) {
    let result = [...this.knowledgeArticles];
    if (category && category !== 'All') {
      result = result.filter((a) => a.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return result;
  }

  public getAgentChatHistory(agentSlug: string): ChatMessage[] {
    return this.agentChatLogs[agentSlug] || [];
  }

  public sendAgentChatMessage(agentSlug: string, userMessage: string): ChatMessage[] {
    if (!this.agentChatLogs[agentSlug]) {
      this.agentChatLogs[agentSlug] = [];
    }

    const userEntry: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    };
    this.agentChatLogs[agentSlug].push(userEntry);

    // Contextual agent response simulation with findings and evidence
    const agent = this.aiAgents.find((a) => a.slug === agentSlug);
    let agentReply = `I have received your instruction: "${userMessage}". Monitoring connected telemetry systems.`;
    let findings: ChatMessage['findings'] = undefined;
    let approvalRequest: ChatMessage['approvalRequest'] = undefined;

    if (agentSlug === 'security_ops') {
      agentReply =
        'Security Operations Agent: Analysing latest SentinelOne EDR and FortiGate telemetry. Isolated endpoint WKSTN-TRADING-41. MITRE ATT&CK T1003.001 detected with 96% behavioral confidence.';
      findings = {
        category: 'Live Threat Investigation',
        summary: 'Target process powershell.exe injected payload into LSASS.',
        evidence: [
          'SentinelOne Threat ID: S1-THR-882 (Severity: Critical)',
          'IOC Match: Hash 8d9f10a82b9e01ca verified against threat feed',
        ],
        recommendation:
          'Ensure action approval ACT-4902 is signed off to terminate egress beaconing.',
        riskLevel: 'Critical',
      };
    } else if (agentSlug === 'network_engineer') {
      agentReply =
        'Network Engineer Agent: Polling PRTG sensor #4018 and FortiGate SD-WAN members. SFP optical attenuation remains at -24.2 dBm on link Gi1/0/48.';
      findings = {
        category: 'Optical Attenuation',
        summary: 'Primary WAN link experiencing 8.4% packet drop.',
        evidence: ['PRTG Ping RTT: 64ms', 'Transceiver Rx Power: -24.2 dBm'],
        recommendation: 'Recommend routing freight terminal traffic over WAN2.',
        riskLevel: 'High',
      };
    } else if (agentSlug === 'backup_dr') {
      agentReply =
        'Backup and Disaster Recovery Agent: Monitoring Veeam Backup & Replication V12. Throttle policy for PACS TrueNAS snapshot consolidation is prepared.';
      findings = {
        category: 'Veeam Storage Health',
        summary: 'ZFS pool IOPS pressure throttled to 350 MB/s to ensure zero hospital imaging latency.',
        evidence: ['Pool queue depth stabilized at 28 (down from 128)'],
        recommendation: 'Schedule synthetic full backup for Sunday maintenance window.',
        riskLevel: 'Medium',
      };
    } else {
      agentReply = `${agent?.name || 'Agent'}: Telemetry streams synchronized. Operational parameters are nominal. Ready for command execution.`;
    }

    const agentEntry: ChatMessage = {
      id: `agt-${Date.now() + 1}`,
      sender: 'agent',
      agentSlug,
      content: agentReply,
      timestamp: new Date().toISOString(),
      findings,
      approvalRequest,
    };
    this.agentChatLogs[agentSlug].push(agentEntry);

    return this.agentChatLogs[agentSlug];
  }

  // ==========================================
  // NOTIFICATION RULES & DISPATCHES
  // ==========================================

  public getNotificationRules(): NotificationRule[] {
    return [...this.notificationRules];
  }

  public getNotificationRuleById(id: number): NotificationRule | undefined {
    return this.notificationRules.find((r) => r.id === id);
  }

  public createNotificationRule(
    ruleData: Omit<NotificationRule, 'id' | 'createdAt' | 'updatedAt'>
  ): NotificationRule {
    const newId = this.notificationRules.length > 0
      ? Math.max(...this.notificationRules.map((r) => r.id)) + 1
      : 1;
    const now = new Date().toISOString();
    const newRule: NotificationRule = {
      ...ruleData,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };
    this.notificationRules.unshift(newRule);

    this.addAuditRecord({
      actor: 'System Administrator',
      actorEmail: 'admin@opspilot.internal',
      action: 'NOTIFICATION_RULE_CREATED',
      entityType: 'NotificationRule',
      entityId: String(newId),
      details: `Created notification rule "${newRule.name}" targeting ${newRule.channels} (${newRule.responsibleTeam}).`,
      status: 'Success',
    });

    return newRule;
  }

  public updateNotificationRule(
    id: number,
    updates: Partial<NotificationRule>
  ): NotificationRule | null {
    const rule = this.notificationRules.find((r) => r.id === id);
    if (!rule) return null;

    Object.assign(rule, updates, { updatedAt: new Date().toISOString() });

    this.addAuditRecord({
      actor: 'System Administrator',
      actorEmail: 'admin@opspilot.internal',
      action: 'NOTIFICATION_RULE_UPDATED',
      entityType: 'NotificationRule',
      entityId: String(id),
      details: `Updated rule "${rule.name}" (enabled: ${rule.enabled}, channels: ${rule.channels}).`,
      status: 'Success',
    });

    return rule;
  }

  public deleteNotificationRule(id: number): boolean {
    const idx = this.notificationRules.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    const deleted = this.notificationRules.splice(idx, 1)[0];

    this.addAuditRecord({
      actor: 'System Administrator',
      actorEmail: 'admin@opspilot.internal',
      action: 'NOTIFICATION_RULE_DELETED',
      entityType: 'NotificationRule',
      entityId: String(id),
      details: `Deleted notification rule "${deleted.name}".`,
      status: 'Success',
    });

    return true;
  }

  public getNotificationDispatches(incidentId?: number): NotificationDispatch[] {
    if (incidentId) {
      return this.notificationDispatches.filter((d) => d.incidentId === incidentId);
    }
    return [...this.notificationDispatches].sort(
      (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
    );
  }

  public logNotificationDispatch(
    data: Omit<NotificationDispatch, 'id' | 'sentAt'>
  ): NotificationDispatch {
    const newId = this.notificationDispatches.length > 0
      ? Math.max(...this.notificationDispatches.map((d) => d.id)) + 1
      : 1;
    const now = new Date().toISOString();
    const dispatch: NotificationDispatch = {
      ...data,
      id: newId,
      sentAt: now,
      deliveredAt: data.status === 'delivered' ? now : undefined,
    };
    this.notificationDispatches.unshift(dispatch);
    return dispatch;
  }

  public acknowledgeIncident(id: number, acknowledgedBy: string): Incident | null {
    const incident = this.incidents.find((i) => i.id === id);
    if (!incident) return null;

    const now = new Date().toISOString();
    incident.acknowledged = true;
    incident.acknowledgedBy = acknowledgedBy;
    incident.acknowledgedAt = now;
    if (incident.status === 'New') {
      incident.status = 'Investigating';
    }

    // Add event to incident timeline
    if (!incident.events) incident.events = [];
    const eventId = incident.events.length > 0
      ? Math.max(...incident.events.map((e) => e.id)) + 1
      : 1;
    incident.events.push({
      id: eventId,
      incidentId: incident.id,
      author: acknowledgedBy,
      eventType: 'Acknowledgement',
      content: `Incident acknowledged by ${acknowledgedBy}. SLA timer paused and active response initiated.`,
      timestamp: now,
    });

    this.addAuditRecord({
      actor: acknowledgedBy,
      actorEmail: `${acknowledgedBy.toLowerCase().replace(/[^a-z0-9]/g, '.')}@opspilot.internal`,
      action: 'INCIDENT_ACKNOWLEDGED',
      entityType: 'Incident',
      entityId: incident.incidentNumber,
      details: `Incident ${incident.incidentNumber} acknowledged. Assigned engineer: ${incident.assignedEngineer}.`,
      status: 'Success',
    });

    return incident;
  }

  public addIncidentEvent(
    incidentId: number,
    eventData: Omit<IncidentEvent, 'id' | 'incidentId' | 'timestamp'> & { timestamp?: string }
  ): IncidentEvent | null {
    const incident = this.incidents.find((i) => i.id === incidentId);
    if (!incident) return null;

    if (!incident.events) incident.events = [];
    const eventId = incident.events.length > 0
      ? Math.max(...incident.events.map((e) => e.id)) + 1
      : 1;
    const newEvent: IncidentEvent = {
      id: eventId,
      incidentId,
      author: eventData.author,
      eventType: eventData.eventType,
      content: eventData.content,
      deliveryMetadata: eventData.deliveryMetadata,
      timestamp: eventData.timestamp || new Date().toISOString(),
    };
    incident.events.push(newEvent);
    incident.sourceEventsCount = incident.events.length;
    return newEvent;
  }

  public triggerIncidentFollowUp(id: number): {
    incident: Incident;
    actionTaken: 'acknowledged' | 'reminder_sent' | 'escalated' | 'cooldown_active' | 'none';
    details: string;
  } | null {
    const incident = this.incidents.find((i) => i.id === id);
    if (!incident) return null;

    // Find applicable rule or fallback
    const rule = this.notificationRules.find((r) => r.enabled && r.responsibleTeam === incident.responsibleTeam) ||
      this.notificationRules[0];

    const evaluation = evaluateIncidentFollowUp(incident, rule);
    const now = new Date().toISOString();

    if (evaluation.shouldEscalate) {
      incident.escalationLevel = evaluation.newEscalationLevel || 'Level 2 - IT Manager';
      incident.remindersSentCount = (incident.remindersSentCount || 0) + 1;
      incident.lastReminderAt = now;

      // Dispatched escalation email & Teams message
      this.logNotificationDispatch({
        incidentId: incident.id,
        ruleId: rule?.id,
        channel: 'both',
        status: 'delivered',
        recipient: `${rule?.managerEmail || 'it-manager@ops.internal'} | ${rule?.teamsChannel || '#general-ops'}`,
        subject: `[ESCALATION ${incident.escalationLevel}] ${incident.incidentNumber} - ${incident.title}`,
        payloadPreview: `Escalated unacknowledged incident. Escalation level raised to ${incident.escalationLevel}.`,
      });

      this.addIncidentEvent(incident.id, {
        author: 'Notification Engine',
        eventType: 'Escalation',
        content: `SLA breach trigger: Unacknowledged after timeout. Escalated to ${incident.escalationLevel}. Notified management via Graph Mail and Microsoft Teams.`,
        deliveryMetadata: {
          channel: 'both',
          status: 'delivered',
          recipient: `${rule?.managerEmail || 'it-manager@ops.internal'} | ${rule?.teamsChannel}`,
          dispatchedAt: now,
        },
      });

      return {
        incident,
        actionTaken: 'escalated',
        details: `Incident escalated to ${incident.escalationLevel}. Management notified.`,
      };
    }

    if (evaluation.shouldRemind) {
      incident.remindersSentCount = (incident.remindersSentCount || 0) + 1;
      incident.lastReminderAt = now;

      this.logNotificationDispatch({
        incidentId: incident.id,
        ruleId: rule?.id,
        channel: rule?.channels || 'teams',
        status: 'delivered',
        recipient: rule?.teamsChannel || '#general-ops',
        subject: `[REMINDER #${incident.remindersSentCount}] ${incident.incidentNumber} - Awaiting Acknowledgement`,
        payloadPreview: `Reminder #${incident.remindersSentCount} sent to ${incident.assignedEngineer}.`,
      });

      this.addIncidentEvent(incident.id, {
        author: 'Notification Engine',
        eventType: 'Reminder',
        content: `Follow-up reminder #${incident.remindersSentCount} dispatched to ${incident.assignedEngineer} via ${rule?.channels || 'teams'}.`,
        deliveryMetadata: {
          channel: rule?.channels || 'teams',
          status: 'delivered',
          recipient: rule?.teamsChannel || '#general-ops',
          dispatchedAt: now,
        },
      });

      return {
        incident,
        actionTaken: 'reminder_sent',
        details: `Follow-up reminder #${incident.remindersSentCount} dispatched.`,
      };
    }

    if (evaluation.cooldownActive) {
      return {
        incident,
        actionTaken: 'cooldown_active',
        details: 'Incident is currently within the active notification cooldown window. Dispatch suppressed.',
      };
    }

    return {
      incident,
      actionTaken: 'none',
      details: evaluation.reason || 'Incident is already acknowledged or in nominal state.',
    };
  }

  public testNotificationRule(
    ruleId: number,
    targetIncidentId?: number
  ): {
    success: boolean;
    rule: NotificationRule;
    emailDispatch: NotificationDispatch;
    teamsDispatch: NotificationDispatch;
    message: string;
  } | null {
    const rule = this.notificationRules.find((r) => r.id === ruleId);
    if (!rule) return null;

    const incident = (targetIncidentId ? this.incidents.find((i) => i.id === targetIncidentId) : null) ||
      this.incidents[0];

    const emailSubject = `[TEST DISPATCH] OpsPilot: ${incident.incidentNumber} - ${incident.title}`;
    const teamsSubject = `[TEST CARD] OpsPilot: ${incident.incidentNumber} - ${incident.title}`;

    const emailDispatch = this.logNotificationDispatch({
      incidentId: incident.id,
      ruleId: rule.id,
      channel: 'email',
      status: 'delivered',
      recipient: rule.primaryEmail || 'ops-lead@opspilot.internal',
      subject: emailSubject,
      payloadPreview: `Simulated Microsoft Graph HTML dispatch for rule "${rule.name}".`,
    });

    const teamsDispatch = this.logNotificationDispatch({
      incidentId: incident.id,
      ruleId: rule.id,
      channel: 'teams',
      status: 'delivered',
      recipient: rule.teamsChannel || '#general-ops',
      subject: teamsSubject,
      payloadPreview: `Simulated Microsoft Teams Adaptive Card 1.5 payload for channel ${rule.teamsChannel}.`,
    });

    return {
      success: true,
      rule,
      emailDispatch,
      teamsDispatch,
      message: `Test payload dispatched successfully to ${rule.teamsChannel} and ${rule.primaryEmail}.`,
    };
  }
}

export const repository = new OpsPilotRepository();
