"use client";

import { useEffect, useState } from "react";
import type { Vendor, VendorCategory } from "@/app/api/vendors/route";

export default function VendorsManager() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<VendorCategory | "all">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  useEffect(() => {
    fetchVendors();
  }, []);

  async function fetchVendors() {
    try {
      const response = await fetch("/api/vendors");
      const data = await response.json();
      setVendors(data.vendors || []);
    } catch (error) {
      console.error("Failed to fetch vendors:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredVendors = vendors.filter((v) => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = filterCategory === "all" || v.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories: (VendorCategory | "all")[] = [
    "all",
    "restaurant",
    "decorator",
    "photographer",
    "cake",
    "dj",
    "entertainment",
    "catering",
  ];

  function handleEdit(vendor: Vendor) {
    setEditingVendor(vendor);
    setShowAddModal(true);
  }

  async function handleDelete(vendorId: string) {
    if (confirm("Are you sure you want to delete this vendor?")) {
      try {
        const response = await fetch(`/api/vendors?id=${vendorId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const error = await response.json();
          alert(`Failed to delete vendor: ${error.error || "Unknown error"}`);
          return;
        }

        // Update local state after successful deletion
        setVendors((prev) => prev.filter((v) => v.id !== vendorId));
      } catch (error) {
        console.error("Error deleting vendor:", error);
        alert("Failed to delete vendor. Please try again.");
      }
    }
  }

  async function handleToggleVerified(vendorId: string) {
    const vendor = vendors.find((v) => v.id === vendorId);
    if (!vendor) return;

    try {
      const response = await fetch("/api/vendors", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: vendorId,
          name: vendor.name,
          category: vendor.category,
          rating: vendor.rating,
          reviewCount: vendor.review_count,
          priceMin: vendor.price_min,
          priceMax: vendor.price_max,
          city: vendor.city,
          verified: !vendor.verified,
          tags: vendor.tags,
          imageEmoji: vendor.image_emoji,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Failed to update vendor: ${error.error || "Unknown error"}`);
        return;
      }

      // Update local state after successful update
      setVendors((prev) =>
        prev.map((v) => (v.id === vendorId ? { ...v, verified: !v.verified } : v))
      );
    } catch (error) {
      console.error("Error updating vendor:", error);
      alert("Failed to update vendor. Please try again.");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-[var(--text-muted)]">Loading vendors...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[var(--border)] rounded-[20px] p-6 shadow-[0_4px_24px_rgba(26,15,46,0.06)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="font-playfair font-bold text-2xl">Vendors Management</div>
            <div className="text-sm text-[var(--text-muted)] mt-1">
              {filteredVendors.length} vendors found
            </div>
          </div>
          <button
            onClick={() => {
              setEditingVendor(null);
              setShowAddModal(true);
            }}
            className="px-5 py-2.5 rounded-full bg-[var(--purple)] text-white text-sm font-medium hover:bg-[var(--purple-light)] transition-colors"
          >
            ➕ Add Vendor
          </button>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vendors by name or tags..."
            className="flex-1 bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as VendorCategory | "all")}
            className="bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "all" ? "All Categories" : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVendors.map((vendor) => (
          <div
            key={vendor.id}
            className="bg-white border border-[var(--border)] rounded-[20px] overflow-hidden shadow-[0_4px_24px_rgba(26,15,46,0.06)] hover:shadow-[0_8px_32px_rgba(26,15,46,0.10)] transition-shadow"
          >
            {/* Banner Image */}
            {vendor.banner_image ? (
              <div className="w-full h-48 overflow-hidden bg-gradient-to-br from-[rgba(107,63,160,0.15)] to-[rgba(255,200,87,0.12)]">
                <img
                  src={vendor.banner_image}
                  alt={vendor.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-48 bg-gradient-to-br from-[rgba(107,63,160,0.15)] to-[rgba(255,200,87,0.12)] flex items-center justify-center">
                <span className="text-6xl">{vendor.image_emoji}</span>
              </div>
            )}

            {/* Card Content */}
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="font-semibold text-lg">{vendor.name}</div>
                  <div className="text-xs text-[var(--text-muted)] mt-0.5">
                    {vendor.category.charAt(0).toUpperCase() + vendor.category.slice(1)}
                  </div>
                </div>
                <button
                  onClick={() => handleToggleVerified(vendor.id)}
                  className={`text-xs px-2 py-1 rounded-full ${
                    vendor.verified
                      ? "bg-[rgba(29,158,117,0.12)] text-[#1D9E75]"
                      : "bg-[rgba(26,15,46,0.06)] text-[var(--text-muted)]"
                  }`}
                >
                  {vendor.verified ? "✓ Verified" : "Unverified"}
                </button>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Rating</span>
                  <span className="font-medium">
                    ⭐ {vendor.rating} ({vendor.review_count})
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Price Range</span>
                  <span className="font-medium">
                    ₹{(vendor.price_min / 1000).toFixed(1)}K - ₹{(vendor.price_max / 1000).toFixed(1)}K
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-muted)]">City</span>
                  <span className="font-medium">{vendor.city}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {vendor.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-[0.7rem] px-2 py-0.5 rounded-full bg-[rgba(107,63,160,0.08)] text-[var(--purple)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(vendor)}
                  className="flex-1 px-3 py-2 rounded-xl border border-[var(--border)] text-xs font-medium hover:border-[var(--purple)] hover:bg-[rgba(107,63,160,0.05)] transition-colors"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(vendor.id)}
                  className="flex-1 px-3 py-2 rounded-xl border border-[var(--border)] text-xs font-medium hover:border-[var(--coral)] hover:bg-[rgba(255,122,89,0.05)] transition-colors"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredVendors.length === 0 && (
        <div className="bg-white border border-[var(--border)] rounded-[20px] p-12 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <div className="text-lg font-medium text-[var(--text-muted)]">No vendors found</div>
          <div className="text-sm text-[var(--text-muted)] mt-1">
            Try adjusting your search or filters
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <VendorModal
          vendor={editingVendor}
          onClose={() => {
            setShowAddModal(false);
            setEditingVendor(null);
          }}
          onSave={async (vendor) => {
            try {
              if (editingVendor) {
                // Update existing vendor
                const response = await fetch("/api/vendors", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    id: vendor.id,
                    name: vendor.name,
                    category: vendor.category,
                    rating: vendor.rating,
                    reviewCount: vendor.review_count,
                    priceMin: vendor.price_min,
                    priceMax: vendor.price_max,
                    city: vendor.city,
                    area: vendor.area,
                    description: vendor.description,
                    verified: vendor.verified,
                    tags: vendor.tags,
                    imageEmoji: vendor.image_emoji,
                    bannerImage: vendor.banner_image,
                    portfolioImages: vendor.portfolio_images,
                    portfolioVideos: vendor.portfolio_videos,
                    portfolioDescription: vendor.portfolio_description,
                    portfolioHighlights: vendor.portfolio_highlights,
                    locationAddress: vendor.location_address,
                    locationLat: vendor.location_lat,
                    locationLng: vendor.location_lng,
                    pricingType: vendor.pricing_type,
                    perPlatePrice: vendor.per_plate_price,
                    extraCharges: vendor.extra_charges,
                    fixedPrice: vendor.fixed_price,
                    experienceYears: vendor.experience_years,
                    eventsDone: vendor.events_done,
                  }),
                });

                if (!response.ok) {
                  const error = await response.json();
                  alert(`Failed to update vendor: ${error.error || "Unknown error"}`);
                  return;
                }

                const updatedVendor = await response.json();
                setVendors((prev) => prev.map((v) => (v.id === vendor.id ? updatedVendor : v)));
              } else {
                // Create new vendor
                const response = await fetch("/api/vendors", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    name: vendor.name,
                    category: vendor.category,
                    rating: vendor.rating,
                    reviewCount: vendor.review_count,
                    priceMin: vendor.price_min,
                    priceMax: vendor.price_max,
                    city: vendor.city,
                    area: vendor.area,
                    description: vendor.description,
                    verified: vendor.verified,
                    tags: vendor.tags,
                    imageEmoji: vendor.image_emoji,
                    bannerImage: vendor.banner_image,
                    portfolioImages: vendor.portfolio_images,
                    portfolioVideos: vendor.portfolio_videos,
                    portfolioDescription: vendor.portfolio_description,
                    portfolioHighlights: vendor.portfolio_highlights,
                    locationAddress: vendor.location_address,
                    locationLat: vendor.location_lat,
                    locationLng: vendor.location_lng,
                    pricingType: vendor.pricing_type,
                    perPlatePrice: vendor.per_plate_price,
                    extraCharges: vendor.extra_charges,
                    fixedPrice: vendor.fixed_price,
                    experienceYears: vendor.experience_years,
                    eventsDone: vendor.events_done,
                  }),
                });

                if (!response.ok) {
                  const error = await response.json();
                  alert(`Failed to create vendor: ${error.error || "Unknown error"}`);
                  return;
                }

                const newVendor = await response.json();
                setVendors((prev) => [...prev, newVendor]);
              }

              setShowAddModal(false);
              setEditingVendor(null);
            } catch (error) {
              console.error("Error saving vendor:", error);
              alert("Failed to save vendor. Please try again.");
            }
          }}
        />
      )}
    </div>
  );
}

