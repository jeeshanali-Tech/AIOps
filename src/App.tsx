import React, { useEffect, useState } from 'react';
import { Header } from './components/layout/Header.tsx';
import { NavItemKey, Sidebar } from './components/layout/Sidebar.tsx';
import { AgentControlCenterPage } from './pages/AgentControlCenterPage.tsx';
import { ApprovalCenterPage } from './pages/ApprovalCenterPage.tsx';
import { AutomationPage } from './pages/AutomationPage.tsx';
import { BackupDrPage } from './pages/BackupDrPage.tsx';
import { HelpdeskPage } from './pages/HelpdeskPage.tsx';
import { IncidentsPage } from './pages/IncidentsPage.tsx';
import { IntegrationsPage } from './pages/IntegrationsPage.tsx';
import { KnowledgeBasePage } from './pages/KnowledgeBasePage.tsx';
import { LiveMonitoringPage } from './pages/LiveMonitoringPage.tsx';
import { M365Page } from './pages/M365Page.tsx';
import { NetworkOpsPage } from './pages/NetworkOpsPage.tsx';
import { OverviewPage } from './pages/OverviewPage.tsx';
import { ReportsPage } from './pages/ReportsPage.tsx';
import { SecurityOpsPage } from './pages/SecurityOpsPage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';
import {
  AIAgent,
  ActionApproval,
  AuditRecord,
  AutomationRun,
  BackupJob,
  Customer,
  Device,
  HelpdeskTicket,
  Incident,
  IncidentStatus,
  Integration,
  IntegrationStatus,
  KnowledgeArticle,
  M365TenantHealth,
  MonitoringEvent,
  NetworkInterfaceMetric,
  NotificationDispatch,
  NotificationRule,
  SecurityAlert,
  Site,
} from './types/index.ts';
import { PlatformKpiSummary } from './utils/opsLogic.ts';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavItemKey>('overview');
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Core application state
  const [overviewData, setOverviewData] = useState<{
    kpis: PlatformKpiSummary;
    customers: Customer[];
    recentEvents: MonitoringEvent[];
    recentIncidents: Incident[];
    recentApprovals: ActionApproval[];
    agents: AIAgent[];
    chartData: {
      networkAvailability: { time: string; availability: number; latency: number }[];
      incidentTrends: { day: string; critical: number; high: number; medium: number }[];
      ticketStatusDistribution: { name: string; value: number; color: string }[];
    };
  } | null>(null);

  const [devices, setDevices] = useState<Device[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [events, setEvents] = useState<MonitoringEvent[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [approvals, setApprovals] = useState<ActionApproval[]>([]);
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [helpdeskTickets, setHelpdeskTickets] = useState<HelpdeskTicket[]>([]);
  const [networkMetrics, setNetworkMetrics] = useState<NetworkInterfaceMetric[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [m365Health, setM365Health] = useState<M365TenantHealth[]>([]);
  const [backupJobs, setBackupJobs] = useState<BackupJob[]>([]);
  const [automationRuns, setAutomationRuns] = useState<AutomationRun[]>([]);
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>([]);
  const [knowledgeArticles, setKnowledgeArticles] = useState<KnowledgeArticle[]>([]);
  const [notificationRules, setNotificationRules] = useState<NotificationRule[]>([]);
  const [notificationDispatches, setNotificationDispatches] = useState<NotificationDispatch[]>([]);

  const fetchData = async () => {
    try {
      const [
        overviewRes,
        devicesRes,
        sitesRes,
        eventsRes,
        incidentsRes,
        approvalsRes,
        agentsRes,
        integrationsRes,
        helpdeskRes,
        networkRes,
        securityRes,
        m365Res,
        backupRes,
        automationRes,
        auditRes,
        knowledgeRes,
        rulesRes,
        dispatchesRes,
      ] = await Promise.all([
        fetch('/api/overview'),
        fetch('/api/devices'),
        fetch('/api/sites'),
        fetch('/api/monitoring'),
        fetch('/api/incidents'),
        fetch('/api/approvals'),
        fetch('/api/agents'),
        fetch('/api/integrations'),
        fetch('/api/helpdesk'),
        fetch('/api/network'),
        fetch('/api/security'),
        fetch('/api/m365'),
        fetch('/api/backup'),
        fetch('/api/automation'),
        fetch('/api/audit'),
        fetch('/api/knowledge'),
        fetch('/api/notifications/rules'),
        fetch('/api/notifications/dispatches'),
      ]);

      if (overviewRes.ok) setOverviewData(await overviewRes.json());
      if (devicesRes.ok) setDevices(await devicesRes.json());
      if (sitesRes.ok) setSites(await sitesRes.json());
      if (eventsRes.ok) setEvents(await eventsRes.json());
      if (incidentsRes.ok) setIncidents(await incidentsRes.json());
      if (approvalsRes.ok) setApprovals(await approvalsRes.json());
      if (agentsRes.ok) setAgents(await agentsRes.json());
      if (integrationsRes.ok) setIntegrations(await integrationsRes.json());
      if (helpdeskRes.ok) setHelpdeskTickets(await helpdeskRes.json());
      if (networkRes.ok) setNetworkMetrics(await networkRes.json());
      if (securityRes.ok) setSecurityAlerts(await securityRes.json());
      if (m365Res.ok) setM365Health(await m365Res.json());
      if (backupRes.ok) setBackupJobs(await backupRes.json());
      if (automationRes.ok) setAutomationRuns(await automationRes.json());
      if (auditRes.ok) setAuditRecords(await auditRes.json());
      if (knowledgeRes.ok) setKnowledgeArticles(await knowledgeRes.json());
      if (rulesRes.ok) setNotificationRules(await rulesRes.json());
      if (dispatchesRes.ok) setNotificationDispatches(await dispatchesRes.json());
    } catch (err) {
      console.error('Error fetching platform data', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  const handleDecideApproval = async (
    id: number,
    decision: 'Approved' | 'Rejected',
    approverName: string,
    reason?: string
  ) => {
    try {
      const res = await fetch(`/api/approvals/${id}/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, approverName, reason }),
      });
      if (res.ok) {
        const updated = await res.json();
        setApprovals((prev) => prev.map((a) => (a.id === id ? updated : a)));
        // Refresh overview metrics
        fetchData();
      }
    } catch (e) {
      console.error('Failed to decide approval', e);
    }
  };

  const handleUpdateIncidentStatus = async (
    id: number,
    status: IncidentStatus,
    engineer?: string
  ) => {
    try {
      const res = await fetch(`/api/incidents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, engineer }),
      });
      if (res.ok) {
        const updated = await res.json();
        setIncidents((prev) => prev.map((inc) => (inc.id === id ? updated : inc)));
        fetchData();
      }
    } catch (e) {
      console.error('Failed to update incident', e);
    }
  };

  const handleUpdateIntegration = async (
    slug: string,
    status: IntegrationStatus,
    config: Record<string, unknown>
  ) => {
    try {
      const res = await fetch(`/api/integrations/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, config }),
      });
      if (res.ok) {
        const updated = await res.json();
        setIntegrations((prev) => prev.map((i) => (i.slug === slug ? updated : i)));
        fetchData();
      }
    } catch (e) {
      console.error('Failed to update integration', e);
    }
  };

  const handleAcknowledgeIncident = async (id: number, engineer?: string) => {
    try {
      const res = await fetch(`/api/incidents/${id}/acknowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ engineer: engineer || 'Lead On-Call Engineer' }),
      });
      if (res.ok) {
        const updated = await res.json();
        setIncidents((prev) => prev.map((i) => (i.id === id ? updated : i)));
        fetchData();
      }
    } catch (e) {
      console.error('Failed to acknowledge incident', e);
    }
  };

  const handleTriggerFollowUp = async (id: number) => {
    const res = await fetch(`/api/incidents/${id}/follow-up`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Follow-up request failed');
    const data = await res.json();
    if (data.incident) {
      setIncidents((prev) => prev.map((i) => (i.id === id ? data.incident : i)));
    }
    fetchData();
    return {
      actionTaken: data.actionTaken,
      details: data.details,
    };
  };

  const handleCreateNotificationRule = async (
    rule: Omit<NotificationRule, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      const res = await fetch('/api/notifications/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rule),
      });
      if (res.ok) {
        const newRule = await res.json();
        setNotificationRules((prev) => [newRule, ...prev]);
        fetchData();
      }
    } catch (e) {
      console.error('Failed to create notification rule', e);
    }
  };

  const handleUpdateNotificationRule = async (
    id: number,
    updates: Partial<NotificationRule>
  ) => {
    try {
      const res = await fetch(`/api/notifications/rules/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        setNotificationRules((prev) => prev.map((r) => (r.id === id ? updated : r)));
        fetchData();
      }
    } catch (e) {
      console.error('Failed to update notification rule', e);
    }
  };

  const handleDeleteNotificationRule = async (id: number) => {
    try {
      const res = await fetch(`/api/notifications/rules/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setNotificationRules((prev) => prev.filter((r) => r.id !== id));
        fetchData();
      }
    } catch (e) {
      console.error('Failed to delete notification rule', e);
    }
  };

  const handleTestNotificationRule = async (id: number) => {
    const res = await fetch(`/api/notifications/rules/${id}/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (!res.ok) throw new Error('Test dispatch failed');
    const data = await res.json();
    fetchData();
    return {
      success: data.success,
      message: data.message,
    };
  };

  const pendingApprovalsCount = approvals.filter((a) => a.status === 'Pending Approval').length;
  const criticalIncidentsCount = incidents.filter(
    (i) => i.severity === 'Critical' && i.status !== 'Resolved' && i.status !== 'Closed'
  ).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-900 antialiased">
      {/* Left Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        pendingApprovalsCount={pendingApprovalsCount}
        criticalIncidentsCount={criticalIncidentsCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          customers={overviewData?.customers || []}
          selectedCustomerId={selectedCustomerId}
          onSelectCustomer={setSelectedCustomerId}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          pendingApprovalsCount={pendingApprovalsCount}
          onOpenApprovals={() => setCurrentTab('approvals')}
        />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {isLoading && !overviewData ? (
            <div className="py-24 text-center">
              <div className="inline-block w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs font-semibold text-slate-500">
                Initializing OpsPilot Telemetry Stream & Agents...
              </p>
            </div>
          ) : (
            <>
              {currentTab === 'overview' && overviewData && (
                <OverviewPage
                  kpis={overviewData.kpis}
                  customers={overviewData.customers}
                  recentEvents={overviewData.recentEvents}
                  recentIncidents={overviewData.recentIncidents}
                  recentApprovals={overviewData.recentApprovals}
                  agents={overviewData.agents}
                  chartData={overviewData.chartData}
                  onNavigate={setCurrentTab}
                />
              )}

              {currentTab === 'agents' && (
                <AgentControlCenterPage
                  agents={agents}
                  onOpenApprovals={() => setCurrentTab('approvals')}
                />
              )}

              {currentTab === 'monitoring' && (
                <LiveMonitoringPage
                  devices={devices}
                  events={events}
                  customers={overviewData?.customers || []}
                  sites={sites}
                  selectedCustomerId={selectedCustomerId}
                  onSelectCustomerFilter={setSelectedCustomerId}
                />
              )}

              {currentTab === 'incidents' && (
                <IncidentsPage
                  incidents={incidents}
                  onUpdateStatus={handleUpdateIncidentStatus}
                  onAcknowledgeIncident={handleAcknowledgeIncident}
                  onTriggerFollowUp={handleTriggerFollowUp}
                  onOpenApprovals={() => setCurrentTab('approvals')}
                />
              )}

              {currentTab === 'helpdesk' && <HelpdeskPage tickets={helpdeskTickets} />}

              {currentTab === 'network' && <NetworkOpsPage metrics={networkMetrics} />}

              {currentTab === 'security' && (
                <SecurityOpsPage
                  alerts={securityAlerts}
                  onOpenApprovals={() => setCurrentTab('approvals')}
                />
              )}

              {currentTab === 'm365' && <M365Page tenants={m365Health} />}

              {currentTab === 'backup' && (
                <BackupDrPage
                  backupJobs={backupJobs}
                  onOpenApprovals={() => setCurrentTab('approvals')}
                />
              )}

              {currentTab === 'automation' && <AutomationPage runs={automationRuns} />}

              {currentTab === 'approvals' && (
                <ApprovalCenterPage
                  approvals={approvals}
                  onDecideApproval={handleDecideApproval}
                />
              )}

              {currentTab === 'knowledge' && (
                <KnowledgeBasePage articles={knowledgeArticles} />
              )}

              {currentTab === 'reports' && <ReportsPage />}

              {currentTab === 'integrations' && (
                <IntegrationsPage
                  integrations={integrations}
                  onUpdateIntegration={handleUpdateIntegration}
                />
              )}

              {currentTab === 'settings' && (
                <SettingsPage
                  auditRecords={auditRecords}
                  notificationRules={notificationRules}
                  notificationDispatches={notificationDispatches}
                  onCreateRule={handleCreateNotificationRule}
                  onUpdateRule={handleUpdateNotificationRule}
                  onDeleteRule={handleDeleteNotificationRule}
                  onTestRule={handleTestNotificationRule}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
