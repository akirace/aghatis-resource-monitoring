'use client';

import { UptimeData } from '@/lib/types';
import MetricCard from './MetricCard';

interface UptimeCardProps {
    data: UptimeData;
}

function UptimePart({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex flex-col items-center bg-slate-800/60 rounded-xl p-3">
            <span className="text-2xl font-bold text-white tabular-nums leading-tight">
                {String(value).padStart(2, '0')}
            </span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">{label}</span>
        </div>
    );
}

export default function UptimeCard({ data }: UptimeCardProps) {
    const days = Math.floor(data.uptime / 86400);
    const hours = Math.floor((data.uptime % 86400) / 3600);
    const minutes = Math.floor((data.uptime % 3600) / 60);
    const seconds = Math.floor(data.uptime % 60);

    return (
        <MetricCard
            title="System Info"
            icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            }
        >
            {/* Uptime counter */}
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Uptime</div>
            <div className="grid grid-cols-4 gap-2 mb-4">
                <UptimePart value={days} label="Days" />
                <UptimePart value={hours} label="Hrs" />
                <UptimePart value={minutes} label="Min" />
                <UptimePart value={seconds} label="Sec" />
            </div>

            {/* System info */}
            <div className="space-y-2">
                {[
                    { label: 'Hostname', value: data.hostname },
                    { label: 'Platform', value: data.platform },
                    { label: 'OS', value: `${data.distro} ${data.release}` },
                ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center py-1.5 border-b border-slate-800 last:border-0">
                        <span className="text-[11px] text-slate-500 uppercase tracking-wide">{item.label}</span>
                        <span className="text-xs font-medium text-slate-300 max-w-[60%] text-right truncate">{item.value}</span>
                    </div>
                ))}
            </div>
        </MetricCard>
    );
}
