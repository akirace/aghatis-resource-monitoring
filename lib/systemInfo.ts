import si from 'systeminformation';
import { exec } from 'child_process';
import { promisify } from 'util';
import type { CpuData, MemData, DiskData, NetworkData, UptimeData, ProcessData, DockerContainerData, SystemMetrics } from './types';

const execAsync = promisify(exec);

// Cache for network stats to calculate per-second rates
let prevNetworkStats: si.Systeminformation.NetworkStatsData[] = [];
let prevNetworkTime = Date.now();

export async function getCpuInfo(): Promise<CpuData> {
    const [cpuInfo, cpuLoad] = await Promise.all([
        si.cpu(),
        si.currentLoad(),
    ]);

    return {
        manufacturer: cpuInfo.manufacturer,
        brand: cpuInfo.brand,
        speed: cpuInfo.speed,
        cores: cpuInfo.cores,
        physicalCores: cpuInfo.physicalCores,
        currentLoad: Math.round(cpuLoad.currentLoad * 10) / 10,
        coreLoads: cpuLoad.cpus.map((c) => Math.round(c.load * 10) / 10),
    };
}

export async function getMemInfo(): Promise<MemData> {
    const mem = await si.mem();
    const usedPercent = Math.round((mem.used / mem.total) * 1000) / 10;
    return {
        total: mem.total,
        used: mem.used,
        free: mem.free,
        usedPercent,
    };
}

export async function getDiskInfo(): Promise<DiskData[]> {
    const disks = await si.fsSize();
    return disks
        .filter((d) => d.size > 0)
        .map((d) => ({
            fs: d.fs,
            type: d.type,
            mount: d.mount,
            size: d.size,
            used: d.used,
            available: d.available,
            usedPercent: Math.round(d.use * 10) / 10,
        }));
}

export async function getNetworkInfo(): Promise<NetworkData[]> {
    const stats = await si.networkStats();
    const now = Date.now();
    const elapsed = (now - prevNetworkTime) / 1000; // seconds

    const result: NetworkData[] = stats.map((stat) => {
        const prev = prevNetworkStats.find((p) => p.iface === stat.iface);
        let rxBytesPerSec = 0;
        let txBytesPerSec = 0;

        if (prev && elapsed > 0) {
            rxBytesPerSec = Math.max(0, (stat.rx_bytes - prev.rx_bytes) / elapsed);
            txBytesPerSec = Math.max(0, (stat.tx_bytes - prev.tx_bytes) / elapsed);
        }

        return {
            iface: stat.iface,
            rxBytesPerSec: Math.round(rxBytesPerSec),
            txBytesPerSec: Math.round(txBytesPerSec),
            rxTotal: stat.rx_bytes,
            txTotal: stat.tx_bytes,
        };
    });

    prevNetworkStats = stats;
    prevNetworkTime = now;

    return result;
}

export async function getUptimeInfo(): Promise<UptimeData> {
    const [timeData, osInfo] = await Promise.all([
        si.time(),
        si.osInfo(),
    ]);

    const uptime = timeData.uptime;
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);

    return {
        uptime,
        formattedUptime: parts.join(' '),
        hostname: osInfo.hostname,
        platform: osInfo.platform,
        distro: osInfo.distro,
        release: osInfo.release,
    };
}

export async function getProcessesInfo(): Promise<ProcessData[]> {
    const { list } = await si.processes();
    return list
        .sort((a, b) => b.cpu - a.cpu)
        .slice(0, 50)
        .map((p) => ({
            pid: p.pid,
            name: p.name,
            cpu: Math.round(p.cpu * 10) / 10,
            memPercent: Math.round(p.mem * 10) / 10,
            memBytes: p.memRss,
            status: p.state || 'unknown',
            user: p.user || '',
            command: p.command || p.name,
        }));
}

