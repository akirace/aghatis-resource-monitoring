'use client';

import { CpuData } from '@/lib/types';
import { getStatusLevel } from '@/lib/types';
import MetricCard from './MetricCard';
import ChartWrapper from './ChartWrapper';

interface CpuCardProps {
    data: CpuData;
    history: { time: string; total: number }[];
}

export default function CpuCard({ data, history }: CpuCardProps) {
    const status = getStatusLevel(data.currentLoad);

    return (
        <MetricCard
            title="CPU"
            status={status}
            icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 3H7a2 2 0 00-2 2v2M9 3h6M9 3v0M15 3h2a2 2 0 012 2v2M21 9v6M21 15v2a2 2 0 01-2 2h-2M15 21H9M3 15v-6M3 9V7a2 2 0 012-2h2" />
                </svg>
            }
        >
            {/* Main stat */}
            <div className="flex items-end gap-2 mb-3">
                <span className="text-4xl font-bold text-white tabular-nums leading-none">
                    {data.currentLoad.toFixed(1)}
                </span>
                <span className="text-slate-400 text-sm mb-1">%</span>
                <span className="text-slate-500 text-xs ml-auto mb-1">
                    {data.brand || data.manufacturer} · {data.cores} cores @ {data.speed}GHz
                </span>
            </div>

            {/* Chart */}
            <ChartWrapper
                data={history}
                series={[{ key: 'total', color: '#6366f1', label: 'CPU %' }]}
                height={100}
                unit="%"
                domain={[0, 100]}
            />

            {/* Per-core breakdown */}
            <div className="mt-3 grid grid-cols-4 gap-1.5">
                {data.coreLoads.slice(0, 16).map((load, i) => {
                    const pct = Math.min(load, 100);
                    const color =
                        pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : '#6366f1';
                    return (
                        <div key={i} className="flex flex-col items-center gap-1">
                            <div className="text-[9px] text-slate-500">C{i}</div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{ width: `${pct}%`, backgroundColor: color }}
                                />
                            </div>
                            <div className="text-[9px] text-slate-400 tabular-nums">{pct.toFixed(0)}%</div>
                        </div>
                    );
                })}
            </div>
        </MetricCard>
    );
}
