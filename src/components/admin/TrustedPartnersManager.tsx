"use client";

import { useState, useEffect } from "react";

interface Partner {
  id: string;
  name: string;
  logo: string;
  category: string;
  description: string;
  website: string;
  featured: boolean;
  displayOrder: number;
  status: "active" | "inactive";
}

export default function TrustedPartnersManager() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Fetch partners from API
  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/partners");
      const data = await response.json();
      
      if (response.ok) {
        setPartners(data.partners || []);
      } else {
        console.error("Failed to fetch partners:", data.error);
      }
    } catch (error) {
      console.error("Error fetching partners:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (partner: Partner) => {
    try {
      if (isAddingNew) {
        const response = await fetch("/api/partners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(partner),
        });

        if (response.ok) {
          await fetchPartners();
        } else {
          alert("Failed to create partner");
          return;
        }
      } else {
        const response = await fetch("/api/partners", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(partner),
        });

        if (response.ok) {
          await fetchPartners();
        } else {
          alert("Failed to update partner");
          return;
        }
      }
      
      setEditingPartner(null);
      setIsAddingNew(false);
    } catch (error) {
      console.error("Error saving partner:", error);
      alert("An error occurred while saving");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to remove this partner?")) {
      try {
        const response = await fetch(`/api/partners?id=${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          await fetchPartners();
        } else {
          alert("Failed to delete partner");
        }
      } catch (error) {
        console.error("Error deleting partner:", error);
        alert("An error occurred while deleting");
      }
    }
  };

  const handleToggleStatus = async (id: string) => {
    const partner = partners.find((p) => p.id === id);
    if (!partner) return;

    const updatedPartner = {
      ...partner,
      status: partner.status === "active" ? "inactive" : "active",
    };

    await handleSave(updatedPartner as Partner);
  };

  const handleToggleFeatured = async (id: string) => {
    const partner = partners.find((p) => p.id === id);
    if (!partner) return;

    const updatedPartner = {
      ...partner,
      featured: !partner.featured,
    };

    await handleSave(updatedPartner as Partner);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[var(--text-muted)]">Loading partners...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-playfair font-bold text-[var(--deep)]">
            Trusted Partners
          </h2>
          <p className="text-[var(--text-muted)] mt-1">
            Manage partner logos and information displayed on the homepage
          </p>
        </div>
        <button
          onClick={() => {
            setIsAddingNew(true);
            setEditingPartner({
              id: "",
              name: "",
              logo: "🎉",
              category: "",
              description: "",
              website: "",
              featured: false,
              displayOrder: partners.length + 1,
              status: "active",
            });
          }}
          className="px-6 py-3 rounded-full bg-[var(--purple)] text-white font-medium hover:bg-[var(--purple-light)] transition-colors"
        >
          + Add Partner
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-[var(--border)]">
          <div className="text-3xl font-bold text-[var(--deep)]">
            {partners.length}
          </div>
          <div className="text-sm text-[var(--text-muted)] mt-1">
            Total Partners
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-[var(--border)]">
          <div className="text-3xl font-bold text-[var(--purple)]">
            {partners.filter((p) => p.featured).length}
          </div>
          <div className="text-sm text-[var(--text-muted)] mt-1">Featured</div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-[var(--border)]">
          <div className="text-3xl font-bold text-green-600">
            {partners.filter((p) => p.status === "active").length}
          </div>
          <div className="text-sm text-[var(--text-muted)] mt-1">Active</div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-[var(--border)]">
          <div className="text-3xl font-bold text-[var(--gold)]">
            {new Set(partners.map((p) => p.category)).size}
          </div>
          <div className="text-sm text-[var(--text-muted)] mt-1">
            Categories
          </div>
        </div>
      </div>

      {/* Partners List */}
      <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--cream)] border-b border-[var(--border)]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--deep)]">
                  Partner
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--deep)]">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--deep)]">
                  Website
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--deep)]">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--deep)]">
                  Featured
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--deep)]">
                  Order
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-[var(--deep)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {partners.map((partner) => (
                <tr key={partner.id} className="hover:bg-[var(--cream)] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--purple)] to-[var(--gold)] flex items-center justify-center text-2xl">
                        {partner.logo}
                      </div>
                      <div>
                        <div className="font-semibold text-[var(--deep)]">
                          {partner.name}
                        </div>
                        <div className="text-sm text-[var(--text-muted)]">
                          {partner.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full bg-[var(--cream)] text-sm text-[var(--deep)]">
                      {partner.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={partner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--purple)] hover:underline text-sm"
                    >
                      Visit Site →
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(partner.id)}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        partner.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {partner.status}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleFeatured(partner.id)}
                      className="text-2xl"
                    >
                      {partner.featured ? "⭐" : "☆"}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[var(--text-muted)]">
                      #{partner.displayOrder}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingPartner(partner)}
                        className="px-4 py-2 rounded-full border border-[var(--border)] text-sm hover:border-[var(--purple)] transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(partner.id)}
                        className="px-4 py-2 rounded-full border border-red-200 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingPartner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[var(--border)]">
              <h3 className="text-xl font-playfair font-bold text-[var(--deep)]">
                {isAddingNew ? "Add New Partner" : "Edit Partner"}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--deep)] mb-2">
                  Partner Name
                </label>
                <input
                  type="text"
                  value={editingPartner.name}
                  onChange={(e) =>
                    setEditingPartner({ ...editingPartner, name: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:border-[var(--purple)]"
                  placeholder="Enter partner name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--deep)] mb-2">
                  Logo Emoji
                </label>
                <input
                  type="text"
                  value={editingPartner.logo}
                  onChange={(e) =>
                    setEditingPartner({ ...editingPartner, logo: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:border-[var(--purple)]"
                  placeholder="🎉"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--deep)] mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={editingPartner.category}
                  onChange={(e) =>
                    setEditingPartner({ ...editingPartner, category: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:border-[var(--purple)]"
                  placeholder="e.g., Decorator, Photography, Catering"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--deep)] mb-2">
                  Description
                </label>
                <textarea
                  value={editingPartner.description}
                  onChange={(e) =>
                    setEditingPartner({
                      ...editingPartner,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:border-[var(--purple)]"
                  rows={3}
                  placeholder="Brief description of the partner"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--deep)] mb-2">
                  Website URL
                </label>
                <input
                  type="url"
                  value={editingPartner.website}
                  onChange={(e) =>
                    setEditingPartner({ ...editingPartner, website: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:outline-none focus:border-[var(--purple)]"
                  placeholder="https://example.com"
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingPartner.featured}
                    onChange={(e) =>
                      setEditingPartner({
                        ...editingPartner,
                        featured: e.target.checked,
                      })
                    }
                    className="w-5 h-5 rounded border-[var(--border)]"
                  />
                  <span className="text-sm text-[var(--deep)]">Featured Partner</span>
                </label>

                <div className="flex items-center gap-2">
                  <label className="text-sm text-[var(--deep)]">Display Order:</label>
                  <input
                    type="number"
                    value={editingPartner.displayOrder}
                    onChange={(e) =>
                      setEditingPartner({
                        ...editingPartner,
                        displayOrder: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-20 px-3 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--purple)]"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-[var(--border)] flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setEditingPartner(null);
                  setIsAddingNew(false);
                }}
                className="px-6 py-3 rounded-full border border-[var(--border)] text-sm hover:border-[var(--purple)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSave(editingPartner)}
                className="px-6 py-3 rounded-full bg-[var(--purple)] text-white text-sm hover:bg-[var(--purple-light)] transition-colors"
              >
                {isAddingNew ? "Add Partner" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
