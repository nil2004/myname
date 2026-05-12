"use client";

import Link from "next/link";

export default function AboutPage() {
  const values = [
    {
      icon: "❤️",
      title: "Customer First",
      description: "Every decision we make starts with what's best for parents and their children.",
    },
    {
      icon: "🎯",
      title: "Quality Assured",
      description: "We partner only with verified vendors who meet our high standards.",
    },
    {
      icon: "💡",
      title: "Innovation",
      description: "Using AI to make party planning smarter, faster, and more personalized.",
    },
    {
      icon: "🤝",
      title: "Trust & Transparency",
      description: "Clear pricing, honest reviews, and no hidden surprises.",
    },
  ];

  const milestones = [
    { year: "2024", title: "Founded", description: "UtsavAI was born in Dehradun" },
    { year: "2024", title: "100+ Events", description: "Successfully planned our first 100 celebrations" },
    { year: "2025", title: "50+ Vendors", description: "Built a network of trusted partners" },
    { year: "2025", title: "Growing", description: "Expanding to more cities across India" },
  ];

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      {/* Header */}
      <div className="bg-white border-b border-[var(--border)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="font-playfair font-bold text-2xl text-[var(--deep)] no-underline">
              Utsav<span className="text-[var(--purple)]">AI</span>
            </Link>
            <Link
              href="/"
              className="px-5 py-2 rounded-full border border-[var(--border)] text-sm font-medium hover:border-[var(--purple)] transition-colors no-underline"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-20 px-[5%]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-[var(--purple)]/10 text-[var(--purple)] text-sm font-medium mb-6">
            About UtsavAI
          </div>
          <h1 className="font-playfair font-bold text-4xl md:text-5xl lg:text-6xl text-[var(--deep)] mb-6">
            Making Every Celebration
            <br />
            <span className="text-[var(--purple)]">Magical & Stress-Free</span>
          </h1>
          <p className="text-lg text-[var(--text-muted)] leading-relaxed max-w-2xl mx-auto">
            We&apos;re on a mission to transform birthday planning for Indian parents. Using AI-powered matching,
            we connect you with the perfect vendors for your child&apos;s special day.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 px-[5%]">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-playfair font-bold text-3xl md:text-4xl text-[var(--deep)] mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-[var(--text-muted)] leading-relaxed">
                <p>
                  UtsavAI was born from a simple observation: planning a child&apos;s birthday party shouldn&apos;t be
                  stressful. As parents ourselves, we experienced the overwhelming process of finding reliable
                  vendors, comparing prices, and coordinating everything.
                </p>
                <p>
                  We realized that with the right technology, we could make this process seamless. By combining
                  AI-powered matching with a curated network of trusted vendors, we created a platform that
                  understands your needs and delivers personalized recommendations.
                </p>
                <p>
                  Today, we&apos;re proud to serve families in Dehradun and are rapidly expanding across India.
                  Every celebration we help plan brings us closer to our vision of making party planning
                  effortless for every parent.
                </p>
              </div>
            </div>
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800"
                alt="Birthday celebration"
                className="rounded-[24px] shadow-xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-[5%] bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-playfair font-bold text-3xl md:text-4xl text-[var(--deep)] mb-4">
              Our Values
            </h2>
            <p className="text-[var(--text-muted)] max-w-2xl mx-auto">
              These principles guide everything we do at UtsavAI
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-[var(--cream)] rounded-[20px] p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="font-bold text-lg text-[var(--deep)] mb-2">{value.title}</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones Section */}
      <section className="py-16 px-[5%]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-playfair font-bold text-3xl md:text-4xl text-[var(--deep)] mb-4">
              Our Journey
            </h2>
            <p className="text-[var(--text-muted)] max-w-2xl mx-auto">
              Key milestones in our mission to transform party planning
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {milestones.map((milestone, index) => (
              <div key={index} className="text-center">
                <div className="inline-block px-4 py-2 rounded-full bg-[var(--purple)] text-white font-bold text-xl mb-3">
                  {milestone.year}
                </div>
                <h3 className="font-bold text-lg text-[var(--deep)] mb-2">{milestone.title}</h3>
                <p className="text-sm text-[var(--text-muted)]">{milestone.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-[5%]">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-[var(--purple)] to-[var(--gold)] rounded-[32px] p-12">
          <h2 className="font-playfair font-bold text-3xl md:text-4xl text-white mb-4">
            Ready to Plan Your Next Celebration?
          </h2>
          <p className="text-white/90 text-lg mb-8">
            Join thousands of happy parents who trust UtsavAI for their special moments
          </p>
          <Link
            href="/plan"
            className="inline-block px-8 py-4 rounded-full bg-white text-[var(--purple)] font-bold hover:shadow-xl transition-all no-underline"
          >
            Start Planning Now
          </Link>
        </div>
      </section>
    </div>
  );
}
