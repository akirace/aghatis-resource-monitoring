import si from 'systeminformation';
import type { CpuData, MemData, DiskData, NetworkData, UptimeData, SystemMetrics } from './types';

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

export async function getAllMetrics(): Promise<SystemMetrics> {
    const [cpu, mem, disk, network, uptime] = await Promise.all([
        getCpuInfo(),
        getMemInfo(),
        getDiskInfo(),
        getNetworkInfo(),
        getUptimeInfo(),
    ]);

    return {
        cpu,
        mem,
        disk,
        network,
        uptime,
        timestamp: Date.now(),
    };
}
