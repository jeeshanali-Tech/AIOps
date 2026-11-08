import {
  Incident,
  MonitoringEvent,
  NotificationRule,
  Severity,
} from '../types/index.ts';

const SEVERITY_WEIGHT: Record<Severity, number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
  Info: 0,
};

export function isSeveritySufficient(alertSeverity: Severity, minSeverity: Severity): boolean {
  return (SEVERITY_WEIGHT[alertSeverity] ?? 0) >= (SEVERITY_WEIGHT[minSeverity] ?? 0);
}

export function isBusinessHours(date: Date = new Date()): boolean {
  // Business hours: Monday to Friday, 08:00 to 18:00
  const day = date.getDay(); // 0 is Sunday, 6 is Saturday
  if (day === 0 || day === 6) return false;
  const hours = date.getHours();
  return hours >= 8 && hours < 18;
}

export function matchNotificationRule(
  alert: MonitoringEvent,
  rules: NotificationRule[],
  currentDate: Date = new Date()
): NotificationRule | null {
  // Sort by priority ascending (1 = highest priority)
  const sortedRules = [...rules]
    .filter((r) => (r.isActive ?? r.enabled ?? true))
    .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));

  for (const rule of sortedRules) {
    // 1. Customer Check
    if (rule.customerId && rule.customerId !== 'all' && rule.customerId !== alert.customerId) {
      continue;
    }

    // 2. Severity Check
    const minSev = rule.minSeverity || (rule.severityLevels && rule.severityLevels.length > 0 ? rule.severityLevels[rule.severityLevels.length - 1] : 'Low');
    if (!isSeveritySufficient(alert.severity, minSev)) {
      continue;
    }

    // 3. Source Integration Check
    const sources = rule.sourceIntegrations || rule.sources || [];
    if (
      sources.length > 0 &&
      !sources.includes('all') &&
      !sources.includes(alert.integrationSlug)
    ) {
      continue;
    }

    // 4. Category Check (if alert has category)
    const categories = rule.alertCategories || rule.categories || [];
    if (
      alert.category &&
      categories.length > 0 &&
      !categories.includes('all') &&
      !categories.includes(alert.category)
    ) {
      continue;
    }

    // 5. Business Hours Check
    if (rule.businessHoursOnly && !isBusinessHours(currentDate)) {
      continue;
    }

    return rule;
  }

  return null;
}

export function isAlertInCooldown(
  incident: Incident,
  cooldownMinutes: number,
  currentTimeMs: number = Date.now()
): boolean {
  if (!incident.lastReminderAt && !incident.cooldownUntil) {
    return false;
  }
  const cooldownUntilMs = incident.cooldownUntil
    ? new Date(incident.cooldownUntil).getTime()
    : new Date(incident.lastReminderAt || 0).getTime() + cooldownMinutes * 60 * 1000;

  return currentTimeMs < cooldownUntilMs;
}

export interface EscalationCheckResult {
  needsReminder: boolean;
  needsEscalation: boolean;
  nextEscalationLevel: Incident['escalationLevel'];
  reason?: string;
}

export function checkEscalationStatus(
  incident: Incident,
  rule: NotificationRule,
  currentTimeMs: number = Date.now()
): EscalationCheckResult {
  // If already resolved or acknowledged, no reminder/escalation needed
  if (
    incident.acknowledged ||
    incident.status === 'Resolved' ||
    incident.status === 'Closed'
  ) {
    return {
      needsReminder: false,
      needsEscalation: false,
      nextEscalationLevel: incident.escalationLevel,
    };
  }

  const createdMs = new Date(incident.createdAt).getTime();
  const elapsedMinutes = Math.floor((currentTimeMs - createdMs) / 60000);
  const threshold = rule.escalationThresholdMinutes ?? rule.ackTimeoutMinutes ?? 30;

  // Check Level 2 Escalation (IT Manager) if threshold exceeded (e.g. 1.5x escalation threshold)
  if (
    elapsedMinutes >= threshold * 1.5 &&
    incident.escalationLevel !== 'Level 2: IT Manager' &&
    incident.escalationLevel !== 'Level 2 - IT Manager'
  ) {
    return {
      needsReminder: true,
      needsEscalation: true,
      nextEscalationLevel: 'Level 2: IT Manager',
      reason: `Incident unacknowledged after ${elapsedMinutes}m. Breached secondary SLA of ${Math.round(threshold * 1.5)}m.`,
    };
  }

  // Check Level 1 Escalation (Team Lead)
  if (
    elapsedMinutes >= threshold &&
    incident.escalationLevel === 'None'
  ) {
    return {
      needsReminder: true,
      needsEscalation: true,
      nextEscalationLevel: 'Level 1: Team Lead',
      reason: `Incident unacknowledged for ${elapsedMinutes}m (Threshold: ${threshold}m).`,
    };
  }

  // Check regular Reminder
  const lastContactMs = incident.lastReminderAt
    ? new Date(incident.lastReminderAt).getTime()
    : createdMs;
  const minutesSinceLastContact = Math.floor((currentTimeMs - lastContactMs) / 60000);

  if (
    minutesSinceLastContact >= rule.reminderIntervalMinutes &&
    incident.remindersSentCount < 4 // Escalation limit: max 4 automated reminders
  ) {
    return {
      needsReminder: true,
      needsEscalation: false,
      nextEscalationLevel: incident.escalationLevel,
      reason: `Periodic reminder #${incident.remindersSentCount + 1} after ${minutesSinceLastContact}m of inactivity.`,
    };
  }

  return {
    needsReminder: false,
    needsEscalation: false,
    nextEscalationLevel: incident.escalationLevel,
  };
}

