"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-[5%] py-[1.1rem] transition-all duration-300 ${
        scrolled
          ? "bg-[rgba(253,248,242,0.95)] shadow-sm"
          : "bg-[rgba(253,248,242,0.88)]"
      } backdrop-blur-[12px] border-b border-[var(--border)]`}
    >
      <Link href="/" className="flex items-center gap-2 no-underline">
        <span className="font-playfair text-2xl font-bold text-[var(--deep)]">
          Utsav<span className="text-[var(--purple)]">AI</span>
        </span>
        <span className="w-2 h-2 rounded-full bg-[var(--gold)] inline-block" />
      </Link>

      <div className="hidden md:flex items-center gap-8">
        <Link
          href="#how"
          className="text-sm text-[var(--text-muted)] hover:text-[var(--deep)] transition-colors"
        >
          How it works
        </Link>
        <Link
          href="#vendors"
          className="text-sm text-[var(--text-muted)] hover:text-[var(--deep)] transition-colors"
        >
          Vendors
        </Link>
        <Link
          href="#guarantees"
          className="text-sm text-[var(--text-muted)] hover:text-[var(--deep)] transition-colors"
        >
          Our Guarantees
        </Link>
        <Link
          href="#reviews"
          className="text-sm text-[var(--text-muted)] hover:text-[var(--deep)] transition-colors"
        >
          Reviews
        </Link>
        <Link
          href="/admin"
          className="text-sm text-[var(--text-muted)] hover:text-[var(--deep)] transition-colors hidden"
        >
          Admin
        </Link>
        <Link
          href="/plan"
          className="text-sm font-medium text-white bg-[var(--purple)] px-5 py-2 rounded-full hover:bg-[var(--purple-light)] transition-all hover:-translate-y-px"
        >
          Plan a Party
        </Link>
      </div>
    </nav>
  );
}
