"use client";

import { useState } from "react";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  category: string;
  status: "published" | "draft" | "scheduled";
  publishedAt: string;
  views: number;
  featured: boolean;
};

export default function BlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([
    {
      id: "post1",
      title: "10 Birthday Party Themes for Kids in 2026",
      slug: "birthday-party-themes-kids-2026",
      excerpt: "Discover the hottest birthday party themes that kids love...",
      author: "Admin",
      category: "Party Ideas",
      status: "published",
      publishedAt: "2026-04-20T10:00:00Z",
      views: 1245,
      featured: true,
    },
    {
      id: "post2",
      title: "How to Plan a Budget-Friendly Party",
      slug: "budget-friendly-party-planning",
      excerpt: "Expert tips on throwing an amazing party without breaking the bank...",
      author: "Admin",
      category: "Tips & Tricks",
      status: "published",
      publishedAt: "2026-04-15T14:30:00Z",
      views: 892,
      featured: false,
    },
    {
      id: "post3",
      title: "Choosing the Right Vendors for Your Event",
      slug: "choosing-right-vendors",
      excerpt: "A comprehensive guide to selecting the best vendors...",
      author: "Admin",
      category: "Vendor Guide",
      status: "draft",
      publishedAt: "2026-04-30T09:00:00Z",
      views: 0,
      featured: false,
    },
  ]);

  const [showEditor, setShowEditor] = useState(false);

  function handleDelete(postId: string) {
    if (confirm("Delete this blog post?")) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[var(--border)] rounded-[20px] p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="font-playfair font-bold text-2xl">Blog Management</div>
          <button
            onClick={() => setShowEditor(true)}
            className="px-5 py-2.5 rounded-full bg-[var(--purple)] text-white text-sm font-medium hover:bg-[var(--purple-light)] transition-colors"
          >
            ✍️ New Post
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {posts.map((post) => (
            <div
              key={post.id}
              className="border border-[var(--border)] rounded-xl p-5 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="font-semibold text-lg mb-1">{post.title}</div>
                  <div className="text-sm text-[var(--text-muted)] mb-2">{post.excerpt}</div>
                  <div className="flex gap-2 text-xs text-[var(--text-muted)]">
                    <span>{post.category}</span>
                    <span>·</span>
                    <span>{post.views} views</span>
                    <span>·</span>
                    <span>{new Date(post.publishedAt).toLocaleDateString("en-IN")}</span>
                  </div>
                </div>
                {post.featured && (
                  <span className="text-xs px-2 py-1 rounded-full bg-[rgba(255,200,87,0.12)] text-[var(--gold)]">
                    ⭐ Featured
                  </span>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <button className="flex-1 px-3 py-2 rounded-lg border border-[var(--border)] text-xs font-medium hover:border-[var(--purple)] transition-colors">
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="px-3 py-2 rounded-lg border border-[var(--border)] text-xs font-medium hover:border-[var(--coral)] transition-colors"
                >
                  🗑️
                </button>
                <span
                  className={`px-3 py-2 rounded-lg text-xs font-medium ${
                    post.status === "published"
                      ? "bg-[rgba(29,158,117,0.12)] text-[#1D9E75]"
                      : post.status === "draft"
                        ? "bg-[rgba(255,200,87,0.12)] text-[var(--gold)]"
                        : "bg-[rgba(107,63,160,0.12)] text-[var(--purple)]"
                  }`}
                >
                  {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
