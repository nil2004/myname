import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Type definitions
export type VendorCategory = 'restaurant' | 'decorator' | 'photographer' | 'cake' | 'dj' | 'entertainment' | 'catering';

export interface Vendor {
  id: string;
  name: string;
  category: VendorCategory;
  rating: number;
  review_count: number;
  price_min: number;
  price_max: number;
  city: string;
  area?: string;
  description?: string;
  verified: boolean;
  tags: string[];
  image_emoji: string;
  
  // Media fields
  image_url?: string | null;
  banner_image?: string | null;
  portfolio_images?: string[] | null;
  portfolio_videos?: string[] | null;
  portfolio_description?: string | null;
  portfolio_highlights?: string[] | null;
  
  // Location fields (for restaurants)
  location_address?: string | null;
  location_lat?: number | null;
  location_lng?: number | null;
  
  // Pricing fields
  pricing_type?: 'range' | 'per_plate' | 'fixed';
  per_plate_price?: number | null;
  extra_charges?: number | null;
  fixed_price?: number | null;
  
  // Experience fields
  experience_years?: number;
  events_done?: number;
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
  
  // AI matching score (computed)
  matchScore?: number;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city') || 'Dehradun';
    const category = searchParams.get('category');
    const theme = searchParams.get('theme');
    const budget = searchParams.get('budget');
    const guestCount = searchParams.get('guestCount');
    const specifications = searchParams.get('specifications'); // Customer requirements

    // Build query
    let query = supabase
      .from('vendors')
      .select('*')
      .eq('city', city)
      .eq('verified', true)
      .order('rating', { ascending: false });

    // Filter by category if provided
    if (category) {
      query = query.eq('category', category);
    }

    const { data: vendors, error } = await query;