function VendorModal({
  vendor,
  onClose,
  onSave,
}: {
  vendor: Vendor | null;
  onClose: () => void;
  onSave: (vendor: Vendor) => void;
}) {
  const [formData, setFormData] = useState<Vendor>(
    vendor || {
      id: `v${Date.now()}`,
      name: "",
      category: "decorator",
      rating: 4.5,
      review_count: 0,
      price_min: 5000,
      price_max: 15000,
      city: "Dehradun",
      area: "",
      description: "",
      verified: false,
      tags: [],
      image_emoji: "🎨",
      // Banner
      banner_image: "",
      // Portfolio
      portfolio_images: [],
      portfolio_videos: [],
      portfolio_description: "",
      portfolio_highlights: [],
      // Location (optional)
      location_address: "",
      location_lat: 0,
      location_lng: 0,
      // Pricing
      pricing_type: "range",
      per_plate_price: 0,
      extra_charges: 0,
      fixed_price: 0,
      // Experience
      experience_years: 5,
      events_done: 0,
    }
  );

  const [tagInput, setTagInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");

  async function handleFileUpload(
    file: File,
    type: "banner" | "portfolio-image" | "portfolio-video"
  ): Promise<string | null> {
    try {
      setUploading(true);
      setUploadProgress(`Uploading ${file.name}...`);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const response = await fetch("/api/vendors/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Upload failed: ${data.error}`);
        return null;
      }

      setUploadProgress("");
      return data.url;
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload file");
      return null;
    } finally {
      setUploading(false);
    }
  }

  async function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    const url = await handleFileUpload(file, "banner");
    if (url) {
      setFormData((prev) => ({ ...prev, banner_image: url }));
    }
  }

  async function handlePortfolioImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Upload multiple files
    const uploadedUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) {
        alert(`${file.name} is not an image file`);
        continue;
      }

      const url = await handleFileUpload(file, "portfolio-image");
      if (url) {
        uploadedUrls.push(url);
      }
    }

    if (uploadedUrls.length > 0) {
      setFormData((prev) => ({
        ...prev,
        portfolio_images: [...(prev.portfolio_images || []), ...uploadedUrls],
      }));
    }
  }

  async function handlePortfolioVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Upload multiple files
    const uploadedUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("video/")) {
        alert(`${file.name} is not a video file`);
        continue;
      }

      const url = await handleFileUpload(file, "portfolio-video");
      if (url) {
        uploadedUrls.push(url);
      }
    }

    if (uploadedUrls.length > 0) {
      setFormData((prev) => ({
        ...prev,
        portfolio_videos: [...(prev.portfolio_videos || []), ...uploadedUrls],
      }));
    }
  }

  function removePortfolioImage(index: number) {
    setFormData((prev) => ({
      ...prev,
      portfolio_images: (prev.portfolio_images || []).filter((_, i) => i !== index),
    }));
  }

  function removePortfolioVideo(index: number) {
    setFormData((prev) => ({
      ...prev,
      portfolio_videos: prev.portfolio_videos?.filter((_, i) => i !== index) || [],
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(formData);
  }

  function addTag() {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput("");
    }
  }

  function removeTag(tag: string) {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[24px] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[var(--border)] px-6 py-4 rounded-t-[24px]">
          <div className="flex items-center justify-between">
            <div className="font-playfair font-bold text-xl">
              {vendor ? "Edit Vendor" : "Add New Vendor"}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-[var(--cream)] flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest block mb-2">
                Vendor Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest block mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value as VendorCategory }))
                }
                className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
              >
                <option value="restaurant">Restaurant</option>
                <option value="decorator">Decorator</option>
                <option value="photographer">Photographer</option>
                <option value="cake">Cake</option>
                <option value="dj">DJ</option>
                <option value="entertainment">Entertainment</option>
                <option value="catering">Catering</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest block mb-2">
                City
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest block mb-2">
                Area
              </label>
              <input
                type="text"
                required
                value={formData.area}
                onChange={(e) => setFormData((prev) => ({ ...prev, area: e.target.value }))}
                placeholder="e.g. Rajpur Road"
                className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest block mb-2">
                Emoji Icon
              </label>
              <input
                type="text"
                required
                value={formData.image_emoji}
                onChange={(e) => setFormData((prev) => ({ ...prev, image_emoji: e.target.value }))}
                className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest block mb-2">
              Description
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the vendor's services..."
              rows={3}
              className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors resize-none"
            />
          </div>

          {/* Pricing Section */}
          <div className="border-t border-[var(--border)] pt-4 mt-4">
            <h3 className="font-semibold text-sm mb-3">💰 Pricing Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest block mb-2">
                  Pricing Type
                </label>
                <select
                  value={formData.pricing_type}
                  onChange={(e) => setFormData((prev) => ({ ...prev, pricing_type: e.target.value as any }))}
                  className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
                >
                  <option value="range">Range (Min-Max)</option>
                  <option value="per_plate">Per Plate (Restaurants)</option>
                  <option value="fixed">Fixed Price</option>
                </select>
              </div>

              {formData.pricing_type === "per_plate" && (
                <>
                  <div>
                    <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest block mb-2">
                      Per Plate Price (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.per_plate_price || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, per_plate_price: Number(e.target.value) }))}
                      className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest block mb-2">
                      Extra Charges (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.extra_charges || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, extra_charges: Number(e.target.value) }))}
                      className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
                    />
                  </div>
                </>
              )}

              {formData.pricing_type === "range" && (
                <>
                  <div>
                    <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest block mb-2">
                      Min Price (₹)
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.price_min}
                      onChange={(e) => setFormData((prev) => ({ ...prev, price_min: Number(e.target.value) }))}
                      className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest block mb-2">
                      Max Price (₹)
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.price_max}
                      onChange={(e) => setFormData((prev) => ({ ...prev, price_max: Number(e.target.value) }))}
                      className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
                    />
                  </div>
                </>
              )}

              {formData.pricing_type === "fixed" && (
                <div className="col-span-2">
                  <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest block mb-2">
                    Fixed Price (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.fixed_price || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, fixed_price: Number(e.target.value) }))}
                    className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Experience Section */}
          <div className="border-t border-[var(--border)] pt-4 mt-4">
            <h3 className="font-semibold text-sm mb-3">⭐ Experience & Ratings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest block mb-2">
                  Experience Years
                </label>
                <input
                  type="number"
                  required
                  value={formData.experience_years}
                  onChange={(e) => setFormData((prev) => ({ ...prev, experience_years: Number(e.target.value) }))}
                  className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest block mb-2">
                  Events Done
                </label>
                <input
                  type="number"
                  required
                  value={formData.events_done}
                  onChange={(e) => setFormData((prev) => ({ ...prev, events_done: Number(e.target.value) }))}
                  className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest block mb-2">
                  Rating
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  required
                  value={formData.rating}
                  onChange={(e) => setFormData((prev) => ({ ...prev, rating: Number(e.target.value) }))}
                  className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest block mb-2">
                  Review Count
                </label>
                <input
                  type="number"
                  required
                  value={formData.review_count}
                  onChange={(e) => setFormData((prev) => ({ ...prev, review_count: Number(e.target.value) }))}
                  className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Portfolio Section */}
          <div className="border-t border-[var(--border)] pt-4 mt-4">
            <h3 className="font-semibold text-sm mb-3">📸 Portfolio & Media</h3>
            
            {/* Banner Image Upload */}
            <div className="mb-4">
              <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest block mb-2">
                🖼️ Banner Image (Main Featured Image)
              </label>
              <div className="space-y-2">
                {formData.banner_image && (
                  <div className="relative w-full h-48 rounded-xl overflow-hidden border border-[var(--border)]">
                    <img
                      src={formData.banner_image}
                      alt="Banner"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, banner_image: "" }))}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  disabled={uploading}
                  className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--purple)] file:text-white hover:file:bg-[var(--purple-light)]"
                />
                <p className="text-xs text-[var(--text-muted)]">
                  Upload a high-quality banner image (max 50MB)
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest block mb-2">
                  Portfolio Description
                </label>
                <textarea
                  required
                  value={formData.portfolio_description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, portfolio_description: e.target.value }))}
                  placeholder="Describe the vendor's portfolio..."
                  rows={2}
                  className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors resize-none"
                />
              </div>

              {/* Portfolio Images Upload */}
              <div>
                <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest block mb-2">
                  📷 Portfolio Images (Upload Multiple)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePortfolioImageUpload}
                  disabled={uploading}
                  className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--purple)] file:text-white hover:file:bg-[var(--purple-light)]"
                />
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Select multiple images to upload (max 50MB each)
                </p>
                
                {/* Display uploaded images */}
                {formData.portfolio_images && formData.portfolio_images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {formData.portfolio_images.map((url, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-[var(--border)]">
                        <img
                          src={url}
                          alt={`Portfolio ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removePortfolioImage(index)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Portfolio Videos Upload */}
              <div>
                <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest block mb-2">
                  🎥 Portfolio Videos (Upload Multiple, Optional)
                </label>
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handlePortfolioVideoUpload}
                  disabled={uploading}
                  className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--purple)] file:text-white hover:file:bg-[var(--purple-light)]"
                />
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Select multiple videos to upload (max 50MB each)
                </p>
                
                {/* Display uploaded videos */}
                {formData.portfolio_videos && formData.portfolio_videos.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {formData.portfolio_videos.map((url, index) => (
                      <div key={index} className="relative rounded-lg overflow-hidden border border-[var(--border)]">
                        <video
                          src={url}
                          controls
                          className="w-full max-h-48"
                        />
                        <button
                          type="button"
                          onClick={() => removePortfolioVideo(index)}
                          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div className="bg-[rgba(107,63,160,0.08)] border border-[var(--purple)] rounded-xl px-4 py-3 text-sm text-[var(--purple)]">
                  ⏳ {uploadProgress || "Uploading..."}
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest block mb-2">
                  Portfolio Highlights (one per line)
                </label>
                <textarea
                  required
                  value={(formData.portfolio_highlights || []).join('\n')}
                  onChange={(e) => setFormData((prev) => ({ ...prev, portfolio_highlights: e.target.value.split('\n').filter(h => h.trim()) }))}
                  placeholder="Professional service&#10;High quality work&#10;On-time delivery"
                  rows={4}
                  className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          {/* Location Section (for restaurants) */}
          {formData.category === "restaurant" && (
            <div className="border-t border-[var(--border)] pt-4 mt-4">
              <h3 className="font-semibold text-sm mb-3">📍 Location (Restaurant Only)</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest block mb-2">
                    Full Address
                  </label>
                  <textarea
                    value={formData.location_address || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, location_address: e.target.value }))}
                    placeholder="Full address with landmarks..."
                    rows={2}
                    className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest block mb-2">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      value={formData.location_lat || ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, location_lat: Number(e.target.value) }))}
                      placeholder="30.3255"
                      className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest block mb-2">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      value={formData.location_lng || ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, location_lng: Number(e.target.value) }))}
                      placeholder="78.0436"
                      className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tags Section */}
          <div className="border-t border-[var(--border)] pt-4 mt-4">
            <h3 className="font-semibold text-sm mb-3">🏷️ Tags</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest block mb-2">
                  Add Tags (for AI matching)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="Add tag and press Enter"
                    className="flex-1 bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2.5 rounded-xl bg-[var(--purple)] text-white text-sm font-medium hover:bg-[var(--purple-light)] transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-[rgba(107,63,160,0.08)] text-[var(--purple)]"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-[var(--coral)]"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Verified Status */}          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="verified"
              checked={formData.verified}
              onChange={(e) => setFormData((prev) => ({ ...prev, verified: e.target.checked }))}
              className="w-4 h-4 rounded"
            />
            <label htmlFor="verified" className="text-sm font-medium">
              Verified Vendor
            </label>
          </div>

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
              className="flex-1 px-5 py-2.5 rounded-full bg-[var(--purple)] text-white text-sm font-medium hover:bg-[var(--purple-light)] transition-colors"
            >
              {vendor ? "Update" : "Create"} Vendor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
