'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { SystemMetrics } from '@/lib/types';
import CpuCard from '@/components/CpuCard';
import RamCard from '@/components/RamCard';
import DiskCard from '@/components/DiskCard';
import NetworkCard from '@/components/NetworkCard';
import UptimeCard from '@/components/UptimeCard';

const MAX_HISTORY = 30;
const POLL_INTERVAL = 2500;

function getTimeLabel(): string {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
}

type CpuHistory = { time: string; total: number };
type RamHistory = { time: string; used: number };
type NetHistory = { time: string; rx: number; tx: number };

export default function DashboardPage() {
    const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<string>('');

    const cpuHistory = useRef<CpuHistory[]>([]);
    const ramHistory = useRef<RamHistory[]>([]);
    const netHistory = useRef<NetHistory[]>([]);

    const [, forceRender] = useState(0);

    const fetchMetrics = useCallback(async () => {
        try {
            const res = await fetch('/api/system', { cache: 'no-store' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data: SystemMetrics = await res.json();

            const timeLabel = getTimeLabel();

            cpuHistory.current = [
                ...cpuHistory.current.slice(-(MAX_HISTORY - 1)),
                { time: timeLabel, total: data.cpu.currentLoad },
            ];
            ramHistory.current = [
                ...ramHistory.current.slice(-(MAX_HISTORY - 1)),
                { time: timeLabel, used: data.mem.usedPercent },
            ];
            const totalRx = data.network.reduce((s, n) => s + n.rxBytesPerSec, 0);
            const totalTx = data.network.reduce((s, n) => s + n.txBytesPerSec, 0);
            netHistory.current = [
                ...netHistory.current.slice(-(MAX_HISTORY - 1)),
                { time: timeLabel, rx: totalRx, tx: totalTx },
            ];

            setMetrics(data);
            setLastUpdated(timeLabel);
            setError(null);
            forceRender((n) => n + 1);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
        }
    }, []);

    useEffect(() => {
        fetchMetrics();
        const interval = setInterval(fetchMetrics, POLL_INTERVAL);
        return () => clearInterval(interval);
    }, [fetchMetrics]);

    if (error) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="text-center space-y-3">
                    <div className="text-red-400 text-4xl">⚠</div>
                    <h2 className="text-lg font-semibold text-slate-200">Failed to load metrics</h2>
                    <p className="text-slate-400 text-sm">{error}</p>
                    <button
                        onClick={fetchMetrics}
                        className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!metrics) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="text-center space-y-3">
                    <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-slate-400 text-sm">Loading system metrics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Status bar */}
            <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                    Auto-refreshing every {POLL_INTERVAL / 1000}s
                </p>
                <p className="text-xs text-slate-500 tabular-nums">
                    Last updated: <span className="text-slate-400">{lastUpdated}</span>
                </p>
            </div>

            {/* Top row: CPU + RAM */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <CpuCard data={metrics.cpu} history={cpuHistory.current} />
                <RamCard data={metrics.mem} history={ramHistory.current} />
            </div>

            {/* Middle row: Network + Uptime */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <NetworkCard data={metrics.network} history={netHistory.current} />
                <UptimeCard data={metrics.uptime} />
            </div>

            {/* Bottom row: Disk (full width) */}
            <div className="grid grid-cols-1 gap-4">
                <DiskCard data={metrics.disk} />
            </div>
        </div>
    );
}
