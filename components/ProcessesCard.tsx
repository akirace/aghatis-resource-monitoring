'use client';

import { useState, useMemo } from 'react';
import { ProcessData, formatBytes } from '@/lib/types';
import MetricCard from './MetricCard';

interface ProcessesCardProps {
    data: ProcessData[];
}

type SortKey = 'cpu' | 'memPercent' | 'memBytes' | 'name' | 'pid';
type SortDir = 'asc' | 'desc';

const STATUS_COLORS: Record<string, string> = {
    running: 'text-emerald-400',
    sleeping: 'text-slate-500',
    idle: 'text-slate-600',
    stopped: 'text-amber-400',
    zombie: 'text-red-400',
    unknown: 'text-slate-600',
};

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
    if (!active) return <span className="text-slate-700 ml-1">↕</span>;
    return <span className="text-indigo-400 ml-1">{dir === 'desc' ? '↓' : '↑'}</span>;
}

export default function ProcessesCard({ data }: ProcessesCardProps) {
    const [sortKey, setSortKey] = useState<SortKey>('cpu');
    const [sortDir, setSortDir] = useState<SortDir>('desc');
    const [search, setSearch] = useState('');

    function handleSort(key: SortKey) {
        if (key === sortKey) {
            setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
        } else {
            setSortKey(key);
            setSortDir('desc');
        }
    }

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return data
            .filter((p) => !q || p.name.toLowerCase().includes(q) || String(p.pid).includes(q))
            .sort((a, b) => {
                const av = a[sortKey];
                const bv = b[sortKey];
                if (typeof av === 'string' && typeof bv === 'string') {
                    return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
                }
                return sortDir === 'asc'
                    ? (av as number) - (bv as number)
                    : (bv as number) - (av as number);
            });
    }, [data, sortKey, sortDir, search]);

    const cols: { key: SortKey; label: string; align: string }[] = [
        { key: 'name', label: 'Process', align: 'text-left' },
        { key: 'pid', label: 'PID', align: 'text-right' },
        { key: 'cpu', label: 'CPU %', align: 'text-right' },
        { key: 'memPercent', label: 'MEM %', align: 'text-right' },
        { key: 'memBytes', label: 'Memory', align: 'text-right' },
    ];

    return (
        <MetricCard
            title="Task Manager"
            icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
            }
        >
            {/* Search + stats bar */}
            <div className="flex items-center gap-3 mb-3">
                <div className="relative flex-1">
                    <svg className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search process..."
                        className="w-full bg-slate-800/60 border border-slate-700/60 text-slate-200 text-xs rounded-lg pl-8 pr-3 py-2 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition"
                    />
                </div>
                <div className="text-[10px] text-slate-500 whitespace-nowrap">
                    {filtered.length} / {data.length} processes
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-lg border border-slate-800/80">
                {/* Header */}
                <div className="grid grid-cols-[1fr_60px_72px_72px_80px] bg-slate-800/60 border-b border-slate-700/50">
                    {cols.map((col) => (
                        <button
                            key={col.key}
                            onClick={() => handleSort(col.key)}
                            className={`px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-200 transition ${col.align}`}
                        >
                            {col.label}
                            <SortIcon active={sortKey === col.key} dir={sortDir} />
                        </button>
                    ))}
                </div>

                {/* Rows */}
                <div className="overflow-y-auto max-h-[340px]">
                    {filtered.length === 0 ? (
                        <div className="py-8 text-center text-slate-600 text-sm">No processes found</div>
                    ) : (
                        filtered.map((proc) => {
                            const cpuColor =
                                proc.cpu >= 50 ? 'text-red-400' :
                                    proc.cpu >= 20 ? 'text-amber-400' :
                                        proc.cpu > 0 ? 'text-emerald-400' : 'text-slate-500';

                            const memColor =
                                proc.memPercent >= 10 ? 'text-red-400' :
                                    proc.memPercent >= 5 ? 'text-amber-400' : 'text-slate-400';

                            const statusColor = STATUS_COLORS[proc.status.toLowerCase()] ?? STATUS_COLORS.unknown;

                            return (
                                <div
                                    key={proc.pid}
                                    className="grid grid-cols-[1fr_60px_72px_72px_80px] border-b border-slate-800/60 last:border-0 hover:bg-slate-800/30 transition-colors group"
                                >
                                    {/* Name */}
                                    <div className="px-3 py-2.5 flex items-center gap-2 min-w-0">
                                        <span
                                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusColor.replace('text-', 'bg-')}`}
                                            title={proc.status}
                                        />
                                        <span className="text-xs text-slate-200 font-medium truncate" title={proc.command}>
                                            {proc.name}
                                        </span>
                                        {proc.user && (
                                            <span className="text-[9px] text-slate-600 hidden group-hover:inline truncate">
                                                {proc.user}
                                            </span>
                                        )}
                                    </div>

                                    {/* PID */}
                                    <div className="px-3 py-2.5 text-right">
                                        <span className="text-[11px] text-slate-500 font-mono tabular-nums">{proc.pid}</span>
                                    </div>

                                    {/* CPU % */}
                                    <div className="px-3 py-2.5 text-right">
                                        <span className={`text-xs font-semibold tabular-nums ${cpuColor}`}>
                                            {proc.cpu.toFixed(1)}%
                                        </span>
                                    </div>

                                    {/* MEM % */}
                                    <div className="px-3 py-2.5 text-right">
                                        <span className={`text-xs font-semibold tabular-nums ${memColor}`}>
                                            {proc.memPercent.toFixed(1)}%
                                        </span>
                                    </div>

                                    {/* Memory */}
                                    <div className="px-3 py-2.5 text-right">
                                        <span className="text-[11px] text-slate-400 tabular-nums">
                                            {formatBytes(proc.memBytes)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Legend */}
            <div className="mt-2 flex items-center gap-4 text-[10px] text-slate-600">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />Running</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-500" />Sleeping</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" />Stopped</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-400" />Zombie</span>
                <span className="ml-auto">Click headers to sort</span>
            </div>
        </MetricCard>
    );
}
