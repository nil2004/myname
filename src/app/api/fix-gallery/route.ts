import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST() {
  try {
    // Fix event_gallery images
    const galleryUpdates = [
      {
        title: "Magical Cartoon Birthday Party",
        images: [
          "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800",
          "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800",
          "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800",
        ],
      },
      {
        title: "Romantic Candlelight Setup",
        images: [
          "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800",
          "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800",
        ],
      },
      {
        title: "Luxury Wedding Decoration",
        images: [
          "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800",
          "https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=800",
          "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800",
        ],
      },
    ];

    for (const update of galleryUpdates) {
      await supabase
        .from("event_gallery")
        .update({ images: update.images })
        .eq("title", update.title);
    }

    // Fix testimonials images
    const testimonialUpdates = [
      {
        client_name: "Priya Sharma",
        client_image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
      },
      {
        client_name: "Rahul Verma",
        client_image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
      },
      {
        client_name: "Anjali Gupta",
        client_image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
      },
    ];

    for (const update of testimonialUpdates) {
      await supabase
        .from("client_testimonials")
        .update({ client_image: update.client_image })
        .eq("client_name", update.client_name);
    }

    // Update video testimonial
    await supabase
      .from("client_testimonials")
      .update({ video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ" })
      .eq("client_name", "Vikram Singh");

    return NextResponse.json({
      success: true,
      message: "Gallery and testimonial images fixed successfully",
    });
  } catch (error) {
    console.error("Error fixing images:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fix images" },
      { status: 500 }
    );
  }
}
