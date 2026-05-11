"use client";

import { useReveal } from "@/lib/useReveal";

const features = [
  {
    icon: "🔒",
    title: "Every vendor is verified",
    desc: "We personally vet every vendor before listing — reviews from real Dehradun parents, not strangers on the internet.",
  },
  {
    icon: "💰",
    title: "Fixed, transparent pricing",
    desc: "No bargaining, no surprise charges. What you see is what you pay. Every time.",
  },
  {
    icon: "🛡️",
    title: "Last-minute cancellation protection",
    desc: "If a vendor cancels, we find a replacement — free of charge. Your child's birthday is too important to leave to chance.",
  },
  {
    icon: "⚡",
    title: "Plan in under 10 minutes",
    desc: "What used to take 3 days of calls and WhatsApp messages now takes one cup of chai.",
  },
];

const vendors = [
  { name: "Celebrations by Riya", rating: "★★★★★ 4.9", price: "₹8,500" },
  { name: "Happy Moments Studio", rating: "★★★★★ 4.8", price: "₹6,000", highlight: true },
  { name: "Sweetie's Cake House", rating: "★★★★☆ 4.7", price: "₹2,800" },
];

export default function Features() {
  const { ref: sectionRef } = useReveal();
  const { ref: visualRef } = useReveal();
  const { ref: listRef } = useReveal();

  return (
    <section
      ref={sectionRef}
      className="reveal grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center py-24 px-[5%]"
    >
      {/* Mock App Visual */}
      <div
        ref={visualRef}
        className="reveal bg-gradient-to-br from-[rgba(107,63,160,0.06)] to-[rgba(232,168,48,0.06)] border border-[var(--border)] rounded-[24px] p-8"
      >
        <div className="bg-white rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(26,15,46,0.10)]">
          {/* Mock header */}
          <div className="bg-[var(--purple)] px-5 py-4 flex items-center gap-2.5">
            <span className="font-playfair text-white font-bold">UtsavAI</span>
          </div>
          {/* Mock body */}
          <div className="p-5">
            <p className="text-[0.7rem] font-medium text-[var(--text-muted)] uppercase tracking-[0.06em] mb-2">
              Your party details
            </p>
            {[
              { label: "Budget: ₹20,000" },
              { label: "Date: 15 June 2025" },
              { label: "City: Dehradun" },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-[var(--cream)] border border-[var(--border)] rounded-[10px] px-4 py-2.5 text-sm flex items-center justify-between mb-3"
              >
                <span>{item.label}</span>
                <span className="text-[var(--purple)] text-xs">✓</span>
              </div>
            ))}

            <p className="text-[0.7rem] font-medium text-[var(--text-muted)] uppercase tracking-[0.06em] mt-4 mb-3">
              AI matched vendors
            </p>
            <div className="flex flex-col gap-2.5">
              {vendors.map((v) => (
                <div
                  key={v.name}
                  className={`bg-[var(--cream)] border rounded-xl px-4 py-2.5 flex items-center justify-between text-[0.82rem] ${
                    v.highlight
                      ? "border-[rgba(107,63,160,0.3)]"
                      : "border-[var(--border)]"
                  }`}
                >
                  <div>
                    <div className="font-medium">{v.name}</div>
                    <div className="text-[var(--gold)] text-xs">{v.rating}</div>
                  </div>
                  <div className="text-[var(--purple)] font-medium text-xs">
                    {v.price}
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-[var(--purple)] text-white text-center py-2.5 rounded-[10px] text-sm font-medium mt-3 cursor-pointer hover:bg-[var(--purple-light)] transition-colors">
              Book all 3 — ₹17,300 total
            </div>
          </div>
        </div>
      </div>

      {/* Feature list */}
      <div ref={listRef} className="reveal">
        <span className="text-xs font-medium tracking-widest uppercase text-[var(--purple)] mb-3 block">
          Why parents love it
        </span>
        <h2 className="font-playfair font-bold text-[clamp(2rem,4vw,3rem)] leading-[1.25] mb-8">
          Everything traditional planning gets wrong — we get right.
        </h2>
        <div className="flex flex-col gap-7">
          {features.map((f) => (
            <div key={f.title} className="flex gap-4 items-start">
              <div className="w-11 h-11 rounded-xl bg-[rgba(107,63,160,0.08)] flex items-center justify-center text-xl flex-shrink-0">
                {f.icon}
              </div>
              <div>
                <div className="font-medium mb-1">{f.title}</div>
                <div className="text-sm text-[var(--text-muted)] leading-[1.6]">
                  {f.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
