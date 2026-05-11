"use client";

import { useEffect, useState } from "react";

type Stats = {
  totalOrders: number;
  totalRevenue: number;
  activeVendors: number;
  pendingOrders: number;
  completedOrders: number;
  avgOrderValue: number;
};

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalRevenue: 0,
    activeVendors: 0,
    pendingOrders: 0,
    completedOrders: 0,
    avgOrderValue: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    try {
      const response = await fetch("/api/analytics");
      const data = await response.json();
      setStats({
        totalOrders: data.totalOrders,
        totalRevenue: data.totalRevenue,
        activeVendors: data.activeVendors,
        pendingOrders: data.pendingOrders,
        completedOrders: data.completedOrders,
        avgOrderValue: data.avgOrderValue,
      });
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    {
      label: "Total Orders",
      value: stats.totalOrders,
      icon: "📦",
      color: "from-[rgba(107,63,160,0.15)] to-[rgba(107,63,160,0.05)]",
      change: "+12%",
    },
    {
      label: "Total Revenue",
      value: `₹${(stats.totalRevenue / 100000).toFixed(1)}L`,
      icon: "💰",
      color: "from-[rgba(29,158,117,0.15)] to-[rgba(29,158,117,0.05)]",
      change: "+18%",
    },
    {
      label: "Active Vendors",
      value: stats.activeVendors,
      icon: "👥",
      color: "from-[rgba(255,200,87,0.15)] to-[rgba(255,200,87,0.05)]",
      change: "+3",
    },
    {
      label: "Avg Order Value",
      value: `₹${(stats.avgOrderValue / 1000).toFixed(1)}K`,
      icon: "📈",
      color: "from-[rgba(255,122,89,0.15)] to-[rgba(255,122,89,0.05)]",
      change: "+8%",
    },
  ];

  const recentActivity = [
    { id: 1, type: "order", message: "New order #ORD-A4B2 placed", time: "2 min ago", status: "new" },
    { id: 2, type: "vendor", message: "Vendor 'Dream Decor Studio' updated profile", time: "15 min ago", status: "info" },
    { id: 3, type: "order", message: "Order #ORD-X9F1 completed", time: "1 hour ago", status: "success" },
    { id: 4, type: "payment", message: "Payment received ₹18,500", time: "2 hours ago", status: "success" },
    { id: 5, type: "vendor", message: "New vendor 'Party Magic' registered", time: "3 hours ago", status: "new" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-[var(--text-muted)]">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white border border-[var(--border)] rounded-[20px] p-5 shadow-[0_4px_24px_rgba(26,15,46,0.06)]"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest mb-2">
                  {card.label}
                </div>
                <div className="font-playfair font-bold text-3xl">{card.value}</div>
                <div className="text-xs text-[#1D9E75] mt-2">{card.change} from last month</div>
              </div>
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center text-2xl`}
              >
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Order Status */}
        <div className="bg-white border border-[var(--border)] rounded-[20px] p-6 shadow-[0_4px_24px_rgba(26,15,46,0.06)]">
          <div className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest mb-4">
            Order Status
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Completed</span>
                <span className="font-semibold">{stats.completedOrders}</span>
              </div>
              <div className="h-2 bg-[rgba(26,15,46,0.06)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1D9E75] rounded-full"
                  style={{ width: `${(stats.completedOrders / stats.totalOrders) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Pending</span>
                <span className="font-semibold">{stats.pendingOrders}</span>
              </div>
              <div className="h-2 bg-[rgba(26,15,46,0.06)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--gold)] rounded-full"
                  style={{ width: `${(stats.pendingOrders / stats.totalOrders) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white border border-[var(--border)] rounded-[20px] p-6 shadow-[0_4px_24px_rgba(26,15,46,0.06)]">
          <div className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest mb-4">
            Recent Activity
          </div>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-[var(--cream)] transition-colors"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    activity.status === "new"
                      ? "bg-[var(--purple)]"
                      : activity.status === "success"
                        ? "bg-[#1D9E75]"
                        : "bg-[var(--gold)]"
                  }`}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium">{activity.message}</div>
                  <div className="text-xs text-[var(--text-muted)] mt-1">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-[var(--border)] rounded-[20px] p-6 shadow-[0_4px_24px_rgba(26,15,46,0.06)]">
        <div className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest mb-4">
          Quick Actions
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button className="px-4 py-3 rounded-xl border border-[var(--border)] text-sm font-medium hover:border-[var(--purple)] hover:bg-[rgba(107,63,160,0.05)] transition-colors">
            📝 Create Order
          </button>
          <button className="px-4 py-3 rounded-xl border border-[var(--border)] text-sm font-medium hover:border-[var(--purple)] hover:bg-[rgba(107,63,160,0.05)] transition-colors">
            ➕ Add Vendor
          </button>
          <button className="px-4 py-3 rounded-xl border border-[var(--border)] text-sm font-medium hover:border-[var(--purple)] hover:bg-[rgba(107,63,160,0.05)] transition-colors">
            📊 Export Data
          </button>
          <button className="px-4 py-3 rounded-xl border border-[var(--border)] text-sm font-medium hover:border-[var(--purple)] hover:bg-[rgba(107,63,160,0.05)] transition-colors">
            ⚙️ Settings
          </button>
        </div>
      </div>
    </div>
  );
}
