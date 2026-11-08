import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isSeveritySufficient,
  matchNotificationRule,
  isAlertInCooldown,
  checkEscalationStatus,
  formatIncidentEmail,
  formatTeamsAdaptiveCard,
} from './notificationLogic.ts';
import { Incident, MonitoringEvent, NotificationRule } from '../types/index.ts';

test('isSeveritySufficient evaluates threshold weights correctly', () => {
  assert.equal(isSeveritySufficient('Critical', 'Low'), true);
  assert.equal(isSeveritySufficient('Critical', 'Critical'), true);
  assert.equal(isSeveritySufficient('Medium', 'High'), false);
  assert.equal(isSeveritySufficient('Low', 'Medium'), false);
});

test('matchNotificationRule prioritizes matching active rule', () => {
  const rules: NotificationRule[] = [
    {
      id: 1,
      name: 'Catch-All Info',
      priority: 10,
      isActive: true,
      sourceIntegrations: ['all'],
      alertCategories: ['all'],
      minSeverity: 'Low',
      customerId: 'all',
      responsibleAgentSlug: 'central_ops',
      responsibleTeam: 'Infrastructure Operations',
      recipientEmails: ['team@demo.local'],
      distributionLists: [],
      teamsChannel: 'General',
      ackTimeoutMinutes: 60,
      reminderIntervalMinutes: 30,
      escalationThresholdMinutes: 60,
      escalationContact: 'manager@demo.local',
      notifyOnResolution: true,
      businessHoursOnly: false,
      cooldownMinutes: 15,
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'Security High/Critical Rule',
      priority: 1,
      isActive: true,
      sourceIntegrations: ['sentinelone', 'fortigate'],
      alertCategories: ['Security', 'Threat'],
      minSeverity: 'High',
      customerId: 'all',
      responsibleAgentSlug: 'security_ops',
      responsibleTeam: 'Security Operations',
      recipientEmails: ['soc-oncall@demo.local'],
      distributionLists: ['soc-tier1@demo.local'],
      teamsChannel: 'Security Operations',
      ackTimeoutMinutes: 15,
      reminderIntervalMinutes: 10,
      escalationThresholdMinutes: 30,
      escalationContact: 'ciso@demo.local',
      notifyOnResolution: true,
      businessHoursOnly: false,
      cooldownMinutes: 10,
      createdAt: new Date().toISOString(),
    },
  ];

  const secAlert: MonitoringEvent = {
    id: 101,
    customerId: 1,
    integrationSlug: 'sentinelone',
    severity: 'Critical',
    title: 'LSASS Mimikatz Beacon',
    message: 'Memory extraction detected',
    source: 'SentinelOne Agent',
    category: 'Security',
    isResolved: false,
    timestamp: new Date().toISOString(),
  };

  const matched = matchNotificationRule(secAlert, rules);
  assert.notEqual(matched, null);
  assert.equal(matched?.id, 2);
  assert.equal(matched?.responsibleTeam, 'Security Operations');
});

test('isAlertInCooldown blocks repeated notification within cooldown window', () => {
  const incident: Incident = {
    id: 1,
    incidentNumber: 'INC-2026-0841',
    customerId: 1,
    severity: 'Critical',
    status: 'Investigating',
    title: 'Kerberos Token Leak',
    description: 'Malicious ticket request',
    assignedAgentSlug: 'security_ops',
    assignedEngineer: 'Sarah Vance',
    responsibleTeam: 'Security Operations',
    sourceEventsCount: 2,
    acknowledged: false,
    escalationLevel: 'None',
    remindersSentCount: 1,
    lastReminderAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 min ago
    cooldownUntil: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 min in future
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
  };

  // Currently in cooldown
  assert.equal(isAlertInCooldown(incident, 15, Date.now()), true);
  // After cooldown passes
  assert.equal(isAlertInCooldown(incident, 15, Date.now() + 15 * 60 * 1000), false);
});

test('checkEscalationStatus triggers reminders and manager escalations when unacknowledged', () => {
  const rule: NotificationRule = {
    id: 1,
    name: 'S1 Rule',
    priority: 1,
    isActive: true,
    sourceIntegrations: ['sentinelone'],
    alertCategories: ['Security'],
    minSeverity: 'High',
    customerId: 'all',
    responsibleAgentSlug: 'security_ops',
    responsibleTeam: 'Security Operations',
    recipientEmails: ['soc@demo.local'],
    distributionLists: [],
    teamsChannel: 'Security Operations',
    ackTimeoutMinutes: 15,
    reminderIntervalMinutes: 10,
    escalationThresholdMinutes: 30,
    escalationContact: 'ciso@demo.local',
    notifyOnResolution: true,
    businessHoursOnly: false,
    cooldownMinutes: 10,
    createdAt: new Date().toISOString(),
  };

  // Incident created 35 minutes ago, never acknowledged, currently escalationLevel 'None'
  const unackedIncident: Incident = {
    id: 1,
    incidentNumber: 'INC-2026-0841',
    customerId: 1,
    severity: 'Critical',
    status: 'Investigating',
    title: 'Credential Dumping',
    description: 'Detected Mimikatz',
    assignedAgentSlug: 'security_ops',
    assignedEngineer: 'Sarah Vance',
    responsibleTeam: 'Security Operations',
    sourceEventsCount: 1,
    acknowledged: false,
    escalationLevel: 'None',
    remindersSentCount: 2,
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
  };

  const check = checkEscalationStatus(unackedIncident, rule, Date.now());
  assert.equal(check.needsEscalation, true);
  assert.equal(check.nextEscalationLevel, 'Level 1: Team Lead');
});

test('formatIncidentEmail and formatTeamsAdaptiveCard build complete templates', () => {
  const incident: Incident = {
    id: 1,
    incidentNumber: 'INC-2026-0841',
    customerId: 1,
    customerName: 'Apex Financial',
    siteName: 'Wall St HQ',
    severity: 'Critical',
    status: 'Investigating',
    title: 'Active Cobalt Strike',
    description: 'LSASS dumped',
    assignedAgentSlug: 'security_ops',
    assignedEngineer: 'Sarah Vance',
    responsibleTeam: 'Security Operations',
    rootCauseFindings: 'Macro execution dropped DLL',
    recommendedRemediation: 'Isolate host and revoke tokens',
    sourceEventsCount: 3,
    acknowledged: false,
    escalationLevel: 'None',
    remindersSentCount: 0,
    createdAt: new Date().toISOString(),
  };

  const email = formatIncidentEmail({
    incident,
    appUrl: 'https://opspilot.internal',
    templateType: 'New Alert',
  });

  assert.equal(email.subject.includes('[OPSPILOT ALERT] Critical - INC-2026-0841'), true);
  assert.equal(email.bodyHtml.includes('Apex Financial'), true);
  assert.equal(email.bodyHtml.includes('Macro execution dropped DLL'), true);

  const card = formatTeamsAdaptiveCard({
    incident,
    appUrl: 'https://opspilot.internal',
    channelName: 'Security Operations',
  });

  assert.equal(card.type, 'message');
  assert.notEqual(card.attachments, undefined);
});
