import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateKpis,
  evaluateRiskLevel,
  calculateSlaRemaining,
  correlateAlertToIncident,
} from './opsLogic.ts';
import { Device, Incident, HelpdeskTicket, SecurityAlert, BackupJob, ActionApproval, MonitoringEvent } from '../types/index.ts';

test('calculateKpis computes accurate operational totals', () => {
  const mockDevices: Device[] = [
    {
      id: 1,
      customerId: 10,
      siteId: 1,
      name: 'DC-SRV01',
      type: 'Server',
      os: 'Windows Server 2022',
      ipAddress: '10.0.1.10',
      macAddress: '00:15:5D:01:02:03',
      status: 'Online',
      agentInstalled: true,
      cpuUsage: 25,
      memoryUsage: 60,
      diskUsage: 70,
      lastSeen: new Date().toISOString(),
    },
    {
      id: 2,
      customerId: 10,
      siteId: 1,
      name: 'WKSTN-FIN-04',
      type: 'Workstation',
      os: 'Windows 11 Pro',
      ipAddress: '10.0.1.55',
      macAddress: '00:15:5D:01:02:04',
      status: 'Offline',
      agentInstalled: true,
      cpuUsage: 0,
      memoryUsage: 0,
      diskUsage: 50,
      lastSeen: new Date().toISOString(),
    },
  ];

  const mockIncidents: Incident[] = [
    {
      id: 1,
      incidentNumber: 'INC-2026-001',
      customerId: 10,
      severity: 'Critical',
      status: 'Investigating',
      title: 'Active Ransomware attempt isolated',
      description: 'SentinelOne detected Cobalt Strike beacon',
      assignedAgentSlug: 'security_ops',
      assignedEngineer: 'Sarah Connor',
      responsibleTeam: 'Security Operations',
      acknowledged: false,
      escalationLevel: 'None',
      remindersSentCount: 0,
      sourceEventsCount: 3,
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      incidentNumber: 'INC-2026-002',
      customerId: 10,
      severity: 'Medium',
      status: 'Resolved',
      title: 'Spooler service stalled',
      description: 'Print spooler restarted',
      assignedAgentSlug: 'tech_support',
      assignedEngineer: 'Auto-pilot',
      responsibleTeam: 'Helpdesk Operations',
      acknowledged: true,
      escalationLevel: 'None',
      remindersSentCount: 0,
      sourceEventsCount: 1,
      createdAt: new Date().toISOString(),
    },
  ];

  const mockTickets: HelpdeskTicket[] = [
    {
      id: 1,
      ticketNumber: 'TKT-101',
      customerId: 10,
      customerName: 'Acme Corp',
      title: 'VPN disconnects every 10 min',
      priority: 'High',
      status: 'Open',
      assignedTo: 'Helpdesk Tier 2',
      slaTargetMinutes: 60,
      slaRemainingMinutes: 15,
      isBreached: false,
      agentInvestigated: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      ticketNumber: 'TKT-102',
      customerId: 10,
      customerName: 'Acme Corp',
      title: 'Outlook password prompt loop',
      priority: 'Urgent',
      status: 'In Progress',
      assignedTo: 'M365 Admin',
      slaTargetMinutes: 30,
      slaRemainingMinutes: -10,
      isBreached: true,
      agentInvestigated: true,
      createdAt: new Date().toISOString(),
    },
  ];

  const mockAlerts: SecurityAlert[] = [
    {
      id: 1,
      threatId: 'S1-THR-882',
      customerName: 'Acme Corp',
      deviceName: 'WKSTN-FIN-04',
      severity: 'High',
      classification: 'Trojan.Downloader',
      mitreTactic: 'Initial Access',
      status: 'Active Threat',
      sentinelOneEngine: 'On-Write AI',
      detectedAt: new Date().toISOString(),
    },
  ];

  const mockBackups: BackupJob[] = [
    {
      id: 1,
      jobName: 'Daily Hyper-V Replica',
      customerName: 'Acme Corp',
      workload: 'VMware Cluster',
      lastRunStatus: 'Success',
      dataTransferredGb: 140,
      repositoryCapacityUsedPercent: 62,
      lastSuccessfulBackup: new Date().toISOString(),
      recoveryReadiness: 'Verified Bootable',
    },
    {
      id: 2,
      jobName: 'SQL Database Diff',
      customerName: 'Acme Corp',
      workload: 'MSSQL-PROD',
      lastRunStatus: 'Failed',
      dataTransferredGb: 0,
      repositoryCapacityUsedPercent: 88,
      lastSuccessfulBackup: new Date().toISOString(),
      recoveryReadiness: 'At Risk',
    },
  ];

  const mockApprovals: ActionApproval[] = [
    {
      id: 1,
      actionNumber: 'ACT-001',
      customerId: 10,
      customerName: 'Acme Corp',
      targetDeviceName: 'FW-CORE-01',
      requestingAgentSlug: 'network_engineer',
      requestingAgentName: 'Network Engineer Agent',
      proposedAction: 'Quarantine WAN port 2',
      technicalJustification: 'Excessive SYN flood from foreign ASN',
      supportingEvidence: ['Packet drop > 40%'],
      riskLevel: 'High',
      status: 'Pending Approval',
      requestedAt: new Date().toISOString(),
    },
  ];

  const kpis = calculateKpis({
    customersCount: 12,
    devices: mockDevices,
    incidents: mockIncidents,
    tickets: mockTickets,
    alerts: mockAlerts,
    backups: mockBackups,
    approvals: mockApprovals,
  });

  assert.equal(kpis.managedCustomersCount, 12);
  assert.equal(kpis.totalDevices, 2);
  assert.equal(kpis.devicesOnline, 1);
  assert.equal(kpis.devicesOffline, 1);
  assert.equal(kpis.criticalIncidents, 1);
  assert.equal(kpis.openHelpdeskTickets, 2);
  assert.equal(kpis.slaBreaches, 1);
  assert.equal(kpis.securityThreats, 1);
  assert.equal(kpis.failedBackupJobs, 1);
  assert.equal(kpis.pendingApprovals, 1);
  assert.equal(kpis.fleetHealthPercent, 50);
  assert.equal(kpis.backupSuccessRatePercent, 50);
});

