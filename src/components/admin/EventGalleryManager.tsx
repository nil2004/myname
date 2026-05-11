"use client";

import { useEffect, useState } from "react";
import type { EventGallery } from "@/app/api/event-gallery/route";
import MediaLibrary from "./MediaLibrary";

export default function EventGalleryManager() {
  const [gallery, setGallery] = useState<EventGallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<EventGallery | null>(null);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  useEffect(() => {
    fetchGallery();
  }, []);

  async function fetchGallery() {
    try {
      const response = await fetch("/api/event-gallery?published=false"); // Get all items
      const data = await response.json();
      setGallery(data.gallery || []);
    } catch (error) {
      console.error("Failed to fetch gallery:", error);
      alert("Failed to load gallery items");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this gallery item?")) return;

    try {
      const response = await fetch(`/api/event-gallery?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        alert("Failed to delete gallery item");
        return;
      }

      setGallery((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting gallery item:", error);
      alert("Failed to delete gallery item");
    }
  }

  async function handleToggleFeatured(item: EventGallery) {
    try {
      const response = await fetch("/api/event-gallery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          featured: !item.featured,
        }),
      });

      if (!response.ok) {
        alert("Failed to update gallery item");
        return;
      }

      fetchGallery();
    } catch (error) {
      console.error("Error updating gallery item:", error);
      alert("Failed to update gallery item");
    }
  }

  async function handleTogglePublished(item: EventGallery) {
    try {
      const response = await fetch("/api/event-gallery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          published: !item.published,
        }),
      });

      if (!response.ok) {
        alert("Failed to update gallery item");
        return;
      }

      fetchGallery();
    } catch (error) {
      console.error("Error updating gallery item:", error);
      alert("Failed to update gallery item");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-[var(--text-muted)]">Loading gallery...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[var(--border)] rounded-[20px] p-6 shadow-[0_4px_24px_rgba(26,15,46,0.06)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="font-playfair font-bold text-2xl">Event Gallery</div>
            <div className="text-sm text-[var(--text-muted)] mt-1">
              {gallery.length} gallery items
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => fetchGallery()}
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
              + Add Gallery Item
            </button>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {gallery.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-[var(--border)] rounded-[20px] overflow-hidden shadow-[0_4px_24px_rgba(26,15,46,0.06)]"
          >
            {/* Image Preview */}
            <div className="relative h-48 bg-[var(--cream)]">
              {item.images && item.images.length > 0 ? (
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">
                  🖼️
                </div>
              )}
              {item.images && item.images.length > 1 && (
                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                  +{item.images.length - 1} more
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="font-semibold">{item.title}</div>
                  <div className="text-xs text-[var(--text-muted)] mt-1">
                    {item.event_type} {item.theme && `• ${item.theme}`}
                  </div>
                </div>
                <div className="flex gap-1">
                  {item.featured && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(255,200,87,0.12)] text-[#FFC857]">
                      ⭐
                    </span>
                  )}
                  {item.published ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(29,158,117,0.12)] text-[#1D9E75]">
                      ✓
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(255,122,89,0.12)] text-[var(--coral)]">
                      Hidden
                    </span>
                  )}
                </div>
              </div>

              {item.description && (
                <div className="text-sm text-[var(--text-muted)] mb-3 line-clamp-2">
                  {item.description}
                </div>
              )}

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.tags.slice(0, 3).map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-0.5 rounded-full bg-[var(--cream)] text-[var(--text-muted)]"
                    >
                      {tag}
                    </span>
                  ))}
                  {item.tags.length > 3 && (
                    <span className="text-xs px-2 py-0.5 text-[var(--text-muted)]">
                      +{item.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingItem(item);
                    setShowCreateModal(true);
                  }}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs font-medium hover:border-[var(--purple)] transition-colors"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleToggleFeatured(item)}
                  className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs font-medium hover:border-[var(--purple)] transition-colors"
                  title={item.featured ? "Remove from featured" : "Mark as featured"}
                >
                  {item.featured ? "⭐" : "☆"}
                </button>
                <button
                  onClick={() => handleTogglePublished(item)}
                  className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs font-medium hover:border-[var(--purple)] transition-colors"
                  title={item.published ? "Hide" : "Publish"}
                >
                  {item.published ? "👁️" : "👁️‍🗨️"}
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs font-medium hover:border-[var(--coral)] transition-colors"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {gallery.length === 0 && (
        <div className="bg-white border border-[var(--border)] rounded-[20px] p-12 text-center">
          <div className="text-4xl mb-3">🖼️</div>
          <div className="text-lg font-medium text-[var(--text-muted)]">No gallery items yet</div>
          <div className="text-sm text-[var(--text-muted)] mt-1">
            Click "Add Gallery Item" to create your first event gallery
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <GalleryFormModal
          item={editingItem}
          onClose={() => {
            setShowCreateModal(false);
            setEditingItem(null);
          }}
          onSave={() => {
            setShowCreateModal(false);
            setEditingItem(null);
            fetchGallery();
          }}
        />
      )}
    </div>
  );
}

function GalleryFormModal({
  item,
  onClose,
  onSave,
}: {
  item: EventGallery | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [title, setTitle] = useState(item?.title || "");
  const [description, setDescription] = useState(item?.description || "");
  const [eventType, setEventType] = useState(item?.event_type || "birthday");
  const [theme, setTheme] = useState(item?.theme || "");
  const [images, setImages] = useState<string[]>(item?.images || []);
  const [tags, setTags] = useState<string[]>(item?.tags || []);
  const [tagInput, setTagInput] = useState("");
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
        title,
        description,
        eventType,
        theme,
        images,
        tags,
        featured,
        published,
      };

      const response = await fetch("/api/event-gallery", {
        method: item ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        alert("Failed to save gallery item");
        return;
      }

      onSave();
    } catch (error) {
      console.error("Error saving gallery item:", error);
      alert("Failed to save gallery item");
    } finally {
      setSaving(false);
    }
  }

  function handleAddTag() {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  }

  function handleRemoveTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  function handleMediaSelect(urls: string[]) {
    setImages([...images, ...urls]);
    setShowMediaLibrary(false);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[24px] max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[var(--border)] px-6 py-4 rounded-t-[24px]">
          <div className="flex items-center justify-between">
            <div className="font-playfair font-bold text-xl">
              {item ? "Edit Gallery Item" : "Add Gallery Item"}
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
          {/* Title */}
          <div>
            <label className="text-sm font-medium block mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g., Magical Cartoon Birthday Party"
              className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium block mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the event..."
              rows={3}
              className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors resize-none"
            />
          </div>

          {/* Event Type & Theme */}
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
              <label className="text-sm font-medium block mb-2">Theme</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
              >
                <option value="">Select theme...</option>
                <option value="Cartoon">Cartoon</option>
                <option value="Romantic">Romantic</option>
                <option value="Luxury">Luxury</option>
                <option value="Surprise">Surprise</option>
              </select>
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="text-sm font-medium block mb-2">Images</label>
            <div className="space-y-2">
              {images.map((url, index) => (
                <div key={index} className="flex items-center gap-2">
                  <img src={url} alt="" className="w-16 h-16 object-cover rounded-lg" />
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => {
                      const newImages = [...images];
                      newImages[index] = e.target.value;
                      setImages(newImages);
                    }}
                    className="flex-1 bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2 text-sm outline-none focus:border-[var(--purple)] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, i) => i !== index))}
                    className="px-3 py-2 rounded-lg border border-[var(--border)] text-sm hover:border-[var(--coral)] transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowMediaLibrary(true)}
                  className="px-4 py-2 rounded-xl border border-[var(--border)] text-sm font-medium hover:border-[var(--purple)] transition-colors"
                >
                  📁 Choose from Media Library
                </button>
                <button
                  type="button"
                  onClick={() => setImages([...images, ""])}
                  className="px-4 py-2 rounded-xl border border-[var(--border)] text-sm font-medium hover:border-[var(--purple)] transition-colors"
                >
                  + Add Image URL
                </button>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium block mb-2">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--cream)] text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-[var(--coral)]"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                placeholder="Add tag..."
                className="flex-1 bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2 text-sm outline-none focus:border-[var(--purple)] transition-colors"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 rounded-xl border border-[var(--border)] text-sm font-medium hover:border-[var(--purple)] transition-colors"
              >
                Add
              </button>
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
          multiple={true}
        />
      )}
    </div>
  );
}
