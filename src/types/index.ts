export type Severity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';

export type IncidentStatus =
  | 'New'
  | 'Investigating'
  | 'Awaiting Approval'
  | 'In Progress'
  | 'Resolved'
  | 'Closed';

export type ApprovalStatus =
  | 'Pending Approval'
  | 'Approved'
  | 'Rejected'
  | 'Executed';

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type IntegrationStatus =
  | 'Connected'
  | 'Not Configured'
  | 'Degraded'
  | 'Authentication Failed';

export type DeviceStatus = 'Online' | 'Offline' | 'Warning' | 'Maintenance';

export type AgentStatus =
  | 'Active Monitoring'
  | 'Investigating'
  | 'Standby'
  | 'Awaiting Approval';

export type AlertSeverity = Severity;

export type NotificationChannelType = 'Email' | 'Teams' | 'Both' | 'both' | 'email' | 'teams';

export type DeliveryStatus =
  | 'Delivered'
  | 'Pending'
  | 'Retrying'
  | 'Failed'
  | 'DeadLetter'
  | 'delivered'
  | 'pending'
  | 'retrying'
  | 'failed'
  | 'dead_letter';

export type EscalationLevel =
  | 'None'
  | 'Level 1: Team Lead'
  | 'Level 2: IT Manager'
  | 'Level 1 - Lead Engineer'
  | 'Level 2 - IT Manager';

export type ResponsibleTeam =
  | 'Helpdesk Operations'
  | 'Network Operations'
  | 'Infrastructure Operations'
  | 'Security Operations'
  | 'Microsoft 365 Operations'
  | 'Backup and Disaster Recovery'
  | 'Helpdesk & Client Systems'
  | 'M365 & Cloud Identity'
  | 'Backup & DR';

export interface Customer {
  id: number;
  name: string;
  code: string;
  tier: 'Enterprise' | 'Mid-Market' | 'Standard';
  contactName: string;
  contactEmail: string;
  status: 'Active' | 'Onboarding' | 'Suspended';
  slaTier: string;
  activeDevicesCount: number;
  healthScore: number;
  createdAt: string;
}

export interface Site {
  id: number;
  customerId: number;
  customerName?: string;
  name: string;
  location: string;
  wanIp: string;
  isOnline: boolean;
  deviceCount: number;
}

export interface Device {
  id: number;
  customerId: number;
  customerName?: string;
  siteId: number;
  siteName?: string;
  name: string;
  type:
    | 'Server'
    | 'Workstation'
    | 'Firewall'
    | 'Switch'
    | 'Router'
    | 'Storage / NAS'
    | 'Access Point';
  os: string;
  ipAddress: string;
  macAddress: string;
  status: DeviceStatus;
  agentInstalled: boolean;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  lastSeen: string;
}

export interface MonitoringEvent {
  id: number;
  customerId: number;
  customerName?: string;
  siteId?: number;
  siteName?: string;
  deviceId?: number;
  deviceName?: string;
  integrationSlug: string;
  severity: Severity;
  title: string;
  message: string;
  source: string;
  category?: string;
  correlatedIncidentId?: number;
  isResolved: boolean;
  timestamp: string;
}

export interface IncidentEvent {
  id: number;
  incidentId: number;
  author: string;
  eventType:
    | 'Detection'
    | 'Agent Analysis'
    | 'Hypothesis'
    | 'Telemetry'
    | 'Email Notification'
    | 'Teams Notification'
    | 'Dispatch'
    | 'Acknowledgement'
    | 'Reminder'
    | 'Escalation'
    | 'Remediation Step'
    | 'Approval Request'
    | 'Service Recovery Verification'
    | 'Resolution';
  content: string;
  deliveryMetadata?: {
    channel: 'Email' | 'Teams' | 'Both' | 'email' | 'teams' | 'both';
    recipient: string;
    status: DeliveryStatus;
    dispatchId?: number;
    latencyMs?: number;
    dispatchedAt?: string;
  };
  timestamp: string;
}