test('evaluateRiskLevel assesses correct threat grade', () => {
  assert.equal(evaluateRiskLevel('Critical', 'factory_reset', 'Server'), 'Critical');
  assert.equal(evaluateRiskLevel('High', 'firewall_block', 'Firewall'), 'Critical');
  assert.equal(evaluateRiskLevel('Low', 'service_restart', 'Server'), 'Medium');
  assert.equal(evaluateRiskLevel('Low', 'read_only', 'Workstation'), 'Low');
});

test('calculateSlaRemaining flags breached target times accurately', () => {
  const pastTimeIso = new Date(Date.now() - 45 * 60 * 1000).toISOString();
  const sla1 = calculateSlaRemaining(pastTimeIso, 30);
  assert.equal(sla1.isBreached, true);
  assert.equal(sla1.remainingMinutes <= 0, true);

  const sla2 = calculateSlaRemaining(pastTimeIso, 60);
  assert.equal(sla2.isBreached, false);
  assert.equal(sla2.remainingMinutes > 0, true);
});

test('correlateAlertToIncident links event to site incident', () => {
  const event: MonitoringEvent = {
    id: 99,
    customerId: 5,
    siteId: 2,
    integrationSlug: 'prtg',
    severity: 'High',
    title: 'WAN Latency Spike > 180ms',
    message: 'PRTG sensor ping jitter high',
    source: 'PRTG Core Probe',
    isResolved: false,
    timestamp: new Date().toISOString(),
  };

  const incidents: Incident[] = [
    {
      id: 201,
      incidentNumber: 'INC-2026-90',
      customerId: 5,
      siteId: 2,
      severity: 'High',
      status: 'Investigating',
      title: 'Branch Office WAN Degradation',
      description: 'Fiber failover active',
      assignedAgentSlug: 'network_engineer',
      assignedEngineer: 'Jack Bauer',
      responsibleTeam: 'Network Operations',
      acknowledged: false,
      escalationLevel: 'None',
      remindersSentCount: 0,
      sourceEventsCount: 2,
      createdAt: new Date().toISOString(),
    },
  ];

  const matchedId = correlateAlertToIncident(event, incidents);
  assert.equal(matchedId, 201);
});