// Helper: parse Docker size strings like "1.5GiB", "500MiB", "1.2kB" → bytes
function parseDockerSize(str: string): number {
    if (!str || str === '--') return 0;
    const match = str.trim().match(/^([\d.]+)\s*(B|kB|MB|GB|MiB|GiB|TiB|Ki?B|Mi?B|Gi?B|Ti?B)?$/i);
    if (!match) return 0;
    const val = parseFloat(match[1]);
    const unit = (match[2] || 'B').toLowerCase();
    const multipliers: Record<string, number> = {
        b: 1,
        kb: 1000, kib: 1024,
        mb: 1000 ** 2, mib: 1024 ** 2,
        gb: 1000 ** 3, gib: 1024 ** 3,
        tb: 1000 ** 4, tib: 1024 ** 4,
    };
    return Math.round(val * (multipliers[unit] ?? 1));
}

export async function getDockerContainers(): Promise<DockerContainerData[]> {
    try {
        // Step 1: get all container IDs + names + image + status/state via docker ps
        const { stdout: psOut } = await execAsync(
            'docker ps -a --format "{{.ID}}|{{.Names}}|{{.Image}}|{{.Status}}|{{.State}}"',
            { timeout: 8000 }
        );

        const lines = psOut.trim().split('\n').filter(Boolean);
        if (lines.length === 0) return [];

        // Step 2: get stats (no-stream) only for running containers
        const statsMap: Map<string, { cpu: number; memUsed: number; memLimit: number; memPercent: number; netRx: number; netTx: number; pids: number }> = new Map();

        try {
            const { stdout: statsOut } = await execAsync(
                'docker stats --no-stream --format "{{.ID}}|{{.CPUPerc}}|{{.MemUsage}}|{{.MemPerc}}|{{.NetIO}}|{{.PIDs}}"',
                { timeout: 15000 }
            );

            for (const line of statsOut.trim().split('\n').filter(Boolean)) {
                const [sid, cpuPerc, memUsage, memPerc, netIO, pidsStr] = line.split('|');
                const [memUsedStr, memLimitStr] = (memUsage || '').split(' / ');
                const [netRxStr, netTxStr] = (netIO || '').split(' / ');

                statsMap.set(sid.trim(), {
                    cpu: parseFloat(cpuPerc) || 0,
                    memUsed: parseDockerSize(memUsedStr),
                    memLimit: parseDockerSize(memLimitStr),
                    memPercent: parseFloat(memPerc) || 0,
                    netRx: parseDockerSize(netRxStr),
                    netTx: parseDockerSize(netTxStr),
                    pids: parseInt(pidsStr) || 0,
                });
            }
        } catch {
            // docker stats may fail if no running containers — that's fine
        }

        return lines.map((line) => {
            const [id, name, image, status, state] = line.split('|');
            const shortId = id.trim();
            const stats = statsMap.get(shortId) ?? {
                cpu: 0, memUsed: 0, memLimit: 0, memPercent: 0, netRx: 0, netTx: 0, pids: 0,
            };
            return {
                id: shortId,
                name: (name || '').trim(),
                image: (image || '').trim(),
                status: (status || '').trim(),
                state: (state || '').trim().toLowerCase(),
                cpuPercent: Math.round(stats.cpu * 10) / 10,
                memUsed: stats.memUsed,
                memLimit: stats.memLimit,
                memPercent: Math.round(stats.memPercent * 10) / 10,
                netRx: stats.netRx,
                netTx: stats.netTx,
                pids: stats.pids,
            };
        });
    } catch {
        // Docker not installed or not accessible — return empty gracefully
        return [];
    }
}

export async function getAllMetrics(): Promise<SystemMetrics> {
    const [cpu, mem, disk, network, uptime, processes, docker] = await Promise.all([
        getCpuInfo(),
        getMemInfo(),
        getDiskInfo(),
        getNetworkInfo(),
        getUptimeInfo(),
        getProcessesInfo(),
        getDockerContainers(),
    ]);

    return {
        cpu,
        mem,
        disk,
        network,
        uptime,
        processes,
        docker,
        timestamp: Date.now(),
    };
}
