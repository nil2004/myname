"use client";

import Link from "next/link";
import { useState } from "react";

export default function CareersPage() {
  const [selectedJob, setSelectedJob] = useState<number | null>(null);

  const benefits = [
    {
      icon: "💰",
      title: "Competitive Salary",
      description: "Industry-leading compensation packages with performance bonuses",
    },
    {
      icon: "🏥",
      title: "Health Insurance",
      description: "Comprehensive medical coverage for you and your family",
    },
    {
      icon: "🏖️",
      title: "Flexible Time Off",
      description: "Generous vacation policy and work-life balance",
    },
    {
      icon: "📚",
      title: "Learning Budget",
      description: "Annual budget for courses, conferences, and skill development",
    },
    {
      icon: "🏠",
      title: "Remote Work",
      description: "Hybrid work model with flexible remote options",
    },
    {
      icon: "🎉",
      title: "Team Events",
      description: "Regular team outings, celebrations, and fun activities",
    },
    {
      icon: "🚀",
      title: "Growth Opportunities",
      description: "Clear career progression paths and mentorship programs",
    },
    {
      icon: "🍕",
      title: "Free Meals",
      description: "Complimentary lunch and snacks at the office",
    },
  ];

  const openings = [
    {
      title: "Senior Full Stack Developer",
      department: "Engineering",
      location: "Dehradun / Remote",
      type: "Full-time",
      experience: "3-5 years",
      description:
        "We're looking for an experienced full stack developer to help build and scale our AI-powered event planning platform. You'll work with React, Node.js, and cutting-edge AI technologies.",
      requirements: [
        "3+ years of experience with React and Node.js",
        "Strong understanding of RESTful APIs and database design",
        "Experience with AI/ML integration is a plus",
        "Excellent problem-solving and communication skills",
      ],
    },
    {
      title: "Product Designer",
      department: "Design",
      location: "Dehradun / Hybrid",
      type: "Full-time",
      experience: "2-4 years",
      description:
        "Join our design team to create beautiful, intuitive experiences for parents planning their children's celebrations. You'll own the end-to-end design process from research to implementation.",
      requirements: [
        "2+ years of product design experience",
        "Proficiency in Figma and modern design tools",
        "Strong portfolio showcasing user-centered design",
        "Understanding of design systems and accessibility",
      ],
    },
    {
      title: "Customer Success Manager",
      department: "Operations",
      location: "Dehradun",
      type: "Full-time",
      experience: "1-3 years",
      description:
        "Help our customers create magical celebrations by providing exceptional support and guidance. You'll be the bridge between our customers and our vendor network.",
      requirements: [
        "1+ years in customer success or support role",
        "Excellent communication skills in Hindi and English",
        "Empathy and problem-solving mindset",
        "Experience in event planning or hospitality is a plus",
      ],
    },
    {
      title: "AI/ML Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      experience: "2-4 years",
      description:
        "Build and improve our AI matching algorithms that connect customers with the perfect vendors. You'll work on recommendation systems, natural language processing, and predictive analytics.",
      requirements: [
        "2+ years of experience in ML/AI development",
        "Strong Python skills and ML frameworks (TensorFlow, PyTorch)",
        "Experience with recommendation systems",
        "Understanding of NLP and data pipelines",
      ],
    },
    {
      title: "Marketing Manager",
      department: "Marketing",
      location: "Dehradun / Hybrid",
      type: "Full-time",
      experience: "3-5 years",
      description:
        "Lead our marketing efforts to reach more parents across India. You'll develop and execute strategies across digital channels, content, and partnerships.",
      requirements: [
        "3+ years of marketing experience, preferably in tech/consumer",
        "Strong understanding of digital marketing and SEO",
        "Experience with content marketing and social media",
        "Data-driven approach to campaign optimization",
      ],
    },
    {
      title: "Business Development Intern",
      department: "Business",
      location: "Dehradun",
      type: "Internship",
      experience: "0-1 years",
      description:
        "Join our team to help expand our vendor network and explore new market opportunities. Perfect for someone passionate about startups and business growth.",
      requirements: [
        "Currently pursuing or recently completed MBA/BBA",
        "Strong communication and negotiation skills",
        "Self-motivated and eager to learn",
        "Interest in event planning or marketplace businesses",
      ],
    },
  ];

  const values = [
    {
      title: "Customer Obsession",
      description: "We start with the customer and work backwards. Every decision is made with their happiness in mind.",
    },
    {
      title: "Move Fast",
      description: "We believe in rapid iteration and learning. Ship early, get feedback, and improve continuously.",
    },
    {
      title: "Own It",
      description: "Take ownership of your work and see it through. We trust our team to make decisions and deliver results.",
    },
    {
      title: "Celebrate Together",
      description: "We're building a platform for celebrations, and we practice what we preach. Success is sweeter when shared.",
    },
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
            Join Our Team
          </div>
          <h1 className="font-playfair font-bold text-4xl md:text-5xl lg:text-6xl text-[var(--deep)] mb-6">
            Build the Future of
            <br />
            <span className="text-[var(--purple)]">Celebration Planning</span>
          </h1>
          <p className="text-lg text-[var(--text-muted)] leading-relaxed max-w-2xl mx-auto">
            Join a passionate team that's transforming how Indian families celebrate life's special moments.
            We're growing fast and looking for talented people to grow with us.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-[5%]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { number: "20+", label: "Team Members" },
              { number: "6", label: "Open Positions" },
              { number: "100+", label: "Events Planned" },
              { number: "4.9/5", label: "Employee Rating" },
            ].map((stat, index) => (
              <div key={index} className="bg-white rounded-[20px] p-6 text-center">
                <div className="font-playfair font-bold text-3xl text-[var(--purple)] mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-[var(--text-muted)]">{stat.label}</div>
              </div>
            ))}
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
              These principles guide how we work and make decisions every day
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className="bg-[var(--cream)] rounded-[20px] p-6">
                <h3 className="font-bold text-lg text-[var(--deep)] mb-2">{value.title}</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-[5%]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-playfair font-bold text-3xl md:text-4xl text-[var(--deep)] mb-4">
              Why Join UtsavAI?
            </h2>
            <p className="text-[var(--text-muted)] max-w-2xl mx-auto">
              We believe in taking care of our team so they can take care of our customers
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white rounded-[20px] p-6 hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-3">{benefit.icon}</div>
                <h3 className="font-bold text-base text-[var(--deep)] mb-2">{benefit.title}</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-16 px-[5%] bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-playfair font-bold text-3xl md:text-4xl text-[var(--deep)] mb-4">
              Open Positions
            </h2>
            <p className="text-[var(--text-muted)] max-w-2xl mx-auto">
              Find your next opportunity and help us make celebrations magical
            </p>
          </div>
          <div className="space-y-4">
            {openings.map((job, index) => (
              <div key={index} className="bg-[var(--cream)] rounded-[20px] overflow-hidden">
                <div
                  className="p-6 cursor-pointer hover:bg-white transition-colors"
                  onClick={() => setSelectedJob(selectedJob === index ? null : index)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-[var(--deep)] mb-2">{job.title}</h3>
                      <div className="flex flex-wrap gap-3 text-sm text-[var(--text-muted)]">
                        <span className="flex items-center gap-1">
                          🏢 {job.department}
                        </span>
                        <span className="flex items-center gap-1">
                          📍 {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          ⏰ {job.type}
                        </span>
                        <span className="flex items-center gap-1">
                          💼 {job.experience}
                        </span>
                      </div>
                    </div>
                    <button className="text-2xl text-[var(--purple)]">
                      {selectedJob === index ? "−" : "+"}
                    </button>
                  </div>
                </div>
                {selectedJob === index && (
                  <div className="px-6 pb-6 space-y-4">
                    <div>
                      <h4 className="font-bold text-sm text-[var(--deep)] mb-2">About the Role</h4>
                      <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                        {job.description}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[var(--deep)] mb-2">Requirements</h4>
                      <ul className="space-y-1">
                        {job.requirements.map((req, idx) => (
                          <li key={idx} className="text-sm text-[var(--text-muted)] flex items-start gap-2">
                            <span className="text-[var(--purple)] mt-0.5">•</span>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-4">
                      <a
                        href={`mailto:careers@utsavai.com?subject=Application for ${job.title}`}
                        className="inline-block px-6 py-3 rounded-full bg-[var(--purple)] text-white font-medium hover:bg-[var(--purple-light)] transition-colors no-underline"
                      >
                        Apply Now
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-[5%]">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-[var(--purple)] to-[var(--gold)] rounded-[32px] p-12">
          <h2 className="font-playfair font-bold text-3xl md:text-4xl text-white mb-4">
            Don't See the Right Role?
          </h2>
          <p className="text-white/90 text-lg mb-8">
            We're always looking for talented people. Send us your resume and let's talk!
          </p>
          <a
            href="mailto:careers@utsavai.com"
            className="inline-block px-8 py-4 rounded-full bg-white text-[var(--purple)] font-bold hover:shadow-xl transition-all no-underline"
          >
            Get in Touch
          </a>
        </div>
      </section>
    </div>
  );
}
