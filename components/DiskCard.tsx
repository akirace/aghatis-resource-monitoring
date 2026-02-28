'use client';

import { DiskData, formatBytes, getStatusLevel } from '@/lib/types';
import MetricCard from './MetricCard';

interface DiskCardProps {
    data: DiskData[];
}

export default function DiskCard({ data }: DiskCardProps) {
    const maxUsed = data.reduce((max, d) => Math.max(max, d.usedPercent), 0);
    const status = getStatusLevel(maxUsed);

    return (
        <MetricCard
            title="Disk"
            status={status}
            icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
            }
        >
            <div className="space-y-3">
                {data.map((disk, i) => {
                    const pct = disk.usedPercent;
                    const barColor =
                        pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : '#f59e0b';
                    const barColorNormal = '#8b5cf6';
                    const finalColor = pct >= 70 ? barColor : barColorNormal;
                    return (
                        <div key={i} className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-slate-200 font-mono">{disk.mount}</span>
                                    <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">{disk.type}</span>
                                </div>
                                <span className="text-xs text-slate-400 tabular-nums">
                                    {formatBytes(disk.used)} / {formatBytes(disk.size)}
                                </span>
                            </div>
                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{ width: `${pct}%`, backgroundColor: finalColor }}
                                />
                            </div>
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-slate-500">{formatBytes(disk.available)} free</span>
                                <span
                                    className="font-semibold tabular-nums"
                                    style={{ color: finalColor }}
                                >
                                    {pct.toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </MetricCard>
    );
}
