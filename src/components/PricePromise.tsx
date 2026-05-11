"use client";

import { useReveal } from "@/lib/useReveal";

const guarantees = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Best Price Guarantee",
    desc: "Found a lower price elsewhere? We'll match it and provide ₹500 credit for your next booking.",
    color: "from-[#6B3FA0] to-[#8B5FC7]",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "No Hidden Charges",
    desc: "Complete transparency in pricing. What you see is what you pay — zero platform fees, zero surprises.",
    color: "from-[#E8A830] to-[#F5C563]",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Vendor Cancellation Protection",
    desc: "If a vendor cancels, we find an equivalent replacement at no extra cost within 24 hours.",
    color: "from-[#F06449] to-[#F58976]",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    title: "Flexible Payment Terms",
    desc: "Pay only 20% to confirm booking. Remaining amount due after successful event completion.",
    color: "from-[#6B3FA0] to-[#8B5FC7]",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Instant Confirmation",
    desc: "Receive vendor confirmation within 2 hours of booking or we'll provide alternative options immediately.",
    color: "from-[#E8A830] to-[#F5C563]",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    title: "Hassle-Free Cancellation",
    desc: "Full refund for cancellations made 7+ days before the event. No questions asked.",
    color: "from-[#F06449] to-[#F58976]",
  },
];

const trustIndicators = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    title: "Verified Vendors Only",
    desc: "Every vendor is personally vetted and verified by our team before listing",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    title: "Quality Assured",
    desc: "Rated by real parents with minimum 4.5★ rating requirement",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    title: "24/7 Support",
    desc: "Our dedicated team is available round the clock to assist you",
  },
];

export default function PricePromise() {
  const { ref: sectionRef } = useReveal();

  return (
    <section
      id="guarantees"
      ref={sectionRef}
      className="reveal py-24 px-[5%]"
      style={{
        background: 'linear-gradient(to bottom, #FEF9F3 0%, #FDF6ED 100%)'
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Main bordered container - exact replica of the image */}
        <div 
          className="relative bg-gradient-to-br from-[#FFFBF5] via-[#FEF8F0] to-[#FDF5EB] px-8 py-12 md:px-16 md:py-16"
          style={{
            border: '2px solid #C9A86A',
            borderRadius: '24px',
            boxShadow: '0 4px 24px rgba(201, 168, 106, 0.12)',
            clipPath: 'polygon(20px 0, calc(100% - 20px) 0, 100% 20px, 100% calc(100% - 20px), calc(100% - 20px) 100%, 20px 100%, 0 calc(100% - 20px), 0 20px)'
          }}
        >
          {/* Decorative corner flourishes */}
          <div className="absolute top-3 left-3 w-12 h-12 border-l-2 border-t-2 border-[#C9A86A] opacity-60" style={{ borderRadius: '4px 0 0 0' }} />
          <div className="absolute top-3 right-3 w-12 h-12 border-r-2 border-t-2 border-[#C9A86A] opacity-60" style={{ borderRadius: '0 4px 0 0' }} />
          <div className="absolute bottom-3 left-3 w-12 h-12 border-l-2 border-b-2 border-[#C9A86A] opacity-60" style={{ borderRadius: '0 0 0 4px' }} />
          <div className="absolute bottom-3 right-3 w-12 h-12 border-r-2 border-b-2 border-[#C9A86A] opacity-60" style={{ borderRadius: '0 0 4px 0' }} />

          {/* Header */}
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-3 mb-5">
              {/* Left decorative element */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#C9A86A]">
                <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" fill="currentColor" opacity="0.6"/>
              </svg>
              
              <h2 className="font-playfair font-bold text-[2.5rem] text-[#2C1810] uppercase tracking-wider">
                Our Guarantees
              </h2>
              
              {/* Right decorative element */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#C9A86A]">
                <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" fill="currentColor" opacity="0.6"/>
              </svg>
            </div>
            
            <p className="text-[#6B5A4C] text-base leading-relaxed max-w-2xl mx-auto">
              We stand behind every booking with comprehensive guarantees designed to give you complete peace of mind throughout your planning journey.
            </p>
          </div>

          {/* Guarantees grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
            {guarantees.map((guarantee, index) => (
              <GuaranteeCard key={guarantee.title} guarantee={guarantee} index={index} />
            ))}
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-[#C9A86A] to-transparent mb-12 opacity-40" />

          {/* Trust indicators */}
          <div>
            <h3 className="font-playfair font-bold text-2xl text-center mb-10 text-[#2C1810]">
              Why Parents Trust UtsavAI
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {trustIndicators.map((indicator) => (
                <TrustCard key={indicator.title} indicator={indicator} />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-col md:flex-row items-center gap-6 bg-[var(--deep)] text-white rounded-2xl p-8 md:p-10 max-w-3xl shadow-[0_8px_32px_rgba(26,15,46,0.15)]">
            <div className="flex-1 text-left">
              <h3 className="font-medium text-xl mb-2">Have questions about our guarantees?</h3>
              <p className="text-[rgba(255,255,255,0.8)] leading-[1.7]">
                Our support team is ready to address any concerns and provide detailed information about our policies.
              </p>
            </div>
            <button className="px-8 py-3.5 rounded-full bg-white text-[var(--deep)] font-medium hover:bg-[var(--cream)] transition-colors whitespace-nowrap shadow-lg">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function GuaranteeCard({ guarantee, index }: { guarantee: typeof guarantees[0]; index: number }) {
  const { ref } = useReveal();

  return (
    <div
      ref={ref}
      className="reveal group bg-white/60 backdrop-blur-sm border border-[#E8DCC8] rounded-xl p-6 hover:border-[var(--purple)] hover:shadow-[0_8px_24px_rgba(107,63,160,0.1)] hover:bg-white transition-all duration-300"
    >
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${guarantee.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
        {guarantee.icon}
      </div>
      <h3 className="font-semibold text-base mb-2 text-[#2C1810]">{guarantee.title}</h3>
      <p className="text-[#6B5A4C] leading-[1.65] text-sm">{guarantee.desc}</p>
    </div>
  );
}

function TrustCard({ indicator }: { indicator: typeof trustIndicators[0] }) {
  return (
    <div className="text-center">
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--purple)] to-[var(--gold)] flex items-center justify-center text-white mx-auto mb-4 shadow-md">
        {indicator.icon}
      </div>
      <h4 className="font-semibold text-base mb-2 text-[#2C1810]">{indicator.title}</h4>
      <p className="text-sm text-[#6B5A4C] leading-[1.65]">
        {indicator.desc}
      </p>
    </div>
  );
}