export function formatIncidentEmail(params: {
  incident: Incident;
  appUrl: string;
  templateType: 'New Alert' | 'Reminder' | 'Escalation' | 'Resolution';
}): { subject: string; bodyHtml: string; bodyText: string } {
  const { incident, appUrl, templateType } = params;
  const incidentUrl = `${appUrl}?incident=${incident.incidentNumber}`;

  const subjectPrefix =
    templateType === 'Escalation'
      ? `[ESCALATION - ${incident.escalationLevel}]`
      : templateType === 'Reminder'
      ? '[REMINDER]'
      : templateType === 'Resolution'
      ? '[RESOLVED]'
      : '[OPSPILOT ALERT]';

  const subject = `${subjectPrefix} ${incident.severity} - ${incident.incidentNumber}: ${incident.title} (${incident.customerName})`;

  const bodyText = `
OpsPilot Intelligent Alert Notification
---------------------------------------
Template Type: ${templateType}
Incident Reference: ${incident.incidentNumber}
Severity: ${incident.severity}
Status: ${incident.status}
Customer: ${incident.customerName || 'N/A'}
Site: ${incident.siteName || 'Central Infrastructure'}
Responsible Team: ${incident.responsibleTeam}
Assigned AI Agent: ${incident.assignedAgentSlug}
Assigned Engineer: ${incident.assignedEngineer}
Detection Time: ${incident.createdAt}

Description:
${incident.description}

AI Investigation Summary:
${incident.rootCauseFindings || 'Heuristic correlation underway.'}

Recommended Next Steps:
${incident.recommendedRemediation || 'Inspect telemetry and verify containment.'}

Direct OpsPilot Link:
${incidentUrl}
`.trim();

  const bodyHtml = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background: #ffffff;">
  <div style="background: #0a1224; padding: 18px 24px; color: #ffffff;">
    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #38bdf8; font-weight: bold;">OpsPilot Enterprise Notification</div>
    <h2 style="margin: 6px 0 0; font-size: 18px; font-weight: bold;">${incident.incidentNumber}: ${incident.title}</h2>
  </div>
  <div style="padding: 24px; color: #1e293b; font-size: 13px; line-height: 1.5;">
    <div style="display: flex; gap: 12px; margin-bottom: 16px;">
      <span style="display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: bold; background: ${
        incident.severity === 'Critical' ? '#fee2e2; color: #b91c1c;' : '#fef3c7; color: #b45309;'
      }">Severity: ${incident.severity}</span>
      <span style="display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: bold; background: #f1f5f9; color: #475569;">Team: ${
        incident.responsibleTeam
      }</span>
    </div>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <tr>
        <td style="padding: 6px 0; color: #64748b; font-size: 12px; width: 140px;">Customer / Site:</td>
        <td style="padding: 6px 0; font-weight: 600;">${incident.customerName} (${incident.siteName || 'All Sites'})</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #64748b; font-size: 12px;">Assigned AI Agent:</td>
        <td style="padding: 6px 0; font-family: monospace; color: #0284c7; font-weight: 600;">${incident.assignedAgentSlug}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #64748b; font-size: 12px;">Assigned Engineer:</td>
        <td style="padding: 6px 0; font-weight: 600;">${incident.assignedEngineer}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #64748b; font-size: 12px;">Acknowledgement:</td>
        <td style="padding: 6px 0; font-weight: 600; color: ${incident.acknowledged ? '#15803d' : '#b45309'};">${
          incident.acknowledged ? 'Acknowledged' : 'Pending Acknowledgment'
        }</td>
      </tr>
    </table>
    <div style="background: #f8fafc; border-left: 3px solid #0284c7; padding: 12px 16px; margin-bottom: 20px; border-radius: 4px;">
      <div style="font-size: 11px; text-transform: uppercase; font-weight: bold; color: #0369a1; margin-bottom: 4px;">AI Investigation Summary</div>
      <div style="color: #334155;">${incident.rootCauseFindings || incident.description}</div>
    </div>
    <div style="margin-top: 24px; text-align: center;">
      <a href="${incidentUrl}" style="background: #2563eb; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 13px; display: inline-block;">View Incident in OpsPilot</a>
    </div>
  </div>
