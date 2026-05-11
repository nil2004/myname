"use client";

import { useState } from "react";

type MediaItem = {
  id: string;
  name: string;
  type: "image" | "video";
  url: string;
  size: number;
  uploadedAt: string;
  category: string;
  tags: string[];
};

export default function MediaManager() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([
    {
      id: "m1",
      name: "birthday-decoration-1.jpg",
      type: "image",
      url: "https://via.placeholder.com/400x300/6B3FA0/FFFFFF?text=Decoration+1",
      size: 245000,
      uploadedAt: "2026-04-28T10:30:00Z",
      category: "decorations",
      tags: ["birthday", "cartoon", "balloons"],
    },
    {
      id: "m2",
      name: "cake-design-luxury.jpg",
      type: "image",
      url: "https://via.placeholder.com/400x300/FFC857/FFFFFF?text=Luxury+Cake",
      size: 312000,
      uploadedAt: "2026-04-27T14:20:00Z",
      category: "cakes",
      tags: ["luxury", "fondant", "3d"],
    },
    {
      id: "m3",
      name: "event-setup-video.mp4",
      type: "video",
      url: "https://via.placeholder.com/400x300/1D9E75/FFFFFF?text=Setup+Video",
      size: 5240000,
      uploadedAt: "2026-04-26T09:15:00Z",
      category: "videos",
      tags: ["setup", "timelapse", "event"],
    },
    {
      id: "m4",
      name: "photographer-portfolio.jpg",
      type: "image",
      url: "https://via.placeholder.com/400x300/FF7A59/FFFFFF?text=Photography",
      size: 189000,
      uploadedAt: "2026-04-25T16:45:00Z",
      category: "portfolio",
      tags: ["photography", "candid", "moments"],
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "image" | "video">("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showUploadModal, setShowUploadModal] = useState(false);

  const categories = ["all", "decorations", "cakes", "videos", "portfolio", "vendors"];

  const filteredMedia = mediaItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === "all" || item.type === filterType;
    const matchesCategory = filterCategory === "all" || item.category === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  function formatFileSize(bytes: number) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  function toggleSelection(id: string) {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleDeleteSelected() {
    if (selectedItems.size === 0) return;
    if (confirm(`Delete ${selectedItems.size} selected item(s)?`)) {
      setMediaItems((prev) => prev.filter((item) => !selectedItems.has(item.id)));
      setSelectedItems(new Set());
    }
  }

  function handleDelete(id: string) {
    if (confirm("Delete this media item?")) {
      setMediaItems((prev) => prev.filter((item) => item.id !== id));
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[var(--border)] rounded-[20px] p-6 shadow-[0_4px_24px_rgba(26,15,46,0.06)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="font-playfair font-bold text-2xl">Media Library</div>
            <div className="text-sm text-[var(--text-muted)] mt-1">
              {filteredMedia.length} items · {selectedItems.size} selected
            </div>
          </div>
          <div className="flex gap-2">
            {selectedItems.size > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="px-5 py-2.5 rounded-full border border-[var(--coral)] text-[var(--coral)] text-sm font-medium hover:bg-[rgba(255,122,89,0.05)] transition-colors"
              >
                🗑️ Delete ({selectedItems.size})
              </button>
            )}
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-5 py-2.5 rounded-full bg-[var(--purple)] text-white text-sm font-medium hover:bg-[var(--purple-light)] transition-colors"
            >
              ⬆️ Upload Media
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or tags..."
            className="bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as "all" | "image" | "video")}
            className="bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
          >
            <option value="all">All Types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
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

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredMedia.map((item) => (
          <div
            key={item.id}
            className={`bg-white border rounded-[20px] overflow-hidden shadow-[0_4px_24px_rgba(26,15,46,0.06)] hover:shadow-[0_8px_32px_rgba(26,15,46,0.10)] transition-all ${
              selectedItems.has(item.id) ? "ring-2 ring-[var(--purple)]" : "border-[var(--border)]"
            }`}
          >
            {/* Image/Video Preview */}
            <div className="relative aspect-[4/3] bg-[var(--cream)]">
              <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
              <div className="absolute top-2 left-2">
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    item.type === "image"
                      ? "bg-[rgba(107,63,160,0.90)] text-white"
                      : "bg-[rgba(255,200,87,0.90)] text-[var(--deep)]"
                  }`}
                >
                  {item.type === "image" ? "🖼️ Image" : "🎥 Video"}
                </span>
              </div>
              <div className="absolute top-2 right-2">
                <button
                  onClick={() => toggleSelection(item.id)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    selectedItems.has(item.id)
                      ? "bg-[var(--purple)] border-[var(--purple)] text-white"
                      : "bg-white/90 border-white/90 hover:bg-[var(--purple)] hover:border-[var(--purple)] hover:text-white"
                  }`}
                >
                  {selectedItems.has(item.id) && "✓"}
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <div className="font-medium text-sm truncate mb-1">{item.name}</div>
              <div className="text-xs text-[var(--text-muted)] mb-3">
                {formatFileSize(item.size)} ·{" "}
                {new Date(item.uploadedAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {item.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="text-[0.65rem] px-2 py-0.5 rounded-full bg-[rgba(107,63,160,0.08)] text-[var(--purple)]"
                  >
                    {tag}
                  </span>
                ))}
                {item.tags.length > 2 && (
                  <span className="text-[0.65rem] px-2 py-0.5 rounded-full bg-[rgba(26,15,46,0.06)] text-[var(--text-muted)]">
                    +{item.tags.length - 2}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <button className="flex-1 px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs font-medium hover:border-[var(--purple)] hover:bg-[rgba(107,63,160,0.05)] transition-colors">
                  👁️ View
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs font-medium hover:border-[var(--coral)] hover:bg-[rgba(255,122,89,0.05)] transition-colors"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMedia.length === 0 && (
        <div className="bg-white border border-[var(--border)] rounded-[20px] p-12 text-center">
          <div className="text-4xl mb-3">🖼️</div>
          <div className="text-lg font-medium text-[var(--text-muted)]">No media found</div>
          <div className="text-sm text-[var(--text-muted)] mt-1">
            Try adjusting your search or filters
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={(newItem) => {
            setMediaItems((prev) => [newItem, ...prev]);
            setShowUploadModal(false);
          }}
        />
      )}
    </div>
  );
}

function UploadModal({
  onClose,
  onUpload,
}: {
  onClose: () => void;
  onUpload: (item: MediaItem) => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    type: "image" as "image" | "video",
    category: "decorations",
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newItem: MediaItem = {
      id: `m${Date.now()}`,
      name: formData.name || "untitled.jpg",
      type: formData.type,
      url: `https://via.placeholder.com/400x300/6B3FA0/FFFFFF?text=${encodeURIComponent(formData.name || "New")}`,
      size: Math.floor(Math.random() * 500000) + 100000,
      uploadedAt: new Date().toISOString(),
      category: formData.category,
      tags: formData.tags,
    };
    onUpload(newItem);
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
            <div className="font-playfair font-bold text-xl">Upload Media</div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-[var(--cream)] flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Drag & Drop Area */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              // Handle file drop
            }}
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${
              isDragging
                ? "border-[var(--purple)] bg-[rgba(107,63,160,0.05)]"
                : "border-[var(--border)] hover:border-[var(--purple)]"
            }`}
          >
            <div className="text-4xl mb-3">⬆️</div>
            <div className="text-sm font-medium mb-1">Drag & drop files here</div>
            <div className="text-xs text-[var(--text-muted)] mb-4">or click to browse</div>
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              id="file-upload"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setFormData((prev) => ({
                    ...prev,
                    name: file.name,
                    type: file.type.startsWith("video") ? "video" : "image",
                  }));
                }
              }}
            />
            <label
              htmlFor="file-upload"
              className="inline-block px-5 py-2.5 rounded-full bg-[var(--purple)] text-white text-sm font-medium hover:bg-[var(--purple-light)] transition-colors cursor-pointer"
            >
              Choose File
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest block mb-2">
                File Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. birthday-decoration.jpg"
                className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest block mb-2">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value as "image" | "video" }))}
                className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest block mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
              >
                <option value="decorations">Decorations</option>
                <option value="cakes">Cakes</option>
                <option value="videos">Videos</option>
                <option value="portfolio">Portfolio</option>
                <option value="vendors">Vendors</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest block mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
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
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-[rgba(107,63,160,0.08)] text-[var(--purple)]"
                >
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-[var(--coral)]">
                    ✕
                  </button>
                </span>
              ))}
            </div>
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
              Upload
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
