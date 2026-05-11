"use client";

import { useState, useEffect } from "react";

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

export default function MediaLibrary({
  onSelect,
  onClose,
  multiple = false,
}: {
  onSelect: (urls: string[]) => void;
  onClose: () => void;
  multiple?: boolean;
}) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([
    {
      id: "m1",
      name: "birthday-decoration-1.jpg",
      type: "image",
      url: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800",
      size: 245000,
      uploadedAt: "2026-04-28T10:30:00Z",
      category: "decorations",
      tags: ["birthday", "cartoon", "balloons"],
    },
    {
      id: "m2",
      name: "cake-design-luxury.jpg",
      type: "image",
      url: "https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=800",
      size: 312000,
      uploadedAt: "2026-04-27T14:20:00Z",
      category: "cakes",
      tags: ["luxury", "fondant", "3d"],
    },
    {
      id: "m3",
      name: "romantic-setup.jpg",
      type: "image",
      url: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800",
      size: 189000,
      uploadedAt: "2026-04-25T16:45:00Z",
      category: "decorations",
      tags: ["romantic", "candles", "elegant"],
    },
    {
      id: "m4",
      name: "party-balloons.jpg",
      type: "image",
      url: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800",
      size: 198000,
      uploadedAt: "2026-04-24T12:30:00Z",
      category: "decorations",
      tags: ["balloons", "colorful", "party"],
    },
    {
      id: "m5",
      name: "birthday-cake.jpg",
      type: "image",
      url: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800",
      size: 221000,
      uploadedAt: "2026-04-23T09:15:00Z",
      category: "cakes",
      tags: ["birthday", "cake", "celebration"],
    },
    {
      id: "m6",
      name: "elegant-dinner.jpg",
      type: "image",
      url: "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800",
      size: 267000,
      uploadedAt: "2026-04-22T18:45:00Z",
      category: "decorations",
      tags: ["dinner", "elegant", "table"],
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const categories = ["all", "decorations", "cakes", "videos", "portfolio", "vendors"];

  const filteredMedia = mediaItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = filterCategory === "all" || item.category === filterCategory;
    return matchesSearch && matchesCategory && item.type === "image"; // Only show images
  });

  function toggleSelection(id: string, url: string) {
    if (!multiple) {
      // Single selection mode
      setSelectedItems(new Set([id]));
    } else {
      // Multiple selection mode
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
  }

  function handleSelect() {
    const selectedUrls = mediaItems
      .filter((item) => selectedItems.has(item.id))
      .map((item) => item.url);
    onSelect(selectedUrls);
  }

  function formatFileSize(bytes: number) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-[24px] max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-[var(--border)] px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-playfair font-bold text-xl">Media Library</div>
              <div className="text-xs text-[var(--text-muted)] mt-1">
                {selectedItems.size} selected · {multiple ? "Multiple selection" : "Single selection"}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-[var(--cream)] flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or tags..."
              className="bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--purple)] transition-colors"
            />
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
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredMedia.map((item) => {
              const isSelected = selectedItems.has(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleSelection(item.id, item.url)}
                  className={`relative bg-white border rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                    isSelected ? "ring-2 ring-[var(--purple)] shadow-lg" : "border-[var(--border)]"
                  }`}
                >
                  {/* Image */}
                  <div className="relative aspect-square bg-[var(--cream)]">
                    <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? "bg-[var(--purple)] border-[var(--purple)] text-white"
                            : "bg-white/90 border-white/90"
                        }`}
                      >
                        {isSelected && "✓"}
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-2">
                    <div className="text-xs font-medium truncate">{item.name}</div>
                    <div className="text-[0.65rem] text-[var(--text-muted)]">
                      {formatFileSize(item.size)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredMedia.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🖼️</div>
              <div className="text-lg font-medium text-[var(--text-muted)]">No images found</div>
              <div className="text-sm text-[var(--text-muted)] mt-1">
                Try adjusting your search or filters
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--border)] px-6 py-4">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-5 py-2.5 rounded-full border border-[var(--border)] text-sm font-medium hover:border-[var(--purple)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSelect}
              disabled={selectedItems.size === 0}
              className="flex-1 px-5 py-2.5 rounded-full bg-[var(--purple)] text-white text-sm font-medium hover:bg-[var(--purple-light)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Select {selectedItems.size > 0 && `(${selectedItems.size})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
