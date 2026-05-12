"use client";

import { useEffect, useState } from "react";
import type { VendorSuggestion } from "@/app/api/vendor-suggestions/route";
import type { Vendor } from "@/app/api/vendors/route";

export default function VendorSuggestionsManager() {
  const [suggestions, setSuggestions] = useState<VendorSuggestion[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [editingSuggestion, setEditingSuggestion] = useState<VendorSuggestion | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchSuggestions();
    fetchVendors();
  }, []);

  async function fetchSuggestions() {
    try {
      const response = await fetch("/api/vendor-suggestions");
      const data = await response.json();
      console.log("Fetched suggestions:", data);
      console.log("First suggestion:", data.suggestions?.[0]);
      if (data.suggestions?.[0]) {
        console.log("Vendor 1 ID:", data.suggestions[0].vendor_1_id);
        console.log("Vendor 2 ID:", data.suggestions[0].vendor_2_id);
        console.log("Vendor 3 ID:", data.suggestions[0].vendor_3_id);
      }
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
      alert("Failed to load vendor suggestions. Please check the console for details.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchVendors() {
    try {
      const response = await fetch("/api/vendors");
      const data = await response.json();
      setVendors(data.vendors || []);
    } catch (error) {
      console.error("Failed to fetch vendors:", error);
    }
  }

  const filteredSuggestions = suggestions.filter((s) => {
    if (filterStatus === "all") return true;
    return s.status === filterStatus;
  });

  function handleEdit(suggestion: VendorSuggestion) {
    setEditingSuggestion(suggestion);
    setShowEditModal(true);
  }

  async function handleApprove(suggestionId: string) {
    if (!confirm("Finalize and send to customer for approval?")) return;

    try {
      const response = await fetch("/api/vendor-suggestions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: suggestionId,
          status: "waiting_customer_approval",
          finalizedBy: "admin",
        }),
      });

      if (!response.ok) {
        alert("Failed to finalize suggestion");
        return;
      }

      fetchSuggestions();
    } catch (error) {
      console.error("Error finalizing suggestion:", error);
      alert("Failed to finalize suggestion");
    }
  }

  function handleCustomize(suggestion: VendorSuggestion) {
    setEditingSuggestion(suggestion);
    setShowEditModal(true);
  }

  async function handleDelete(suggestionId: string) {
    if (!confirm("Delete this suggestion?")) return;

    try {
      const response = await fetch(`/api/vendor-suggestions?id=${suggestionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        alert("Failed to delete suggestion");
        return;
      }

      setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId));
    } catch (error) {
      console.error("Error deleting suggestion:", error);
      alert("Failed to delete suggestion");
    }
  }

  async function handleVendorSelection(suggestionId: string, category: string, index: number) {
    try {
      // Get current suggestion
      const suggestion = suggestions.find(s => s.id === suggestionId);
      if (!suggestion || !suggestion.vendor_options) return;

      // Update selected indices
      const updatedIndices = {
        ...(suggestion.selected_vendor_indices || {}),
        [category]: index,
      };

      // Send update to API
      const response = await fetch("/api/vendor-suggestions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: suggestionId,
          selectedVendorIndices: updatedIndices,
        }),
      });

      if (!response.ok) {
        alert("Failed to update vendor selection");
        return;
      }

      // Update local state
      setSuggestions(prev => prev.map(s => 
        s.id === suggestionId 
          ? { ...s, selected_vendor_indices: updatedIndices }
          : s
      ));
    } catch (error) {
      console.error("Error updating vendor selection:", error);
      alert("Failed to update vendor selection");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-[var(--text-muted)]">Loading suggestions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[var(--border)] rounded-[20px] p-6 shadow-[0_4px_24px_rgba(26,15,46,0.06)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="font-playfair font-bold text-2xl">Vendor Suggestions</div>
            <div className="text-sm text-[var(--text-muted)] mt-1">
              {filteredSuggestions.length} suggestions found
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
            >
              <option value="all">All Status</option>
              <option value="pending_admin_review">Pending Admin Review</option>
              <option value="admin_customizing">Admin Customizing</option>
              <option value="approved">Approved</option>
              <option value="waiting_customer_approval">Waiting Customer Approval</option>
              <option value="customer_approved">Customer Approved</option>
              <option value="customer_rejected">Customer Rejected</option>
            </select>
            <button
              onClick={() => fetchSuggestions()}
              className="px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm font-medium hover:border-[var(--purple)] transition-colors"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Suggestions List */}
      <div className="space-y-4">
        {filteredSuggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="bg-white border border-[var(--border)] rounded-[20px] p-6 shadow-[0_4px_24px_rgba(26,15,46,0.06)]"
          >
            {/* Customer Info */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="font-semibold text-lg">{suggestion.customer_name}</div>
                <div className="text-sm text-[var(--text-muted)]">
                  {suggestion.customer_phone} • {suggestion.customer_email}
                </div>
                <div className="text-sm text-[var(--text-muted)] mt-1">
                  {suggestion.occasion} • {suggestion.age_group} • {suggestion.city}
                </div>
              </div>
              <span
                className={`text-xs px-3 py-1 rounded-full ${
                  suggestion.status === "pending_admin_review"
                    ? "bg-[rgba(255,200,87,0.12)] text-[#FFC857]"
                    : suggestion.status === "admin_customizing"
                      ? "bg-[rgba(255,200,87,0.12)] text-[#FFC857]"
                      : suggestion.status === "waiting_customer_approval"
                        ? "bg-[rgba(107,63,160,0.12)] text-[var(--purple)]"
                        : suggestion.status === "customer_approved"
                          ? "bg-[rgba(29,158,117,0.12)] text-[#1D9E75]"
                          : suggestion.status === "customer_rejected"
                            ? "bg-[rgba(255,122,89,0.12)] text-[var(--coral)]"
                            : "bg-[rgba(29,158,117,0.12)] text-[#1D9E75]"
                }`}
              >
                {suggestion.status.replace(/_/g, " ").toUpperCase()}
              </span>
            </div>

            {/* Requirements */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 p-4 bg-[var(--cream)] rounded-xl">
              <div>
                <div className="text-xs text-[var(--text-muted)]">Budget</div>
                <div className="font-medium">₹{suggestion.budget.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--text-muted)]">Guests</div>
                <div className="font-medium">{suggestion.guest_count}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--text-muted)]">Theme</div>
                <div className="font-medium">{suggestion.theme}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--text-muted)]">Location</div>
                <div className="font-medium">{suggestion.location_type}</div>
              </div>
            </div>

            {/* Suggested Vendors */}
            <div className="mb-4">
              <div className="text-sm font-medium mb-3">AI-Matched Vendor Options:</div>
              
              {/* Check if vendor_options exists (new format) */}
              {suggestion.vendor_options && Object.keys(suggestion.vendor_options).length > 0 ? (
                <VendorOptionsDisplay
                  suggestion={suggestion}
                  onSelectionChange={(category, index) => {
                    // Update selection in real-time
                    handleVendorSelection(suggestion.id, category, index);
                  }}
                />
              ) : (
                // Fallback to old format
                <>
                  {!suggestion.vendor_1_id && !suggestion.vendor_2_id && !suggestion.vendor_3_id ? (
                    <div className="p-6 border border-[var(--border)] rounded-xl bg-[rgba(255,200,87,0.08)] text-center">
                      <div className="text-2xl mb-2">🤖</div>
                      <div className="font-medium mb-1">No Vendors Matched</div>
                      <div className="text-sm text-[var(--text-muted)]">
                        AI couldn't find matching vendors for this request.
                        <br />
                        Click "Edit Suggestions" to manually select vendors.
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Vendor 1 */}
                      {suggestion.vendor_1_id && (
                        <div className="p-4 border border-[var(--border)] rounded-xl">
                          <div className="flex items-start justify-between mb-2">
                            <div className="font-medium">{suggestion.vendor_1_name}</div>
                            {suggestion.vendor_1_auto_matched && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(107,63,160,0.08)] text-[var(--purple)]">
                                AI
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-[var(--text-muted)]">{suggestion.vendor_1_category}</div>
                          <div className="text-sm font-medium mt-2">₹{suggestion.vendor_1_price?.toLocaleString()}</div>
                        </div>
                      )}

                      {/* Vendor 2 */}
                      {suggestion.vendor_2_id && (
                        <div className="p-4 border border-[var(--border)] rounded-xl">
                          <div className="flex items-start justify-between mb-2">
                            <div className="font-medium">{suggestion.vendor_2_name}</div>
                            {suggestion.vendor_2_auto_matched && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(107,63,160,0.08)] text-[var(--purple)]">
                                AI
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-[var(--text-muted)]">{suggestion.vendor_2_category}</div>
                          <div className="text-sm font-medium mt-2">₹{suggestion.vendor_2_price?.toLocaleString()}</div>
                        </div>
                      )}

                      {/* Vendor 3 */}
                      {suggestion.vendor_3_id && (
                        <div className="p-4 border border-[var(--border)] rounded-xl">
                          <div className="flex items-start justify-between mb-2">
                            <div className="font-medium">{suggestion.vendor_3_name}</div>
                            {suggestion.vendor_3_auto_matched && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(107,63,160,0.08)] text-[var(--purple)]">
                                AI
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-[var(--text-muted)]">{suggestion.vendor_3_category}</div>
                          <div className="text-sm font-medium mt-2">₹{suggestion.vendor_3_price?.toLocaleString()}</div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Total Price */}
            <div className="mb-4 p-3 bg-[rgba(107,63,160,0.05)] rounded-xl">
              <div className="flex items-center justify-between">
                <span className="font-medium">Total Package Price:</span>
                <span className="font-bold text-lg">
                  ₹{(suggestion.final_price || suggestion.admin_adjusted_price || suggestion.initial_price || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Admin Notes */}
            {suggestion.admin_notes && (
              <div className="mb-4 p-3 bg-[rgba(255,200,87,0.08)] rounded-xl">
                <div className="text-xs font-medium text-[var(--text-muted)] mb-1">Admin Notes:</div>
                <div className="text-sm">{suggestion.admin_notes}</div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(suggestion)}
                className="flex-1 px-4 py-2 rounded-xl border border-[var(--border)] text-sm font-medium hover:border-[var(--purple)] hover:bg-[rgba(107,63,160,0.05)] transition-colors"
              >
                ✏️ Edit Suggestions
              </button>
              {(suggestion.status === "pending_admin_review" || suggestion.status === "admin_customizing") && (
                <button
                  onClick={() => handleApprove(suggestion.id)}
                  className="flex-1 px-4 py-2 rounded-xl bg-[var(--purple)] text-white text-sm font-medium hover:bg-[var(--purple-light)] transition-colors"
                >
                  ✓ Approve & Send
                </button>
              )}
              <button
                onClick={() => handleDelete(suggestion.id)}
                className="px-4 py-2 rounded-xl border border-[var(--border)] text-sm font-medium hover:border-[var(--coral)] hover:bg-[rgba(255,122,89,0.05)] transition-colors"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredSuggestions.length === 0 && (
        <div className="bg-white border border-[var(--border)] rounded-[20px] p-12 text-center">
          <div className="text-4xl mb-3">📋</div>
          <div className="text-lg font-medium text-[var(--text-muted)]">No suggestions found</div>
          <div className="text-sm text-[var(--text-muted)] mt-1">
            Suggestions will appear here when customers submit requests
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingSuggestion && (
        <EditSuggestionModal
          suggestion={editingSuggestion}
          vendors={vendors}
          onClose={() => {
            setShowEditModal(false);
            setEditingSuggestion(null);
          }}
          onSave={() => {
            setShowEditModal(false);
            setEditingSuggestion(null);
            fetchSuggestions();
          }}
        />
      )}
    </div>
  );
}

function EditSuggestionModal({
  suggestion,
  vendors,
  onClose,
  onSave,
}: {
  suggestion: VendorSuggestion;
  vendors: Vendor[];
  onClose: () => void;
  onSave: () => void;
}) {
  const [vendor1Id, setVendor1Id] = useState(suggestion.vendor_1_id || "");
  const [vendor2Id, setVendor2Id] = useState(suggestion.vendor_2_id || "");
  const [vendor3Id, setVendor3Id] = useState(suggestion.vendor_3_id || "");
  const [adminNotes, setAdminNotes] = useState(suggestion.admin_notes || "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const vendor1 = vendors.find((v) => v.id === vendor1Id);
      const vendor2 = vendors.find((v) => v.id === vendor2Id);
      const vendor3 = vendors.find((v) => v.id === vendor3Id);

      const response = await fetch("/api/vendor-suggestions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: suggestion.id,
          vendor1Id: vendor1?.id,
          vendor1Name: vendor1?.name,
          vendor1Category: vendor1?.category,
          vendor1Price: vendor1 ? Math.round((vendor1.price_min + vendor1.price_max) / 2) : 0,
          vendor1AutoMatched: false, // Manual selection
          
          vendor2Id: vendor2?.id,
          vendor2Name: vendor2?.name,
          vendor2Category: vendor2?.category,
          vendor2Price: vendor2 ? Math.round((vendor2.price_min + vendor2.price_max) / 2) : 0,
          vendor2AutoMatched: false,
          
          vendor3Id: vendor3?.id,
          vendor3Name: vendor3?.name,
          vendor3Category: vendor3?.category,
          vendor3Price: vendor3 ? Math.round((vendor3.price_min + vendor3.price_max) / 2) : 0,
          vendor3AutoMatched: false,
          
          adminNotes,
          status: "approved",
          reviewedBy: "admin",
        }),
      });

      if (!response.ok) {
        alert("Failed to update suggestion");
        return;
      }

      onSave();
    } catch (error) {
      console.error("Error updating suggestion:", error);
      alert("Failed to update suggestion");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[24px] max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[var(--border)] px-6 py-4 rounded-t-[24px]">
          <div className="flex items-center justify-between">
            <div className="font-playfair font-bold text-xl">Edit Vendor Suggestions</div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-[var(--cream)] flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Customer Info */}
          <div className="p-4 bg-[var(--cream)] rounded-xl">
            <div className="font-medium mb-2">{suggestion.customer_name}</div>
            <div className="text-sm text-[var(--text-muted)]">
              Budget: ₹{suggestion.budget.toLocaleString()} • Guests: {suggestion.guest_count} • Theme: {suggestion.theme}
            </div>
          </div>

          {/* Vendor 1 */}
          <div>
            <label className="text-sm font-medium block mb-2">Vendor Choice 1</label>
            <select
              value={vendor1Id}
              onChange={(e) => setVendor1Id(e.target.value)}
              className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
            >
              <option value="">Select vendor...</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name} - {vendor.category} (₹{vendor.price_min}-₹{vendor.price_max})
                </option>
              ))}
            </select>
          </div>

          {/* Vendor 2 */}
          <div>
            <label className="text-sm font-medium block mb-2">Vendor Choice 2</label>
            <select
              value={vendor2Id}
              onChange={(e) => setVendor2Id(e.target.value)}
              className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
            >
              <option value="">Select vendor...</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name} - {vendor.category} (₹{vendor.price_min}-₹{vendor.price_max})
                </option>
              ))}
            </select>
          </div>

          {/* Vendor 3 */}
          <div>
            <label className="text-sm font-medium block mb-2">Vendor Choice 3</label>
            <select
              value={vendor3Id}
              onChange={(e) => setVendor3Id(e.target.value)}
              className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
            >
              <option value="">Select vendor...</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name} - {vendor.category} (₹{vendor.price_min}-₹{vendor.price_max})
                </option>
              ))}
            </select>
          </div>

          {/* Admin Notes */}
          <div>
            <label className="text-sm font-medium block mb-2">Admin Notes (Optional)</label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add notes about why you changed the suggestions..."
              rows={3}
              className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-5 py-2.5 rounded-full border border-[var(--border)] text-sm font-medium hover:border-[var(--purple)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-5 py-2.5 rounded-full bg-[var(--purple)] text-white text-sm font-medium hover:bg-[var(--purple-light)] transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save & Approve"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Component to display all vendor options per category with selection
function VendorOptionsDisplay({
  suggestion,
  onSelectionChange,
}: {
  suggestion: VendorSuggestion;
  onSelectionChange: (category: string, index: number) => void;
}) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const vendorOptions = suggestion.vendor_options || {};
  const selectedIndices = suggestion.selected_vendor_indices || {};

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const categoryLabels: Record<string, string> = {
    restaurant: "🍽️ Restaurant",
    cake: "🎂 Cake",
    decorator: "🎨 Decorator",
    photographer: "📸 Photographer",
    dj: "🎵 DJ",
  };

  if (Object.keys(vendorOptions).length === 0) {
    return (
      <div className="p-6 border border-[var(--border)] rounded-xl bg-[rgba(255,200,87,0.08)] text-center">
        <div className="text-2xl mb-2">🤖</div>
        <div className="font-medium mb-1">No Vendors Matched</div>
        <div className="text-sm text-[var(--text-muted)]">
          AI couldn't find matching vendors for this request.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {Object.entries(vendorOptions).map(([category, vendors]) => {
        const isExpanded = expandedCategories.has(category);
        const selectedIndex = selectedIndices[category] || 0;
        const selectedVendor = vendors[selectedIndex];

        return (
          <div key={category} className="border border-[var(--border)] rounded-xl overflow-hidden">
            {/* Category Header - Shows selected vendor */}
            <div
              className="p-4 bg-[var(--cream)] cursor-pointer hover:bg-[rgba(107,63,160,0.05)] transition-colors"
              onClick={() => toggleCategory(category)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{categoryLabels[category] || category}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(107,63,160,0.08)] text-[var(--purple)]">
                      {vendors.length} options
                    </span>
                  </div>
                  {selectedVendor && (
                    <div className="text-sm">
                      <span className="font-medium">{selectedVendor.name}</span>
                      <span className="text-[var(--text-muted)]"> • ₹{selectedVendor.price?.toLocaleString()}</span>
                      <span className="text-[var(--text-muted)]"> • ⭐ {selectedVendor.rating}</span>
                    </div>
                  )}
                </div>
                <div className="text-lg">
                  {isExpanded ? "▼" : "▶"}
                </div>
              </div>
            </div>

            {/* Expanded Options */}
            {isExpanded && (
              <div className="p-4 space-y-3 bg-white">
                {vendors.map((vendor: any, index: number) => {
                  const isSelected = index === selectedIndex;
                  return (
                    <div
                      key={vendor.id}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? "border-[var(--purple)] bg-[rgba(107,63,160,0.05)]"
                          : "border-[var(--border)] hover:border-[var(--purple-light)]"
                      }`}
                      onClick={() => onSelectionChange(category, index)}
                    >
                      <div className="flex items-start gap-3">
                        {/* Radio Button */}
                        <div className="mt-1">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isSelected
                                ? "border-[var(--purple)] bg-[var(--purple)]"
                                : "border-[var(--border)]"
                            }`}
                          >
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                        </div>

                        {/* Vendor Details */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="font-medium text-base">{vendor.name}</div>
                              <div className="text-xs text-[var(--text-muted)] mt-0.5">
                                ⭐ {vendor.rating} ({vendor.reviews} reviews) • {vendor.experience_years}y exp • {vendor.events_done} events
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg">₹{vendor.price?.toLocaleString()}</div>
                              {vendor.price_min && vendor.price_max && (
                                <div className="text-xs text-[var(--text-muted)]">
                                  ₹{vendor.price_min?.toLocaleString()} - ₹{vendor.price_max?.toLocaleString()}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Description */}
                          {vendor.description && (
                            <div className="text-sm text-[var(--text-muted)] mb-2">
                              {vendor.description}
                            </div>
                          )}

                          {/* Tags */}
                          {vendor.tags && vendor.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {vendor.tags.slice(0, 5).map((tag: string, i: number) => (
                                <span
                                  key={i}
                                  className="text-xs px-2 py-0.5 rounded-full bg-[rgba(255,200,87,0.12)] text-[var(--text-muted)]"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Match Score */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(107,63,160,0.08)] text-[var(--purple)]">
                              AI Match Score: {vendor.match_score}
                            </span>
                            {isSelected && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(29,158,117,0.12)] text-[#1D9E75]">
                                ✓ Selected
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
