"use client";

import Link from "next/link";
import Image from "next/image";

const floatingCards = [
  { icon: "🎂", label: "Cake booked!", className: "top-[22%] left-[5%] delay-0" },
  { icon: "🎈", label: "Decorator confirmed", className: "top-[30%] right-[4%] delay-[1.5s]" },
  { icon: "📸", label: "Photographer ready", className: "bottom-[28%] left-[6%] delay-[0.8s]" },
];

export default function Hero() {
  return (
    <section 
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-[5%] pt-32 pb-20 overflow-hidden bg-[var(--cream)]"
    >
      {/* Background Image - Desktop only */}
      <div className="absolute inset-0 z-0 hidden md:block">
        <Image
          src="/hero-image-optimized.jpg"
          alt="Birthday celebration background"
          fill
          priority
          quality={90}
          sizes="100vw"
          style={{
            objectFit: 'cover',
            objectPosition: 'center',
          }}
          unoptimized
        />
      </div>

      {/* Subtle color gradients for depth - Desktop only */}
      <div
        className="absolute inset-0 z-[6] pointer-events-none hidden md:block"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 20% 20%, rgba(107,63,160,0.02) 0%, transparent 70%),
            radial-gradient(ellipse 50% 40% at 80% 80%, rgba(232,168,48,0.02) 0%, transparent 70%)
          `,
        }}
      />

      {/* Floating cards */}
      {floatingCards.map((card) => (
        <div
          key={card.label}
          className={`absolute z-10 hidden md:flex items-center gap-2 bg-white border border-[var(--border)] rounded-2xl px-4 py-3 text-sm font-medium shadow-[0_8px_32px_rgba(26,15,46,0.10)] animate-float ${card.className}`}
        >
          <span className="text-xl">{card.icon}</span>
          <span>{card.label}</span>
        </div>
      ))}

      {/* Badge */}
      <div
        className="relative z-20 inline-flex items-center gap-2 bg-[rgba(107,63,160,0.08)] border border-[rgba(107,63,160,0.2)] rounded-full px-4 py-1.5 text-xs font-medium text-[var(--purple)] mb-7 animate-[fadeUp_0.6s_ease_both]"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]" />
        Now live in Dehradun
      </div>

      {/* Headline */}
      <h1
        className="relative z-20 font-playfair font-bold leading-[1.15] max-w-[820px] mb-6 text-[clamp(2.8rem,6vw,5rem)] animate-[fadeUp_0.7s_0.1s_ease_both] text-[var(--deep)]"
      >
        Your child&apos;s <em className="italic text-[var(--purple)]">dream birthday</em>
        <br />
        planned in{" "}
        <span className="text-[var(--gold)] not-italic">3 clicks.</span>
      </h1>

      {/* Subheading */}
      <p
        className="relative z-20 text-lg text-[var(--text-muted)] max-w-[520px] leading-[1.7] mb-10 animate-[fadeUp_0.7s_0.2s_ease_both]"
      >
        No calls. No bargaining. No stress. UtsavAI matches you with Dehradun&apos;s
        best verified vendors — decorator, cake, photographer — instantly.
      </p>

      {/* CTAs */}
      <div className="relative z-20 flex gap-4 flex-wrap justify-center mb-14 animate-[fadeUp_0.7s_0.3s_ease_both]">
        <Link
          href="/plan"
          className="bg-[var(--purple)] text-white px-8 py-3.5 rounded-full text-base font-medium shadow-[0_4px_20px_rgba(107,63,160,0.3)] hover:bg-[var(--purple-light)] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(107,63,160,0.4)] transition-all"
        >
          Plan Birthday Now
        </Link>
        <Link
          href="#how"
          className="bg-transparent text-[var(--deep)] px-8 py-3.5 rounded-full text-base font-medium border border-[rgba(26,15,46,0.2)] hover:border-[var(--purple)] hover:-translate-y-0.5 transition-all"
        >
          See how it works
        </Link>
      </div>

      {/* Stats */}
      <div className="relative z-20 flex gap-12 flex-wrap justify-center animate-[fadeUp_0.7s_0.4s_ease_both]">
        {[
          { num: "3", label: "Clicks to book" },
          { num: "₹0", label: "Platform fee" },
          { num: "100%", label: "Verified vendors" },
          { num: "Ddn", label: "Now serving" },
        ].map((stat, i) => (
          <div key={stat.label} className="flex items-center gap-12">
            {i > 0 && (
              <div className="hidden sm:block w-px h-10 bg-[var(--border)]" />
            )}
            <div className="text-center">
              <span className="font-playfair text-3xl font-bold text-[var(--deep)] block">
                {stat.num}
              </span>
              <span className="text-xs text-[var(--text-muted)] mt-0.5 block">
                {stat.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