    if (error) {
      console.error('Error fetching vendors:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If no vendors found, return empty array
    if (!vendors || vendors.length === 0) {
      return NextResponse.json({ vendors: [] });
    }

    // Apply AI matching logic if theme and budget are provided
    if (theme && budget) {
      const budgetNum = parseInt(budget);
      const guestCountNum = parseInt(guestCount || '30');

      // IMPROVED: Priority-based budget allocation with Restaurant getting majority
      const budgetPriority: Record<string, number> = {
        'restaurant': 75,  // Restaurant gets 75% when selected
        'catering': 75,    // Catering gets 75% when selected
        'decorator': 20,   // Other categories share remaining
        'photographer': 15,
        'cake': 8,
        'dj': 10,
        'entertainment': 5
      };

      // Theme keywords mapping
      const themeKeywords: Record<string, string[]> = {
        'Cartoon': ['cartoon', 'kids', 'children', 'fun', 'colorful', 'playful', 'animated', 'character'],
        'Romantic': ['romantic', 'elegant', 'intimate', 'couple', 'love', 'roses', 'candles', 'soft'],
        'Luxury': ['luxury', 'premium', 'elegant', 'sophisticated', 'high-end', 'exclusive', 'deluxe', 'royal'],
        'Surprise': ['surprise', 'special', 'unique', 'creative', 'unexpected', 'wow', 'amazing']
      };

      const keywords = themeKeywords[theme] || [];

      // Calculate match score for each vendor
      const scoredVendors = vendors.map((vendor) => {
        let score = 0;

        // 1. Rating score (0-5 points)
        score += vendor.rating;

        // 2. Price match score (0-3 points) - Using priority-based budget
        const avgPrice = (vendor.price_min + vendor.price_max) / 2;
        const categoryPriority = budgetPriority[vendor.category] || 10;
        
        // Calculate budget for this specific category
        let budgetPerCategory: number;
        
        // If this is restaurant/catering, give it 75% of total budget
        if (vendor.category === 'restaurant' || vendor.category === 'catering') {
          budgetPerCategory = budgetNum * 0.75;
        } else {
          // For other categories, use remaining 25% divided proportionally
          budgetPerCategory = (budgetNum * 0.25) * (categoryPriority / 100);
        }
        
        if (avgPrice <= budgetPerCategory * 0.8) {
          score += 3; // Well within budget
        } else if (avgPrice <= budgetPerCategory) {
          score += 2; // Within budget
        } else if (avgPrice <= budgetPerCategory * 1.2) {
          score += 1; // Slightly over
        }

        // 3. Theme match in tags (0-5 points)
        let tagMatches = 0;
        if (vendor.tags && Array.isArray(vendor.tags)) {
          for (const tag of vendor.tags) {
            const tagLower = tag.toLowerCase();
            for (const keyword of keywords) {
              if (tagLower.includes(keyword.toLowerCase())) {
                tagMatches++;
                break;
              }
            }
          }
        }
        score += Math.min(tagMatches * 2, 5);

        // 4. Specifications match in description (0-5 points) - IMPROVED!
        if (specifications && vendor.description) {
          const specWords = specifications.toLowerCase().split(/\s+/).filter(w => w.length > 2);
          const descLower = vendor.description.toLowerCase();
          let specMatches = 0;
          let totalWords = specWords.length;
          
          // Count how many specification words are in the description
          for (const word of specWords) {
            if (descLower.includes(word)) {
              specMatches++;
            }
          }
          
          // Calculate match percentage
          const matchPercentage = totalWords > 0 ? (specMatches / totalWords) * 100 : 0;
          
          // Award points based on match percentage
          let specScore = 0;
          if (matchPercentage >= 60) {
            specScore = 5; // Excellent match (60%+ words found)
          } else if (matchPercentage >= 40) {
            specScore = 4; // Very good match (40-60% words found)
          } else if (matchPercentage >= 25) {
            specScore = 3; // Good match (25-40% words found)
          } else if (matchPercentage >= 15) {
            specScore = 2; // Fair match (15-25% words found)
          } else if (specMatches >= 1) {
            specScore = 1; // Some match (at least 1 word found)
          }
          
          score += specScore;
          
          // Debug logging
          console.log(`Vendor: ${vendor.name}`);
          console.log(`  Spec words: ${specWords.join(', ')}`);
          console.log(`  Matches: ${specMatches}/${totalWords} (${matchPercentage.toFixed(1)}%)`);
          console.log(`  Spec score: ${specScore} points`);
        }

        // 5. Experience bonus (0-2 points)
        if (vendor.review_count >= 100) {
          score += 2;
        } else if (vendor.review_count >= 50) {
          score += 1;
        }

        // 6. Verified bonus (0-1 point)
        if (vendor.verified) {
          score += 1;
        }

        return { ...vendor, matchScore: score };
      });

      // Sort by match score (highest first)
      scoredVendors.sort((a, b) => b.matchScore - a.matchScore);

      // Return only top 3 recommended vendors
      const topVendors = scoredVendors.slice(0, 3);

      return NextResponse.json({ vendors: topVendors });
    }

    return NextResponse.json({ vendors });
  } catch (error) {
    console.error('Error in vendors API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


// POST - Create new vendor
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { data, error } = await supabase
      .from('vendors')
      .insert({
        name: body.name,
        category: body.category,
        rating: body.rating || 4.5,
        review_count: body.reviewCount || 0,
        price_min: body.priceMin,
        price_max: body.priceMax,
        city: body.city,
        area: body.area,
        description: body.description,
        verified: body.verified || false,
        tags: body.tags || [],
        image_emoji: body.imageEmoji || '🎨',
        banner_image: body.bannerImage,
        portfolio_images: body.portfolioImages || [],
        portfolio_videos: body.portfolioVideos || [],
        portfolio_description: body.portfolioDescription,
        portfolio_highlights: body.portfolioHighlights || [],
        location_address: body.locationAddress,
        location_lat: body.locationLat || 0,
        location_lng: body.locationLng || 0,
        pricing_type: body.pricingType || 'range',
        per_plate_price: body.perPlatePrice || 0,
        extra_charges: body.extraCharges || 0,
        fixed_price: body.fixedPrice || 0,
        experience_years: body.experienceYears || 5,
        events_done: body.eventsDone || 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating vendor:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in POST /api/vendors:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update existing vendor
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json({ error: 'Vendor ID required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('vendors')
      .update({
        name: body.name,
        category: body.category,
        rating: body.rating,
        review_count: body.reviewCount,
        price_min: body.priceMin,
        price_max: body.priceMax,
        city: body.city,
        area: body.area,
        description: body.description,
        verified: body.verified,
        tags: body.tags,
        image_emoji: body.imageEmoji,
        banner_image: body.bannerImage,
        portfolio_images: body.portfolioImages,
        portfolio_videos: body.portfolioVideos,
        portfolio_description: body.portfolioDescription,
        portfolio_highlights: body.portfolioHighlights,
        location_address: body.locationAddress,
        location_lat: body.locationLat,
        location_lng: body.locationLng,
        pricing_type: body.pricingType,
        per_plate_price: body.perPlatePrice,
        extra_charges: body.extraCharges,
        fixed_price: body.fixedPrice,
        experience_years: body.experienceYears,
        events_done: body.eventsDone,
      })
      .eq('id', body.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating vendor:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in PUT /api/vendors:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete vendor
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Vendor ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('vendors')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting vendor:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/vendors:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
