"use client";

import Link from "next/link";
import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log("Form submitted:", formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const contactInfo = [
    {
      icon: "📍",
      title: "Visit Us",
      details: ["123 Rajpur Road", "Dehradun, Uttarakhand", "India - 248001"],
    },
    {
      icon: "📞",
      title: "Call Us",
      details: ["+91 98765 43210", "+91 98765 43211", "Mon-Sat: 9 AM - 7 PM"],
    },
    {
      icon: "✉️",
      title: "Email Us",
      details: ["hello@utsavai.com", "support@utsavai.com", "We reply within 24 hours"],
    },
    {
      icon: "💬",
      title: "Social Media",
      details: ["@utsavai on Instagram", "@utsavai on Facebook", "Follow for updates"],
    },
  ];

  const faqs = [
    {
      question: "How quickly can you plan an event?",
      answer: "We can help plan events with as little as 2 weeks notice, though we recommend 4-6 weeks for the best vendor availability.",
    },
    {
      question: "What areas do you serve?",
      answer: "Currently, we serve Dehradun and surrounding areas. We're rapidly expanding to other cities across India.",
    },
    {
      question: "Is there a consultation fee?",
      answer: "No! Our AI-powered planning service is completely free. You only pay the vendors directly for their services.",
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
            Get in Touch
          </div>
          <h1 className="font-playfair font-bold text-4xl md:text-5xl lg:text-6xl text-[var(--deep)] mb-6">
            We&apos;d Love to
            <br />
            <span className="text-[var(--purple)]">Hear From You</span>
          </h1>
          <p className="text-lg text-[var(--text-muted)] leading-relaxed max-w-2xl mx-auto">
            Have questions about planning your celebration? Need help with an existing booking?
            Our team is here to assist you every step of the way.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 px-[5%]">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactInfo.map((info, index) => (
              <div
                key={index}
                className="bg-white rounded-[20px] p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-4">{info.icon}</div>
                <h3 className="font-bold text-lg text-[var(--deep)] mb-3">{info.title}</h3>
                {info.details.map((detail, idx) => (
                  <p key={idx} className="text-sm text-[var(--text-muted)] mb-1">
                    {detail}
                  </p>
                ))}
              </div>
            ))}
          </div>

          {/* Contact Form & Map */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Form */}
            <div className="bg-white rounded-[24px] p-8">
              <h2 className="font-playfair font-bold text-2xl text-[var(--deep)] mb-6">
                Send Us a Message
              </h2>
              {submitted ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="font-bold text-xl text-[var(--deep)] mb-2">Message Sent!</h3>
                  <p className="text-[var(--text-muted)]">
                    We&apos;ll get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--deep)] mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--cream)] focus:outline-none focus:border-[var(--purple)] transition-colors"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--deep)] mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--cream)] focus:outline-none focus:border-[var(--purple)] transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--deep)] mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--cream)] focus:outline-none focus:border-[var(--purple)] transition-colors"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--deep)] mb-2">
                      Subject *
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--cream)] focus:outline-none focus:border-[var(--purple)] transition-colors"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="booking">Booking Question</option>
                      <option value="vendor">Vendor Partnership</option>
                      <option value="support">Technical Support</option>
                      <option value="feedback">Feedback</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--deep)] mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--cream)] focus:outline-none focus:border-[var(--purple)] transition-colors resize-none"
                      placeholder="Tell us how we can help..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full px-6 py-3 rounded-full bg-[var(--purple)] text-white font-medium hover:bg-[var(--purple-light)] transition-colors"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>

            {/* Map & Info */}
            <div className="space-y-6">
              <div className="bg-white rounded-[24px] p-8">
                <h3 className="font-playfair font-bold text-xl text-[var(--deep)] mb-4">
                  Office Hours
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Monday - Friday</span>
                    <span className="font-medium text-[var(--deep)]">9:00 AM - 7:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Saturday</span>
                    <span className="font-medium text-[var(--deep)]">10:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Sunday</span>
                    <span className="font-medium text-[var(--deep)]">Closed</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[24px] overflow-hidden">
                <div className="aspect-video bg-[var(--cream)] flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🗺️</div>
                    <p className="text-sm text-[var(--text-muted)]">Map View</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">Rajpur Road, Dehradun</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[var(--purple)] to-[var(--gold)] rounded-[24px] p-6 text-white">
                <h3 className="font-bold text-lg mb-2">Need Immediate Help?</h3>
                <p className="text-sm text-white/90 mb-4">
                  Call us directly for urgent inquiries or last-minute bookings.
                </p>
                <a
                  href="tel:+919876543210"
                  className="inline-block px-6 py-2 rounded-full bg-white text-[var(--purple)] font-medium hover:shadow-lg transition-all no-underline"
                >
                  📞 Call Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-[5%] bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-playfair font-bold text-3xl md:text-4xl text-[var(--deep)] mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-[var(--text-muted)]">Quick answers to common questions</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-[var(--cream)] rounded-[20px] p-6">
                <h3 className="font-bold text-lg text-[var(--deep)] mb-2">{faq.question}</h3>
                <p className="text-[var(--text-muted)] leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
