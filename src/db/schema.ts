import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

// 1. Users
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name').notNull().default('Operations Engineer'),
  role: text('role').notNull().default('Senior IT Ops Engineer'),
  avatarUrl: text('avatar_url'),
  department: text('department').notNull().default('Managed IT Services (MSP)'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastLoginAt: timestamp('last_login_at').defaultNow().notNull(),
});

// 2. Roles
export const roles = pgTable('roles', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description').notNull(),
  permissions: jsonb('permissions').$type<string[]>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 3. Customers
export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  tier: text('tier').notNull().default('Enterprise'),
  contactName: text('contact_name').notNull(),
  contactEmail: text('contact_email').notNull(),
  status: text('status').notNull().default('Active'),
  slaTier: text('sla_tier').notNull().default('24x7 15min Response'),
  activeDevicesCount: integer('active_devices_count').notNull().default(0),
  healthScore: integer('health_score').notNull().default(98),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 4. Sites
export const sites = pgTable('sites', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id')
    .references(() => customers.id)
    .notNull(),
  name: text('name').notNull(),
  location: text('location').notNull(),
  wanIp: text('wan_ip').notNull(),
  isOnline: boolean('is_online').notNull().default(true),
  deviceCount: integer('device_count').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 5. Devices
export const devices = pgTable('devices', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id')
    .references(() => customers.id)
    .notNull(),
  siteId: integer('site_id')
    .references(() => sites.id)
    .notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(), // Server, Workstation, Firewall, Switch, Router, Storage
  os: text('os').notNull(),
  ipAddress: text('ip_address').notNull(),
  macAddress: text('mac_address').notNull(),
  status: text('status').notNull().default('Online'), // Online, Offline, Warning, Maintenance
  agentInstalled: boolean('agent_installed').notNull().default(true),
  cpuUsage: integer('cpu_usage').notNull().default(20),
  memoryUsage: integer('memory_usage').notNull().default(45),
  diskUsage: integer('disk_usage').notNull().default(60),
  lastSeen: timestamp('last_seen').defaultNow().notNull(),
});

// 6. Integrations
export const integrations = pgTable('integrations', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  category: text('category').notNull(),
  description: text('description').notNull(),
  status: text('status').notNull().default('Not Configured'), // Connected, Not Configured, Degraded, Authentication Failed
  lastSyncAt: timestamp('last_sync_at'),
  docsUrl: text('docs_url').notNull(),
  requiredPermissions: text('required_permissions').notNull(),
  config: jsonb('config').$type<Record<string, unknown>>().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 7. Monitoring Events
export const monitoringEvents = pgTable('monitoring_events', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id')
    .references(() => customers.id)
    .notNull(),
  siteId: integer('site_id').references(() => sites.id),
  deviceId: integer('device_id').references(() => devices.id),
  integrationSlug: text('integration_slug').notNull(),
  severity: text('severity').notNull(), // Critical, High, Medium, Low, Info
  title: text('title').notNull(),
  message: text('message').notNull(),
  source: text('source').notNull(),
  correlatedIncidentId: integer('correlated_incident_id'),
  isResolved: boolean('is_resolved').notNull().default(false),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

// 8. Incidents
export const incidents = pgTable('incidents', {
  id: serial('id').primaryKey(),
  incidentNumber: text('incident_number').notNull().unique(),
  customerId: integer('customer_id')
    .references(() => customers.id)
    .notNull(),
  siteId: integer('site_id').references(() => sites.id),
  severity: text('severity').notNull(), // Critical, High, Medium, Low
  status: text('status').notNull().default('New'), // New, Investigating, Awaiting Approval, In Progress, Resolved, Closed
  title: text('title').notNull(),
  description: text('description').notNull(),
  assignedAgentSlug: text('assigned_agent_slug').notNull().default('central_ops'),
  assignedEngineer: text('assigned_engineer').notNull().default('OpsPilot On-Call'),
  responsibleTeam: text('responsible_team').notNull().default('Infrastructure Operations'),
  rootCauseFindings: text('root_cause_findings'),
  recommendedRemediation: text('recommended_remediation'),
  acknowledged: boolean('acknowledged').notNull().default(false),
  acknowledgedBy: text('acknowledged_by'),
  acknowledgedAt: timestamp('acknowledged_at'),
  escalationLevel: text('escalation_level').notNull().default('None'),
  remindersSentCount: integer('reminders_sent_count').notNull().default(0),
  lastReminderAt: timestamp('last_reminder_at'),
  cooldownUntil: timestamp('cooldown_until'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  resolvedAt: timestamp('resolved_at'),
});

// 9. Incident Events / Timeline
export const incidentEvents = pgTable('incident_events', {
  id: serial('id').primaryKey(),
  incidentId: integer('incident_id')
    .references(() => incidents.id)
    .notNull(),
  author: text('author').notNull(),
  eventType: text('event_type').notNull(), // Detection, Agent Analysis, Hypothesis, Telemetry, Email Notification, Teams Notification, Acknowledgement, Reminder, Escalation, Remediation Step, Approval Request, Service Recovery Verification, Resolution
  content: text('content').notNull(),
  deliveryMetadata: jsonb('delivery_metadata'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

// 10. AI Agents
export const aiAgents = pgTable('ai_agents', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  responsibilities: jsonb('responsibilities').$type<string[]>().notNull(),
  status: text('status').notNull().default('Active Monitoring'), // Active Monitoring, Investigating, Standby, Awaiting Approval
  connectedSystems: jsonb('connected_systems').$type<string[]>().notNull(),
  activeTasksCount: integer('active_tasks_count').notNull().default(0),
  completedInvestigationsCount: integer('completed_investigations_count').notNull().default(0),
  successRate: integer('success_rate').notNull().default(99),
  modelVersion: text('model_version').notNull().default('Gemini 2.5 Pro / Flash hybrid'),
  lastActiveAt: timestamp('last_active_at').defaultNow().notNull(),
});

// 11. Agent Tasks
export const agentTasks = pgTable('agent_tasks', {
  id: serial('id').primaryKey(),
  agentId: integer('agent_id')
    .references(() => aiAgents.id)
    .notNull(),
  incidentId: integer('incident_id').references(() => incidents.id),
  customerId: integer('customer_id').references(() => customers.id),
  title: text('title').notNull(),
  status: text('status').notNull().default('In Progress'), // Pending, In Progress, Completed, Failed
  findings: text('findings'),
  confidenceScore: integer('confidence_score').notNull().default(95),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

// 12. Agent Findings
export const agentFindings = pgTable('agent_findings', {
  id: serial('id').primaryKey(),
  agentSlug: text('agent_slug').notNull(),
  incidentId: integer('incident_id').references(() => incidents.id),
  category: text('category').notNull(),
  summary: text('summary').notNull(),
  evidence: jsonb('evidence').$type<string[]>().notNull(),
  recommendation: text('recommendation').notNull(),
  riskLevel: text('risk_level').notNull().default('Medium'), // Low, Medium, High, Critical
  confidence: integer('confidence').notNull().default(90),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 13. Action Approvals
export const actionApprovals = pgTable('action_approvals', {
  id: serial('id').primaryKey(),
  actionNumber: text('action_number').notNull().unique(),
  customerId: integer('customer_id')
    .references(() => customers.id)
    .notNull(),
  targetDeviceId: integer('target_device_id').references(() => devices.id),
  targetDeviceName: text('target_device_name').notNull(),
  requestingAgentSlug: text('requesting_agent_slug').notNull(),
  proposedAction: text('proposed_action').notNull(),
  technicalJustification: text('technical_justification').notNull(),
  supportingEvidence: jsonb('supporting_evidence').$type<string[]>().notNull(),
  riskLevel: text('risk_level').notNull(), // Low, Medium, High, Critical
  status: text('status').notNull().default('Pending Approval'), // Pending Approval, Approved, Rejected, Executed
  approver: text('approver'),
  rejectionReason: text('rejection_reason'),
  requestedAt: timestamp('requested_at').defaultNow().notNull(),
  decidedAt: timestamp('decided_at'),
});

// 14. Automation History
export const automationHistory = pgTable('automation_history', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  triggerType: text('trigger_type').notNull(), // Alert Auto-Remediation, Scheduled Health Check, Approval Enacted, Agent Playbook
  executedBy: text('executed_by').notNull(),
  targetEntity: text('target_entity').notNull(),
  status: text('status').notNull().default('Success'), // Success, Failed, Running
  durationMs: integer('duration_ms').notNull().default(1200),
  executionLog: text('execution_log').notNull(),
  executedAt: timestamp('executed_at').defaultNow().notNull(),
});

// 15. Audit Records
export const auditRecords = pgTable('audit_records', {
  id: serial('id').primaryKey(),
  actor: text('actor').notNull(),
  actorEmail: text('actor_email').notNull(),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  ipAddress: text('ip_address').notNull().default('127.0.0.1'),
  details: text('details').notNull(),
  status: text('status').notNull().default('Success'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

// 16. Knowledge Articles
export const knowledgeArticles = pgTable('knowledge_articles', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  category: text('category').notNull(), // Network, Security, M365, RMM, Veeam, SOP
  tags: jsonb('tags').$type<string[]>().notNull(),
  summary: text('summary').notNull(),
  resolutionSteps: text('resolution_steps').notNull(),
  author: text('author').notNull().default('OpsPilot Technical Staff'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 17. Notification Rules
export const notificationRules = pgTable('notification_rules', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  priority: integer('priority').notNull().default(1),
  isActive: boolean('is_active').notNull().default(true),
  sourceIntegrations: jsonb('source_integrations').$type<string[]>().notNull(),
  alertCategories: jsonb('alert_categories').$type<string[]>().notNull(),
  minSeverity: text('min_severity').notNull().default('Low'),
  customerId: integer('customer_id'),
  responsibleAgentSlug: text('responsible_agent_slug').notNull(),
  responsibleTeam: text('responsible_team').notNull(),
  recipientEmails: jsonb('recipient_emails').$type<string[]>().notNull(),
  distributionLists: jsonb('distribution_lists').$type<string[]>().notNull(),
  teamsChannel: text('teams_channel').notNull(),
  ackTimeoutMinutes: integer('ack_timeout_minutes').notNull().default(30),
  reminderIntervalMinutes: integer('reminder_interval_minutes').notNull().default(15),
  escalationThresholdMinutes: integer('escalation_threshold_minutes').notNull().default(45),
  escalationContact: text('escalation_contact').notNull(),
  notifyOnResolution: boolean('notify_on_resolution').notNull().default(true),
  businessHoursOnly: boolean('business_hours_only').notNull().default(false),
  cooldownMinutes: integer('cooldown_minutes').notNull().default(15),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 18. Notification Dispatches (Delivery Log & Dead-Letter Queue)
export const notificationDispatches = pgTable('notification_dispatches', {
  id: serial('id').primaryKey(),
  incidentId: integer('incident_id')
    .references(() => incidents.id)
    .notNull(),
  ruleId: integer('rule_id').references(() => notificationRules.id),
  channelType: text('channel_type').notNull(), // Email, Teams
  recipient: text('recipient').notNull(),
  subjectOrTitle: text('subject_or_title').notNull(),
  bodyPreview: text('body_preview').notNull(),
  status: text('status').notNull().default('Delivered'), // Delivered, Pending, Retrying, Failed, DeadLetter
  attemptCount: integer('attempt_count').notNull().default(1),
  maxAttempts: integer('max_attempts').notNull().default(3),
  lastError: text('last_error'),
  sentAt: timestamp('sent_at').defaultNow().notNull(),
  deliveredAt: timestamp('delivered_at'),
});

// Relations
export const customersRelations = relations(customers, ({ many }) => ({
  sites: many(sites),
  devices: many(devices),
  incidents: many(incidents),
}));

export const sitesRelations = relations(sites, ({ one, many }) => ({
  customer: one(customers, {
    fields: [sites.customerId],
    references: [customers.id],
  }),
  devices: many(devices),
}));

export const devicesRelations = relations(devices, ({ one }) => ({
  customer: one(customers, {
    fields: [devices.customerId],
    references: [customers.id],
  }),
  site: one(sites, {
    fields: [devices.siteId],
    references: [sites.id],
  }),
}));

export const incidentsRelations = relations(incidents, ({ one, many }) => ({
  customer: one(customers, {
    fields: [incidents.customerId],
    references: [customers.id],
  }),
  events: many(incidentEvents),
}));
