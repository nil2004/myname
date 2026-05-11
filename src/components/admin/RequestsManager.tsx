"use client";

import { useState, useEffect } from "react";

type RequestStatus = "pending" | "in-progress" | "resolved" | "rejected";

type Request = {
  id: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  occasion: string;
  ageGroup?: string;
  budget?: number;
  guestCount?: number;
  locationType?: string;
  city?: string;
  theme?: string;
  addOns: string[];
  partyDate?: string;
  specifications?: string;
  status: RequestStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export default function RequestsManager() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<RequestStatus | "all">("all");

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    try {
      setLoading(true);
      const response = await fetch("/api/requests");
      const data = await response.json();
      
      if (response.ok) {
        setRequests(data.requests || []);
      } else {
        console.error("Failed to fetch requests:", data.error);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.customerEmail && req.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
      req.customerPhone.includes(searchQuery);
    const matchesStatus = filterStatus === "all" || req.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  function getStatusColor(status: RequestStatus) {
    switch (status) {
      case "resolved":
        return "bg-[rgba(29,158,117,0.12)] text-[#1D9E75]";
      case "rejected":
        return "bg-[rgba(255,122,89,0.12)] text-[var(--coral)]";
      case "in-progress":
        return "bg-[rgba(255,200,87,0.12)] text-[var(--gold)]";
      default:
        return "bg-[rgba(107,63,160,0.12)] text-[var(--purple)]";
    }
  }

  async function handleStatusChange(requestId: string, newStatus: RequestStatus) {
    const request = requests.find((r) => r.id === requestId);
    if (!request) return;

    try {
      const response = await fetch("/api/requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...request, status: newStatus }),
      });

      if (response.ok) {
        setRequests((prev) =>
          prev.map((req) => (req.id === requestId ? { ...req, status: newStatus } : req))
        );
      } else {
        alert("Failed to update request status");
      }
    } catch (error) {
      console.error("Error updating request:", error);
      alert("An error occurred while updating");
    }
  }

  async function handleDeleteRequest(requestId: string, customerName: string) {
    // Confirm deletion
    const confirmed = window.confirm(
      `Are you sure you want to delete the request from ${customerName}?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/requests?id=${requestId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Remove from local state
        setRequests((prev) => prev.filter((req) => req.id !== requestId));
        alert("Request deleted successfully");
      } else {
        const data = await response.json();
        alert(`Failed to delete request: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error deleting request:", error);
      alert("An error occurred while deleting the request");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-[var(--text-muted)]">Loading requests...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[var(--border)] rounded-[20px] p-6 shadow-[0_4px_24px_rgba(26,15,46,0.06)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="font-playfair font-bold text-2xl">Customer Requests</div>
            <div className="text-sm text-[var(--text-muted)] mt-1">
              {filteredRequests.length} requests found
            </div>
          </div>
          <button
            onClick={fetchRequests}
            className="px-5 py-2.5 rounded-full border border-[var(--border)] text-sm font-medium hover:border-[var(--purple)] transition-colors"
          >
            🔄 Refresh
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search requests..."
            className="bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as RequestStatus | "all")}
            className="bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredRequests.map((request) => (
          <div
            key={request.id}
            className="bg-white border border-[var(--border)] rounded-[20px] p-5 shadow-[0_4px_24px_rgba(26,15,46,0.06)]"
          >
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold text-lg">{request.customerName}</div>
                    <div className="text-sm text-[var(--text-muted)] mt-0.5">
                      {request.occasion} • {request.theme || "No theme"}
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(request.status)}`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1).replace("-", " ")}
                  </span>
                </div>

                <div className="space-y-2 text-sm mb-3">
                  <div>
                    <span className="text-[var(--text-muted)]">Phone:</span>{" "}
                    <span className="font-medium">{request.customerPhone}</span>
                  </div>
                  {request.customerEmail && (
                    <div>
                      <span className="text-[var(--text-muted)]">Email:</span>{" "}
                      <span className="font-medium">{request.customerEmail}</span>
                    </div>
                  )}
                  {request.partyDate && (
                    <div>
                      <span className="text-[var(--text-muted)]">Party Date:</span>{" "}
                      <span className="font-medium">
                        {new Date(request.partyDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                  {request.budget && (
                    <div>
                      <span className="text-[var(--text-muted)]">Budget:</span>{" "}
                      <span className="font-medium">₹{request.budget.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  {request.guestCount && (
                    <div>
                      <span className="text-[var(--text-muted)]">Guests:</span>{" "}
                      <span className="font-medium">{request.guestCount}</span>
                    </div>
                  )}
                  {request.city && (
                    <div>
                      <span className="text-[var(--text-muted)]">City:</span>{" "}
                      <span className="font-medium">{request.city}</span>
                    </div>
                  )}
                  {request.addOns.length > 0 && (
                    <div>
                      <span className="text-[var(--text-muted)]">Vendors:</span>{" "}
                      <span className="font-medium">{request.addOns.join(", ")}</span>
                    </div>
                  )}
                  {request.specifications && (
                    <div>
                      <span className="text-[var(--text-muted)]">Specifications:</span>{" "}
                      <span className="font-medium">{request.specifications}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-[var(--text-muted)]">Received:</span>{" "}
                    <span>
                      {new Date(request.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="lg:w-48 space-y-2">
                <select
                  value={request.status}
                  onChange={(e) => handleStatusChange(request.id, e.target.value as RequestStatus)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border)] text-xs font-medium outline-none focus:border-[var(--purple)] transition-colors"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <button className="w-full px-3 py-2 rounded-xl border border-[var(--border)] text-xs font-medium hover:border-[var(--purple)] hover:bg-[rgba(107,63,160,0.05)] transition-colors">
                  📧 Reply
                </button>
                <button
                  onClick={() => handleDeleteRequest(request.id, request.customerName)}
                  className="w-full px-3 py-2 rounded-xl border border-[rgba(255,122,89,0.30)] bg-[rgba(255,122,89,0.05)] text-[var(--coral)] text-xs font-medium hover:bg-[rgba(255,122,89,0.12)] hover:border-[rgba(255,122,89,0.50)] transition-colors"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <div className="bg-white border border-[var(--border)] rounded-[20px] p-12 text-center">
          <div className="text-4xl mb-3">📝</div>
          <div className="text-lg font-medium text-[var(--text-muted)]">No requests found</div>
          <div className="text-sm text-[var(--text-muted)] mt-1">
            {loading ? "Loading..." : "Try adjusting your search or filters"}
          </div>
        </div>
      )}
    </div>
  );
}
