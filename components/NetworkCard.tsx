'use client';

import { NetworkData, formatBytes } from '@/lib/types';
import MetricCard from './MetricCard';
import ChartWrapper from './ChartWrapper';

interface NetworkHistoryPoint {
    time: string;
    rx: number;
    tx: number;
}

interface NetworkCardProps {
    data: NetworkData[];
    history: NetworkHistoryPoint[];
}

export default function NetworkCard({ data, history }: NetworkCardProps) {
    const totalRx = data.reduce((s, d) => s + d.rxBytesPerSec, 0);
    const totalTx = data.reduce((s, d) => s + d.txBytesPerSec, 0);

    // Convert bytes/s to KB/s for chart
    const chartData = history.map((h) => ({
        time: h.time,
        rx: Math.round(h.rx / 1024),
        tx: Math.round(h.tx / 1024),
    }));

    return (
        <MetricCard
            title="Network"
            icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                </svg>
            }
        >
            {/* Summary stats */}
            <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-slate-800/50 rounded-lg p-2.5">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">↓ Incoming</div>
                    <div className="text-sm font-bold text-cyan-400 tabular-nums">{formatBytes(totalRx)}/s</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-2.5">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">↑ Outgoing</div>
                    <div className="text-sm font-bold text-violet-400 tabular-nums">{formatBytes(totalTx)}/s</div>
                </div>
            </div>

            {/* Chart */}
            <ChartWrapper
                data={chartData}
                series={[
                    { key: 'rx', color: '#06b6d4', label: 'RX KB/s' },
                    { key: 'tx', color: '#8b5cf6', label: 'TX KB/s' },
                ]}
                height={110}
                unit=" KB/s"
                domain={[0, 'auto']}
            />

            {/* Per-interface */}
            <div className="mt-3 space-y-2">
                {data.map((iface) => (
                    <div key={iface.iface} className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-mono">{iface.iface}</span>
                        <div className="flex gap-3 text-slate-500 tabular-nums">
                            <span className="text-cyan-500">↓ {formatBytes(iface.rxBytesPerSec)}/s</span>
                            <span className="text-violet-500">↑ {formatBytes(iface.txBytesPerSec)}/s</span>
                        </div>
                    </div>
                ))}
            </div>
        </MetricCard>
    );
}
