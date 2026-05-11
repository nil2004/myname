"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminAuthGuard from "@/components/AdminAuthGuard";
import VendorsManager from "@/components/admin/VendorsManager";
import OrdersManager from "@/components/admin/OrdersManager";
import MediaManager from "@/components/admin/MediaManager";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";
import TrustedPartnersManager from "@/components/admin/TrustedPartnersManager";
import EventsManager from "@/components/admin/EventsManager";
import RequestsManager from "@/components/admin/RequestsManager";
import VendorBookingsManager from "@/components/admin/VendorBookingsManager";
import BlogManager from "@/components/admin/BlogManager";
import SettingsManager from "@/components/admin/SettingsManager";
import DatabaseStatus from "@/components/admin/DatabaseStatus";
import VendorSuggestionsManager from "@/components/admin/VendorSuggestionsManager";
import EventGalleryManager from "@/components/admin/EventGalleryManager";
import TestimonialsManager from "@/components/admin/TestimonialsManager";

type AdminTab = 
  | "dashboard" 
  | "partners" 
  | "events" 
  | "vendors" 
  | "suggestions"
  | "requests" 
  | "bookings" 
  | "orders" 
  | "gallery"
  | "testimonials"
  | "media" 
  | "blog" 
  | "settings" 
  | "database";

export default function AdminPanel() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    router.push("/admin/login");
  };

  const tabs: { id: AdminTab; label: string; icon: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "partners", label: "Trusted Partners", icon: "🤝" },
    { id: "events", label: "Events", icon: "🎉" },
    { id: "vendors", label: "Vendors", icon: "👥" },
    { id: "suggestions", label: "Vendor Suggestions", icon: "🎯" },
    { id: "requests", label: "Requests", icon: "📝" },
    { id: "bookings", label: "Bookings", icon: "📅" },
    { id: "orders", label: "Orders", icon: "📦" },
    { id: "gallery", label: "Event Gallery", icon: "🖼️" },
    { id: "testimonials", label: "Testimonials", icon: "💬" },
    { id: "media", label: "Media Library", icon: "📁" },
    { id: "blog", label: "Blog", icon: "✍️" },
    { id: "settings", label: "Settings", icon: "⚙️" },
    { id: "database", label: "Database", icon: "💾" },
  ];

  return (
    <AdminAuthGuard>
    <div className="min-h-screen bg-[var(--cream)]">
      {/* Header */}
      <div className="bg-white border-b border-[var(--border)] sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--purple)] to-[var(--gold)] flex items-center justify-center">
                <span className="text-white font-bold text-lg">U</span>
              </div>
              <div>
                <div className="font-playfair font-bold text-xl">Utsav AI</div>
                <div className="text-xs text-[var(--text-muted)]">Admin Panel</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={handleLogout}
                className="px-4 py-2 rounded-full border border-[var(--border)] text-sm hover:border-[var(--purple)] transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-[var(--border)] overflow-x-auto">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium transition-colors relative whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-[var(--purple)]"
                    : "text-[var(--text-muted)] hover:text-[var(--deep)]"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--purple)]" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "dashboard" && <AnalyticsDashboard />}
        {activeTab === "partners" && <TrustedPartnersManager />}
        {activeTab === "events" && <EventsManager />}
        {activeTab === "vendors" && <VendorsManager />}
        {activeTab === "suggestions" && <VendorSuggestionsManager />}
        {activeTab === "requests" && <RequestsManager />}
        {activeTab === "bookings" && <VendorBookingsManager />}
        {activeTab === "orders" && <OrdersManager />}
        {activeTab === "gallery" && <EventGalleryManager />}
        {activeTab === "testimonials" && <TestimonialsManager />}
        {activeTab === "media" && <MediaManager />}
        {activeTab === "blog" && <BlogManager />}
        {activeTab === "settings" && <SettingsManager />}
        {activeTab === "database" && <DatabaseStatus />}
      </div>
    </div>
    </AdminAuthGuard>
  );
}
