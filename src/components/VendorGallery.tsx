"use client";

import Image from "next/image";
import { useReveal } from "@/lib/useReveal";
import { useState, useEffect } from "react";

interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  event_type: string;
  images: string[];
  theme?: string;
  tags: string[];
}

export default function VendorGallery() {
  const { ref } = useReveal();
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGallery();
  }, []);

  async function fetchGallery() {
    try {
      const response = await fetch("/api/event-gallery?published=true&featured=true");
      const data = await response.json();
      setGalleryItems(data.gallery || []);
    } catch (error) {
      console.error("Failed to fetch gallery:", error);
    } finally {
      setLoading(false);
    }
  }

  // Hide section if no gallery items
  if (!loading && galleryItems.length === 0) {
    return null;
  }

  return (
    <section id="vendor-gallery" ref={ref} className="reveal py-24 px-[5%] bg-white">
      <span className="text-xs font-medium tracking-widest uppercase text-[var(--purple)] mb-3 block">
        Real Event Looks
      </span>
      <h2 className="font-playfair font-bold text-[clamp(2rem,4vw,3rem)] leading-[1.25] mb-3 max-w-[640px]">
        Vendor and decoration photo gallery
      </h2>
      <p className="text-[var(--text-muted)] leading-[1.7] max-w-[560px] mb-12">
        Explore sample visuals from decorators, photographers, venues, and DJs to quickly understand the party style
        you want.
      </p>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-[var(--text-muted)]">Loading gallery...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {galleryItems.map((item) => (
            <article
              key={item.id}
              className="group bg-[var(--warm-white)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-[0_8px_24px_rgba(26,15,46,0.06)] hover:shadow-[0_16px_34px_rgba(26,15,46,0.12)] hover:-translate-y-1 transition-all duration-200"
            >
              <div className="relative h-52 overflow-hidden bg-[var(--cream)] flex items-center justify-center">
                {item.images && item.images.length > 0 ? (
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <span className="text-7xl group-hover:scale-110 transition-transform duration-300">
                    🖼️
                  </span>
                )}
                <span className="absolute top-3 left-3 text-[0.68rem] font-medium tracking-wide uppercase bg-white/90 text-[var(--deep)] px-2.5 py-1 rounded-full">
                  {item.event_type}
                </span>
                {item.theme && (
                  <span className="absolute top-3 right-3 text-[0.68rem] font-medium tracking-wide uppercase bg-[var(--purple)]/90 text-white px-2.5 py-1 rounded-full">
                    {item.theme}
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium text-[1rem] leading-snug mb-1">{item.title}</h3>
                {item.description && (
                  <p className="text-xs text-[var(--text-muted)] line-clamp-2">{item.description}</p>
                )}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.tags.slice(0, 3).map((tag, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 rounded-full bg-[var(--cream)] text-[var(--text-muted)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

