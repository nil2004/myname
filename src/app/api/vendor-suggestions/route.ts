import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export interface VendorSuggestion {
  id: string;
  request_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  occasion: string;
  age_group: string;
  budget: number;
  guest_count: number;
  location_type: string;
  city: string;
  theme: string;
  add_ons: string[];
  specifications?: string;
  
  // NEW: All vendor options (3 per category)
  vendor_options?: Record<string, any[]>;
  selected_vendor_indices?: Record<string, number>;
  
  // Vendor 1
  vendor_1_id?: string;
  vendor_1_name?: string;
  vendor_1_category?: string;
  vendor_1_price?: number;
  vendor_1_auto_matched: boolean;
  
  // Vendor 2
  vendor_2_id?: string;
  vendor_2_name?: string;
  vendor_2_category?: string;
  vendor_2_price?: number;
  vendor_2_auto_matched: boolean;
  
  // Vendor 3
  vendor_3_id?: string;
  vendor_3_name?: string;
  vendor_3_category?: string;
  vendor_3_price?: number;
  vendor_3_auto_matched: boolean;
  
  // Package details
  package_type: string;
  package_name?: string;
  package_description?: string;
  
  // Pricing
  initial_price: number;
  admin_adjusted_price?: number;
  final_price?: number;
  discount_amount?: number;
  discount_reason?: string;
  
  // Customization
  customizations?: any;
  admin_notes?: string;
  
  // Slot/Schedule
  event_date?: string;
  event_time?: string;
  event_duration?: string;
  setup_time?: string;
  slot_confirmed: boolean;
  
  // Status
  status: string;
  
  // Admin workflow
  reviewed_by?: string;
  reviewed_at?: string;
  finalized_by?: string;
  finalized_at?: string;
  
  // Customer workflow
  sent_to_customer_at?: string;
  customer_viewed_at?: string;
  customer_approved_at?: string;
  
  // Payment
  payment_method?: string;
  payment_status?: string;
  payment_id?: string;
  paid_amount?: number;
  paid_at?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// GET - Fetch all vendor suggestions
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const requestId = searchParams.get("requestId");

    let query = supabase.from("vendor_suggestions").select("*").order("created_at", { ascending: false });

    if (status) query = query.eq("status", status);
    if (requestId) query = query.eq("request_id", requestId);

    const { data: suggestions, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ suggestions: suggestions || [], total: suggestions?.length || 0 });
  } catch (error) {
    console.error("Error fetching vendor suggestions:", error);
    return NextResponse.json({ error: "Failed to fetch vendor suggestions" }, { status: 500 });
  }
}