export interface Incident {
  id: number;
  incidentNumber: string;
  customerId: number;
  customerName?: string;
  siteId?: number;
  siteName?: string;
  severity: Severity;
  status: IncidentStatus;
  title: string;
  description: string;
  assignedAgentSlug: string;
  assignedEngineer: string;
  responsibleTeam: ResponsibleTeam;
  rootCauseFindings?: string;
  recommendedRemediation?: string;
  sourceEventsCount: number;
  events?: IncidentEvent[];
  // Follow-up & Lifecycle Tracking
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  escalationLevel: EscalationLevel;
  remindersSentCount: number;
  lastReminderAt?: string;
  cooldownUntil?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface AIAgent {
  id: number;
  slug: string;
  name: string;
  title: string;
  description: string;
  responsibilities: string[];
  status: AgentStatus;
  connectedSystems: string[];
  activeTasksCount: number;
  completedInvestigationsCount: number;
  successRate: number;
  modelVersion: string;
  lastActiveAt: string;
  avatarColor: string;
}

export interface AgentTask {
  id: number;
  agentSlug: string;
  incidentId?: number;
  incidentNumber?: string;
  customerId: number;
  customerName?: string;
  title: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Failed';
  findings?: string;
  confidenceScore: number;
  startedAt: string;
  completedAt?: string;
}

export interface AgentFinding {
  id: number;
  agentSlug: string;
  incidentId?: number;
  incidentNumber?: string;
  category: string;
  summary: string;
  evidence: string[];
  recommendation: string;
  riskLevel: RiskLevel;
  confidence: number;
  createdAt: string;
}

export interface ActionApproval {
  id: number;
  actionNumber: string;
  customerId: number;
  customerName: string;
  targetDeviceId?: number;
  targetDeviceName: string;
  requestingAgentSlug: string;
  requestingAgentName: string;
  proposedAction: string;
  technicalJustification: string;
  supportingEvidence: string[];
  riskLevel: RiskLevel;
  status: ApprovalStatus;
  approver?: string;
  rejectionReason?: string;
  requestedAt: string;
  decidedAt?: string;
}

export interface Integration {
  id: number;
  name: string;
  slug: string;
  category: string;
  description: string;
  status: IntegrationStatus;
  lastSyncAt?: string;
  docsUrl: string;
  requiredPermissions: string;
  config?: Record<string, unknown>;
  syncHistory?: { timestamp: string; status: string; itemsProcessed: number }[];
  deliveryTelemetry?: {
    totalSent: number;
    deliveredCount: number;
    failedCount: number;
    avgLatencyMs: number;
  };
}

export interface NotificationRule {
  id: number;
  name: string;
  priority?: number;
  isActive?: boolean;
  enabled?: boolean;
  sourceIntegrations?: string[];
  sources?: string[];
  alertCategories?: string[];
  categories?: string[];
  minSeverity?: Severity;
  severityLevels?: Severity[];
  customerId?: number | 'all';
  customerName?: string;
  responsibleAgentSlug?: string;
  assignedAgentSlug?: string;
  responsibleTeam: ResponsibleTeam;
  recipientEmails?: string[];
  distributionLists?: string[];
  primaryEmail?: string;
  managerEmail?: string;
  teamsChannel?: string;
  channels?: NotificationChannelType;
  ackTimeoutMinutes: number;
  reminderIntervalMinutes: number;
  maxReminders?: number;
  escalationThresholdMinutes?: number;
  escalationContact?: string;
  notifyOnResolution?: boolean;
  businessHoursOnly: boolean;
  cooldownMinutes: number;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationDispatch {
  id: number;
  incidentId: number;
  incidentNumber?: string;
  ruleId?: number;
  ruleName?: string;
  channelType?: NotificationChannelType;
  channel?: NotificationChannelType;
  recipient: string;
  subjectOrTitle?: string;
  subject?: string;
  bodyPreview?: string;
  payloadPreview?: string;
  status: DeliveryStatus;
  attemptCount?: number;
  maxAttempts?: number;
  lastError?: string;
  sentAt: string;
  deliveredAt?: string;
}

export interface HelpdeskTicket {
  id: number;
  ticketNumber: string;
  customerId: number;
  customerName: string;
  title: string;
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  status: 'New' | 'Open' | 'In Progress' | 'Waiting on Client' | 'Resolved';
  assignedTo: string;
  slaTargetMinutes: number;
  slaRemainingMinutes: number;
  isBreached: boolean;
  agentInvestigated: boolean;
  agentFindingsSummary?: string;
  createdAt: string;
}

export interface NetworkInterfaceMetric {
  id: number;
  siteName: string;
  device: string;
  wanAvailability: number;
  packetLossPercent: number;
  latencyMs: number;
  firewallStatus: 'Healthy' | 'Degraded' | 'Offline';
  vpnTunnelsUp: number;
  vpnTunnelsTotal: number;
  prtgSensorStatus: 'All Sensors Green' | '1 Warning' | 'Sensor Critical';
  lastPolled: string;
}

export interface SecurityAlert {
  id: number;
  threatId: string;
  customerName: string;
  deviceName: string;
  severity: Severity;
  classification: string;
  mitreTactic: string;
  status: 'Active Threat' | 'Mitigated' | 'Under Investigation' | 'Quarantined';
  sentinelOneEngine: string;
  detectedAt: string;
}

export interface M365TenantHealth {
  customerId: number;
  customerName: string;
  totalUsers: number;
  assignedLicenses: number;
  unassignedLicenses: number;
  entraIdSyncStatus: 'Healthy' | 'Sync Delayed' | 'Error';
  exchangeServiceHealth: 'Operational' | 'Advisory' | 'Degraded';
  suspiciousSignIns24h: number;
  mfaAdoptionPercent: number;
}

export interface BackupJob {
  id: number;
  jobName: string;
  customerName: string;
  workload: string;
  lastRunStatus: 'Success' | 'Failed' | 'Warning' | 'Running';
  dataTransferredGb: number;
  repositoryCapacityUsedPercent: number;
  lastSuccessfulBackup: string;
  recoveryReadiness: 'Verified Bootable' | 'Needs Testing' | 'At Risk';
}

export interface AutomationRun {
  id: number;
  name: string;
  triggerType: string;
  executedBy: string;
  targetEntity: string;
  status: 'Success' | 'Failed' | 'Running';
  durationMs: number;
  executedAt: string;
  executionLog: string;
}

export interface AuditRecord {
  id: number;
  actor: string;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  ipAddress: string;
  details: string;
  status: 'Success' | 'Denied' | 'Failed';
  timestamp: string;
}

export interface KnowledgeArticle {
  id: number;
  title: string;
  category: string;
  tags: string[];
  summary: string;
  resolutionSteps: string;
  author: string;
  viewCount: number;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  agentSlug?: string;
  content: string;
  timestamp: string;
  findings?: {
    category: string;
    summary: string;
    evidence: string[];
    recommendation: string;
    riskLevel: RiskLevel;
  };
  approvalRequest?: {
    actionNumber: string;
    proposedAction: string;
    targetDevice: string;
    technicalJustification: string;
    riskLevel: RiskLevel;
  };
}

export interface GitHubUser {
  login: string;
  id: number;
  avatarUrl: string;
  htmlUrl: string;
  name: string;
  company?: string;
  email?: string;
  bio?: string;
  publicRepos: number;
  totalPrivateRepos?: number;
}

export interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  private: boolean;
  htmlUrl: string;
  description: string;
  defaultBranch: string;
  updatedAt: string;
  openIssuesCount: number;
  category?: 'IaC' | 'Runbooks' | 'Service' | 'Config' | 'General';
  isMonitored?: boolean;
}

export interface GitHubWorkflowRun {
  id: number;
  name: string;
  status: 'completed' | 'in_progress' | 'queued' | 'waiting' | 'requested';
  conclusion: 'success' | 'failure' | 'cancelled' | 'timed_out' | 'neutral' | null;
  headBranch: string;
  headSha: string;
  event: string;
  htmlUrl: string;
  actor: string;
  actorAvatar?: string;
  createdAt: string;
  updatedAt: string;
  repository: string;
  durationMs?: number;
}

export interface GitHubCommitItem {
  sha: string;
  message: string;
  author: string;
  date: string;
  htmlUrl: string;
  repo: string;
}

export interface GitHubConnectionState {
  connected: boolean;
  user: GitHubUser | null;
  authMethod: 'OAuth 2.0' | 'Personal Access Token' | 'Simulation' | 'None';
  connectedAt?: string;
  lastSyncAt?: string;
  monitoredRepos: GitHubRepo[];
  recentWorkflowRuns: GitHubWorkflowRun[];
  recentCommits: GitHubCommitItem[];
  rateLimit?: {
    limit: number;
    remaining: number;
    reset: number;
  };
}

export type SystemMode = 'live' | 'demo';