</div>
`.trim();

  return { subject, bodyHtml, bodyText };
}

export function formatTeamsAdaptiveCard(params: {
  incident: Incident;
  appUrl: string;
  channelName: string;
}): Record<string, unknown> {
  const { incident, appUrl, channelName } = params;
  const incidentUrl = `${appUrl}?incident=${incident.incidentNumber}`;

  return {
    type: 'message',
    attachments: [
      {
        contentType: 'application/vnd.microsoft.card.adaptive',
        content: {
          $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
          type: 'AdaptiveCard',
          version: '1.4',
          body: [
            {
              type: 'Container',
              style: incident.severity === 'Critical' ? 'attention' : 'warning',
              items: [
                {
                  type: 'TextBlock',
                  text: `🚨 [${incident.severity.toUpperCase()}] ${incident.incidentNumber}: ${incident.title}`,
                  weight: 'Bolder',
                  size: 'Medium',
                  wrap: true,
                },
              ],
            },
            {
              type: 'FactSet',
              facts: [
                { title: 'Customer:', value: incident.customerName || 'N/A' },
                { title: 'Site:', value: incident.siteName || 'Core Infrastructure' },
                { title: 'Responsible Team:', value: incident.responsibleTeam },
                { title: 'Assigned Agent:', value: incident.assignedAgentSlug },
                { title: 'Assigned Engineer:', value: incident.assignedEngineer },
                {
                  title: 'Acknowledgement:',
                  value: incident.acknowledged ? '✅ Acknowledged' : '⏳ Awaiting Engineer',
                },
              ],
            },
            {
              type: 'TextBlock',
              text: `**AI Investigation Summary:**\n${incident.rootCauseFindings || incident.description}`,
              wrap: true,
            },
            {
              type: 'TextBlock',
              text: `**Recommended Next Step:**\n${incident.recommendedRemediation || 'Review active telemetry and verify gateway authorization.'}`,
              wrap: true,
            },
          ],
          actions: [
            {
              type: 'Action.OpenUrl',
              title: 'Open in OpsPilot',
              url: incidentUrl,
            },
            {
              type: 'Action.Submit',
              title: 'Acknowledge Incident',
              data: {
                action: 'ACKNOWLEDGE_INCIDENT',
                incidentId: incident.id,
                incidentNumber: incident.incidentNumber,
              },
            },
          ],
        },
      },
    ],
  };
}

export function evaluateIncidentFollowUp(
  incident: Incident,
  rule?: NotificationRule,
  currentTimeMs: number = Date.now()
): {
  shouldRemind: boolean;
  shouldEscalate: boolean;
  newEscalationLevel?: Incident['escalationLevel'];
  cooldownActive?: boolean;
  reason?: string;
} {
  if (incident.acknowledged || incident.status === 'Resolved' || incident.status === 'Closed') {
    return {
      shouldRemind: false,
      shouldEscalate: false,
      reason: 'Incident is already acknowledged or resolved.',
    };
  }

  const cooldownMinutes = rule?.cooldownMinutes ?? 15;
  if (isAlertInCooldown(incident, cooldownMinutes, currentTimeMs)) {
    return {
      shouldRemind: false,
      shouldEscalate: false,
      cooldownActive: true,
      reason: 'Notification cooldown window is active.',
    };
  }

  const fallbackRule: NotificationRule = rule || {
    id: 0,
    name: 'Default Fallback Rule',
    priority: 1,
    isActive: true,
    sourceIntegrations: ['all'],
    alertCategories: ['all'],
    minSeverity: 'Low',
    customerId: 'all',
    responsibleAgentSlug: incident.assignedAgentSlug,
    responsibleTeam: incident.responsibleTeam,
    recipientEmails: ['ops-oncall@opspilot.internal'],
    distributionLists: [],
    teamsChannel: '#general-ops',
    ackTimeoutMinutes: 15,
    reminderIntervalMinutes: 10,
    escalationThresholdMinutes: 30,
    escalationContact: 'it-manager@ops.internal',
    notifyOnResolution: true,
    businessHoursOnly: false,
    cooldownMinutes: 15,
    createdAt: new Date().toISOString(),
  };

  const escalation = checkEscalationStatus(incident, fallbackRule, currentTimeMs);
  return {
    shouldRemind: escalation.needsReminder,
    shouldEscalate: escalation.needsEscalation,
    newEscalationLevel: escalation.nextEscalationLevel,
    reason: escalation.reason,
  };
}

export function formatIncidentEmailHtml(incident: Incident): string {
  return formatIncidentEmail({
    incident,
    appUrl: 'http://localhost:3000',
    templateType: 'New Alert',
  }).bodyHtml;
}

