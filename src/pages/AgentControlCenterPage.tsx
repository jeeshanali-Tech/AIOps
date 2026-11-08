import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Bot,
  CheckCircle2,
  CheckSquare,
  Clock,
  Cpu,
  Layers,
  MessageSquare,
  Radio,
  Send,
  Settings2,
  Shield,
  Sparkles,
  Terminal,
  Zap,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge.tsx';
import { Card } from '../components/ui/Card.tsx';
import { AIAgent, ChatMessage } from '../types/index.ts';

interface AgentControlCenterProps {
  agents: AIAgent[];
  onOpenApprovals?: () => void;
}

export const AgentControlCenterPage: React.FC<AgentControlCenterProps> = ({
  agents,
  onOpenApprovals,
}) => {
  const [selectedAgentSlug, setSelectedAgentSlug] = useState<string>('security_ops');
  const [activeTab, setActiveTab] = useState<'profile' | 'chat' | 'config'>('profile');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const selectedAgent = agents.find((a) => a.slug === selectedAgentSlug) || agents[0];

  useEffect(() => {
    async function loadChat() {
      setIsLoadingChat(true);
      try {
        const res = await fetch(`/api/agents/${selectedAgentSlug}/chat`);
        if (res.ok) {
          const data = await res.json();
          setChatMessages(data);
        }
      } catch (e) {
        console.error('Failed to load agent chat', e);
      } finally {
        setIsLoadingChat(false);
      }
    }
    loadChat();
  }, [selectedAgentSlug]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    const messageText = inputMessage;
    setInputMessage('');
    setIsSending(true);

    try {
      const res = await fetch(`/api/agents/${selectedAgentSlug}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText }),
      });
      if (res.ok) {
        const updatedChat = await res.json();
        setChatMessages(updatedChat);
      }
    } catch (e) {
      console.error('Failed to send message to agent', e);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            AI Agent Control Centre
            <span className="text-xs px-2 py-0.5 rounded font-mono font-semibold bg-blue-100 text-blue-700">
              Google ADK / Hybrid Mesh Ready
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Orchestration and telemetry governance across 7 specialised autonomous IT operations agents.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>Multi-Agent Mesh Active</span>
          </div>
        </div>
      </div>

      {/* Main Agent Selector Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {agents.map((agent) => {
          const isSelected = agent.slug === selectedAgentSlug;
          return (
            <button
              key={agent.slug}
              onClick={() => setSelectedAgentSlug(agent.slug)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-500/20'
                  : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${agent.avatarColor} text-white flex items-center justify-center font-bold text-xs shadow-2xs mb-2`}
              >
                <Bot className="w-4.5 h-4.5" />
              </div>
              <div className="text-xs font-bold text-slate-900 truncate">{agent.name}</div>
              <div className="text-[10px] text-slate-500 truncate mt-0.5">{agent.title}</div>
              <div className="mt-2 flex items-center justify-between text-[10px]">
                <Badge
                  variant={
                    agent.status === 'Investigating'
                      ? 'high'
                      : agent.status === 'Awaiting Approval'
                      ? 'warning'
                      : 'success'
                  }
                  dot
                >
                  {agent.status}
                </Badge>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Agent Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Agent Overview & Metrics */}
        <div className="space-y-6 lg:col-span-1">
          {/* Main Agent Summary Card */}
          <Card>
            <div className="flex items-start gap-3.5">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${selectedAgent.avatarColor} text-white flex items-center justify-center shadow-md shrink-0`}
              >
                <Bot className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900 truncate">
                    {selectedAgent.name}
                  </h2>
                  <Badge variant="info">{selectedAgent.status}</Badge>
                </div>
                <p className="text-xs text-blue-600 font-medium mt-0.5">{selectedAgent.title}</p>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {selectedAgent.description}
                </p>
              </div>
            </div>

            {/* Performance Metrics Grid */}
            <div className="grid grid-cols-2 gap-2.5 mt-5 pt-4 border-t border-slate-100 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-[11px] text-slate-500">Autonomous Success</div>
                <div className="text-base font-bold text-slate-900 mt-0.5">
                  {selectedAgent.successRate}%
                </div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-[11px] text-slate-500">Completed Investigations</div>
                <div className="text-base font-bold text-slate-900 mt-0.5">
                  {selectedAgent.completedInvestigationsCount}
                </div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-[11px] text-slate-500">Active Workflows</div>
                <div className="text-base font-bold text-blue-600 mt-0.5">
                  {selectedAgent.activeTasksCount}
                </div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-[11px] text-slate-500">Execution Engine</div>
                <div className="text-xs font-semibold text-slate-800 mt-1 truncate">
                  {selectedAgent.modelVersion.split('/')[0]}
                </div>
              </div>
            </div>

            {/* Responsibilities */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span>Responsibilities & Bounds</span>
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {selectedAgent.responsibilities.map((r, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Connected Systems */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>Connected Integration Sources</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {selectedAgent.connectedSystems.map((sys, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-medium rounded border border-slate-200"
                  >
                    {sys}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Interactive Agent Chat & Investigation Workspace */}
        <div className="space-y-6 lg:col-span-2">
          <Card
            title={
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span>Agent Investigation & Diagnostic Chat</span>
              </div>
            }
            subtitle={`Direct conversational link with ${selectedAgent.name}`}
            action={
              <div className="flex items-center gap-1.5 bg-slate-100 p-0.5 rounded-lg text-xs">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    activeTab === 'profile' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-600'
                  }`}
                >
                  Investigation Findings
                </button>
                <button
                  onClick={() => setActiveTab('config')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    activeTab === 'config' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-600'
                  }`}
                >
                  Configuration & Bounds
                </button>
              </div>
            }
          >
            {activeTab === 'config' ? (
              <div className="space-y-4 py-2">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <h4 className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <Settings2 className="w-4 h-4 text-blue-600" />
                    <span>Agent Governance & Autonomy Level</span>
                  </h4>
                  <p className="text-slate-600 mt-1">
                    Defines whether the agent can execute changes autonomously or must submit an
                    Action Approval request.
                  </p>
                  <div className="mt-3 space-y-2">
                    <label className="flex items-center gap-2 font-medium text-slate-800">
                      <input
                        type="radio"
                        name="autonomy"
                        defaultChecked
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>Enforce Human Approval Gate (All Write/Remediation Actions)</span>
                    </label>
                    <label className="flex items-center gap-2 font-medium text-slate-500">
                      <input
                        type="radio"
                        name="autonomy"
                        disabled
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>Autonomous Level 2 (Low Risk Auto-Heal, e.g., Spooler Flush) [Disabled in Preview]</span>
                    </label>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <h4 className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-slate-700" />
                    <span>Prepared Google ADK Contract</span>
                  </h4>
                  <pre className="mt-2 p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-lg overflow-x-auto leading-relaxed">
{`{
  "agent_id": "${selectedAgent.slug}",
  "capabilities": ["telemetry_analysis", "incident_correlation", "proposal_generation"],
  "model_runtime": "@google/genai",
  "approval_gateway": "OpsPilotActionGateway/v1",
  "status": "AWAITING_PRODUCTION_DISPATCH"
}`}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-[520px]">
                {/* Chat Message Scroll Area */}
                <div className="flex-1 overflow-y-auto space-y-3.5 pr-2">
                  {isLoadingChat ? (
                    <div className="flex items-center justify-center h-full text-xs text-slate-400">
                      <Clock className="w-4 h-4 animate-spin mr-2" />
                      Loading investigation history...
                    </div>
                  ) : chatMessages.length === 0 ? (
                    <div className="text-center py-12 text-xs text-slate-400">
                      No previous chat sessions for this agent. Send a prompt below to begin an
                      investigation.
                    </div>
                  ) : (
                    chatMessages.map((msg) => {
                      const isAgent = msg.sender === 'agent';
                      return (
                        <div
                          key={msg.id}
                          className={`flex gap-3 text-xs ${
                            isAgent ? 'items-start' : 'items-end justify-end'
                          }`}
                        >
                          {isAgent && (
                            <div
                              className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${selectedAgent.avatarColor} text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-2xs`}
                            >
                              <Bot className="w-4 h-4" />
                            </div>
                          )}
                          <div
                            className={`max-w-[85%] rounded-xl p-3.5 ${
                              isAgent
                                ? 'bg-slate-50 border border-slate-200 text-slate-800'
                                : 'bg-blue-600 text-white shadow-xs'
                            }`}
                          >
                            <div className="leading-relaxed whitespace-pre-wrap">{msg.content}</div>

                            {/* Structured Findings Card if present */}
                            {msg.findings && (
                              <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200/90 text-slate-800 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                                    <span>Findings: {msg.findings.category}</span>
                                  </span>
                                  <Badge
                                    variant={
                                      msg.findings.riskLevel === 'Critical'
                                        ? 'critical'
                                        : msg.findings.riskLevel === 'High'
                                        ? 'high'
                                        : 'medium'
                                    }
                                  >
                                    {msg.findings.riskLevel} Risk
                                  </Badge>
                                </div>
                                <p className="text-xs text-slate-600">{msg.findings.summary}</p>
                                <div className="text-[11px] bg-slate-50 p-2 rounded border border-slate-100">
                                  <div className="font-semibold text-slate-700 mb-1">
                                    Supporting Evidence:
                                  </div>
                                  <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                                    {msg.findings.evidence.map((ev, i) => (
                                      <li key={i}>{ev}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="text-xs pt-1 border-t border-slate-100 text-slate-700">
                                  <strong>Recommendation:</strong> {msg.findings.recommendation}
                                </div>
                              </div>
                            )}

                            {/* Action Approval Request Card if present */}
                            {msg.approvalRequest && (
                              <div className="mt-3 p-3 bg-amber-50/70 border border-amber-300 rounded-lg text-slate-800 space-y-2">
                                <div className="flex items-center justify-between text-amber-900 font-bold">
                                  <span className="flex items-center gap-1.5">
                                    <CheckSquare className="w-3.5 h-3.5 text-amber-600" />
                                    <span>Approval Required: {msg.approvalRequest.actionNumber}</span>
                                  </span>
                                  <Badge variant="critical">
                                    {msg.approvalRequest.riskLevel} Risk
                                  </Badge>
                                </div>
                                <div className="text-xs font-semibold text-slate-900">
                                  {msg.approvalRequest.proposedAction}
                                </div>
                                <div className="text-[11px] text-slate-600">
                                  <strong>Target:</strong> {msg.approvalRequest.targetDevice}
                                </div>
                                <div className="text-[11px] text-slate-600">
                                  <strong>Justification:</strong>{' '}
                                  {msg.approvalRequest.technicalJustification}
                                </div>
                                <div className="pt-2 flex justify-end">
                                  <button
                                    onClick={onOpenApprovals}
                                    className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold transition-colors"
                                  >
                                    Go to Approval Centre
                                  </button>
                                </div>
                              </div>
                            )}

                            <div
                              className={`text-[10px] mt-1.5 ${
                                isAgent ? 'text-slate-400' : 'text-blue-100'
                              } text-right`}
                            >
                              {new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Chat Input Form */}
                <form
                  onSubmit={handleSendMessage}
                  className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={`Ask ${selectedAgent.name} to analyze telemetry, run diagnostics, or summarize findings...`}
                    className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                  <button
                    type="submit"
                    disabled={isSending || !inputMessage.trim()}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
                  >
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
