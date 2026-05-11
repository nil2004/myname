"use client";

import { useState } from "react";
import { useReveal } from "@/lib/useReveal";

export default function CTA() {
  const { ref } = useReveal();
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async () => {
    if (phone.replace(/\D/g, "").length < 10) {
      setError(true);
      return;
    }
    setError(false);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (res.ok) setSubmitted(true);
    } catch {
      // Optimistic UI — show success even if API is unavailable in dev
      setSubmitted(true);
    }
  };

  return (
    <section
      id="cta"
      ref={ref}
      className="reveal py-24 px-[5%] text-center bg-[var(--cream)] relative overflow-hidden"
    >
      {/* Background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(107,63,160,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="bg-[var(--deep)] rounded-[28px] p-16 max-w-[700px] mx-auto relative overflow-hidden">
        {/* Inner glow */}
        <div
          className="absolute -top-1/2 -right-1/5 w-[400px] h-[400px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(107,63,160,0.4) 0%, transparent 70%)",
          }}
        />

        <span className="text-xs font-medium tracking-widest uppercase text-[var(--gold)] mb-3 block relative z-10">
          Get started free
        </span>
        <h2 className="font-playfair font-bold text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[1.25] text-white mb-3 relative z-10">
          Your child&apos;s birthday
          <br />
          deserves better than jugaad.
        </h2>
        <p className="text-[rgba(255,255,255,0.5)] leading-[1.7] mb-8 relative z-10">
          Enter your number. We&apos;ll help you plan it — for free.
        </p>

        <div className="flex gap-3 max-w-[440px] mx-auto flex-wrap justify-center relative z-10">
          <input
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setError(false);
            }}
            placeholder="Enter your WhatsApp number"
            className={`flex-1 min-w-[200px] bg-[rgba(255,255,255,0.08)] border rounded-full px-5 py-3.5 text-white text-sm outline-none placeholder:text-[rgba(255,255,255,0.35)] focus:border-[var(--purple-light)] transition-colors ${
              error
                ? "border-[var(--coral)]"
                : "border-[rgba(255,255,255,0.15)]"
            }`}
          />
          <button
            onClick={handleSubmit}
            className={`px-7 py-3.5 rounded-full text-sm font-medium whitespace-nowrap transition-all hover:-translate-y-px ${
              submitted
                ? "bg-[#1D9E75] text-white"
                : "bg-[var(--gold)] text-[var(--deep)] hover:bg-[var(--gold-light)]"
            }`}
          >
            {submitted ? "We'll call you! 🎉" : "Start Planning"}
          </button>
        </div>

        <p className="text-[0.75rem] text-[rgba(255,255,255,0.25)] mt-4 relative z-10">
          No spam. We&apos;ll only reach out to help plan your party.
        </p>
      </div>
    </section>
  );
}
