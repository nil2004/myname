"use client";

import { useState } from "react";

export default function SettingsManager() {
  const [settings, setSettings] = useState({
    siteName: "Utsav AI",
    siteEmail: "contact@utsavai.com",
    sitePhone: "+91 98765 43210",
    currency: "INR",
    timezone: "Asia/Kolkata",
    maintenanceMode: false,
    allowRegistration: true,
    emailNotifications: true,
    smsNotifications: true,
    platformFee: 299,
    deliveryFee: 500,
    minOrderValue: 5000,
  });

  function handleSave() {
    alert("Settings saved successfully!");
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[var(--border)] rounded-[20px] p-6">
        <div className="font-playfair font-bold text-2xl mb-6">Platform Settings</div>

        <div className="space-y-6">
          {/* General Settings */}
          <div>
            <div className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-widest mb-4">
              General
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Site Name</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Contact Email</label>
                <input
                  type="email"
                  value={settings.siteEmail}
                  onChange={(e) => setSettings({ ...settings, siteEmail: e.target.value })}
                  className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Contact Phone</label>
                <input
                  type="tel"
                  value={settings.sitePhone}
                  onChange={(e) => setSettings({ ...settings, sitePhone: e.target.value })}
                  className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Currency</label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pricing Settings */}
          <div>
            <div className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-widest mb-4">
              Pricing
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Platform Fee (₹)</label>
                <input
                  type="number"
                  value={settings.platformFee}
                  onChange={(e) => setSettings({ ...settings, platformFee: Number(e.target.value) })}
                  className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Delivery Fee (₹)</label>
                <input
                  type="number"
                  value={settings.deliveryFee}
                  onChange={(e) => setSettings({ ...settings, deliveryFee: Number(e.target.value) })}
                  className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Min Order Value (₹)</label>
                <input
                  type="number"
                  value={settings.minOrderValue}
                  onChange={(e) => setSettings({ ...settings, minOrderValue: Number(e.target.value) })}
                  className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Feature Toggles */}
          <div>
            <div className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-widest mb-4">
              Features
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <div>
                  <div className="font-medium text-sm">Maintenance Mode</div>
                  <div className="text-xs text-[var(--text-muted)]">Disable public access temporarily</div>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowRegistration}
                  onChange={(e) => setSettings({ ...settings, allowRegistration: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <div>
                  <div className="font-medium text-sm">Allow User Registration</div>
                  <div className="text-xs text-[var(--text-muted)]">Let new users sign up</div>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <div>
                  <div className="font-medium text-sm">Email Notifications</div>
                  <div className="text-xs text-[var(--text-muted)]">Send email updates to users</div>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.smsNotifications}
                  onChange={(e) => setSettings({ ...settings, smsNotifications: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <div>
                  <div className="font-medium text-sm">SMS Notifications</div>
                  <div className="text-xs text-[var(--text-muted)]">Send SMS updates to users</div>
                </div>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              className="px-6 py-3 rounded-full bg-[var(--purple)] text-white font-medium hover:bg-[var(--purple-light)] transition-colors"
            >
              💾 Save Settings
            </button>
            <button className="px-6 py-3 rounded-full border border-[var(--border)] font-medium hover:border-[var(--purple)] transition-colors">
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
