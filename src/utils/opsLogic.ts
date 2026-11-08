import {
  ActionApproval,
  BackupJob,
  Device,
  HelpdeskTicket,
  Incident,
  MonitoringEvent,
  RiskLevel,
  SecurityAlert,
  Severity,
} from '../types/index.ts';

export interface PlatformKpiSummary {
  managedCustomersCount: number;
  totalDevices: number;
  devicesOnline: number;
  devicesOffline: number;
  criticalIncidents: number;
  openHelpdeskTickets: number;
  slaBreaches: number;
  securityThreats: number;
  failedBackupJobs: number;
  pendingApprovals: number;
  fleetHealthPercent: number;
  networkAvailabilityPercent: number;
  backupSuccessRatePercent: number;
}

export function calculateKpis(params: {
  customersCount: number;
  devices: Device[];
  incidents: Incident[];
  tickets: HelpdeskTicket[];
  alerts: SecurityAlert[];
  backups: BackupJob[];
  approvals: ActionApproval[];
}): PlatformKpiSummary {
  const { customersCount, devices, incidents, tickets, alerts, backups, approvals } = params;

  const totalDevices = devices.length;
  const devicesOnline = devices.filter((d) => d.status === 'Online').length;
  const devicesOffline = devices.filter((d) => d.status === 'Offline').length;

  const criticalIncidents = incidents.filter(
    (i) => i.severity === 'Critical' && i.status !== 'Resolved' && i.status !== 'Closed'
  ).length;

  const openTickets = tickets.filter(
    (t) => t.status !== 'Resolved'
  );
  const slaBreaches = openTickets.filter((t) => t.isBreached || t.slaRemainingMinutes <= 0).length;

  const securityThreats = alerts.filter(
    (a) => a.status === 'Active Threat' || a.status === 'Under Investigation'
  ).length;

  const failedBackupJobs = backups.filter(
    (b) => b.lastRunStatus === 'Failed'
  ).length;

  const pendingApprovals = approvals.filter(
    (a) => a.status === 'Pending Approval'
  ).length;

  const fleetHealthPercent = totalDevices > 0
    ? Math.round((devicesOnline / totalDevices) * 100)
    : 100;

  const backupSuccessCount = backups.filter((b) => b.lastRunStatus === 'Success').length;
  const backupSuccessRatePercent = backups.length > 0
    ? Math.round((backupSuccessCount / backups.length) * 100)
    : 100;

  return {
    managedCustomersCount: customersCount,
    totalDevices,
    devicesOnline,
    devicesOffline,
    criticalIncidents,
    openHelpdeskTickets: openTickets.length,
    slaBreaches,
    securityThreats,
    failedBackupJobs,
    pendingApprovals,
    fleetHealthPercent,
    networkAvailabilityPercent: 99.82,
    backupSuccessRatePercent,
  };
}

export function evaluateRiskLevel(
  severity: Severity,
  actionType: 'read_only' | 'service_restart' | 'quarantine' | 'firewall_block' | 'os_reboot' | 'factory_reset',
  deviceType: Device['type']
): RiskLevel {
  if (actionType === 'factory_reset') return 'Critical';
  if (deviceType === 'Firewall' && (actionType === 'firewall_block' || actionType === 'os_reboot')) {
    return 'Critical';
  }
  if (severity === 'Critical') return 'High';
  if (actionType === 'quarantine' || actionType === 'os_reboot') return 'High';
  if (actionType === 'service_restart') return 'Medium';
  return 'Low';
}

export function correlateAlertToIncident(
  event: MonitoringEvent,
  openIncidents: Incident[]
): number | null {
  // If already correlated
  if (event.correlatedIncidentId) {
    return event.correlatedIncidentId;
  }
  // Try matching by device or site and customer
  const match = openIncidents.find((inc) => {
    if (inc.status === 'Resolved' || inc.status === 'Closed') return false;
    if (inc.customerId !== event.customerId) return false;
    if (event.siteId && inc.siteId === event.siteId) return true;
    return false;
  });

  return match ? match.id : null;
}

export function calculateSlaRemaining(
  createdAtIso: string,
  targetMinutes: number,
  currentTimeMs: number = Date.now()
): { remainingMinutes: number; isBreached: boolean; elapsedPercent: number } {
  const createdMs = new Date(createdAtIso).getTime();
  const elapsedMinutes = Math.max(0, Math.floor((currentTimeMs - createdMs) / 60000));
  const remainingMinutes = targetMinutes - elapsedMinutes;
  const isBreached = remainingMinutes <= 0;
  const elapsedPercent = Math.min(100, Math.round((elapsedMinutes / targetMinutes) * 100));

  return {
    remainingMinutes,
    isBreached,
    elapsedPercent,
  };
}
