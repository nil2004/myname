"use client";

import { useEffect, useState } from "react";

type OrderStatus =
  | "Booked"
  | "Assigned"
  | "Vendors Confirmed"
  | "On the way"
  | "Setup started"
  | "Completed"
  | "Cancelled";

type Order = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  occasion: string;
  date: string;
  time: string;
  city: string;
  theme: string;
  total: number;
  paidAmount: number;
  dueAmount: number;
  status: OrderStatus;
  createdAt: string;
  vendors: { category: string; name: string }[];
};

export default function OrdersManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "all">("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      setLoading(true);
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery);
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const statuses: (OrderStatus | "all")[] = [
    "all",
    "Booked",
    "Assigned",
    "Vendors Confirmed",
    "On the way",
    "Setup started",
    "Completed",
    "Cancelled",
  ];

  function getStatusColor(status: OrderStatus) {
    switch (status) {
      case "Completed":
        return "bg-[rgba(29,158,117,0.12)] text-[#1D9E75]";
      case "Cancelled":
        return "bg-[rgba(255,122,89,0.12)] text-[var(--coral)]";
      case "Booked":
        return "bg-[rgba(107,63,160,0.12)] text-[var(--purple)]";
      default:
        return "bg-[rgba(255,200,87,0.12)] text-[var(--gold)]";
    }
  }

  function handleStatusChange(orderId: string, newStatus: OrderStatus) {
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order))
    );
    
    // Update in database
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...order, status: newStatus }),
      }).catch((err) => console.error("Failed to update order:", err));
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-[var(--text-muted)]">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[var(--border)] rounded-[20px] p-6 shadow-[0_4px_24px_rgba(26,15,46,0.06)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="font-playfair font-bold text-2xl">Orders Management</div>
            <div className="text-sm text-[var(--text-muted)] mt-1">
              {filteredOrders.length} orders found
            </div>
          </div>
          <button className="px-5 py-2.5 rounded-full bg-[var(--purple)] text-white text-sm font-medium hover:bg-[var(--purple-light)] transition-colors">
            📊 Export Orders
          </button>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order ID, customer name, or phone..."
            className="flex-1 bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as OrderStatus | "all")}
            className="bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status === "all" ? "All Statuses" : status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white border border-[var(--border)] rounded-[20px] p-5 shadow-[0_4px_24px_rgba(26,15,46,0.06)] hover:shadow-[0_8px_32px_rgba(26,15,46,0.10)] transition-shadow"
          >
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              {/* Order Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-playfair font-bold text-lg">{order.id}</div>
                    <div className="text-sm text-[var(--text-muted)] mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-[var(--text-muted)]">Customer:</span>
                    <span className="font-medium ml-2">{order.customerName}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)]">Phone:</span>
                    <span className="font-medium ml-2">{order.customerPhone}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)]">Event Date:</span>
                    <span className="font-medium ml-2">
                      {new Date(order.date).toLocaleDateString("en-IN")} · {order.time}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)]">Theme:</span>
                    <span className="font-medium ml-2">{order.theme}</span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {order.vendors.map((vendor, idx) => (
                    <span
                      key={idx}
                      className="text-[0.7rem] px-2 py-1 rounded-full bg-[rgba(107,63,160,0.08)] text-[var(--purple)]"
                    >
                      {vendor.category}: {vendor.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Payment & Actions */}
              <div className="lg:w-64 space-y-3">
                <div className="bg-[var(--cream)] rounded-xl p-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-[var(--text-muted)]">Total</span>
                    <span className="font-semibold">₹{order.total.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-[var(--text-muted)]">Paid</span>
                    <span className="font-semibold text-[#1D9E75]">
                      ₹{order.paidAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-muted)]">Due</span>
                    <span className="font-semibold text-[var(--coral)]">
                      ₹{order.dueAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="flex-1 px-3 py-2 rounded-xl border border-[var(--border)] text-xs font-medium hover:border-[var(--purple)] hover:bg-[rgba(107,63,160,0.05)] transition-colors"
                  >
                    👁️ View
                  </button>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                    className="flex-1 px-3 py-2 rounded-xl border border-[var(--border)] text-xs font-medium outline-none focus:border-[var(--purple)] transition-colors"
                  >
                    {statuses.filter((s) => s !== "all").map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="bg-white border border-[var(--border)] rounded-[20px] p-12 text-center">
          <div className="text-4xl mb-3">📦</div>
          <div className="text-lg font-medium text-[var(--text-muted)]">No orders found</div>
          <div className="text-sm text-[var(--text-muted)] mt-1">
            Try adjusting your search or filters
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}

function OrderDetailsModal({ order, onClose }: { order: Order; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[24px] max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[var(--border)] px-6 py-4 rounded-t-[24px]">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-playfair font-bold text-xl">{order.id}</div>
              <div className="text-sm text-[var(--text-muted)] mt-0.5">Order Details</div>
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
          {/* Customer Info */}
          <div>
            <div className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest mb-3">
              Customer Information
            </div>
            <div className="bg-[var(--cream)] rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Name</span>
                <span className="font-medium">{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Phone</span>
                <span className="font-medium">{order.customerPhone}</span>
              </div>
              {order.customerEmail && (
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Email</span>
                  <span className="font-medium">{order.customerEmail}</span>
                </div>
              )}
            </div>
          </div>

          {/* Event Details */}
          <div>
            <div className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest mb-3">
              Event Details
            </div>
            <div className="bg-[var(--cream)] rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Occasion</span>
                <span className="font-medium">{order.occasion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Theme</span>
                <span className="font-medium">{order.theme}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Date & Time</span>
                <span className="font-medium">
                  {new Date(order.date).toLocaleDateString("en-IN")} · {order.time}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">City</span>
                <span className="font-medium">{order.city}</span>
              </div>
            </div>
          </div>

          {/* Vendors */}
          <div>
            <div className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest mb-3">
              Assigned Vendors
            </div>
            <div className="space-y-2">
              {order.vendors.map((vendor, idx) => (
                <div key={idx} className="bg-[var(--cream)] rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{vendor.name}</div>
                    <div className="text-xs text-[var(--text-muted)] mt-0.5">{vendor.category}</div>
                  </div>
                  <button className="text-xs px-3 py-1 rounded-full border border-[var(--border)] hover:border-[var(--purple)] transition-colors">
                    Contact
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Payment */}
          <div>
            <div className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest mb-3">
              Payment Details
            </div>
            <div className="bg-[var(--deep)] text-white rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Total Amount</span>
                <span className="font-semibold">₹{order.total.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Paid</span>
                <span className="font-semibold">₹{order.paidAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-white/20">
                <span className="text-white/70">Due</span>
                <span className="font-bold text-lg">₹{order.dueAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button className="flex-1 px-5 py-2.5 rounded-full border border-[var(--border)] text-sm font-medium hover:border-[var(--purple)] transition-colors">
              📞 Contact Customer
            </button>
            <button className="flex-1 px-5 py-2.5 rounded-full bg-[var(--purple)] text-white text-sm font-medium hover:bg-[var(--purple-light)] transition-colors">
              📄 Generate Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