// POST - Create new vendor suggestion (automatic AI matching)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Auto-match vendors based on requirements - now returns top 3 per category
    const { topPicks, allOptions } = await autoMatchVendors({
      city: body.city,
      budget: body.budget,
      addOns: body.addOns || [],
      theme: body.theme,
      guestCount: body.guestCount,
      specifications: body.specifications,
    });

    // Initialize selected indices (default to first option for each category)
    const selectedIndices: Record<string, number> = {};
    Object.keys(allOptions).forEach(category => {
      selectedIndices[category] = 0; // Default to first vendor
    });

    const { data, error } = await supabase
      .from("vendor_suggestions")
      .insert([
        {
          request_id: body.requestId,
          customer_name: body.customerName,
          customer_phone: body.customerPhone,
          customer_email: body.customerEmail,
          occasion: body.occasion,
          age_group: body.ageGroup,
          budget: body.budget,
          guest_count: body.guestCount,
          location_type: body.locationType,
          city: body.city,
          theme: body.theme,
          add_ons: body.addOns || [],
          specifications: body.specifications,
          
          // Store all vendor options (3 per category)
          vendor_options: allOptions,
          selected_vendor_indices: selectedIndices,
          
          // Keep backward compatibility - store top picks
          vendor_1_id: topPicks[0]?.id,
          vendor_1_name: topPicks[0]?.name,
          vendor_1_category: topPicks[0]?.category,
          vendor_1_price: topPicks[0]?.price,
          vendor_1_auto_matched: true,
          
          vendor_2_id: topPicks[1]?.id,
          vendor_2_name: topPicks[1]?.name,
          vendor_2_category: topPicks[1]?.category,
          vendor_2_price: topPicks[1]?.price,
          vendor_2_auto_matched: true,
          
          vendor_3_id: topPicks[2]?.id,
          vendor_3_name: topPicks[2]?.name,
          vendor_3_category: topPicks[2]?.category,
          vendor_3_price: topPicks[2]?.price,
          vendor_3_auto_matched: true,
          
          package_type: body.packageType || "essential",
          initial_price: topPicks.reduce((sum, v) => sum + (v?.price || 0), 0),
          status: "pending_admin_review",
          slot_confirmed: false,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating vendor suggestion:", error);
    return NextResponse.json({ error: "Failed to create vendor suggestion" }, { status: 500 });
  }
}

// PUT - Update vendor suggestion (manual admin customization)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Update selected vendor indices if provided
    if (body.selectedVendorIndices !== undefined) {
      updateData.selected_vendor_indices = body.selectedVendorIndices;
    }

    // Update vendor 1 if provided
    if (body.vendor1Id !== undefined) {
      updateData.vendor_1_id = body.vendor1Id;
      updateData.vendor_1_name = body.vendor1Name;
      updateData.vendor_1_category = body.vendor1Category;
      updateData.vendor_1_price = body.vendor1Price;
      updateData.vendor_1_auto_matched = body.vendor1AutoMatched ?? false;
    }

    // Update vendor 2 if provided
    if (body.vendor2Id !== undefined) {
      updateData.vendor_2_id = body.vendor2Id;
      updateData.vendor_2_name = body.vendor2Name;
      updateData.vendor_2_category = body.vendor2Category;
      updateData.vendor_2_price = body.vendor2Price;
      updateData.vendor_2_auto_matched = body.vendor2AutoMatched ?? false;
    }

    // Update vendor 3 if provided
    if (body.vendor3Id !== undefined) {
      updateData.vendor_3_id = body.vendor3Id;
      updateData.vendor_3_name = body.vendor3Name;
      updateData.vendor_3_category = body.vendor3Category;
      updateData.vendor_3_price = body.vendor3Price;
      updateData.vendor_3_auto_matched = body.vendor3AutoMatched ?? false;
    }

    // Update package details
    if (body.packageName !== undefined) updateData.package_name = body.packageName;
    if (body.packageDescription !== undefined) updateData.package_description = body.packageDescription;

    // Update pricing
    if (body.adminAdjustedPrice !== undefined) updateData.admin_adjusted_price = body.adminAdjustedPrice;
    if (body.finalPrice !== undefined) updateData.final_price = body.finalPrice;
    if (body.discountAmount !== undefined) updateData.discount_amount = body.discountAmount;
    if (body.discountReason !== undefined) updateData.discount_reason = body.discountReason;

    // Update customizations
    if (body.customizations !== undefined) updateData.customizations = body.customizations;

    // Update slot/schedule
    if (body.eventDate !== undefined) updateData.event_date = body.eventDate;
    if (body.eventTime !== undefined) updateData.event_time = body.eventTime;
    if (body.eventDuration !== undefined) updateData.event_duration = body.eventDuration;
    if (body.setupTime !== undefined) updateData.setup_time = body.setupTime;
    if (body.slotConfirmed !== undefined) updateData.slot_confirmed = body.slotConfirmed;

    // Update status if provided
    if (body.status) {
      updateData.status = body.status;
      
      if (body.status === "admin_customizing") {
        updateData.reviewed_by = body.reviewedBy || "admin";
        updateData.reviewed_at = new Date().toISOString();
      }
      
      if (body.status === "waiting_customer_approval") {
        updateData.finalized_by = body.finalizedBy || "admin";
        updateData.finalized_at = new Date().toISOString();
        updateData.sent_to_customer_at = new Date().toISOString();
      }

      if (body.status === "customer_approved") {
        updateData.customer_approved_at = new Date().toISOString();
      }
    }

    // Update admin notes if provided
    if (body.adminNotes !== undefined) {
      updateData.admin_notes = body.adminNotes;
    }

    const { data, error } = await supabase
      .from("vendor_suggestions")
      .update(updateData)
      .eq("id", body.id)
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating vendor suggestion:", error);
    return NextResponse.json({ error: "Failed to update vendor suggestion" }, { status: 500 });
  }
}

