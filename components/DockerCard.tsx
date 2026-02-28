'use client';

import { useState, useMemo } from 'react';
import { DockerContainerData, formatBytes } from '@/lib/types';
import MetricCard from './MetricCard';

interface DockerCardProps {
    data: DockerContainerData[];
}

type SortKey = 'name' | 'cpuPercent' | 'memPercent' | 'memUsed' | 'state';
type SortDir = 'asc' | 'desc';

const STATE_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
    running: { label: 'Running', dot: 'bg-emerald-400', badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    exited: { label: 'Exited', dot: 'bg-red-400', badge: 'bg-red-500/20 text-red-400 border-red-500/30' },
    paused: { label: 'Paused', dot: 'bg-amber-400', badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    created: { label: 'Created', dot: 'bg-blue-400', badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    dead: { label: 'Dead', dot: 'bg-slate-500', badge: 'bg-slate-700/40 text-slate-500 border-slate-600/30' },
};

function getState(state: string) {
    return STATE_CONFIG[state.toLowerCase()] ?? {
        label: state,
        dot: 'bg-slate-500',
        badge: 'bg-slate-700/40 text-slate-400 border-slate-600/30',
    };
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
    if (!active) return <span className="text-slate-700 ml-1">↕</span>;
    return <span className="text-cyan-400 ml-1">{dir === 'desc' ? '↓' : '↑'}</span>;
}

function MiniBar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
    const pct = Math.min(100, (value / max) * 100);
    return (
        <div className="w-full bg-slate-800 rounded-full h-1 mt-0.5">
            <div
                className={`h-1 rounded-full transition-all duration-500 ${color}`}
                style={{ width: `${pct}%` }}
            />
        </div>
    );
}

export default function DockerCard({ data }: DockerCardProps) {
    const [sortKey, setSortKey] = useState<SortKey>('state');
    const [sortDir, setSortDir] = useState<SortDir>('asc');
    const [search, setSearch] = useState('');

    function handleSort(key: SortKey) {
        if (key === sortKey) {
            setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
        } else {
            setSortKey(key);
            setSortDir(key === 'name' || key === 'state' ? 'asc' : 'desc');
        }
    }


    const running = data.filter((c) => c.state === 'running').length;
    const total = data.length;

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return data
            .filter((c) =>
                !q ||
                c.name.toLowerCase().includes(q) ||
                c.image.toLowerCase().includes(q) ||
                c.id.includes(q)
            )
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
        { key: 'name', label: 'Container', align: 'text-left' },
        { key: 'state', label: 'State', align: 'text-left' },
        { key: 'cpuPercent', label: 'CPU %', align: 'text-right' },
        { key: 'memPercent', label: 'MEM %', align: 'text-right' },
        { key: 'memUsed', label: 'Memory', align: 'text-right' },
    ];

    return (
        <MetricCard
            title="Docker Containers"
            icon={
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.185h-2.119a.186.186 0 00-.185.185v1.887c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.186.185.186m-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.186.185.186m-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.186.186.186m5.893 2.715h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.185-.185H5.136a.185.185 0 00-.186.185v1.887c0 .102.084.185.186.185m-2.92 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.185H2.217a.185.185 0 00-.185.185v1.887c0 .102.083.185.185.185M23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338.001-.676.03-1.01.087-.248-1.7-1.653-2.53-1.716-2.566l-.344-.199-.226.327c-.284.438-.49.922-.612 1.43-.23.97-.09 1.882.403 2.661-.595.332-1.55.413-1.744.42H.751a.751.751 0 00-.75.748 11.376 11.376 0 00.692 4.062c.545 1.428 1.355 2.48 2.41 3.124 1.18.723 3.1 1.137 5.275 1.137.983.003 1.963-.086 2.93-.266a12.248 12.248 0 003.823-1.389c.98-.567 1.86-1.288 2.61-2.136 1.252-1.418 1.998-2.997 2.553-4.4h.221c1.372 0 2.215-.549 2.68-1.009.309-.293.55-.65.707-1.046l.098-.288Z" />
                </svg>
            }
        >
            {/* Search + summary bar */}
            <div className="flex items-center gap-3 mb-3">
                <div className="relative flex-1">
                    <svg className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search container, image..."
                        className="w-full bg-slate-800/60 border border-slate-700/60 text-slate-200 text-xs rounded-lg pl-8 pr-3 py-2 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition"
                    />
                </div>
                <div className="flex items-center gap-2 text-[10px] whitespace-nowrap">
                    <span className="flex items-center gap-1 text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {running} running
                    </span>
                    <span className="text-slate-600">/</span>
                    <span className="text-slate-500">{total} total</span>
                </div>
            </div>

            {total === 0 ? (
                /* Docker not available state */
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-slate-600">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.185h-2.119a.186.186 0 00-.185.185v1.887c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.186.185.186m-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.186.185.186m-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.186.186.186m5.893 2.715h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.185-.185H5.136a.185.185 0 00-.186.185v1.887c0 .102.084.185.186.185m-2.92 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.185H2.217a.185.185 0 00-.185.185v1.887c0 .102.083.185.185.185" />
                        </svg>
                    </div>
                    <div className="text-center">
                        <p className="text-slate-500 text-sm font-medium">No containers found</p>
                        <p className="text-slate-600 text-xs mt-0.5">Docker may not be installed or no containers exist</p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Table */}
                    <div className="overflow-hidden rounded-lg border border-slate-800/80">
                        {/* Header */}
                        <div className="grid grid-cols-[1fr_90px_72px_72px_80px] bg-slate-800/60 border-b border-slate-700/50">
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
                                <div className="py-8 text-center text-slate-600 text-sm">No containers match</div>
                            ) : (
                                filtered.map((c) => {
                                    const stateInfo = getState(c.state);
                                    const cpuColor = c.cpuPercent >= 80 ? 'bg-red-500' : c.cpuPercent >= 50 ? 'bg-amber-500' : 'bg-cyan-500';
                                    const memColor = c.memPercent >= 80 ? 'bg-red-500' : c.memPercent >= 50 ? 'bg-amber-500' : 'bg-indigo-500';
                                    const cpuTextColor = c.cpuPercent >= 80 ? 'text-red-400' : c.cpuPercent >= 50 ? 'text-amber-400' : 'text-cyan-400';
                                    const memTextColor = c.memPercent >= 80 ? 'text-red-400' : c.memPercent >= 50 ? 'text-amber-400' : 'text-slate-400';

                                    return (
                                        <div
                                            key={c.id}
                                            className="grid grid-cols-[1fr_90px_72px_72px_80px] border-b border-slate-800/60 last:border-0 hover:bg-slate-800/30 transition-colors group"
                                        >
                                            {/* Name + image */}
                                            <div className="px-3 py-2.5 flex flex-col justify-center min-w-0">
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <span className={`w-1.5 h-1.5 shrink-0 rounded-full ${stateInfo.dot} ${c.state === 'running' ? 'animate-pulse' : ''}`} />
                                                    <span className="text-xs text-slate-200 font-medium truncate" title={c.name}>
                                                        {c.name}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-slate-600 truncate pl-3 group-hover:text-slate-500 transition" title={c.image}>
                                                    {c.image}
                                                </span>
                                            </div>

                                            {/* State badge */}
                                            <div className="px-3 py-2.5 flex items-center">
                                                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${stateInfo.badge}`}>
                                                    {stateInfo.label}
                                                </span>
                                            </div>

                                            {/* CPU % */}
                                            <div className="px-3 py-2.5 text-right">
                                                <span className={`text-xs font-semibold tabular-nums ${cpuTextColor}`}>
                                                    {c.cpuPercent.toFixed(1)}%
                                                </span>
                                                <MiniBar value={c.cpuPercent} max={100} color={cpuColor} />
                                            </div>

                                            {/* MEM % */}
                                            <div className="px-3 py-2.5 text-right">
                                                <span className={`text-xs font-semibold tabular-nums ${memTextColor}`}>
                                                    {c.memPercent.toFixed(1)}%
                                                </span>
                                                <MiniBar value={c.memPercent} max={100} color={memColor} />
                                            </div>

                                            {/* Memory bytes */}
                                            <div className="px-3 py-2.5 text-right">
                                                <span className="text-[11px] text-slate-400 tabular-nums">
                                                    {formatBytes(c.memUsed)}
                                                </span>
                                                {c.memLimit > 0 && (
                                                    <span className="block text-[10px] text-slate-600">
                                                        / {formatBytes(c.memLimit)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Footer legend + net I/O summary */}
                    <div className="mt-2 flex items-center gap-4 text-[10px] text-slate-600">
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />Running</span>
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" />Paused</span>
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-400" />Exited</span>
                        <span className="ml-auto">Click headers to sort</span>
                    </div>
                </>
            )}
        </MetricCard>
    );
}
