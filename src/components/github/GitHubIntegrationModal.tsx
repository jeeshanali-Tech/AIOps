import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  ExternalLink,
  GitBranch,
  GitCommit,
  GitFork,
  Github,
  Key,
  Layers,
  Lock,
  Play,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  User,
} from 'lucide-react';
import {
  GitHubConnectionState,
  GitHubRepo,
  GitHubWorkflowRun,
} from '../../types/index.ts';
import { validateGitHubTokenFormat } from '../../utils/githubLogic.ts';
import { Badge } from '../ui/Badge.tsx';
import { Modal } from '../ui/Modal.tsx';

interface GitHubIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: GitHubConnectionState;
  onConnectToken: (token: string, method?: 'Personal Access Token' | 'OAuth 2.0') => Promise<void>;
  onDisconnect: () => Promise<void>;
  onRefresh: () => Promise<void>;
  onSelectRepos: (repos: string[]) => Promise<void>;
  onDispatchWorkflow?: (repo: string, workflow: string, ref: string) => Promise<void>;
}

export const GitHubIntegrationModal: React.FC<GitHubIntegrationModalProps> = ({
  isOpen,
  onClose,
  status,
  onConnectToken,
  onDisconnect,
  onRefresh,
  onSelectRepos,
  onDispatchWorkflow,
}) => {
  const [activeTab, setActiveTab] = useState<'oauth' | 'pat'>('oauth');
  const [connectedTab, setConnectedTab] = useState<'repos' | 'workflows' | 'settings'>('repos');
  
  // PAT Form
  const [patToken, setPatToken] = useState('');
  const [isVerifyingPat, setIsVerifyingPat] = useState(false);
  const [patError, setPatError] = useState<string | null>(null);

  // OAuth Form
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [isOAuthConnecting, setIsOAuthConnecting] = useState(false);
  const [copiedCallback, setCopiedCallback] = useState(false);

  // Workflow Dispatch
  const [dispatchRepo, setDispatchRepo] = useState(
    status.monitoredRepos[0]?.fullName || 'opspilot-org/opspilot-infrastructure-iac'
  );
  const [dispatchWorkflowFile, setDispatchWorkflowFile] = useState('deploy.yml');
  const [dispatchRef, setDispatchRef] = useState('main');
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchMessage, setDispatchMessage] = useState<string | null>(null);

  // Filter repos
  const [repoSearch, setRepoSearch] = useState('');

  // AI Studio dynamic runtime callback URL
  const devCallbackUrl = 'https://ais-dev-adgbezlud2x44d5mjohaxp-775873756084.asia-southeast1.run.app/auth/callback';
  const sharedCallbackUrl = 'https://ais-pre-adgbezlud2x44d5mjohaxp-775873756084.asia-southeast1.run.app/auth/callback';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCallback(true);
    setTimeout(() => setCopiedCallback(false), 2000);
  };

  // Handle OAuth Popup Flow following oauth-integration skill
  const handleOAuthConnect = async () => {
    setIsOAuthConnecting(true);
    try {
      // 1. If user entered client credentials, save them first
      if (clientId && clientSecret) {
        await fetch('/api/auth/github/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientId, clientSecret }),
        });
      }

      // 2. Fetch OAuth Authorization URL
      const urlRes = await fetch(`/api/auth/github/url${clientId ? `?clientId=${encodeURIComponent(clientId)}` : ''}`);
      const { url } = await urlRes.json();

      // 3. Open OAuth provider URL directly in popup (never container route)
      const authWindow = window.open(
        url,
        'github_oauth_popup',
        'width=600,height=720,menubar=no,toolbar=no,status=no'
      );

      if (!authWindow) {
        alert('Please allow popups for OpsPilot to complete GitHub authorization.');
        setIsOAuthConnecting(false);
        return;
      }

      // Listen for success message from popup
      const messageListener = async (event: MessageEvent) => {
        if (!event.origin.endsWith('.run.app') && !event.origin.includes('localhost')) {
          return;
        }
        if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
          window.removeEventListener('message', messageListener);
          await onRefresh();
          setIsOAuthConnecting(false);
        }
      };

      window.addEventListener('message', messageListener);
    } catch (err: any) {
      console.error('OAuth flow error:', err);
      setIsOAuthConnecting(false);
    }
  };

  const handleConnectPat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patToken) return;

    const validation = validateGitHubTokenFormat(patToken);
    if (!validation.isValid && !patToken.startsWith('gh_sim_')) {
      setPatError(validation.message);
      return;
    }

    setIsVerifyingPat(true);
    setPatError(null);

    try {
      await onConnectToken(patToken, 'Personal Access Token');
      setPatToken('');
    } catch (err: any) {
      setPatError(err.message || 'Failed to authenticate token with GitHub API');
    } finally {
      setIsVerifyingPat(false);
    }
  };

  const handleToggleRepoMonitoring = (repoFullName: string) => {
    const current = status.monitoredRepos.filter((r) => r.isMonitored).map((r) => r.fullName);
    const updated = current.includes(repoFullName)
      ? current.filter((f) => f !== repoFullName)
      : [...current, repoFullName];
    onSelectRepos(updated);
  };

  const handleTriggerDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onDispatchWorkflow) return;
    setIsDispatching(true);
    setDispatchMessage(null);
    try {
      await onDispatchWorkflow(dispatchRepo, dispatchWorkflowFile, dispatchRef);
      setDispatchMessage(`Dispatched ${dispatchWorkflowFile} on ${dispatchRepo} (${dispatchRef})`);
      setTimeout(() => setDispatchMessage(null), 4000);
    } catch (e: any) {
      setDispatchMessage(`Dispatch failed: ${e.message}`);
    } finally {
      setIsDispatching(false);
    }
  };

  const filteredRepos = status.monitoredRepos.filter(
    (r) =>
      r.name.toLowerCase().includes(repoSearch.toLowerCase()) ||
      r.description.toLowerCase().includes(repoSearch.toLowerCase()) ||
      r.fullName.toLowerCase().includes(repoSearch.toLowerCase())
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <Github className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="text-base font-bold text-slate-900 flex items-center gap-2">
              GitHub DevOps & Infrastructure as Code (IaC)
              {status.connected && (
                <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />
                  Connected
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 font-normal">
              Sync Terraform/Ansible repos, automated incident runbooks, and GitHub Actions telemetry
            </p>
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>Tokens are encrypted & never exposed client-side</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        {/* If Connected */}
        {status.connected && status.user ? (
          <div className="space-y-4">
            {/* Account Card */}
            <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <img
                  src={status.user.avatarUrl}
                  alt={status.user.login}
                  className="w-12 h-12 rounded-full border-2 border-blue-400/40 object-cover"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{status.user.name}</span>
                    <a
                      href={status.user.htmlUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-mono text-blue-400 hover:underline flex items-center gap-0.5"
                    >
                      @{status.user.login}
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{status.user.bio || 'Enterprise DevOps'}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-300">
                    <span className="flex items-center gap-1">
                      <GitFork className="w-3 h-3 text-slate-400" /> {status.user.publicRepos} Public Repos
                    </span>
                    {status.user.totalPrivateRepos !== undefined && (
                      <span className="flex items-center gap-1">
                        <Lock className="w-3 h-3 text-slate-400" /> {status.user.totalPrivateRepos} Private Repos
                      </span>
                    )}
                    <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                      Auth: {status.authMethod}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onRefresh}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sync Telemetry</span>
                </button>
                <button
                  onClick={onDisconnect}
                  className="px-3 py-1.5 bg-red-950/60 hover:bg-red-900/80 text-red-300 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-red-800/40 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Disconnect</span>
                </button>
              </div>
            </div>

            {/* Navigation Tabs for Connected View */}
            <div className="flex border-b border-slate-200 gap-4">
              <button
                onClick={() => setConnectedTab('repos')}
                className={`pb-2 text-xs font-semibold border-b-2 transition-colors ${
                  connectedTab === 'repos'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Monitored Repositories ({status.monitoredRepos.length})
              </button>
              <button
                onClick={() => setConnectedTab('workflows')}
                className={`pb-2 text-xs font-semibold border-b-2 transition-colors ${
                  connectedTab === 'workflows'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                GitHub Actions Runs ({status.recentWorkflowRuns.length})
              </button>
              <button
                onClick={() => setConnectedTab('settings')}
                className={`pb-2 text-xs font-semibold border-b-2 transition-colors ${
                  connectedTab === 'settings'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Dispatch Runbook & Triggers
              </button>
            </div>

            {/* Tab: Monitored Repositories */}
            {connectedTab === 'repos' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search repositories (Terraform, Ansible, Runbooks)..."
                      value={repoSearch}
                      onChange={(e) => setRepoSearch(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {status.monitoredRepos.filter((r) => r.isMonitored).length} of {status.monitoredRepos.length} Active
                  </span>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {filteredRepos.map((repo) => (
                    <div
                      key={repo.id}
                      className={`p-3 rounded-lg border flex items-center justify-between transition-colors ${
                        repo.isMonitored
                          ? 'bg-blue-50/50 border-blue-200'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={Boolean(repo.isMonitored)}
                          onChange={() => handleToggleRepoMonitoring(repo.fullName)}
                          className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800 text-xs truncate">
                              {repo.fullName}
                            </span>
                            {repo.private ? (
                              <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 text-[10px] rounded font-medium">
                                Private
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] rounded font-medium">
                                Public
                              </span>
                            )}
                            {repo.category && (
                              <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 text-[10px] rounded font-medium">
                                {repo.category}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">{repo.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 ml-2">
                        <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                          <GitBranch className="w-3 h-3" /> {repo.defaultBranch}
                        </span>
                        <a
                          href={repo.htmlUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 hover:bg-slate-200 rounded text-slate-600"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: GitHub Actions Runs */}
            {connectedTab === 'workflows' && (
              <div className="space-y-3">
                <div className="text-[11px] text-slate-500">
                  Real-time CI/CD workflow telemetry. OpsPilot correlates deployment failures with customer infrastructure incidents.
                </div>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {status.recentWorkflowRuns.map((run) => (
                    <div
                      key={run.id}
                      className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            run.conclusion === 'success'
                              ? 'bg-emerald-500'
                              : run.conclusion === 'failure'
                              ? 'bg-red-500'
                              : 'bg-amber-400 animate-pulse'
                          }`}
                        />
                        <div>
                          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                            <span>{run.name}</span>
                            <span className="text-[10px] font-mono text-slate-400">#{run.id}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                            <span className="font-mono text-blue-600">{run.repository}</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <GitBranch className="w-2.5 h-2.5" /> {run.headBranch}
                            </span>
                            <span>•</span>
                            <span>by {run.actor}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            run.conclusion === 'success'
                              ? 'outline'
                              : run.conclusion === 'failure'
                              ? 'destructive'
                              : 'secondary'
                          }
                          className="capitalize text-[10px]"
                        >
                          {run.status === 'in_progress' ? 'Running' : run.conclusion || run.status}
                        </Badge>
                        <a
                          href={run.htmlUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-400 hover:text-blue-600"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Dispatch Runbook */}
            {connectedTab === 'settings' && (
              <form onSubmit={handleTriggerDispatch} className="space-y-3.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 text-blue-600" />
                  <span>Execute GitHub Actions Runbook Workflow</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Autonomous agents can trigger GitHub Actions workflows to perform verified infrastructure rollbacks or service restarts with engineer authorization.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Target Repository</label>
                    <select
                      value={dispatchRepo}
                      onChange={(e) => setDispatchRepo(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500"
                    >
                      {status.monitoredRepos.map((r) => (
                        <option key={r.id} value={r.fullName}>
                          {r.fullName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Workflow File</label>
                    <input
                      type="text"
                      value={dispatchWorkflowFile}
                      onChange={(e) => setDispatchWorkflowFile(e.target.value)}
                      placeholder="e.g. deploy.yml or restart-service.yml"
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Target Branch / Git Ref</label>
                  <input
                    type="text"
                    value={dispatchRef}
                    onChange={(e) => setDispatchRef(e.target.value)}
                    placeholder="main"
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                {dispatchMessage && (
                  <div className="p-2.5 bg-blue-50 text-blue-900 border border-blue-200 rounded-lg text-[11px] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{dispatchMessage}</span>
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={isDispatching}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                  >
                    {isDispatching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                    <span>Dispatch Workflow Run</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* Not Connected State */
          <div className="space-y-4">
            {/* Connection Method Tabs */}
            <div className="flex border-b border-slate-200 gap-4">
              <button
                onClick={() => setActiveTab('oauth')}
                className={`pb-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'oauth'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>OAuth 2.0 (Browser Popup Flow)</span>
              </button>
              <button
                onClick={() => setActiveTab('pat')}
                className={`pb-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'pat'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>Personal Access Token (Instant)</span>
              </button>
            </div>

            {/* TAB: OAuth 2.0 Flow */}
            {activeTab === 'oauth' && (
              <div className="space-y-4">
                <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl text-slate-700 space-y-2">
                  <div className="font-semibold text-blue-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>OAuth Setup Instructions</span>
                  </div>
                  <ol className="list-decimal pl-4 space-y-1.5 text-[11px] leading-relaxed text-slate-600">
                    <li>
                      Go to GitHub:{' '}
                      <a
                        href="https://github.com/settings/developers"
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-0.5"
                      >
                        GitHub Developer Settings <ExternalLink className="w-2.5 h-2.5" />
                      </a>{' '}
                      and click <strong>New OAuth App</strong>.
                    </li>
                    <li>
                      Set <strong>Authorization callback URL</strong> to:
                      <div className="mt-1 flex items-center gap-1.5 bg-white p-1.5 rounded-lg border border-blue-200 font-mono text-[10px] text-slate-800 select-all">
                        <span className="truncate">{devCallbackUrl}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(devCallbackUrl)}
                          className="p-1 hover:bg-slate-100 rounded text-slate-500 shrink-0"
                          title="Copy callback URL"
                        >
                          {copiedCallback ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </li>
                    <li>
                      (Optional for shared preview): Add{' '}
                      <code className="text-blue-700 bg-blue-100/60 px-1 py-0.5 rounded text-[10px]">
                        {sharedCallbackUrl}
                      </code>
                    </li>
                  </ol>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">GitHub Client ID (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Iv1.8ab1c9d2..."
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Client Secret (Optional)</label>
                    <input
                      type="password"
                      placeholder="••••••••••••••••"
                      value={clientSecret}
                      onChange={(e) => setClientSecret(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-500">
                    Opens GitHub authorization directly in a secure popup window.
                  </span>
                  <button
                    onClick={handleOAuthConnect}
                    disabled={isOAuthConnecting}
                    className="w-full sm:w-auto px-5 py-2 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    {isOAuthConnecting ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Github className="w-3.5 h-3.5 fill-current" />
                    )}
                    <span>Connect with GitHub (OAuth)</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB: Personal Access Token (PAT) Flow */}
            {activeTab === 'pat' && (
              <form onSubmit={handleConnectPat} className="space-y-4">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
                  <div className="font-semibold flex items-center gap-1.5 mb-1">
                    <Key className="w-3.5 h-3.5 text-amber-700" />
                    <span>Instant Zero-Configuration Connection</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Generate a token in{' '}
                    <a
                      href="https://github.com/settings/tokens"
                      target="_blank"
                      rel="noreferrer"
                      className="underline font-semibold"
                    >
                      GitHub Personal Access Tokens
                    </a>{' '}
                    with scopes <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">repo</code>,{' '}
                    <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">workflow</code>, and{' '}
                    <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">read:user</code>.
                  </p>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    GitHub Personal Access Token (Classic or Fine-Grained)
                  </label>
                  <input
                    type="password"
                    value={patToken}
                    onChange={(e) => {
                      setPatToken(e.target.value);
                      setPatError(null);
                    }}
                    placeholder="ghp_... or github_pat_..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                  {patToken && (
                    <div className="mt-1 text-[11px]">
                      {validateGitHubTokenFormat(patToken).isValid ? (
                        <span className="text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{validateGitHubTokenFormat(patToken).message}</span>
                        </span>
                      ) : (
                        <span className="text-amber-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{validateGitHubTokenFormat(patToken).message}</span>
                        </span>
                      )}
                    </div>
                  )}
                  {patError && (
                    <div className="mt-1 text-[11px] text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{patError}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  {/* Quick test simulation button */}
                  <button
                    type="button"
                    onClick={() => {
                      setPatToken('ghp_123456789012345678901234567890123456');
                    }}
                    className="text-[11px] text-blue-600 hover:underline"
                  >
                    Paste sample token for test connection
                  </button>

                  <button
                    type="submit"
                    disabled={isVerifyingPat || !patToken}
                    className="w-full sm:w-auto px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    {isVerifyingPat ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    <span>Verify & Link GitHub</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
