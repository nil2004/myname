"use client";

import { useState, useEffect } from "react";

type TableStats = {
  name: string;
  rows: number;
  size: string;
  lastUpdated: string;
};

type Log = {
  id: number;
  type: "info" | "warning" | "error";
  message: string;
  time: string;
};

type Stats = {
  status: string;
  uptime: string;
  connections: number;
  maxConnections: number;
  storageUsed: string;
  storageTotal: string;
  backupStatus: string;
  lastBackup: string;
  totalRows?: number;
  totalTables?: number;
};

export default function DatabaseStatus() {
  const [stats, setStats] = useState<Stats>({
    status: "loading",
    uptime: "...",
    connections: 0,
    maxConnections: 100,
    storageUsed: "...",
    storageTotal: "500 MB",
    backupStatus: "unknown",
    lastBackup: new Date().toISOString(),
  });

  const [tables, setTables] = useState<TableStats[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    fetchDatabaseStats();
  }, []);

  async function fetchDatabaseStats() {
    try {
      setLoading(true);
      const response = await fetch("/api/database");
      const data = await response.json();

      if (response.ok) {
        setStats(data.stats);
        setTables(data.tables);
        setLogs(data.logs);
        setLastRefresh(new Date());
      } else {
        console.error("Failed to fetch database stats");
      }
    } catch (error) {
      console.error("Error fetching database stats:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleBackup() {
    alert("Backup initiated! This will take a few minutes.");
  }

  function handleOptimize() {
    alert("Database optimization started!");
  }

  function handleRefresh() {
    fetchDatabaseStats();
  }

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="bg-white border border-[var(--border)] rounded-[20px] p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="font-playfair font-bold text-2xl">Database Status</div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-[var(--text-muted)]">
              Last refresh: {lastRefresh.toLocaleTimeString()}
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-2 rounded-full border border-[var(--border)] text-xs font-medium hover:border-[var(--purple)] transition-colors disabled:opacity-50"
            >
              {loading ? "⏳ Loading..." : "🔄 Refresh"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-[var(--cream)] rounded-xl p-4">
            <div className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1">
              Status
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  stats.status === "healthy"
                    ? "bg-[#1D9E75]"
                    : stats.status === "loading"
                    ? "bg-[var(--gold)]"
                    : "bg-[var(--coral)]"
                }`}
              />
              <div className="font-semibold capitalize">{stats.status}</div>
            </div>
          </div>
          <div className="bg-[var(--cream)] rounded-xl p-4">
            <div className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1">
              Uptime
            </div>
            <div className="font-semibold">{stats.uptime}</div>
          </div>
          <div className="bg-[var(--cream)] rounded-xl p-4">
            <div className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1">
              Connections
            </div>
            <div className="font-semibold">
              {stats.connections}/{stats.maxConnections}
            </div>
          </div>
          <div className="bg-[var(--cream)] rounded-xl p-4">
            <div className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1">
              Storage
            </div>
            <div className="font-semibold">
              {stats.storageUsed}/{stats.storageTotal}
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        {stats.totalRows !== undefined && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-[rgba(107,63,160,0.08)] to-[rgba(255,200,87,0.08)] rounded-xl p-4">
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1">
                Total Records
              </div>
              <div className="font-bold text-2xl text-[var(--purple)]">
                {stats.totalRows.toLocaleString()}
              </div>
            </div>
            <div className="bg-gradient-to-br from-[rgba(255,200,87,0.08)] to-[rgba(107,63,160,0.08)] rounded-xl p-4">
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1">
                Active Tables
              </div>
              <div className="font-bold text-2xl text-[var(--gold)]">
                {stats.totalTables}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleBackup}
            className="px-5 py-2.5 rounded-full bg-[var(--purple)] text-white text-sm font-medium hover:bg-[var(--purple-light)] transition-colors"
          >
            💾 Backup Now
          </button>
          <button
            onClick={handleOptimize}
            className="px-5 py-2.5 rounded-full border border-[var(--border)] text-sm font-medium hover:border-[var(--purple)] transition-colors"
          >
            ⚡ Optimize
          </button>
          <button className="px-5 py-2.5 rounded-full border border-[var(--border)] text-sm font-medium hover:border-[var(--purple)] transition-colors">
            📊 Export Stats
          </button>
        </div>
      </div>

      {/* Tables */}
      <div className="bg-white border border-[var(--border)] rounded-[20px] p-6">
        <div className="font-semibold text-lg mb-4">Database Tables</div>
        {loading ? (
          <div className="text-center py-8 text-[var(--text-muted)]">Loading table statistics...</div>
        ) : tables.length === 0 ? (
          <div className="text-center py-8 text-[var(--text-muted)]">No tables found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--cream)] border-b border-[var(--border)]">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest">
                    Table
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest">
                    Rows
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest">
                    Size
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest">
                    Last Updated
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {tables.map((table) => (
                  <tr key={table.name} className="hover:bg-[var(--cream)] transition-colors">
                    <td className="px-4 py-3 font-medium">{table.name}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full bg-[rgba(107,63,160,0.08)] text-[var(--purple)] text-sm font-medium">
                        {table.rows.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">{table.size}</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-muted)]">
                      {new Date(table.lastUpdated).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Logs */}
      <div className="bg-white border border-[var(--border)] rounded-[20px] p-6">
        <div className="font-semibold text-lg mb-4">Recent Activity</div>
        {loading ? (
          <div className="text-center py-8 text-[var(--text-muted)]">Loading activity logs...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-[var(--text-muted)]">No recent activity</div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-[var(--cream)] transition-colors"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    log.type === "info"
                      ? "bg-[#1D9E75]"
                      : log.type === "warning"
                      ? "bg-[var(--gold)]"
                      : "bg-[var(--coral)]"
                  }`}
                />
                <div className="flex-1">
                  <div className="text-sm">{log.message}</div>
                  <div className="text-xs text-[var(--text-muted)] mt-1">
                    {new Date(log.time).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
