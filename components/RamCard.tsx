'use client';

import { MemData, formatBytes, getStatusLevel } from '@/lib/types';
import MetricCard from './MetricCard';
import ChartWrapper from './ChartWrapper';

interface RamCardProps {
    data: MemData;
    history: { time: string; used: number }[];
}

export default function RamCard({ data, history }: RamCardProps) {
    const status = getStatusLevel(data.usedPercent);

    return (
        <MetricCard
            title="Memory"
            status={status}
            icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            }
        >
            {/* Stats */}
            <div className="flex items-end gap-2 mb-3">
                <span className="text-4xl font-bold text-white tabular-nums leading-none">
                    {data.usedPercent.toFixed(1)}
                </span>
                <span className="text-slate-400 text-sm mb-1">%</span>
                <span className="text-slate-500 text-xs ml-auto mb-1">
                    {formatBytes(data.used)} / {formatBytes(data.total)}
                </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-3">
                <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                        width: `${data.usedPercent}%`,
                        background:
                            data.usedPercent >= 90
                                ? '#ef4444'
                                : data.usedPercent >= 70
                                    ? '#f59e0b'
                                    : '#10b981',
                    }}
                />
            </div>

            {/* Chart */}
            <ChartWrapper
                data={history}
                series={[{ key: 'used', color: '#10b981', label: 'RAM %' }]}
                height={100}
                unit="%"
                domain={[0, 100]}
            />

            {/* Stats row */}
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                {[
                    { label: 'Total', value: formatBytes(data.total) },
                    { label: 'Used', value: formatBytes(data.used) },
                    { label: 'Free', value: formatBytes(data.free) },
                ].map((item) => (
                    <div key={item.label} className="bg-slate-800/50 rounded-lg p-2">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wide">{item.label}</div>
                        <div className="text-xs font-semibold text-slate-200 mt-0.5">{item.value}</div>
                    </div>
                ))}
            </div>
        </MetricCard>
    );
}
