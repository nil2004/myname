import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { VendorCategory } from "../vendors/route";

interface MatchRequest {
  budget: number;
  date: string;
  city: string;
  theme?: string;
  categories?: VendorCategory[];
}

interface MatchedVendor {
  id: string;
  name: string;
  category: VendorCategory;
  rating: number;
  review_count: number;
  price_min: number;
  price_max: number;
  city: string;
  verified: boolean;
  tags: string[];
  image_emoji: string;
  suggestedPrice: number;
}

/**
 * Simple AI-style matching:
 * 1. Filter by city and verified status
 * 2. Filter by budget (price_min <= per-category budget slice)
 * 3. Score by rating × log(reviewCount)
 * 4. Return top pick per requested category
 */
async function matchVendors(req: MatchRequest): Promise<{
  matched: MatchedVendor[];
  totalEstimate: number;
}> {
  const categories: VendorCategory[] =
    req.categories && req.categories.length > 0
      ? req.categories
      : ["decorator", "photographer", "cake"];

  const perCategoryBudget = Math.floor(req.budget / categories.length);

  const matched: MatchedVendor[] = [];

  for (const cat of categories) {
    // Fetch vendors from Supabase
    const { data: candidates, error } = await supabase
      .from("vendors")
      .select("*")
      .eq("category", cat)
      .ilike("city", req.city)
      .eq("verified", true)
      .lte("price_min", perCategoryBudget);

    if (error) {
      console.error("Supabase error:", error);
      continue;
    }

    if (candidates && candidates.length > 0) {
      // Sort by rating × log(review_count)
      const sorted = candidates.sort((a, b) => {
        const scoreA = a.rating * Math.log(a.review_count + 1);
        const scoreB = b.rating * Math.log(b.review_count + 1);
        return scoreB - scoreA;
      });

      const best = sorted[0];
      const suggestedPrice = Math.min(best.price_max, perCategoryBudget);
      
      matched.push({
        ...best,
        category: best.category as VendorCategory,
        suggestedPrice,
      });
    }
  }

  const totalEstimate = matched.reduce((sum, v) => sum + v.suggestedPrice, 0);

  return { matched, totalEstimate };
}

export async function POST(req: NextRequest) {
  try {
    const body: MatchRequest = await req.json();

    if (!body.budget || !body.city || !body.date) {
      return NextResponse.json(
        { error: "budget, city, and date are required." },
        { status: 400 }
      );
    }

    if (body.budget < 1000) {
      return NextResponse.json(
        { error: "Minimum budget is ₹1,000." },
        { status: 400 }
      );
    }

    const result = await matchVendors(body);

    return NextResponse.json({
      ...result,
      city: body.city,
      date: body.date,
      theme: body.theme ?? null,
    });
  } catch (error) {
    console.error("Error matching vendors:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
