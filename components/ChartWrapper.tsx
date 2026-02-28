'use client';

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';

interface ChartSeries {
    key: string;
    color: string;
    label?: string;
}

interface ChartWrapperProps {
    data: Record<string, number | string>[];
    series: ChartSeries[];
    height?: number;
    unit?: string;
    domain?: [number | 'auto', number | 'auto'];
}

export default function ChartWrapper({
    data,
    series,
    height = 120,
    unit = '%',
    domain = [0, 100],
}: ChartWrapperProps) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <YAxis
                    domain={domain}
                    tick={{ fontSize: 9, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v}${unit}`}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid rgba(148,163,184,0.15)',
                        borderRadius: '8px',
                        fontSize: '11px',
                        color: '#cbd5e1',
                    }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={((value: number | undefined, name: string | undefined) => [`${value ?? 0}${unit}`, name ?? '']) as any}
                />
                {series.length > 1 && (
                    <Legend
                        wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }}
                        iconType="circle"
                        iconSize={6}
                    />
                )}
                {series.map((s) => (
                    <Line
                        key={s.key}
                        type="monotone"
                        dataKey={s.key}
                        stroke={s.color}
                        name={s.label || s.key}
                        dot={false}
                        strokeWidth={1.5}
                        isAnimationActive={false}
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    );
}
