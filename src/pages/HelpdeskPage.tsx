import React, { useState } from 'react';
import {
  AlertTriangle,
  Bot,
  CheckCircle,
  Clock,
  Filter,
  Headphones,
  Search,
  UserCheck,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge.tsx';
import { Card } from '../components/ui/Card.tsx';
import { HelpdeskTicket } from '../types/index.ts';

interface HelpdeskPageProps {
  tickets: HelpdeskTicket[];
}

export const HelpdeskPage: React.FC<HelpdeskPageProps> = ({ tickets }) => {
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = tickets.filter((t) => {
    if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;
    if (statusFilter !== 'All' && t.status !== statusFilter) return false;
    if (
      searchQuery &&
      !t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !t.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !t.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const totalOpen = tickets.filter((t) => t.status !== 'Resolved').length;
  const breachedCount = tickets.filter((t) => t.isBreached).length;
  const aiTriagedCount = tickets.filter((t) => t.agentInvestigated).length;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Helpdesk Operations & PSA
            <Badge variant="info">Zoho Desk Synchronized</Badge>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            SLA compliance monitoring, ticket assignment, and autonomous triage investigation results.
          </p>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Open Tickets</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalOpen}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Assigned to engineers & AI</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">SLA Breached / Overdue</div>
          <div className="text-2xl font-bold text-red-600 mt-1">{breachedCount}</div>
          <div className="text-[11px] text-red-600 font-medium mt-0.5">Escalated to NetOps lead</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">AI Investigated</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{aiTriagedCount}</div>
          <div className="text-[11px] text-blue-600 font-medium mt-0.5">Pre-diagnosed with findings</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Average Response Time</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">11.4m</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Target: &lt; 15m</div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-800"
            >
              <option value="All">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-800"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tickets, subject, tenant..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 pl-8 pr-3 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Tickets List */}
      <Card title={`Helpdesk Queue (${filtered.length})`} subtitle="Zoho Desk tickets with AI investigation findings">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Ticket ID</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Title & AI Diagnostics</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Assigned To</th>
                <th className="py-2.5 px-3">SLA Status</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-blue-600">
                    {ticket.ticketNumber}
                  </td>
                  <td className="py-3 px-3">
                    <Badge
                      variant={
                        ticket.priority === 'Urgent'
                          ? 'critical'
                          : ticket.priority === 'High'
                          ? 'high'
                          : 'default'
                      }
                    >
                      {ticket.priority}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 max-w-sm">
                    <div className="font-semibold text-slate-900">{ticket.title}</div>
                    {ticket.agentFindingsSummary && (
                      <div className="mt-1 p-2 bg-blue-50/60 rounded border border-blue-100 text-[11px] text-slate-700 flex items-start gap-1.5">
                        <Bot className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>{ticket.agentFindingsSummary}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-700 font-medium">
                    {ticket.customerName}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-medium text-slate-800">{ticket.assignedTo}</span>
                  </td>
                  <td className="py-3 px-3">
                    {ticket.status === 'Resolved' ? (
                      <span className="text-emerald-600 font-medium flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Met SLA
                      </span>
                    ) : ticket.isBreached ? (
                      <span className="text-red-600 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Breached (
                        {ticket.slaRemainingMinutes}m)
                      </span>
                    ) : (
                      <span className="text-slate-600 font-mono">
                        {ticket.slaRemainingMinutes}m remaining
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <Badge
                      variant={
                        ticket.status === 'Resolved'
                          ? 'success'
                          : ticket.status === 'In Progress'
                          ? 'info'
                          : 'warning'
                      }
                    >
                      {ticket.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
