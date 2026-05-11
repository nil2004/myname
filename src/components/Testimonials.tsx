"use client";

import { useReveal } from "@/lib/useReveal";
import { useEffect, useState } from "react";

interface Testimonial {
  id: string;
  client_name: string;
  client_image?: string;
  event_type: string;
  review_text: string;
  rating: number;
}

export default function Testimonials() {
  const { ref } = useReveal();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  async function fetchTestimonials() {
    try {
      const response = await fetch("/api/testimonials?published=true&featured=true");
      const data = await response.json();
      setTestimonials(data.testimonials || []);
    } catch (error) {
      console.error("Failed to fetch testimonials:", error);
    } finally {
      setLoading(false);
    }
  }

  // Hide section if no testimonials
  if (!loading && testimonials.length === 0) {
    return null;
  }

  function getInitials(name: string): string {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  function getStars(rating: number): string {
    const fullStars = Math.floor(rating);
    return "★".repeat(fullStars) + "☆".repeat(5 - fullStars);
  }

  return (
    <section
      id="reviews"
      ref={ref}
      className="reveal py-24 px-[5%] bg-[var(--deep)] text-white relative overflow-hidden"
    >
      {/* Background glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 80% 50%, rgba(107,63,160,0.3) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-xl mb-12">
        <span className="text-xs font-medium tracking-widest uppercase text-[var(--gold)] mb-3 block">
          Parent stories
        </span>
        <h2 className="font-playfair font-bold text-[clamp(2rem,4vw,3rem)] leading-[1.25] text-white mb-3">
          Real parents. Real birthdays. Real magic.
        </h2>
        <p className="text-[rgba(255,255,255,0.5)] leading-[1.7]">
          From Dehradun families who trusted UtsavAI with their child&apos;s special day.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-[rgba(255,255,255,0.5)]">Loading testimonials...</div>
        </div>
      ) : (
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.10)] rounded-[20px] p-7 hover:bg-[rgba(255,255,255,0.08)] transition-colors"
            >
              <div className="text-[var(--gold)] tracking-[2px] text-sm mb-3">
                {getStars(t.rating)}
              </div>
              <p className="text-sm text-[rgba(255,255,255,0.8)] leading-[1.7] mb-5 italic">
                &quot;{t.review_text}&quot;
              </p>
              <div className="flex items-center gap-3">
                {t.client_image ? (
                  <img
                    src={t.client_image}
                    alt={t.client_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm text-white bg-[var(--purple)]">
                    {getInitials(t.client_name)}
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium">{t.client_name}</div>
                  <div className="text-xs text-[rgba(255,255,255,0.4)]">
                    {t.event_type} event
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
