"use client";

import { useReveal } from "@/lib/useReveal";
import { useEffect, useState } from "react";

interface VideoTestimonial {
  id: string;
  client_name: string;
  event_type: string;
  video_url: string;
  video_thumbnail?: string;
  rating: number;
}

export default function ExperienceStories() {
  const { ref } = useReveal();
  const [stories, setStories] = useState<VideoTestimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideoTestimonials();
  }, []);

  async function fetchVideoTestimonials() {
    try {
      // Fetch testimonials that have video URLs
      const response = await fetch("/api/testimonials?published=true");
      const data = await response.json();
      const videosOnly = (data.testimonials || []).filter((t: any) => t.video_url);
      setStories(videosOnly);
    } catch (error) {
      console.error("Failed to fetch video testimonials:", error);
    } finally {
      setLoading(false);
    }
  }

  // Hide section if no video testimonials
  if (!loading && stories.length === 0) {
    return null;
  }

  function getYouTubeThumbnail(url: string): string {
    // Extract YouTube video ID and return thumbnail
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    if (match && match[1]) {
      return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
    }
    return "";
  }

  function getVideoEmbed(url: string): string {
    // Convert YouTube URL to embed URL
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    return url;
  }

  return (
    <section ref={ref} className="reveal py-20 px-[5%] bg-[var(--cream)]">
      <div className="text-center mb-8">
        <span className="text-xs font-medium tracking-widest uppercase text-[var(--purple)] mb-3 block">
          Client Stories
        </span>
        <h2 className="font-playfair font-bold text-[clamp(2rem,4vw,3.2rem)] leading-[1.2] mb-2">
          Our clients&apos; reviews & experiences
        </h2>
        <p className="text-[var(--text-muted)] text-sm">
          See real celebrations from families who booked through UtsavAI.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-[var(--text-muted)]">Loading stories...</div>
        </div>
      ) : (
        <div className="overflow-x-auto pb-3">
          <div className="flex gap-4 min-w-max">
            {stories.map((story) => {
              const thumbnail = story.video_thumbnail || getYouTubeThumbnail(story.video_url);
              
              return (
                <article
                  key={story.id}
                  className="relative w-[190px] sm:w-[210px] h-[330px] rounded-[18px] overflow-hidden border border-[rgba(26,15,46,0.12)] shadow-[0_12px_28px_rgba(26,15,46,0.12)] bg-gradient-to-br from-purple-400 to-indigo-500 cursor-pointer group"
                  onClick={() => window.open(story.video_url, "_blank")}
                >
                  {thumbnail ? (
                    <>
                      <img
                        src={thumbnail}
                        alt={story.client_name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(26,15,46,0.84)] via-[rgba(26,15,46,0.16)] to-transparent" />
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-8xl opacity-30">🎥</span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(26,15,46,0.84)] via-[rgba(26,15,46,0.16)] to-transparent" />
                    </>
                  )}

                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 text-[var(--purple)] ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>

                  <div className="absolute top-3 left-3 text-[0.65rem] px-2 py-1 rounded-full bg-[rgba(0,0,0,0.5)] text-white flex items-center gap-1">
                    ⭐ {story.rating.toFixed(1)}
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-playfair font-bold text-[1.45rem] leading-[1.05] drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
                      {story.client_name}
                    </h3>
                    <div className="inline-block mt-2 text-[0.62rem] tracking-wide uppercase px-2 py-1 rounded-full bg-white/20 border border-white/20">
                      {story.event_type} • Video Review
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

