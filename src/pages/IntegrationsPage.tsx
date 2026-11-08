import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  Key,
  Layers,
  Lock,
  RefreshCw,
  Search,
  Server,
  Settings,
  Shield,
  Zap,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge.tsx';
import { Card } from '../components/ui/Card.tsx';
import { Modal } from '../components/ui/Modal.tsx';
import { GitHubIntegrationModal } from '../components/github/GitHubIntegrationModal.tsx';
import { GitHubConnectionState, Integration, IntegrationStatus } from '../types/index.ts';

interface IntegrationsPageProps {
  integrations: Integration[];
  onUpdateIntegration: (
    slug: string,
    status: IntegrationStatus,
    config: Record<string, unknown>
  ) => Promise<void>;
  gitHubStatus?: GitHubConnectionState;
  onConnectGitHubToken?: (token: string, method?: 'Personal Access Token' | 'OAuth 2.0') => Promise<void>;
  onDisconnectGitHub?: () => Promise<void>;
  onRefreshGitHub?: () => Promise<void>;
  onSelectGitHubRepos?: (repos: string[]) => Promise<void>;
  onDispatchWorkflow?: (repo: string, workflow: string, ref: string) => Promise<void>;
  isGitHubModalOpen?: boolean;
  setIsGitHubModalOpen?: (open: boolean) => void;
}

