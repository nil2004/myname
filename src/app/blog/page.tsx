"use client";

import Link from "next/link";
import { useState } from "react";

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", label: "All Posts", icon: "📚" },
    { id: "planning", label: "Party Planning", icon: "🎉" },
    { id: "themes", label: "Theme Ideas", icon: "🎨" },
    { id: "tips", label: "Tips & Tricks", icon: "💡" },
    { id: "trends", label: "Trends", icon: "🔥" },
    { id: "diy", label: "DIY Projects", icon: "✂️" },
  ];

  const blogPosts = [
    {
      id: 1,
      title: "10 Trending Birthday Themes for 2025",
      excerpt:
        "Discover the hottest birthday party themes that kids are loving this year, from superhero adventures to magical unicorn worlds.",
      category: "themes",
      author: "Priya Sharma",
      date: "May 8, 2025",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800",
      featured: true,
    },
    {
      id: 2,
      title: "How to Plan a Birthday Party on a Budget",
      excerpt:
        "Expert tips on creating an amazing celebration without breaking the bank. Learn where to save and where to splurge.",
      category: "planning",
      author: "Anjali Patel",
      date: "May 5, 2025",
      readTime: "7 min read",
      image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800",
      featured: true,
    },
    {
      id: 3,
      title: "DIY Decoration Ideas That Look Professional",
      excerpt:
        "Create stunning decorations at home with these easy DIY projects. Perfect for adding a personal touch to your celebration.",
      category: "diy",
      author: "Vikram Singh",
      date: "May 3, 2025",
      readTime: "6 min read",
      image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800",
      featured: false,
    },
    {
      id: 4,
      title: "Choosing the Perfect Cake for Your Child's Birthday",
      excerpt:
        "From flavors to designs, everything you need to know about selecting a birthday cake that will wow your guests.",
      category: "tips",
      author: "Rahul Verma",
      date: "May 1, 2025",
      readTime: "4 min read",
      image: "https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=800",
      featured: false,
    },
    {
      id: 5,
      title: "Outdoor vs Indoor Parties: Pros and Cons",
      excerpt:
        "Weighing your options? Here's a comprehensive guide to help you decide between an outdoor or indoor celebration.",
      category: "planning",
      author: "Priya Sharma",
      date: "Apr 28, 2025",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800",
      featured: false,
    },
    {
      id: 6,
      title: "Cartoon Character Party: A Complete Guide",
      excerpt:
        "Everything you need to know about throwing an epic cartoon-themed party, from decorations to entertainment.",
      category: "themes",
      author: "Anjali Patel",
      date: "Apr 25, 2025",
      readTime: "8 min read",
      image: "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800",
      featured: false,
    },
    {
      id: 7,
      title: "Last-Minute Party Planning Hacks",
      excerpt:
        "Running out of time? These quick tips will help you pull together an amazing party even with just a week's notice.",
      category: "tips",
      author: "Vikram Singh",
      date: "Apr 22, 2025",
      readTime: "4 min read",
      image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800",
      featured: false,
    },
    {
      id: 8,
      title: "Sustainable Party Planning: Eco-Friendly Ideas",
      excerpt:
        "Celebrate responsibly with these eco-friendly party planning tips that are good for the planet and your budget.",
      category: "trends",
      author: "Rahul Verma",
      date: "Apr 20, 2025",
      readTime: "6 min read",
      image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800",
      featured: false,
    },
  ];

  const filteredPosts =
    selectedCategory === "all"
      ? blogPosts
      : blogPosts.filter((post) => post.category === selectedCategory);

  const featuredPost = blogPosts.find((post) => post.featured);

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
            UtsavAI Blog
          </div>
          <h1 className="font-playfair font-bold text-4xl md:text-5xl lg:text-6xl text-[var(--deep)] mb-6">
            Party Planning Tips,
            <br />
            <span className="text-[var(--purple)]">Ideas & Inspiration</span>
          </h1>
          <p className="text-lg text-[var(--text-muted)] leading-relaxed max-w-2xl mx-auto">
            Expert advice, creative ideas, and practical tips to help you plan unforgettable celebrations
            for your loved ones.
          </p>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="py-8 px-[5%]">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-[32px] overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative aspect-[4/3] md:aspect-auto">
                  <img
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[var(--purple)] text-white text-xs font-medium">
                    Featured
                  </div>
                </div>
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <div className="inline-block px-3 py-1 rounded-full bg-[var(--purple)]/10 text-[var(--purple)] text-xs font-medium mb-4 w-fit">
                    {categories.find((c) => c.id === featuredPost.category)?.label}
                  </div>
                  <h2 className="font-playfair font-bold text-3xl text-[var(--deep)] mb-4">
                    {featuredPost.title}
                  </h2>
                  <p className="text-[var(--text-muted)] leading-relaxed mb-6">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-[var(--text-muted)] mb-6">
                    <span>{featuredPost.author}</span>
                    <span>•</span>
                    <span>{featuredPost.date}</span>
                    <span>•</span>
                    <span>{featuredPost.readTime}</span>
                  </div>
                  <Link
                    href={`/blog/${featuredPost.id}`}
                    className="inline-block px-6 py-3 rounded-full bg-[var(--purple)] text-white font-medium hover:bg-[var(--purple-light)] transition-colors no-underline w-fit"
                  >
                    Read Article
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Category Filter */}
      <section className="py-8 px-[5%]">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? "bg-[var(--purple)] text-white"
                    : "bg-white text-[var(--text-muted)] hover:bg-[var(--purple)]/10"
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-8 px-[5%] pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts
              .filter((post) => !post.featured)
              .map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.id}`}
                  className="bg-white rounded-[24px] overflow-hidden hover:shadow-lg transition-shadow group no-underline"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <div className="inline-block px-3 py-1 rounded-full bg-[var(--purple)]/10 text-[var(--purple)] text-xs font-medium mb-3">
                      {categories.find((c) => c.id === post.category)?.label}
                    </div>
                    <h3 className="font-bold text-xl text-[var(--deep)] mb-3 group-hover:text-[var(--purple)] transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                      <span>{post.author}</span>
                      <span>•</span>
                      <span>{post.date}</span>
                      <span>•</span>
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </Link>
              ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="font-bold text-xl text-[var(--deep)] mb-2">No posts found</h3>
              <p className="text-[var(--text-muted)]">
                Try selecting a different category
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 px-[5%] bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-playfair font-bold text-3xl md:text-4xl text-[var(--deep)] mb-4">
            Never Miss a Post
          </h2>
          <p className="text-[var(--text-muted)] mb-8">
            Subscribe to our newsletter for the latest party planning tips and ideas
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-5 py-3 rounded-full border border-[var(--border)] bg-[var(--cream)] focus:outline-none focus:border-[var(--purple)] transition-colors"
            />
            <button className="px-8 py-3 rounded-full bg-[var(--purple)] text-white font-medium hover:bg-[var(--purple-light)] transition-colors whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
