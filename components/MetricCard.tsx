import { ReactNode } from 'react';
import { StatusLevel } from '@/lib/types';
import StatusBadge from './StatusBadge';

interface MetricCardProps {
    title: string;
    icon: ReactNode;
    status?: StatusLevel;
    children: ReactNode;
    className?: string;
}

export default function MetricCard({ title, icon, status, children, className = '' }: MetricCardProps) {
    return (
        <div className={`metric-card ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                    <span className="text-slate-400">{icon}</span>
                    <h2 className="text-sm font-semibold text-slate-200 tracking-wide uppercase">{title}</h2>
                </div>
                {status && <StatusBadge level={status} />}
            </div>
            {children}
        </div>
    );
}
