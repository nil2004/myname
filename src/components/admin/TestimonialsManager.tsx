"use client";

import { useEffect, useState } from "react";
import type { ClientTestimonial } from "@/app/api/testimonials/route";
import MediaLibrary from "./MediaLibrary";

export default function TestimonialsManager() {
  const [testimonials, setTestimonials] = useState<ClientTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ClientTestimonial | null>(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  async function fetchTestimonials() {
    try {
      const response = await fetch("/api/testimonials?published=false"); // Get all items
      const data = await response.json();
      setTestimonials(data.testimonials || []);
    } catch (error) {
      console.error("Failed to fetch testimonials:", error);
      alert("Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this testimonial?")) return;

    try {
      const response = await fetch(`/api/testimonials?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        alert("Failed to delete testimonial");
        return;
      }

      setTestimonials((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      alert("Failed to delete testimonial");
    }
  }

  async function handleToggleFeatured(item: ClientTestimonial) {
    try {
      const response = await fetch("/api/testimonials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          featured: !item.featured,
        }),
      });

      if (!response.ok) {
        alert("Failed to update testimonial");
        return;
      }

      fetchTestimonials();
    } catch (error) {
      console.error("Error updating testimonial:", error);
      alert("Failed to update testimonial");
    }
  }

  async function handleTogglePublished(item: ClientTestimonial) {
    try {
      const response = await fetch("/api/testimonials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          published: !item.published,
        }),
      });

      if (!response.ok) {
        alert("Failed to update testimonial");
        return;
      }

      fetchTestimonials();
    } catch (error) {
      console.error("Error updating testimonial:", error);
      alert("Failed to update testimonial");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-[var(--text-muted)]">Loading testimonials...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[var(--border)] rounded-[20px] p-6 shadow-[0_4px_24px_rgba(26,15,46,0.06)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="font-playfair font-bold text-2xl">Client Testimonials</div>
            <div className="text-sm text-[var(--text-muted)] mt-1">
              {testimonials.length} testimonials
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => fetchTestimonials()}
              className="px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm font-medium hover:border-[var(--purple)] transition-colors"
            >
              🔄 Refresh
            </button>
            <button
              onClick={() => {
                setEditingItem(null);
                setShowCreateModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-[var(--purple)] text-white text-sm font-medium hover:bg-[var(--purple-light)] transition-colors"
            >
              + Add Testimonial
            </button>
          </div>
        </div>
      </div>

      {/* Testimonials List */}
      <div className="space-y-4">
        {testimonials.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-[var(--border)] rounded-[20px] p-6 shadow-[0_4px_24px_rgba(26,15,46,0.06)]"
          >
            <div className="flex items-start gap-4">
              {/* Client Image */}
              <div className="w-16 h-16 rounded-full bg-[var(--cream)] flex items-center justify-center text-2xl overflow-hidden flex-shrink-0">
                {item.client_image ? (
                  <img src={item.client_image} alt={item.client_name} className="w-full h-full object-cover" />
                ) : (
                  "👤"
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold">{item.client_name}</div>
                    <div className="text-xs text-[var(--text-muted)]">
                      {item.event_type} • ⭐ {item.rating}/5
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {item.featured && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(255,200,87,0.12)] text-[#FFC857]">
                        ⭐ Featured
                      </span>
                    )}
                    {item.published ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(29,158,117,0.12)] text-[#1D9E75]">
                        ✓ Published
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(255,122,89,0.12)] text-[var(--coral)]">
                        Hidden
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-sm text-[var(--text-muted)] mb-3">
                  "{item.review_text}"
                </div>

                {item.video_url && (
                  <div className="mb-3 p-3 bg-[var(--cream)] rounded-xl">
                    <div className="text-xs font-medium mb-1">Video Testimonial:</div>
                    <a
                      href={item.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[var(--purple)] hover:underline break-all"
                    >
                      {item.video_url}
                    </a>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingItem(item);
                      setShowCreateModal(true);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs font-medium hover:border-[var(--purple)] transition-colors"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleToggleFeatured(item)}
                    className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs font-medium hover:border-[var(--purple)] transition-colors"
                    title={item.featured ? "Remove from featured" : "Mark as featured"}
                  >
                    {item.featured ? "⭐ Featured" : "☆ Feature"}
                  </button>
                  <button
                    onClick={() => handleTogglePublished(item)}
                    className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs font-medium hover:border-[var(--purple)] transition-colors"
                    title={item.published ? "Hide" : "Publish"}
                  >
                    {item.published ? "👁️ Hide" : "👁️ Publish"}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs font-medium hover:border-[var(--coral)] transition-colors"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {testimonials.length === 0 && (
        <div className="bg-white border border-[var(--border)] rounded-[20px] p-12 text-center">
          <div className="text-4xl mb-3">💬</div>
          <div className="text-lg font-medium text-[var(--text-muted)]">No testimonials yet</div>
          <div className="text-sm text-[var(--text-muted)] mt-1">
            Click "Add Testimonial" to create your first client testimonial
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <TestimonialFormModal
          item={editingItem}
          onClose={() => {
            setShowCreateModal(false);
            setEditingItem(null);
          }}
          onSave={() => {
            setShowCreateModal(false);
            setEditingItem(null);
            fetchTestimonials();
          }}
        />
      )}
    </div>
  );
}

function TestimonialFormModal({
  item,
  onClose,
  onSave,
}: {
  item: ClientTestimonial | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [clientName, setClientName] = useState(item?.client_name || "");
  const [clientImage, setClientImage] = useState(item?.client_image || "");
  const [eventType, setEventType] = useState(item?.event_type || "birthday");
  const [reviewText, setReviewText] = useState(item?.review_text || "");
  const [rating, setRating] = useState(item?.rating || 5);
  const [videoUrl, setVideoUrl] = useState(item?.video_url || "");
  const [featured, setFeatured] = useState(item?.featured || false);
  const [published, setPublished] = useState(item?.published !== false);
  const [saving, setSaving] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const body = {
        id: item?.id,
        clientName,
        clientImage,
        eventType,
        reviewText,
        rating,
        videoUrl,
        featured,
        published,
      };

      const response = await fetch("/api/testimonials", {
        method: item ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        alert("Failed to save testimonial");
        return;
      }

      onSave();
    } catch (error) {
      console.error("Error saving testimonial:", error);
      alert("Failed to save testimonial");
    } finally {
      setSaving(false);
    }
  }

  function handleMediaSelect(urls: string[]) {
    if (urls.length > 0) {
      setClientImage(urls[0]);
    }
    setShowMediaLibrary(false);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[24px] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[var(--border)] px-6 py-4 rounded-t-[24px]">
          <div className="flex items-center justify-between">
            <div className="font-playfair font-bold text-xl">
              {item ? "Edit Testimonial" : "Add Testimonial"}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-[var(--cream)] flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Client Name */}
          <div>
            <label className="text-sm font-medium block mb-2">Client Name *</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
              placeholder="e.g., Priya Sharma"
              className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
            />
          </div>

          {/* Client Image */}
          <div>
            <label className="text-sm font-medium block mb-2">Client Image (Optional)</label>
            <div className="flex gap-2">
              {clientImage && (
                <img src={clientImage} alt="" className="w-16 h-16 rounded-full object-cover" />
              )}
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={clientImage}
                  onChange={(e) => setClientImage(e.target.value)}
                  placeholder="Image URL"
                  className="flex-1 bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowMediaLibrary(true)}
                  className="px-4 py-2 rounded-xl border border-[var(--border)] text-sm font-medium hover:border-[var(--purple)] transition-colors"
                >
                  📁 Browse
                </button>
              </div>
            </div>
          </div>

          {/* Event Type & Rating */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-2">Event Type *</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                required
                className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
              >
                <option value="birthday">Birthday</option>
                <option value="wedding">Wedding</option>
                <option value="corporate">Corporate</option>
                <option value="anniversary">Anniversary</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Rating *</label>
              <input
                type="number"
                value={rating}
                onChange={(e) => setRating(parseFloat(e.target.value))}
                required
                min="0"
                max="5"
                step="0.1"
                className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
              />
            </div>
          </div>

          {/* Review Text */}
          <div>
            <label className="text-sm font-medium block mb-2">Review Text *</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              required
              placeholder="Client's review..."
              rows={4}
              className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors resize-none"
            />
          </div>

          {/* Video URL */}
          <div>
            <label className="text-sm font-medium block mb-2">Video URL (Optional)</label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
            />
            <div className="text-xs text-[var(--text-muted)] mt-1">
              Supports YouTube, Vimeo, or direct video URLs
            </div>
          </div>

          {/* Options */}
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Published</span>
            </label>
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
              {saving ? "Saving..." : item ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>

      {/* Media Library Modal */}
      {showMediaLibrary && (
        <MediaLibrary
          onSelect={handleMediaSelect}
          onClose={() => setShowMediaLibrary(false)}
          multiple={false}
        />
      )}
    </div>
  );
}
