"use client";

import { useReveal } from "@/lib/useReveal";

const vendorTypes = [
  { emoji: "🎨", name: "Decorators", count: "Balloon, theme, floral" },
  { emoji: "📸", name: "Photographers", count: "Photos + videos" },
  { emoji: "🎂", name: "Cake Artists", count: "Custom + theme cakes" },
  { emoji: "🎵", name: "DJs & Music", count: "Kids party specialists" },
  { emoji: "🎪", name: "Entertainment", count: "Magicians, clowns, games" },
  { emoji: "🍕", name: "Catering", count: "Snacks, food stalls" },
];

export default function Vendors() {
  const { ref } = useReveal();

  return (
    <section
      id="vendors"
      ref={ref}
      className="reveal py-24 px-[5%] bg-[var(--warm-white)]"
    >
      <span className="text-xs font-medium tracking-widest uppercase text-[var(--purple)] mb-3 block">
        Vendor categories
      </span>
      <h2 className="font-playfair font-bold text-[clamp(2rem,4vw,3rem)] leading-[1.25] mb-3 max-w-[600px]">
        Every vendor your child&apos;s party needs
      </h2>
      <p className="text-[var(--text-muted)] leading-[1.7] max-w-[480px] mb-12">
        All verified, all in Dehradun, all on one platform.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {vendorTypes.map((v) => (
          <div
            key={v.name}
            className="bg-[var(--cream)] border border-[var(--border)] rounded-2xl p-6 text-center cursor-pointer hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(107,63,160,0.10)] hover:border-[rgba(107,63,160,0.3)] transition-all duration-200"
          >
            <span className="text-3xl block mb-2.5">{v.emoji}</span>
            <div className="text-sm font-medium">{v.name}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">{v.count}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
