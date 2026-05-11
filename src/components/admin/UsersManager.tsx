"use client";

import { useState, useEffect } from "react";

type UserRole = "customer" | "vendor" | "admin";
type UserStatus = "active" | "suspended" | "pending";

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  joinedAt: string;
  lastActive: string;
  ordersCount: number;
  totalSpent: number;
  city: string;
  verified: boolean;
};

export default function UsersManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<UserRole | "all">("all");
  const [filterStatus, setFilterStatus] = useState<UserStatus | "all">("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery);
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  function getRoleColor(role: UserRole) {
    switch (role) {
      case "admin":
        return "bg-[rgba(255,122,89,0.12)] text-[var(--coral)]";
      case "vendor":
        return "bg-[rgba(107,63,160,0.12)] text-[var(--purple)]";
      default:
        return "bg-[rgba(29,158,117,0.12)] text-[#1D9E75]";
    }
  }

  function getStatusColor(status: UserStatus) {
    switch (status) {
      case "active":
        return "bg-[rgba(29,158,117,0.12)] text-[#1D9E75]";
      case "suspended":
        return "bg-[rgba(255,122,89,0.12)] text-[var(--coral)]";
      default:
        return "bg-[rgba(255,200,87,0.12)] text-[var(--gold)]";
    }
  }

  function handleStatusChange(userId: string, newStatus: UserStatus) {
    setUsers((prev) =>
      prev.map((user) => (user.id === userId ? { ...user, status: newStatus } : user))
    );
    // Update on server
    fetch("/api/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(users.find((u) => u.id === userId)),
    });
  }

  function handleDelete(userId: string) {
    if (confirm("Are you sure you want to delete this user?")) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      // Delete on server
      fetch(`/api/users?id=${userId}`, { method: "DELETE" });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-[var(--text-muted)]">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[var(--border)] rounded-[20px] p-6 shadow-[0_4px_24px_rgba(26,15,46,0.06)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="font-playfair font-bold text-2xl">Users Management</div>
            <div className="text-sm text-[var(--text-muted)] mt-1">
              {filteredUsers.length} users found
            </div>
          </div>
          <button className="px-5 py-2.5 rounded-full bg-[var(--purple)] text-white text-sm font-medium hover:bg-[var(--purple-light)] transition-colors">
            ➕ Add User
          </button>
        </div>

        {/* Filters */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
          />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as UserRole | "all")}
            className="bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
          >
            <option value="all">All Roles</option>
            <option value="customer">Customer</option>
            <option value="vendor">Vendor</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as UserStatus | "all")}
            className="bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[var(--border)] rounded-[16px] p-4">
          <div className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1">
            Total Users
          </div>
          <div className="font-playfair font-bold text-2xl">{users.length}</div>
        </div>
        <div className="bg-white border border-[var(--border)] rounded-[16px] p-4">
          <div className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1">
            Customers
          </div>
          <div className="font-playfair font-bold text-2xl">
            {users.filter((u) => u.role === "customer").length}
          </div>
        </div>
        <div className="bg-white border border-[var(--border)] rounded-[16px] p-4">
          <div className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1">
            Vendors
          </div>
          <div className="font-playfair font-bold text-2xl">
            {users.filter((u) => u.role === "vendor").length}
          </div>
        </div>
        <div className="bg-white border border-[var(--border)] rounded-[16px] p-4">
          <div className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1">
            Active
          </div>
          <div className="font-playfair font-bold text-2xl">
            {users.filter((u) => u.status === "active").length}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-[var(--border)] rounded-[20px] overflow-hidden shadow-[0_4px_24px_rgba(26,15,46,0.06)]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--cream)] border-b border-[var(--border)]">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest">
                  User
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest">
                  Contact
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest">
                  Role
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest">
                  Activity
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-[var(--cream)] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--purple)] to-[var(--gold)] flex items-center justify-center text-white font-semibold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{user.name}</div>
                        <div className="text-xs text-[var(--text-muted)]">{user.city}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">{user.email}</div>
                    <div className="text-xs text-[var(--text-muted)]">{user.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getRoleColor(user.role)}`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.status}
                      onChange={(e) => handleStatusChange(user.id, e.target.value as UserStatus)}
                      className={`text-xs px-2 py-1 rounded-full font-medium border-0 outline-none ${getStatusColor(user.status)}`}
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      {user.role === "customer" ? `${user.ordersCount} orders` : `${user.ordersCount} bookings`}
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      {new Date(user.lastActive).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs font-medium hover:border-[var(--purple)] hover:bg-[rgba(107,63,160,0.05)] transition-colors"
                      >
                        👁️ View
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs font-medium hover:border-[var(--coral)] hover:bg-[rgba(255,122,89,0.05)] transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredUsers.length === 0 && (
        <div className="bg-white border border-[var(--border)] rounded-[20px] p-12 text-center">
          <div className="text-4xl mb-3">👤</div>
          <div className="text-lg font-medium text-[var(--text-muted)]">No users found</div>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <UserDetailsModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
}

function UserDetailsModal({ user, onClose }: { user: User; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[24px] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[var(--border)] px-6 py-4 rounded-t-[24px]">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-playfair font-bold text-xl">{user.name}</div>
              <div className="text-sm text-[var(--text-muted)] mt-0.5">User Profile</div>
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
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--purple)] to-[var(--gold)] flex items-center justify-center text-white font-bold text-3xl">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="font-semibold text-lg">{user.name}</div>
              <div className="text-sm text-[var(--text-muted)]">{user.email}</div>
              <div className="text-sm text-[var(--text-muted)]">{user.phone}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[var(--cream)] rounded-xl p-4">
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1">
                Role
              </div>
              <div className="font-semibold">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</div>
            </div>
            <div className="bg-[var(--cream)] rounded-xl p-4">
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1">
                Status
              </div>
              <div className="font-semibold">{user.status.charAt(0).toUpperCase() + user.status.slice(1)}</div>
            </div>
            <div className="bg-[var(--cream)] rounded-xl p-4">
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1">
                {user.role === "customer" ? "Orders" : "Bookings"}
              </div>
              <div className="font-semibold">{user.ordersCount}</div>
            </div>
            <div className="bg-[var(--cream)] rounded-xl p-4">
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1">
                {user.role === "customer" ? "Total Spent" : "Total Earned"}
              </div>
              <div className="font-semibold">₹{user.totalSpent.toLocaleString("en-IN")}</div>
            </div>
          </div>

          <div className="bg-[var(--cream)] rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Joined</span>
              <span className="font-medium">
                {new Date(user.joinedAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Last Active</span>
              <span className="font-medium">
                {new Date(user.lastActive).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">City</span>
              <span className="font-medium">{user.city}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Verified</span>
              <span className="font-medium">{user.verified ? "✓ Yes" : "✗ No"}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="flex-1 px-5 py-2.5 rounded-full border border-[var(--border)] text-sm font-medium hover:border-[var(--purple)] transition-colors">
              📧 Send Email
            </button>
            <button className="flex-1 px-5 py-2.5 rounded-full bg-[var(--purple)] text-white text-sm font-medium hover:bg-[var(--purple-light)] transition-colors">
              ✏️ Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