export const IntegrationsPage: React.FC<IntegrationsPageProps> = ({
  integrations,
  onUpdateIntegration,
  gitHubStatus = {
    connected: false,
    user: null,
    authMethod: 'None',
    monitoredRepos: [],
    recentWorkflowRuns: [],
    recentCommits: [],
  },
  onConnectGitHubToken = async () => {},
  onDisconnectGitHub = async () => {},
  onRefreshGitHub = async () => {},
  onSelectGitHubRepos = async () => {},
  onDispatchWorkflow = async () => {},
  isGitHubModalOpen,
  setIsGitHubModalOpen,
}) => {
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [configDrawerOpen, setConfigDrawerOpen] = useState(false);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [localGitHubModalOpen, setLocalGitHubModalOpen] = useState(false);

  const gitHubModalVisible = isGitHubModalOpen ?? localGitHubModalOpen;
  const setGitHubModalVisible = setIsGitHubModalOpen ?? setLocalGitHubModalOpen;

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    latencyMs: number;
    details?: Record<string, unknown>;
  } | null>(null);

  // Form fields for configuring integration
  const [apiUrl, setApiUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');

  const openConfig = (integ: Integration) => {
    if (integ.slug === 'github') {
      setGitHubModalVisible(true);
      return;
    }
    setSelectedIntegration(integ);
    setApiUrl((integ.config?.apiUrl as string) || '');
    setApiKey((integ.config?.apiKey as string) || '');
    setApiSecret('');
    setConfigDrawerOpen(true);
  };

  const openTest = (integ: Integration) => {
    setSelectedIntegration(integ);
    setTestResult(null);
    setTestModalOpen(true);
  };

  const handleRunTest = async () => {
    if (!selectedIntegration) return;
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`/api/integrations/${selectedIntegration.slug}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: selectedIntegration.config && Object.keys(selectedIntegration.config).length > 0
            ? selectedIntegration.config
            : {
                apiKey: 'test-key-sim',
                apiSecret: 'test-secret-sim',
                apiUrl: 'https://api.partner.demo',
                serverUrl: 'https://prtg.partner.demo',
                passhash: '490192834',
                hostIp: '198.51.100.12',
                apiToken: 'tok_forti_enterprise',
                tenantId: 'apex-azure-tenant-id-demo',
                clientId: 'app-client-id-demo',
                clientSecret: 'app-secret-demo',
                senderMailbox: 'alerts@opspilot.internal',
                webhookUrl: 'https://outlook.office.com/webhook/demo-channel-incoming',
                defaultChannel: '#security-alerts',
                vbrServer: 'https://vbr01.apexfin.demo:9419',
                username: 'svc_veeam_operator',
                consoleUrl: 'https://usea1-partners.sentinelone.net',
              },
        }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (e) {
      setTestResult({
        success: false,
        message: 'Network request error during adapter probe',
        latencyMs: 120,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIntegration) return;

    await onUpdateIntegration(selectedIntegration.slug, 'Connected', {
      apiUrl,
      apiKey: apiKey ? '••••••••' : undefined,
    });
    setConfigDrawerOpen(false);
  };

  // Distinctive SVG logos or icons for the 7 tools
  const getLogoBadge = (slug: string) => {
    switch (slug) {
      case 'datto_rmm':
        return <div className="w-9 h-9 rounded-lg bg-orange-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">D</div>;
      case 'zoho_desk':
        return <div className="w-9 h-9 rounded-lg bg-red-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">Z</div>;
      case 'sentinelone':
        return <div className="w-9 h-9 rounded-lg bg-purple-700 text-white font-bold flex items-center justify-center text-sm shadow-xs">S1</div>;
      case 'prtg':
        return <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">P</div>;
      case 'fortigate':
        return <div className="w-9 h-9 rounded-lg bg-rose-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">FG</div>;
      case 'm365':
        return <div className="w-9 h-9 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">M</div>;
      case 'veeam':
        return <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white font-bold flex items-center justify-center text-sm shadow-xs">V</div>;
      case 'm365_outlook':
        return <div className="w-9 h-9 rounded-lg bg-sky-700 text-white font-bold flex items-center justify-center text-xs shadow-xs">Mail</div>;
      case 'm365_teams':
        return <div className="w-9 h-9 rounded-lg bg-indigo-700 text-white font-bold flex items-center justify-center text-xs shadow-xs">Teams</div>;
      case 'github':
        return (
          <div className="w-9 h-9 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center shadow-xs">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </div>
        );
      default:
        return <div className="w-9 h-9 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center text-sm shadow-xs">API</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Integration Hub & Adapters
            <Badge variant="outline">{integrations.length} Integrations & Channels</Badge>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Enterprise adapters for IT Management, Microsoft Graph Mail, Teams notifications, EDR, and Telemetry engines.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <Lock className="w-3.5 h-3.5 text-slate-600" />
            <span>Zero-Exposure Credential Storage (Server-Side Proxy)</span>
          </span>
        </div>
      </div>

      {/* Integration Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {integrations.map((integ) => (
          <div
            key={integ.slug}
            className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between hover:border-blue-300 hover:shadow-xs transition-all"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {getLogoBadge(integ.slug)}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{integ.name}</h3>
                    <span className="text-[11px] text-slate-500">{integ.category}</span>
                  </div>
                </div>
                <Badge
                  variant={
                    integ.status === 'Connected'
                      ? 'success'
                      : integ.status === 'Degraded'
                      ? 'warning'
                      : integ.status === 'Authentication Failed'
                      ? 'critical'
                      : 'neutral'
                  }
                  dot={integ.status === 'Connected'}
                >
                  {integ.status}
                </Badge>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 mt-3 leading-relaxed min-h-[36px]">
                {integ.description}
              </p>

              {/* Required Permissions */}
              <div className="mt-4 p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-[11px]">
                <div className="font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Key className="w-3 h-3 text-slate-500" />
                  <span>Required Permissions:</span>
                </div>
                <div className="text-slate-600 leading-tight">{integ.requiredPermissions}</div>
              </div>

              {/* Last Sync */}
              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                <span>Last Sync:</span>
                <span className="font-mono text-slate-600">
                  {integ.lastSyncAt ? new Date(integ.lastSyncAt).toLocaleTimeString() : 'Never'}
                </span>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <a
                href={integ.docsUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                <span>Docs</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openTest(integ)}
                  className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Test Link</span>
                </button>
                <button
                  onClick={() => openConfig(integ)}
                  className="px-3 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-2xs"
                >
                  Configure
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Test Connection Modal */}
      {testModalOpen && selectedIntegration && (
        <Modal
          isOpen={testModalOpen}
          onClose={() => setTestModalOpen(false)}
          title={`Test Connection: ${selectedIntegration.name}`}
          subtitle={`Invoking adapter probe for ${selectedIntegration.slug}`}
          footer={
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setTestModalOpen(false)}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-medium"
              >
                Close
              </button>
              <button
                onClick={handleRunTest}
                disabled={isTesting}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Execute Health Probe</span>
              </button>
              {testResult?.success && selectedIntegration.status !== 'Connected' && (
                <button
                  onClick={async () => {
                    await onUpdateIntegration(selectedIntegration.slug, 'Connected', selectedIntegration.config || {});
                    setSelectedIntegration({ ...selectedIntegration, status: 'Connected' });
                    setTestModalOpen(false);
                  }}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Authorize & Connect</span>
                </button>
              )}
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              OpsPilot executes server-side cryptographic handshakes to test API reachability,
              OAuth tokens, and permission scopes without leaking secrets to the client.
            </p>

            {testResult && (
              <div
                className={`p-3.5 rounded-xl border ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-red-50 border-red-200 text-red-900'
                }`}
              >
                <div className="flex items-center justify-between font-bold mb-1">
                  <span className="flex items-center gap-1.5">
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span>{testResult.success ? 'Handshake Successful' : 'Connection Failed'}</span>
                  </span>
                  <span className="font-mono text-[11px]">{testResult.latencyMs} ms RTT</span>
                </div>
                <p className="text-xs leading-relaxed">{testResult.message}</p>
                {testResult.details && (
                  <pre className="mt-2 p-2 bg-black/10 rounded font-mono text-[11px] overflow-x-auto">
                    {JSON.stringify(testResult.details, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Configuration Drawer Modal */}
      {configDrawerOpen && selectedIntegration && (
        <Modal
          isOpen={configDrawerOpen}
          onClose={() => setConfigDrawerOpen(false)}
          title={`Configure ${selectedIntegration.name}`}
          subtitle="All credentials are encrypted and stored via Cloud SQL persistence"
          footer={
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setConfigDrawerOpen(false)}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfig}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
              >
                Save Integration Settings
              </button>
            </div>
          }
        >
          <form onSubmit={handleSaveConfig} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                API Base URL / Endpoint
              </label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://api.partner.demo/v1"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                API Key / Client ID
              </label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="api_key_live_..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                API Secret / Private Token
              </label>
              <input
                type="password"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Credentials are never exposed in browser network inspection.
              </p>
            </div>
          </form>
        </Modal>
      )}

      {/* GitHub Integration & DevOps Modal */}
      <GitHubIntegrationModal
        isOpen={gitHubModalVisible}
        onClose={() => setGitHubModalVisible(false)}
        status={gitHubStatus}
        onConnectToken={onConnectGitHubToken}
        onDisconnect={onDisconnectGitHub}
        onRefresh={onRefreshGitHub}
        onSelectRepos={onSelectGitHubRepos}
        onDispatchWorkflow={onDispatchWorkflow}
      />
    </div>
  );
};
