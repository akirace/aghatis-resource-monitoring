import { StatusLevel } from '@/lib/types';

interface StatusBadgeProps {
    level: StatusLevel;
    showLabel?: boolean;
}

const config: Record<StatusLevel, { label: string; classes: string; dot: string }> = {
    normal: {
        label: 'Normal',
        classes: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
        dot: 'bg-emerald-400',
    },
    high: {
        label: 'High Usage',
        classes: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
        dot: 'bg-amber-400',
    },
    critical: {
        label: 'Critical',
        classes: 'bg-red-500/15 text-red-400 border border-red-500/30',
        dot: 'bg-red-400',
    },
};

export default function StatusBadge({ level, showLabel = true }: StatusBadgeProps) {
    const { label, classes, dot } = config[level];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${classes}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dot} animate-pulse`} />
            {showLabel && label}
        </span>
    );
}
