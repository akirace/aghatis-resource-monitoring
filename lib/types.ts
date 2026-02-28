export interface CpuData {
  manufacturer: string;
  brand: string;
  speed: number;
  cores: number;
  physicalCores: number;
  currentLoad: number;
  coreLoads: number[];
}

export interface MemData {
  total: number;
  used: number;
  free: number;
  usedPercent: number;
}

export interface DiskData {
  fs: string;
  type: string;
  mount: string;
  size: number;
  used: number;
  available: number;
  usedPercent: number;
}

export interface NetworkData {
  iface: string;
  rxBytesPerSec: number;
  txBytesPerSec: number;
  rxTotal: number;
  txTotal: number;
}

export interface UptimeData {
  uptime: number; // seconds
  formattedUptime: string;
  hostname: string;
  platform: string;
  distro: string;
  release: string;
}

export interface SystemMetrics {
  cpu: CpuData;
  mem: MemData;
  disk: DiskData[];
  network: NetworkData[];
  uptime: UptimeData;
  timestamp: number;
}

export type StatusLevel = 'normal' | 'high' | 'critical';

export function getStatusLevel(percent: number): StatusLevel {
  if (percent >= 90) return 'critical';
  if (percent >= 70) return 'high';
  return 'normal';
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}
