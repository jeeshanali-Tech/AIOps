import React, { useState } from 'react';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Filter,
  HardDrive,
  Info,
  Laptop,
  Layers,
  Network,
  RefreshCw,
  Search,
  Server,
  Shield,
  Wifi,
  XCircle,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge.tsx';
import { Card } from '../components/ui/Card.tsx';
import { Customer, Device, MonitoringEvent, Site } from '../types/index.ts';

interface LiveMonitoringPageProps {
  devices: Device[];
  events: MonitoringEvent[];
  customers: Customer[];
  sites: Site[];
  onSelectCustomerFilter: (customerId: number | 'all') => void;
  selectedCustomerId: number | 'all';
}

export const LiveMonitoringPage: React.FC<LiveMonitoringPageProps> = ({
  devices,
  events,
  customers,
  sites,
  onSelectCustomerFilter,
  selectedCustomerId,
}) => {
  const [deviceTypeFilter, setDeviceTypeFilter] = useState<string>('All');
  const [deviceStatusFilter, setDeviceStatusFilter] = useState<string>('All');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'inventory' | 'alerts'>('inventory');

  // Filter devices
  const filteredDevices = devices.filter((d) => {
    if (selectedCustomerId !== 'all' && d.customerId !== selectedCustomerId) return false;
    if (deviceTypeFilter !== 'All' && d.type !== deviceTypeFilter) return false;
    if (deviceStatusFilter !== 'All' && d.status !== deviceStatusFilter) return false;
    if (
      searchQuery &&
      !d.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !d.ipAddress.includes(searchQuery) &&
      !d.os.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Filter events
  const filteredEvents = events.filter((e) => {
    if (selectedCustomerId !== 'all' && e.customerId !== selectedCustomerId) return false;
    if (severityFilter !== 'All' && e.severity !== severityFilter) return false;
    if (
      searchQuery &&
      !e.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !e.message.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !e.source.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Title & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Live Infrastructure Monitoring
            <Badge variant="success" dot pulse>
              Telemetry Streaming
            </Badge>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time server, network, and endpoint telemetry unified across Datto RMM, PRTG, and FortiGate.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'inventory' ? 'bg-white shadow-xs text-blue-600 font-bold' : 'text-slate-600'
            }`}
          >
            Device Inventory ({filteredDevices.length})
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'alerts' ? 'bg-white shadow-xs text-blue-600 font-bold' : 'text-slate-600'
            }`}
          >
            Monitoring Events ({filteredEvents.length})
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Customer filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Customer:</span>
            <select
              value={selectedCustomerId}
              onChange={(e) =>
                onSelectCustomerFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-800"
            >
              <option value="all">All Customers</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {activeTab === 'inventory' ? (
            <>
              {/* Device Type */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Type:</span>
                <select
                  value={deviceTypeFilter}
                  onChange={(e) => setDeviceTypeFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-800"
                >
                  <option value="All">All Types</option>
                  <option value="Server">Servers</option>
                  <option value="Workstation">Workstations</option>
                  <option value="Firewall">Firewalls</option>
                  <option value="Switch">Switches</option>
                  <option value="Storage / NAS">Storage / NAS</option>
                </select>
              </div>

              {/* Status */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Status:</span>
                <select
                  value={deviceStatusFilter}
                  onChange={(e) => setDeviceStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-800"
                >
                  <option value="All">All Statuses</option>
                  <option value="Online">Online</option>
                  <option value="Warning">Warning</option>
                  <option value="Offline">Offline</option>
                </select>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Severity:</span>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-800"
              >
                <option value="All">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter hostname, IP, OS..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 pl-8 pr-3 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Main View: Device Inventory Table */}
      {activeTab === 'inventory' ? (
        <Card title="Managed Devices Telemetry" subtitle="Real-time CPU, RAM, Disk, and Agent State">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Device Name & OS</th>
                  <th className="py-2.5 px-3">Customer / Site</th>
                  <th className="py-2.5 px-3">Network IP</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">CPU</th>
                  <th className="py-2.5 px-3">Memory</th>
                  <th className="py-2.5 px-3">Storage</th>
                  <th className="py-2.5 px-3 text-right">Last Heartbeat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDevices.map((device) => {
                  const Icon =
                    device.type === 'Server'
                      ? Server
                      : device.type === 'Firewall'
                      ? Shield
                      : device.type === 'Switch'
                      ? Network
                      : device.type === 'Storage / NAS'
                      ? HardDrive
                      : Laptop;

                  return (
                    <tr key={device.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700 shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 font-mono">
                              {device.name}
                            </div>
                            <div className="text-[11px] text-slate-500">{device.os}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-800">{device.customerName}</div>
                        <div className="text-[11px] text-slate-500">{device.siteName}</div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">{device.ipAddress}</td>
                      <td className="py-3 px-3">
                        <Badge
                          variant={
                            device.status === 'Online'
                              ? 'success'
                              : device.status === 'Warning'
                              ? 'warning'
                              : 'neutral'
                          }
                          dot
                        >
                          {device.status}
                        </Badge>
                      </td>
                      {/* CPU Bar */}
                      <td className="py-3 px-3">
                        <div className="w-20">
                          <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                            <span>{device.cpuUsage}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                device.cpuUsage > 80
                                  ? 'bg-red-500'
                                  : device.cpuUsage > 60
                                  ? 'bg-amber-500'
                                  : 'bg-blue-600'
                              }`}
                              style={{ width: `${device.cpuUsage}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      {/* Memory Bar */}
                      <td className="py-3 px-3">
                        <div className="w-20">
                          <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                            <span>{device.memoryUsage}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                device.memoryUsage > 85
                                  ? 'bg-red-500'
                                  : device.memoryUsage > 75
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${device.memoryUsage}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      {/* Disk Bar */}
                      <td className="py-3 px-3">
                        <div className="w-20">
                          <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                            <span>{device.diskUsage}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                device.diskUsage > 90
                                  ? 'bg-red-500'
                                  : device.diskUsage > 80
                                  ? 'bg-amber-500'
                                  : 'bg-slate-400'
                              }`}
                              style={{ width: `${device.diskUsage}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right text-[11px] text-slate-500 font-mono">
                        {new Date(device.lastSeen).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* Alerts Table */
        <Card title="Monitoring Alerts & Correlation" subtitle="Telemetry feed from integrated monitoring engines">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Event Title & Source</th>
                  <th className="py-2.5 px-3">Target Device / Customer</th>
                  <th className="py-2.5 px-3">Incident Correlation</th>
                  <th className="py-2.5 px-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3">
                      <Badge
                        variant={
                          event.severity === 'Critical'
                            ? 'critical'
                            : event.severity === 'High'
                            ? 'high'
                            : event.severity === 'Medium'
                            ? 'medium'
                            : 'low'
                        }
                        dot
                      >
                        {event.severity}
                      </Badge>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{event.title}</div>
                      <div className="text-[11px] text-slate-500">{event.message}</div>
                      <div className="text-[10px] text-blue-600 font-medium mt-0.5">
                        Source: {event.source} ({event.integrationSlug})
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-mono text-slate-800">{event.deviceName || 'Network Edge'}</div>
                      <div className="text-[11px] text-slate-500">{event.customerName}</div>
                    </td>
                    <td className="py-3 px-3">
                      {event.correlatedIncidentId ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[11px] font-semibold">
                          <CheckCircle2 className="w-3 h-3 text-blue-600" />
                          <span>Incident #{event.correlatedIncidentId}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Uncorrelated (Telemetry Only)</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-[11px] text-slate-500">
                      {new Date(event.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
