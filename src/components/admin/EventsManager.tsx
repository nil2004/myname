"use client";

import { useState, useEffect } from "react";

type EventStatus = "upcoming" | "ongoing" | "completed" | "cancelled";

type Event = {
  id: string;
  title: string;
  customerName: string;
  date: string;
  time: string;
  location: string;
  city: string;
  theme: string;
  guestCount: number;
  budget: number;
  status: EventStatus;
  vendors: string[];
  notes: string;
};

export default function EventsManager() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<EventStatus | "all">("all");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      const response = await fetch("/api/events");
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || event.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  function getStatusColor(status: EventStatus) {
    switch (status) {
      case "completed":
        return "bg-[rgba(29,158,117,0.12)] text-[#1D9E75]";
      case "cancelled":
        return "bg-[rgba(255,122,89,0.12)] text-[var(--coral)]";
      case "ongoing":
        return "bg-[rgba(255,200,87,0.12)] text-[var(--gold)]";
      default:
        return "bg-[rgba(107,63,160,0.12)] text-[var(--purple)]";
    }
  }

  function handleStatusChange(eventId: string, newStatus: EventStatus) {
    setEvents((prev) =>
      prev.map((event) => (event.id === eventId ? { ...event, status: newStatus } : event))
    );
    // Update on server
    const event = events.find((e) => e.id === eventId);
    if (event) {
      fetch("/api/events", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...event, status: newStatus }),
      });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-[var(--text-muted)]">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[var(--border)] rounded-[20px] p-6 shadow-[0_4px_24px_rgba(26,15,46,0.06)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="font-playfair font-bold text-2xl">Events Management</div>
            <div className="text-sm text-[var(--text-muted)] mt-1">
              {filteredEvents.length} events found
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode(viewMode === "list" ? "calendar" : "list")}
              className="px-5 py-2.5 rounded-full border border-[var(--border)] text-sm font-medium hover:border-[var(--purple)] transition-colors"
            >
              {viewMode === "list" ? "📅 Calendar" : "📋 List"} View
            </button>
            <button className="px-5 py-2.5 rounded-full bg-[var(--purple)] text-white text-sm font-medium hover:bg-[var(--purple-light)] transition-colors">
              ➕ Add Event
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, customer, or city..."
            className="flex-1 bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as EventStatus | "all")}
            className="bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
          >
            <option value="all">All Statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(["upcoming", "ongoing", "completed", "cancelled"] as EventStatus[]).map((status) => (
          <div key={status} className="bg-white border border-[var(--border)] rounded-[16px] p-4">
            <div className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1">
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
            <div className="font-playfair font-bold text-2xl">
              {events.filter((e) => e.status === status).length}
            </div>
          </div>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredEvents.map((event) => (
          <div
            key={event.id}
            className="bg-white border border-[var(--border)] rounded-[20px] p-5 shadow-[0_4px_24px_rgba(26,15,46,0.06)] hover:shadow-[0_8px_32px_rgba(26,15,46,0.10)] transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="font-playfair font-bold text-lg">{event.title}</div>
                <div className="text-sm text-[var(--text-muted)] mt-0.5">{event.customerName}</div>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(event.status)}`}>
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </span>
            </div>

            <div className="space-y-2 mb-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-[var(--text-muted)]">📅</span>
                <span>
                  {new Date(event.date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  · {event.time}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[var(--text-muted)]">📍</span>
                <span>
                  {event.location} · {event.city}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[var(--text-muted)]">🎨</span>
                <span>{event.theme} Theme</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[var(--text-muted)]">👥</span>
                <span>{event.guestCount} Guests</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[var(--text-muted)]">💰</span>
                <span className="font-semibold">₹{event.budget.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-2">
                Vendors ({event.vendors.length})
              </div>
              <div className="flex flex-wrap gap-1.5">
                {event.vendors.map((vendor, idx) => (
                  <span
                    key={idx}
                    className="text-[0.7rem] px-2 py-0.5 rounded-full bg-[rgba(107,63,160,0.08)] text-[var(--purple)]"
                  >
                    {vendor}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedEvent(event)}
                className="flex-1 px-3 py-2 rounded-xl border border-[var(--border)] text-xs font-medium hover:border-[var(--purple)] hover:bg-[rgba(107,63,160,0.05)] transition-colors"
              >
                👁️ View Details
              </button>
              <select
                value={event.status}
                onChange={(e) => handleStatusChange(event.id, e.target.value as EventStatus)}
                className="px-3 py-2 rounded-xl border border-[var(--border)] text-xs font-medium outline-none focus:border-[var(--purple)] transition-colors"
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="bg-white border border-[var(--border)] rounded-[20px] p-12 text-center">
          <div className="text-4xl mb-3">🎉</div>
          <div className="text-lg font-medium text-[var(--text-muted)]">No events found</div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <EventDetailsModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
}

function EventDetailsModal({ event, onClose }: { event: Event; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[24px] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[var(--border)] px-6 py-4 rounded-t-[24px]">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-playfair font-bold text-xl">{event.title}</div>
              <div className="text-sm text-[var(--text-muted)] mt-0.5">Event Details</div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-[var(--cream)] flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-[var(--cream)] rounded-xl p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-muted)]">Customer</span>
              <span className="font-medium">{event.customerName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-muted)]">Date & Time</span>
              <span className="font-medium">
                {new Date(event.date).toLocaleDateString("en-IN")} · {event.time}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-muted)]">Location</span>
              <span className="font-medium">
                {event.location} · {event.city}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-muted)]">Theme</span>
              <span className="font-medium">{event.theme}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-muted)]">Guest Count</span>
              <span className="font-medium">{event.guestCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-muted)]">Budget</span>
              <span className="font-semibold">₹{event.budget.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest mb-3">
              Assigned Vendors
            </div>
            <div className="space-y-2">
              {event.vendors.map((vendor, idx) => (
                <div key={idx} className="bg-[var(--cream)] rounded-xl p-3 flex items-center justify-between">
                  <span className="font-medium text-sm">{vendor}</span>
                  <button className="text-xs px-3 py-1 rounded-full border border-[var(--border)] hover:border-[var(--purple)] transition-colors">
                    Contact
                  </button>
                </div>
              ))}
            </div>
          </div>

          {event.notes && (
            <div>
              <div className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest mb-2">
                Notes
              </div>
              <div className="bg-[var(--cream)] rounded-xl p-4 text-sm">{event.notes}</div>
            </div>
          )}

          <div className="flex gap-3">
            <button className="flex-1 px-5 py-2.5 rounded-full border border-[var(--border)] text-sm font-medium hover:border-[var(--purple)] transition-colors">
              ✏️ Edit Event
            </button>
            <button className="flex-1 px-5 py-2.5 rounded-full bg-[var(--purple)] text-white text-sm font-medium hover:bg-[var(--purple-light)] transition-colors">
              📄 Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
