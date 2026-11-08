import React from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Globe,
  Network,
  Radio,
  Server,
  Shield,
  ShieldCheck,
  Wifi,
  XCircle,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge.tsx';
import { Card } from '../components/ui/Card.tsx';
import { NetworkInterfaceMetric } from '../types/index.ts';

interface NetworkOpsPageProps {
  metrics: NetworkInterfaceMetric[];
}

export const NetworkOpsPage: React.FC<NetworkOpsPageProps> = ({ metrics }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Network Operations Centre (NOC)
            <Badge variant="info">PRTG & FortiGate Feeds</Badge>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Firewall states, WAN uplink availability, IPsec VPN tunnels, and PRTG sensor telemetry.
          </p>
        </div>
      </div>

      {/* High-level Network Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Average WAN Uptime</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">99.82%</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">3 Sites Monitored</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">IPsec VPN Tunnels</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">23 / 24 Up</div>
          <div className="text-[11px] text-slate-400 mt-0.5">1 tunnel negotiating re-key</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Average Core Latency</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">18.6 ms</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Jitter threshold: &lt; 50ms</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">PRTG Sensors Polled</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">124</div>
          <div className="text-[11px] text-amber-600 font-semibold mt-0.5">
            1 sensor optical alert
          </div>
        </div>
      </div>

      {/* Network Interface & Edge Firewall Cards */}
      <div className="grid grid-cols-1 gap-4">
        {metrics.map((m) => (
          <Card key={m.id} title={m.siteName} subtitle={`Primary Network Device: ${m.device}`}>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-[11px] text-slate-500">Firewall Health</div>
                <div className="mt-1 flex items-center gap-1.5 font-bold">
                  <Badge variant={m.firewallStatus === 'Healthy' ? 'success' : 'high'}>
                    {m.firewallStatus}
                  </Badge>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-[11px] text-slate-500">WAN Availability</div>
                <div className="text-base font-bold text-slate-900 mt-0.5">
                  {m.wanAvailability}%
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-[11px] text-slate-500">Packet Loss</div>
                <div
                  className={`text-base font-bold mt-0.5 ${
                    m.packetLossPercent > 5
                      ? 'text-red-600'
                      : m.packetLossPercent > 1
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {m.packetLossPercent}%
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-[11px] text-slate-500">RTT Latency</div>
                <div className="text-base font-mono font-bold text-slate-900 mt-0.5">
                  {m.latencyMs} ms
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-[11px] text-slate-500">VPN Tunnels</div>
                <div className="text-base font-bold text-slate-900 mt-0.5">
                  {m.vpnTunnelsUp} / {m.vpnTunnelsTotal}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-[11px] text-slate-500">PRTG Probe State</div>
                <div className="mt-1 font-semibold text-slate-800 flex items-center gap-1">
                  {m.prtgSensorStatus.includes('Critical') ? (
                    <span className="text-red-600 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Sensor Alarm
                    </span>
                  ) : (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> All Green
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Diagnostic Alert note if degraded */}
            {m.packetLossPercent > 2 && (
              <div className="mt-3 p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Optical Loss Alert:</strong> SFP receive power drop detected (-24.2
                    dBm) on core switch uplink. Correlated to Incident INC-2026-0839.
                  </span>
                </div>
                <span className="font-mono text-[11px] text-amber-800">Assigned: Network Engineer Agent</span>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