// DELETE - Delete vendor suggestion
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Suggestion ID required" }, { status: 400 });
    }

    const { error } = await supabase.from("vendor_suggestions").delete().eq("id", id);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting vendor suggestion:", error);
    return NextResponse.json({ error: "Failed to delete vendor suggestion" }, { status: 500 });
  }
}

// Helper function: Auto-match vendors based on requirements
// Returns top 3 vendors per category for admin to choose from
async function autoMatchVendors(requirements: {
  city: string;
  budget: number;
  addOns: string[];
  theme: string;
  guestCount: number;
  specifications?: string;
}): Promise<{
  topPicks: Array<{ id: string; name: string; category: string; price: number } | null>;
  allOptions: Record<string, any[]>;
}> {
  try {
    const { city, budget, addOns, theme, guestCount, specifications } = requirements;
    
    // Fetch vendors from the city
    const { data: vendors, error } = await supabase
      .from("vendors")
      .select("*")
      .eq("city", city)
      .eq("verified", true);

    if (error || !vendors || vendors.length === 0) {
      return { topPicks: [null, null, null], allOptions: {} };
    }

    // Filter vendors by selected add-ons (categories)
    const categoryMap: Record<string, string> = {
      "Restaurant": "restaurant",
      "Cake": "cake",
      "Decoration": "decorator",
      "Photographer": "photographer",
      "DJ": "dj",
    };

    const selectedCategories = addOns.map(addon => categoryMap[addon]).filter(Boolean);
    
    // Theme keywords for matching
    const themeKeywords: Record<string, string[]> = {
      "Cartoon": ["cartoon", "kids", "children", "fun", "colorful", "playful", "animated", "character"],
      "Romantic": ["romantic", "elegant", "intimate", "couple", "love", "roses", "candles", "soft"],
      "Luxury": ["luxury", "premium", "elegant", "sophisticated", "high-end", "exclusive", "deluxe", "royal"],
      "Surprise": ["surprise", "special", "unique", "creative", "unexpected", "wow", "amazing"],
    };

    const themeWords = themeKeywords[theme] || [];
    
    // Extract keywords from customer specifications
    const specificationKeywords = extractKeywords(specifications || "");
    
    // Calculate match score for each vendor
    function calculateMatchScore(vendor: any): number {
      let score = 0;
      
      // Base score from rating (0-5 points)
      score += vendor.rating || 0;
      
      // Price match score (0-3 points)
      const avgPrice = (vendor.price_min + vendor.price_max) / 2;
      if (avgPrice <= budget * 0.8) {
        score += 3; // Well within budget
      } else if (avgPrice <= budget) {
        score += 2; // Within budget
      } else if (avgPrice <= budget * 1.2) {
        score += 1; // Slightly over budget
      }
      
      // Theme match in description (0-5 points)
      const description = (vendor.description || "").toLowerCase();
      const descriptionMatches = themeWords.filter(keyword => 
        description.includes(keyword.toLowerCase())
      ).length;
      score += Math.min(descriptionMatches * 1.5, 5);
      
      // Theme match in tags (0-5 points)
      const tags = (vendor.tags || []).map((t: string) => t.toLowerCase());
      const tagMatches = themeWords.filter(keyword => 
        tags.some((tag: string) => tag.includes(keyword.toLowerCase()))
      ).length;
      score += Math.min(tagMatches * 2, 5);
      
      // Customer specifications match in description (0-8 points)
      const specDescriptionMatches = specificationKeywords.filter(keyword => 
        description.includes(keyword.toLowerCase())
      ).length;
      score += Math.min(specDescriptionMatches * 2, 8);
      
      // Customer specifications match in tags (0-8 points)
      const specTagMatches = specificationKeywords.filter(keyword => 
        tags.some((tag: string) => tag.includes(keyword.toLowerCase()))
      ).length;
      score += Math.min(specTagMatches * 2.5, 8);
      
      // Customer specifications match in portfolio highlights (0-5 points)
      const highlights = (vendor.portfolio_highlights || []).map((h: string) => h.toLowerCase());
      const specHighlightMatches = specificationKeywords.filter(keyword => 
        highlights.some((highlight: string) => highlight.includes(keyword.toLowerCase()))
      ).length;
      score += Math.min(specHighlightMatches * 2, 5);
      
      // Experience bonus (0-2 points)
      if (vendor.experience_years >= 10) score += 2;
      else if (vendor.experience_years >= 5) score += 1;
      
      // Events done bonus (0-2 points)
      if (vendor.events_done >= 200) score += 2;
      else if (vendor.events_done >= 100) score += 1;
      
      // Guest count suitability (0-2 points)
      if (vendor.pricing_type === "per_plate" && vendor.per_plate_price) {
        const estimatedCost = vendor.per_plate_price * guestCount + (vendor.extra_charges || 0);
        if (estimatedCost <= budget) score += 2;
        else if (estimatedCost <= budget * 1.2) score += 1;
      }
      
      return score;
    }
    
    const topPicks: Array<{ id: string; name: string; category: string; price: number }> = [];
    const allOptions: Record<string, any[]> = {};
    
    // For each selected category, find top 3 vendors
    for (const category of selectedCategories) {
      const categoryVendors = vendors.filter(v => v.category === category);
      
      if (categoryVendors.length === 0) continue;
      
      // Calculate match scores and sort by score
      const scoredVendors = categoryVendors
        .filter(v => v.price_min <= budget * 1.2) // Allow slightly over budget
        .map(v => ({
          vendor: v,
          score: calculateMatchScore(v)
        }))
        .sort((a, b) => b.score - a.score); // Highest score first
      
      // Get top 3 vendors for this category
      const top3 = scoredVendors.slice(0, 3).map(({ vendor, score }) => ({
        id: vendor.id,
        name: vendor.name,
        category: vendor.category,
        price: Math.round((vendor.price_min + vendor.price_max) / 2),
        rating: vendor.rating,
        reviews: vendor.reviews,
        experience_years: vendor.experience_years,
        events_done: vendor.events_done,
        description: vendor.description,
        tags: vendor.tags || [],
        match_score: Math.round(score * 10) / 10,
        price_min: vendor.price_min,
        price_max: vendor.price_max,
      }));
      
      // Store all 3 options for this category
      allOptions[category] = top3;
      
      // Add the best match to topPicks (for backward compatibility)
      if (top3.length > 0 && topPicks.length < 3) {
        topPicks.push({
          id: top3[0].id,
          name: top3[0].name,
          category: top3[0].category,
          price: top3[0].price,
        });
      }
    }
    
    // Fill remaining slots with nulls for backward compatibility
    while (topPicks.length < 3) {
      topPicks.push(null as any);
    }
    
    return { topPicks: topPicks.slice(0, 3), allOptions };
  } catch (error) {
    console.error("Error auto-matching vendors:", error);
    return { topPicks: [null, null, null], allOptions: {} };
  }
}

// Helper function: Extract meaningful keywords from customer specifications
function extractKeywords(text: string): string[] {
  if (!text || text.trim().length === 0) return [];
  
  // Convert to lowercase and remove punctuation
  const cleaned = text.toLowerCase().replace(/[^\w\s]/g, ' ');
  
  // Split into words
  const words = cleaned.split(/\s+/).filter(w => w.length > 0);
  
  // Common stop words to ignore
  const stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
    'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'will', 'with',
    'i', 'we', 'want', 'need', 'looking', 'would', 'like', 'please', 'can', 'could',
    'should', 'my', 'our', 'their', 'this', 'that', 'these', 'those', 'am', 'have'
  ]);
  
  // Filter out stop words and keep meaningful keywords (3+ characters)
  const keywords = words.filter(word => 
    word.length >= 3 && !stopWords.has(word)
  );
  
  // Remove duplicates
  return Array.from(new Set(keywords));
}
