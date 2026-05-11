import Link from "next/link";

export default function Footer() {
  const footerLinks = {
    "For Parents": [
      { label: "How it works", href: "#how" },
      { label: "Pricing", href: "#pricing" },
      { label: "Testimonials", href: "#testimonials" },
      { label: "FAQs", href: "#faq" },
    ],
    "Company": [
      { label: "About us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Careers", href: "/careers" },
      { label: "Blog", href: "/blog" },
    ],
    "Legal": [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Refund Policy", href: "#" },
    ],
  };

  return (
    <footer className="bg-[var(--deep)] text-[rgba(255,255,255,0.7)] px-[5%] pt-16 pb-8">
      {/* Main footer content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 mb-12">
        {/* Brand section */}
        <div className="lg:col-span-2">
          <Link href="/" className="font-playfair text-2xl font-bold text-white no-underline inline-block mb-4">
            Utsav<span className="text-[var(--purple-light)]">AI</span>
          </Link>
          <p className="text-sm text-[rgba(255,255,255,0.5)] leading-[1.7] mb-6 max-w-[280px]">
            Making birthday planning stress-free for Indian parents. Currently serving Dehradun with love.
          </p>
        </div>

        {/* Link columns */}
        {Object.entries(footerLinks).map(([category, links]) => (
          <div key={category}>
            <h3 className="text-white font-medium text-sm mb-4">{category}</h3>
            <ul className="flex flex-col gap-2.5">
              {links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[rgba(255,255,255,0.5)] text-sm hover:text-white hover:translate-x-1 transition-all inline-block no-underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Newsletter section */}
      <div className="border-t border-[rgba(255,255,255,0.08)] pt-8 pb-8">
        <div className="max-w-md">
          <h3 className="text-white font-medium mb-2">Stay updated</h3>
          <p className="text-sm text-[rgba(255,255,255,0.5)] mb-4">
            Get party planning tips and exclusive deals in your inbox.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2.5 rounded-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.1)] text-white text-sm placeholder:text-[rgba(255,255,255,0.3)] focus:outline-none focus:border-[var(--purple)] transition-colors"
            />
            <button className="px-6 py-2.5 rounded-full bg-[var(--purple)] text-white text-sm font-medium hover:bg-[var(--purple-light)] transition-colors whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[rgba(255,255,255,0.08)] pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[rgba(255,255,255,0.4)]">
        <p>© 2025 UtsavAI. All rights reserved. Made with ❤️ for Indian families.</p>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Currently serving Dehradun
          </span>
        </div>
      </div>
    </footer>
  );
}
