"use client";

import { useReveal } from "@/lib/useReveal";
import { useEffect, useState } from "react";

interface Partner {
  id: string;
  name: string;
  logo: string;
  category: string;
  description: string;
  website: string;
  featured: boolean;
  display_order: number;
  status: string;
}

export default function Partners() {
  const { ref } = useReveal();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const response = await fetch("/api/partners?status=active");
      const data = await response.json();
      if (response.ok) {
        setPartners(data.partners || []);
      }
    } catch (error) {
      console.error("Error fetching partners:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section className="reveal py-20 px-[5%] bg-white border-y border-[var(--border)]">
        <div className="text-center">
          <div className="text-[var(--text-muted)]">Loading partners...</div>
        </div>
      </section>
    );
  }

  if (partners.length === 0) {
    return null; // Hide section if no partners
  }

  return (
    <section
      ref={ref}
      className="reveal py-20 px-[5%] bg-white border-y border-[var(--border)]"
    >
      <div className="text-center mb-12">
        <span className="text-xs font-medium tracking-widest uppercase text-[var(--purple)] mb-3 block">
          Trusted Partners
        </span>
        <h2 className="font-playfair font-bold text-[clamp(1.8rem,3.5vw,2.5rem)] leading-[1.25] mb-3">
          Partnered with Dehradun&apos;s best vendors
        </h2>
        <p className="text-[var(--text-muted)] leading-[1.7] max-w-[520px] mx-auto">
          Every vendor is personally verified and rated by real parents in your city.
        </p>
      </div>

      {/* Partner logos grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
        {partners.map((partner, index) => (
          <PartnerCard key={partner.name} partner={partner} index={index} />
        ))}
      </div>

      {/* Stats bar */}
      <div className="mt-16 pt-12 border-t border-[var(--border)] grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
        {[
          { value: `${partners.length}+`, label: "Verified Vendors" },
          { value: "4.8★", label: "Average Rating" },
          { value: "500+", label: "Happy Families" },
          { value: "100%", label: "Satisfaction Rate" },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="font-playfair text-3xl md:text-4xl font-bold text-[var(--purple)] mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-[var(--text-muted)]">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PartnerCard({ partner, index }: { partner: Partner; index: number }) {
  const { ref } = useReveal();

  return (
    <div
      ref={ref}
      className="reveal bg-[var(--cream)] border border-[var(--border)] rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-[var(--purple)] hover:shadow-[0_8px_24px_rgba(107,63,160,0.12)] hover:-translate-y-1 transition-all duration-300"
      style={{
        animationDelay: `${index * 50}ms`
      }}
    >
      {/* Logo placeholder - using emoji or first letter */}
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--purple)] to-[var(--gold)] flex items-center justify-center text-white font-playfair text-2xl font-bold mb-3">
        {partner.logo || partner.name.charAt(0)}
      </div>
      <h3 className="font-medium text-sm mb-1 text-[var(--deep)]">
        {partner.name}
      </h3>
      <p className="text-xs text-[var(--text-muted)]">{partner.category}</p>
    </div>
  );
}
