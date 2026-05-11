"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import VendorTierCard from "./VendorTierCard";
import TotalCostSummary from "./TotalCostSummary";

type Occasion = "Birthday";
type AgeGroup = "Kids" | "Teen" | "Adult";
type LocationType = "Home" | "Restaurant" | "City";
type Theme = "Cartoon" | "Romantic" | "Luxury" | "Surprise";
type AddOn = "Restaurant" | "Cake" | "Decoration" | "Photographer" | "DJ";

type Step =
  | "requirements"
  | "confirmation";

type PlannerMode = "form" | "chat";

type Money = number;

type CustomerInfo = {
  name: string;
  phone: string;
  email?: string;
};

type EventBrief = {
  occasion: Occasion;
  ageGroup: AgeGroup;
  budget: Money;
  guestCount: number;
  locationType: LocationType;
  city: string;
  theme: Theme;
  addOns: AddOn[];
  specifications?: string;
};

type LineItemKey =
  | "restaurant"
  | "decoration"
  | "cake"
  | "photographer"
  | "dj"
  | "surprise"
  | "delivery"
  | "platformFee";

type LineItem = {
  key: LineItemKey;
  title: string;
  description?: string;
  amount: Money;
  removable?: boolean;
  category: "core" | "addon" | "fee";
};

type PackageRec = {
  id: string;
  name: string;
  preview: { emoji: string; gradient: string };
  why: string[];
  deliverables: string[];
  lineItems: LineItem[];
  recommended: boolean;
};

type MockVendor = {
  id: string;
  name: string;
  category: "Restaurant" | "Photographer" | "Decorator" | "Cake Artist" | "DJ";
  city: string;
  area: string;
  description: string;
  tags: string[];
  // Location coordinates (for map display, especially restaurants)
  location?: {
    address: string;
    lat: number;
    lng: number;
  };
  // Pricing structure
  pricing: {
    type: "per_plate" | "range" | "fixed";
    perPlate?: number; // For restaurants
    extraCharges?: number; // For restaurants
    minPrice?: number; // For range-based (decoration)
    maxPrice?: number; // For range-based (decoration)
    fixedPrice?: number; // For fixed price services
  };
  rating: number;
  reviews: number;
  experienceYears: number;
  eventsDone: number;
  portfolio: {
    images: string[]; // URLs to actual images
    videos?: string[]; // Optional URLs to videos
    description: string;
    highlights: string[];
  };
  imageGradient: string;
};

type Slot = {
  id: string;
  date: string; // yyyy-mm-dd
  time: string; // e.g. "6:00 PM"
  available: boolean;
};

type PaymentChoice = "advance" | "full";

type Order = {
  id: string;
  createdAt: string;
  customer: CustomerInfo;
  event: EventBrief;
  selectedPackageId: string;
  customLineItems: LineItem[];
  total: Money;
  slot: Slot;
  payment: {
    choice: PaymentChoice;
    paidNow: Money;
    dueLater: Money;
  };
  status:
    | "Booked"
    | "Assigned"
    | "Vendors Confirmed"
    | "On the way"
    | "Setup started"
    | "Completed";
};

const STORAGE_KEY = "utsavai.partyPlanner.order.v1";

function inr(amount: number) {
  return amount.toLocaleString("en-IN");
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function budgetToRange(budget: Money): { min: Money; max: Money } {
  const safe = clamp(Math.round(budget || 0), 1000, 9999999);
  // Show a confidence band (±20%) for UI context
  return { min: Math.round(safe * 0.8), max: Math.round(safe * 1.2) };
}

function sumLineItems(items: LineItem[]) {
  return items.reduce((s, i) => s + i.amount, 0);
}

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function buildPackages(event: EventBrief, vendors: MockVendor[] = []): PackageRec[] {
  const budget = clamp(Math.round(event.budget || 0), 1000, 9999999);
  const selectedVendors = vendors.length > 0 ? vendors : [];
  const vendorsByCategory = new Map<MockVendor["category"], MockVendor[]>();
  for (const vendor of selectedVendors) {
    const curr = vendorsByCategory.get(vendor.category) ?? [];
    curr.push(vendor);
    vendorsByCategory.set(vendor.category, curr);
  }
  const selectedCategories = Array.from(vendorsByCategory.keys());

  const locationFees =
    event.locationType === "Restaurant"
      ? { delivery: 700, platformFee: 299 }
      : event.locationType === "City"
        ? { delivery: 900, platformFee: 299 }
        : { delivery: 500, platformFee: 199 };

  const baseSurprise = event.theme === "Surprise" ? 2200 : 1600;
  
  // Reserve budget for fees
  const feesTotal = locationFees.delivery + locationFees.platformFee;
  const availableBudgetForVendors = Math.max(1000, budget - feesTotal);
  
  // If no vendors selected, return empty state
  if (selectedCategories.length === 0) {
    return [{
      id: "essential",
      name: "Select Vendors to Continue",
      preview: { emoji: "🎯", gradient: "from-[rgba(107,63,160,0.25)] to-[rgba(255,200,87,0.18)]" },
      why: [
        "Select vendors in Requirements to build your package",
        "Choose from Restaurant, Cake, Decoration, Photographer, DJ",
        "We'll match the best vendors within your budget",
      ],
      deliverables: [
        "Select vendors to see recommendations",
        `Your budget: ₹${inr(budget)}`,
        "AI-powered vendor matching",
      ],
      lineItems: [],
      recommended: true,
    }];
  }
  
  // Check if budget is too low for selected vendors
  const minPricePerCategory = new Map<MockVendor["category"], number>();
  for (const category of selectedCategories) {
    const candidates = vendorsByCategory.get(category) ?? [];
    if (candidates.length === 0) continue;
    
    const minPrice = Math.min(...candidates.map(v => {
      if (v.pricing.type === "per_plate" && v.pricing.perPlate) {
        return (v.pricing.perPlate * event.guestCount) + (v.pricing.extraCharges || 0);
      } else if (v.pricing.type === "range") {
        return v.pricing.minPrice!;
      } else {
        return v.pricing.fixedPrice!;
      }
    }));
    minPricePerCategory.set(category, minPrice);
  }
  
  const totalMinimumCost = Array.from(minPricePerCategory.values()).reduce((sum, price) => sum + price, 0) + feesTotal;
  
  // If minimum cost exceeds budget, show "contact us" message
  if (totalMinimumCost > budget) {
    return [{
      id: "contact-us",
      name: "Our Team Will Connect With You",
      preview: { emoji: "📞", gradient: "from-[rgba(107,63,160,0.25)] to-[rgba(255,200,87,0.18)]" },
      why: [
        `Your budget: ₹${inr(budget)}`,
        `Minimum cost for selected vendors: ₹${inr(totalMinimumCost)}`,
        "Our team will find the best options for you",
        "We'll connect with you within 24 hours",
      ],
      deliverables: [
        "✓ Personal consultation with our event planning team",
        "✓ Custom vendor recommendations within your budget",
        "✓ Flexible payment options and packages",
        "✓ Response within 24 hours",
        `Selected vendors: ${selectedCategories.join(", ")}`,
      ],
      lineItems: [],
      recommended: true,
    }];
  }

  const toLineItem = (category: MockVendor["category"], vendor: MockVendor, premium = false, allocatedBudget?: number): LineItem => {
    let price = 0;
    
    // Calculate base price based on pricing type
    if (vendor.pricing.type === "per_plate" && vendor.pricing.perPlate) {
      price = (vendor.pricing.perPlate * event.guestCount) + (vendor.pricing.extraCharges || 0);
    } else if (vendor.pricing.type === "range") {
      // Use average of range for line item
      price = Math.round((vendor.pricing.minPrice! + vendor.pricing.maxPrice!) / 2);
    } else {
      price = vendor.pricing.fixedPrice!;
    }
    
    // Apply premium multiplier first
    if (premium) {
      price = Math.round(price * 1.15);
    }
    
    // Cap price at allocated budget if provided (after premium calculation)
    if (allocatedBudget !== undefined && price > allocatedBudget) {
      price = allocatedBudget;
    }
    
    if (category === "Restaurant") {
      return {
        key: "restaurant",
        title: `${vendor.name} (${premium ? "premium table setup" : "venue booking"})`,
        description: `${vendor.city} • for ~${event.guestCount} guests`,
        amount: price,
        removable: true,
        category: "core",
      };
    }
    if (category === "Decorator") {
      return {
        key: "decoration",
        title: `${vendor.name} (${event.theme} decor)`,
        description: `${vendor.city} • ${vendor.eventsDone}+ events`,
        amount: price,
        removable: true,
        category: "core",
      };
    }
    if (category === "Photographer") {
      return {
        key: "photographer",
        title: `${vendor.name} (${premium ? "3 hours" : "2 hours"})`,
        description: `${vendor.reviews} reviews • rating ${vendor.rating}`,
        amount: price,
        removable: true,
        category: "addon",
      };
    }
    if (category === "Cake Artist") {
      return {
        key: "cake",
        title: `${vendor.name} (${premium ? "premium cake" : "custom cake"})`,
        description: `${event.theme}-matched design`,
        amount: price,
        removable: true,
        category: "core",
      };
    }
    return {
      key: "dj",
      title: `${vendor.name} (DJ set)`,
      description: `${vendor.experienceYears}y exp`,
      amount: price,
      removable: true,
      category: "addon",
    };
  };

  // Smart budget allocation - distribute budget proportionally based on typical vendor costs
  const allocateBudget = (totalBudget: number, categories: MockVendor["category"][]): Map<MockVendor["category"], number> => {
    const allocation = new Map<MockVendor["category"], number>();
    
    // Typical cost weights for each category (based on industry standards)
    const weights: Record<MockVendor["category"], number> = {
      "Restaurant": 3.5,      // Highest priority - venue is essential
      "Decorator": 2.0,       // Important for ambiance
      "Photographer": 2.5,    // Memories are valuable
      "Cake Artist": 0.5,     // Lower cost item
      "DJ": 1.5,              // Entertainment
    };
    
    const totalWeight = categories.reduce((sum, cat) => sum + weights[cat], 0);
    
    // Allocate budget proportionally
    categories.forEach(cat => {
      allocation.set(cat, Math.round((weights[cat] / totalWeight) * totalBudget));
    });
    
    return allocation;
  };

  const budgetAllocation = allocateBudget(availableBudgetForVendors, selectedCategories);

  // Build essential package within budget
  const essentialVendorItems: LineItem[] = [];
  let canBuildPackage = true;
  let totalAllocatedCost = 0;
  
  for (const category of selectedCategories) {
    const candidates = vendorsByCategory.get(category) ?? [];
    if (candidates.length === 0) continue;
    
    const allocatedBudget = budgetAllocation.get(category) ?? 0;
    
    // Find best vendor within allocated budget
    const affordableVendors = candidates
      .map(v => {
        let adjustedPrice = 0;
        if (v.pricing.type === "per_plate" && v.pricing.perPlate) {
          adjustedPrice = (v.pricing.perPlate * event.guestCount) + (v.pricing.extraCharges || 0);
        } else if (v.pricing.type === "range") {
          adjustedPrice = Math.round((v.pricing.minPrice! + v.pricing.maxPrice!) / 2);
        } else {
          adjustedPrice = v.pricing.fixedPrice!;
        }
        return { vendor: v, adjustedPrice };
      })
      .filter(({ adjustedPrice }) => adjustedPrice <= allocatedBudget)
      .sort((a, b) => {
        // Prefer higher rating, then lower price
        if (Math.abs(a.vendor.rating - b.vendor.rating) > 0.2) return b.vendor.rating - a.vendor.rating;
        return a.adjustedPrice - b.adjustedPrice;
      });
    
    if (affordableVendors.length > 0) {
      const best = affordableVendors[0].vendor;
      const lineItem = toLineItem(category, best, false, allocatedBudget);
      essentialVendorItems.push(lineItem);
      totalAllocatedCost += lineItem.amount;
    } else {
      // No vendor available within allocated budget
      canBuildPackage = false;
      break;
    }
  }

  const essential: LineItem[] = [
    ...essentialVendorItems,
    ({ key: "delivery", title: "Logistics & delivery", amount: locationFees.delivery, category: "fee" } satisfies LineItem),
    ({ key: "platformFee", title: "Platform fee", amount: locationFees.platformFee, category: "fee" } satisfies LineItem),
  ];

  const essentialTotal = sumLineItems(essential);

  // If cannot build package or exceeds budget, show "contact us" message
  if (!canBuildPackage || essentialTotal > budget) {
    return [{
      id: "contact-us",
      name: "Our Team Will Connect With You",
      preview: { emoji: "📞", gradient: "from-[rgba(107,63,160,0.25)] to-[rgba(255,200,87,0.18)]" },
      why: [
        `Your budget: ₹${inr(budget)}`,
        canBuildPackage ? `Package cost: ₹${inr(essentialTotal)}` : "No vendors available within budget allocation",
        "Our team will find the best options for you",
        "We'll connect with you within 24 hours",
      ],
      deliverables: [
        "✓ Personal consultation with our event planning team",
        "✓ Custom vendor recommendations within your budget",
        "✓ Flexible payment options and packages",
        "✓ Response within 24 hours",
        `Selected vendors: ${selectedCategories.join(", ")}`,
      ],
      lineItems: [],
      recommended: true,
    }];
  }

  // Build premium package - only if essential is within budget
  let premium: LineItem[] = [];
  let premiumTotal = 0;
  let premiumVendorItems: LineItem[] = [];
  let totalPremiumCost = 0;
  
  if (canBuildPackage && essentialTotal <= budget) {
    // For premium, allocate slightly more budget per category
    const premiumBudgetAllocation = allocateBudget(availableBudgetForVendors, selectedCategories);
    
    for (const category of selectedCategories) {
      const candidates = vendorsByCategory.get(category) ?? [];
      if (candidates.length === 0) continue;
      
      const allocatedBudget = premiumBudgetAllocation.get(category) ?? 0;
      
      // Find best premium vendor
      const affordableVendors = candidates
        .map(v => {
          let basePrice = 0;
          if (v.pricing.type === "per_plate" && v.pricing.perPlate) {
            basePrice = (v.pricing.perPlate * event.guestCount) + (v.pricing.extraCharges || 0);
          } else if (v.pricing.type === "range") {
            basePrice = Math.round((v.pricing.minPrice! + v.pricing.maxPrice!) / 2);
          } else {
            basePrice = v.pricing.fixedPrice!;
          }
          const premiumPrice = Math.round(basePrice * 1.15); // Apply premium multiplier
          return { vendor: v, basePrice, premiumPrice };
        })
        .filter(({ premiumPrice }) => premiumPrice <= allocatedBudget)
        .sort((a, b) => {
          // For premium, prefer highest rating first
          return b.vendor.rating - a.vendor.rating || b.premiumPrice - a.premiumPrice;
        });
      
      if (affordableVendors.length > 0) {
        const best = affordableVendors[0].vendor;
        const lineItem = toLineItem(category, best, true, allocatedBudget);
        premiumVendorItems.push(lineItem);
        totalPremiumCost += lineItem.amount;
      }
    }

    premium = [
      ...premiumVendorItems,
      ({ key: "delivery", title: "Logistics & delivery", amount: locationFees.delivery, category: "fee" } satisfies LineItem),
      ({ key: "platformFee", title: "Platform fee", amount: locationFees.platformFee, category: "fee" } satisfies LineItem),
    ];

    premiumTotal = sumLineItems(premium);

    // Add surprise if budget allows
    if (premiumTotal + baseSurprise <= budget) {
      premium.splice(premium.length - 2, 0, {
        key: "surprise",
        title: "Surprise add-on",
        description: "Entry reveal + confetti moment",
        amount: baseSurprise,
        removable: true,
        category: "addon",
      } satisfies LineItem);
      premiumTotal = sumLineItems(premium);
    }
  }

  const reasonBase = [
    `Designed for ${event.ageGroup.toLowerCase()} birthdays`,
    `${event.locationType} friendly setup`,
    "Clear deliverables + transparent pricing",
  ];

  const recs: PackageRec[] = [];

  // Add essential package
  recs.push({
    id: "essential",
    name: "Best Value Combo",
    preview: { emoji: "🎈", gradient: "from-[rgba(107,63,160,0.25)] to-[rgba(255,122,89,0.18)]" },
    why: [
      `Total: ₹${inr(essentialTotal)} (within your ₹${inr(budget)} budget)`,
      "Best value vendors for your requirements",
      ...reasonBase,
      "Smart budget allocation across vendors",
    ],
    deliverables: [
      "Setup & teardown included",
      `Estimated guests: ${event.guestCount}`,
      ...essentialVendorItems.slice(0, 3).map((i) => i.title),
      "Transparent per-vendor pricing",
    ],
    lineItems: essential,
    recommended: true,
  });

  // Add premium package if available and within budget
  if (premiumTotal > 0 && premiumTotal <= budget && premiumVendorItems.length === selectedCategories.length) {
    recs.push({
      id: "premium",
      name: "Premium Combo",
      preview: { emoji: "🎁", gradient: "from-[rgba(255,200,87,0.24)] to-[rgba(107,63,160,0.16)]" },
      why: [
        `Total: ₹${inr(premiumTotal)} (within your ₹${inr(budget)} budget)`,
        "Top-rated vendors with premium service",
        ...reasonBase,
      ],
      deliverables: [
        `Estimated guests: ${event.guestCount}`,
        ...premiumVendorItems.slice(0, 3).map((i) => i.title),
        "Premium execution & service",
      ],
      lineItems: premium,
      recommended: false,
    });
  }

  return recs;
}

function buildSlots(date: string): Slot[] {
  const times = ["11:00 AM", "1:00 PM", "4:00 PM", "6:00 PM", "8:00 PM"];
  return times.map((time, idx) => ({
    id: `${date}_${idx}`,
    date,
    time,
    available: Math.random() > 0.18, // demo availability
  }));
}

function buildMockVendors(event: EventBrief): MockVendor[] {
  const all: MockVendor[] = [
    // Restaurants
    {
      id: "rest1",
      name: "Olive Banquets",
      category: "Restaurant",
      city: event.city,
      area: "Rajpur Road",
      description: "Premium banquet hall with elegant interiors, perfect for birthday celebrations. Specializes in multi-cuisine buffets with customizable menus.",
      tags: ["Buffet", "AC Hall", "Parking", "Kids Friendly", "Outdoor Seating"],
      location: {
        address: "Rajpur Road, Near Clock Tower, Dehradun, Uttarakhand 248001",
        lat: 30.3255,
        lng: 78.0436,
      },
      pricing: {
        type: "per_plate",
        perPlate: 450,
        extraCharges: 5000, // Hall charges, decoration setup, etc.
      },
      rating: 4.5,
      reviews: 188,
      experienceYears: 12,
      eventsDone: 540,
      portfolio: {
        // Using emoji placeholders - replace with actual image URLs when available
        images: ["🍽️", "🎉", "✨"],
        videos: [],
        description: "Elegant banquet hall with modern amenities and professional catering services.",
        highlights: [
          "Capacity: 50-200 guests",
          "Complimentary parking for 50 vehicles",
          "In-house decoration team",
          "Multi-cuisine menu options",
          "Kids play area available"
        ],
      },
      imageGradient: "from-[rgba(26,15,46,0.18)] to-[rgba(255,200,87,0.22)]",
    },
    {
      id: "rest2",
      name: "Royal Garden Restaurant",
      category: "Restaurant",
      city: event.city,
      area: "Saharanpur Road",
      description: "Luxury dining with beautiful garden setting. Known for authentic North Indian cuisine and exceptional service for birthday parties.",
      tags: ["Garden", "Premium", "Live Music", "Valet Parking", "Photography Spots"],
      location: {
        address: "Saharanpur Road, Near ISBT, Dehradun, Uttarakhand 248001",
        lat: 30.3398,
        lng: 77.9993,
      },
      pricing: {
        type: "per_plate",
        perPlate: 650,
        extraCharges: 8000,
      },
      rating: 4.7,
      reviews: 142,
      experienceYears: 10,
      eventsDone: 390,
      portfolio: {
        images: ["🌳", "🍽️", "✨"],
        description: "Premium garden restaurant with stunning ambiance and gourmet cuisine.",
        highlights: [
          "Beautiful garden setting",
          "Live music arrangements",
          "Premium bar service",
          "Professional event coordination",
          "Instagram-worthy decor"
        ],
      },
      imageGradient: "from-[rgba(107,63,160,0.22)] to-[rgba(255,122,89,0.20)]",
    },
    {
      id: "rest3",
      name: "Celebration Hub",
      category: "Restaurant",
      city: event.city,
      area: "Clock Tower",
      description: "Budget-friendly party venue with great food quality. Perfect for intimate birthday celebrations with family and friends.",
      tags: ["Budget Friendly", "Family Style", "Quick Service", "Customizable Menu"],
      location: {
        address: "Clock Tower, Paltan Bazaar, Dehradun, Uttarakhand 248001",
        lat: 30.3255,
        lng: 78.0322,
      },
      pricing: {
        type: "per_plate",
        perPlate: 350,
        extraCharges: 3000,
      },
      rating: 4.3,
      reviews: 95,
      experienceYears: 5,
      eventsDone: 180,
      portfolio: {
        images: ["🎊", "🍕", "🎂"],
        description: "Affordable venue with quality food and friendly service.",
        highlights: [
          "Best value for money",
          "Flexible menu options",
          "Quick setup and service",
          "Ideal for 20-50 guests",
          "Free birthday cake cutting"
        ],
      },
      imageGradient: "from-[rgba(255,200,87,0.24)] to-[rgba(107,63,160,0.18)]",
    },
    
    // Decorators
    {
      id: "dec1",
      name: "Celebration Decor Co.",
      category: "Decorator",
      city: event.city,
      area: "Rajpur Road",
      description: "Creative decoration specialists for all age groups. From cartoon themes to elegant setups, we bring your vision to life.",
      tags: ["Balloon Art", "Theme Decor", "LED Lights", "Photo Booth", "Customizable"],
      pricing: {
        type: "range",
        minPrice: 5000,
        maxPrice: 15000,
      },
      rating: 4.8,
      reviews: 131,
      experienceYears: 8,
      eventsDone: 220,
      portfolio: {
        images: ["🎈", "🎨", "✨"],
        description: "Transform any space into a magical celebration venue with our creative decorations.",
        highlights: [
          "Custom theme designs",
          "Balloon installations",
          "LED lighting effects",
          "Photo booth setup",
          "Same-day setup available"
        ],
      },
      imageGradient: "from-[rgba(255,200,87,0.24)] to-[rgba(255,122,89,0.22)]",
    },
    {
      id: "dec2",
      name: "Dream Decorators",
      category: "Decorator",
      city: event.city,
      area: "Patel Nagar",
      description: "Premium decoration services with luxury themes. Specializing in elegant and sophisticated birthday setups.",
      tags: ["Luxury", "Floral Decor", "Draping", "Stage Setup", "Premium Materials"],
      pricing: {
        type: "range",
        minPrice: 15000,
        maxPrice: 35000,
      },
      rating: 4.9,
      reviews: 87,
      experienceYears: 12,
      eventsDone: 156,
      portfolio: {
        images: ["💐", "✨", "🎭"],
        description: "Luxury decoration services for unforgettable celebrations.",
        highlights: [
          "Premium floral arrangements",
          "Elegant draping and fabrics",
          "Professional stage setup",
          "Lighting design",
          "Complete venue transformation"
        ],
      },
      imageGradient: "from-[rgba(107,63,160,0.25)] to-[rgba(255,200,87,0.25)]",
    },
    {
      id: "dec3",
      name: "Party Perfect Decor",
      category: "Decorator",
      city: event.city,
      area: "Clement Town",
      description: "Affordable and creative decorations for kids' birthdays. Specializing in cartoon and superhero themes.",
      tags: ["Kids Themes", "Cartoon Characters", "Budget Friendly", "Quick Setup"],
      pricing: {
        type: "range",
        minPrice: 3000,
        maxPrice: 8000,
      },
      rating: 4.6,
      reviews: 164,
      experienceYears: 6,
      eventsDone: 290,
      portfolio: {
        images: ["🎪", "🦸", "🎨"],
        description: "Fun and colorful decorations that kids absolutely love!",
        highlights: [
          "Popular cartoon themes",
          "Superhero setups",
          "Colorful balloon arches",
          "Character cutouts",
          "Budget-friendly packages"
        ],
      },
      imageGradient: "from-[rgba(255,122,89,0.18)] to-[rgba(107,63,160,0.22)]",
    },

    // Photographers
    {
      id: "photo1",
      name: "Rahul Movies",
      category: "Photographer",
      city: event.city,
      area: "Rajpur Road",
      description: "Professional photography and videography for birthday celebrations. Candid moments captured beautifully.",
      tags: ["Candid", "Video", "Drone Shots", "Same Day Edit", "Photo Album"],
      pricing: {
        type: "fixed",
        fixedPrice: 12000,
      },
      rating: 4.6,
      reviews: 106,
      experienceYears: 13,
      eventsDone: 280,
      portfolio: {
        images: ["📸", "🎥", "✨"],
        description: "Capturing precious moments with artistic photography and cinematic videography.",
        highlights: [
          "2-3 hours coverage",
          "200+ edited photos",
          "Highlight video (3-5 min)",
          "Online gallery",
          "Same day preview"
        ],
      },
      imageGradient: "from-[rgba(107,63,160,0.25)] to-[rgba(255,200,87,0.25)]",
    },
    {
      id: "photo2",
      name: "Rudra Photography",
      category: "Photographer",
      city: event.city,
      area: "Saharanpur Road",
      description: "Premium photography services with creative concepts. Specializing in themed photoshoots and professional editing.",
      tags: ["Premium", "Themed Shoots", "Professional Editing", "Photo Booth", "Props"],
      pricing: {
        type: "fixed",
        fixedPrice: 18000,
      },
      rating: 4.7,
      reviews: 45,
      experienceYears: 10,
      eventsDone: 300,
      portfolio: {
        images: ["🎥", "📷", "🎬"],
        description: "Premium photography with creative concepts and professional post-production.",
        highlights: [
          "4-5 hours coverage",
          "300+ edited photos",
          "Cinematic video (10 min)",
          "Photo booth with props",
          "Premium album included"
        ],
      },
      imageGradient: "from-[rgba(26,15,46,0.22)] to-[rgba(107,63,160,0.28)]",
    },
    {
      id: "photo3",
      name: "Moments Studio",
      category: "Photographer",
      city: event.city,
      area: "Clock Tower",
      description: "Affordable photography packages for birthday parties. Quality photos without breaking the bank.",
      tags: ["Budget Friendly", "Quick Delivery", "Digital Photos", "Basic Video"],
      pricing: {
        type: "fixed",
        fixedPrice: 8000,
      },
      rating: 4.4,
      reviews: 78,
      experienceYears: 5,
      eventsDone: 150,
      portfolio: {
        images: ["📸", "🎉", "💫"],
        description: "Quality photography at affordable prices for memorable celebrations.",
        highlights: [
          "2 hours coverage",
          "100+ edited photos",
          "Basic highlight video",
          "Digital delivery",
          "Quick turnaround (3 days)"
        ],
      },
      imageGradient: "from-[rgba(255,200,87,0.24)] to-[rgba(255,122,89,0.22)]",
    },

    // Cake Artists
    {
      id: "cake1",
      name: "Sweet Layers Studio",
      category: "Cake Artist",
      city: event.city,
      area: "Rajpur Road",
      description: "Custom designer cakes for all occasions. Specializing in themed cakes with edible art and unique flavors.",
      tags: ["Custom Design", "Theme Cakes", "Eggless Options", "Photo Cakes", "Multi-tier"],
      pricing: {
        type: "fixed",
        fixedPrice: 2500,
      },
      rating: 4.7,
      reviews: 210,
      experienceYears: 7,
      eventsDone: 640,
      portfolio: {
        images: ["🎂", "🍰", "✨"],
        description: "Beautiful custom cakes that taste as good as they look!",
        highlights: [
          "Custom theme designs",
          "Multiple flavor options",
          "Eggless available",
          "Photo printing on cake",
          "Free delivery in city"
        ],
      },
      imageGradient: "from-[rgba(255,182,193,0.30)] to-[rgba(255,200,87,0.28)]",
    },
    {
      id: "cake2",
      name: "Cake Craft Studio",
      category: "Cake Artist",
      city: event.city,
      area: "Patel Nagar",
      description: "Premium cake artistry with intricate designs. Perfect for elegant birthday celebrations.",
      tags: ["Premium", "Fondant Art", "3D Cakes", "Luxury Flavors", "Edible Gold"],
      pricing: {
        type: "fixed",
        fixedPrice: 4500,
      },
      rating: 4.8,
      reviews: 92,
      experienceYears: 10,
      eventsDone: 280,
      portfolio: {
        images: ["🎨", "🍰", "👑"],
        description: "Luxury cakes with exquisite designs and premium ingredients.",
        highlights: [
          "Intricate fondant work",
          "3D sculpted cakes",
          "Premium imported flavors",
          "Edible decorations",
          "Personalized toppers"
        ],
      },
      imageGradient: "from-[rgba(107,63,160,0.25)] to-[rgba(255,200,87,0.25)]",
    },
    {
      id: "cake3",
      name: "Happy Bakes",
      category: "Cake Artist",
      city: event.city,
      area: "Clock Tower",
      description: "Delicious homemade cakes at affordable prices. Fresh ingredients and traditional recipes.",
      tags: ["Homemade", "Budget Friendly", "Fresh", "Traditional Flavors"],
      pricing: {
        type: "fixed",
        fixedPrice: 1500,
      },
      rating: 4.5,
      reviews: 156,
      experienceYears: 4,
      eventsDone: 420,
      portfolio: {
        images: ["🎂", "🍓", "🍫"],
        description: "Delicious homemade cakes made with love and fresh ingredients.",
        highlights: [
          "Fresh daily baking",
          "Traditional recipes",
          "Simple elegant designs",
          "Great taste guaranteed",
          "Same day orders accepted"
        ],
      },
      imageGradient: "from-[rgba(255,200,87,0.24)] to-[rgba(255,122,89,0.22)]",
    },

    // DJs
    {
      id: "dj1",
      name: "DJ Pulse",
      category: "DJ",
      city: event.city,
      area: "Rajpur Road",
      description: "Professional DJ services with latest sound systems. Perfect mix of Bollywood, retro, and kids' party music.",
      tags: ["Professional Setup", "Bollywood", "Kids Music", "Karaoke", "LED Lights"],
      pricing: {
        type: "fixed",
        fixedPrice: 8000,
      },
      rating: 4.5,
      reviews: 72,
      experienceYears: 6,
      eventsDone: 180,
      portfolio: {
        images: ["🎧", "🎵", "💡"],
        description: "High-energy music and entertainment for unforgettable celebrations.",
        highlights: [
          "Professional sound system",
          "Wireless microphones",
          "LED party lights",
          "Karaoke setup",
          "Customized playlists"
        ],
      },
      imageGradient: "from-[rgba(26,15,46,0.20)] to-[rgba(107,63,160,0.28)]",
    },
    {
      id: "dj2",
      name: "Beat Masters",
      category: "DJ",
      city: event.city,
      area: "Saharanpur Road",
      description: "Premium DJ and entertainment services. Complete party setup with lights, sound, and special effects.",
      tags: ["Premium", "Special Effects", "Smoke Machine", "Laser Lights", "Live Mixing"],
      pricing: {
        type: "fixed",
        fixedPrice: 15000,
      },
      rating: 4.7,
      reviews: 54,
      experienceYears: 8,
      eventsDone: 120,
      portfolio: {
        images: ["🎛️", "✨", "🎉"],
        description: "Premium entertainment with state-of-the-art equipment and special effects.",
        highlights: [
          "Premium sound system",
          "Laser light show",
          "Smoke effects",
          "Live DJ mixing",
          "Dance floor lighting"
        ],
      },
      imageGradient: "from-[rgba(107,63,160,0.25)] to-[rgba(255,200,87,0.25)]",
    },
    {
      id: "dj3",
      name: "Party Vibes DJ",
      category: "DJ",
      city: event.city,
      area: "Clement Town",
      description: "Budget-friendly DJ services for small to medium parties. Good music and basic lighting included.",
      tags: ["Budget Friendly", "Basic Setup", "Popular Music", "Flexible Timing"],
      pricing: {
        type: "fixed",
        fixedPrice: 5000,
      },
      rating: 4.3,
      reviews: 89,
      experienceYears: 4,
      eventsDone: 160,
      portfolio: {
        images: ["🎵", "🎊", "🎤"],
        description: "Affordable DJ services with good music and basic party lighting.",
        highlights: [
          "Good quality sound",
          "Basic party lights",
          "Popular playlists",
          "Flexible timing",
          "Microphone included"
        ],
      },
      imageGradient: "from-[rgba(255,122,89,0.18)] to-[rgba(107,63,160,0.22)]",
    },
  ];

  const categoryFromAddOn: Record<AddOn, MockVendor["category"]> = {
    Restaurant: "Restaurant",
    Cake: "Cake Artist",
    Decoration: "Decorator",
    Photographer: "Photographer",
    DJ: "DJ",
  };

  // Only show categories explicitly selected in Requirements
  const requestedCategories = new Set<MockVendor["category"]>(event.addOns.map((a) => categoryFromAddOn[a]));

  if (requestedCategories.size === 0) return [];

  // Smart matching algorithm for each category
  const matchedVendors: MockVendor[] = [];

  for (const category of requestedCategories) {
    const candidates = all.filter((v) => v.category === category);
    
    // Calculate match score for each vendor
    const scoredVendors = candidates.map((vendor) => {
      let score = 0;
      
      // 1. Price matching (40% weight)
      const perCategoryBudget = event.budget / requestedCategories.size;
      let vendorPrice = 0;
      
      if (vendor.pricing.type === "per_plate" && vendor.pricing.perPlate) {
        vendorPrice = (vendor.pricing.perPlate * event.guestCount) + (vendor.pricing.extraCharges || 0);
      } else if (vendor.pricing.type === "range") {
        vendorPrice = (vendor.pricing.minPrice! + vendor.pricing.maxPrice!) / 2;
      } else if (vendor.pricing.type === "fixed") {
        vendorPrice = vendor.pricing.fixedPrice!;
      }
      
      const priceDiff = Math.abs(vendorPrice - perCategoryBudget);
      const priceScore = Math.max(0, 100 - (priceDiff / perCategoryBudget) * 100);
      score += priceScore * 0.4;
      
      // 2. Rating and reviews (30% weight)
      const ratingScore = (vendor.rating / 5) * 100;
      const reviewScore = Math.min(100, (vendor.reviews / 200) * 100);
      score += (ratingScore * 0.7 + reviewScore * 0.3) * 0.3;
      
      // 3. Tag matching (20% weight)
      const themeKeywords = event.theme.toLowerCase();
      const ageKeywords = event.ageGroup.toLowerCase();
      const matchingTags = vendor.tags.filter(tag => 
        tag.toLowerCase().includes(themeKeywords) || 
        tag.toLowerCase().includes(ageKeywords) ||
        (event.ageGroup === "Kids" && tag.toLowerCase().includes("kid"))
      );
      const tagScore = (matchingTags.length / vendor.tags.length) * 100;
      score += tagScore * 0.2;
      
      // 4. Experience (10% weight)
      const experienceScore = Math.min(100, (vendor.experienceYears / 15) * 100);
      score += experienceScore * 0.1;
      
      return { vendor, score, vendorPrice };
    });
    
    // Sort by score and take top 3
    const topMatches = scoredVendors
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.vendor);
    
    matchedVendors.push(...topMatches);
  }

  return matchedVendors;
}

function defaultLineItemsForAddOns(addOns: AddOn[], theme: Theme, ageGroup: AgeGroup, locationType: LocationType) {
  const event: EventBrief = {
    occasion: "Birthday",
    ageGroup,
    budget: 15000,
    guestCount: 30,
    locationType,
    city: "Dehradun",
    theme,
    addOns,
  };
  const essential = buildPackages(event, []).find((p) => p.id === "essential");
  return essential?.lineItems ?? [];
}

export default function PlanForm() {
  const [mode, setMode] = useState<PlannerMode>("form");
  const [step, setStep] = useState<Step>("requirements");
  const [error, setError] = useState<string>("");

  const [event, setEvent] = useState<EventBrief>({
    occasion: "Birthday",
    ageGroup: "Kids",
    budget: 15000,
    guestCount: 30,
    locationType: "Restaurant",
    city: "Dehradun",
    theme: "Cartoon",
    addOns: ["Restaurant", "Decoration"],
    specifications: "",
  });

  const [partyDate, setPartyDate] = useState<string>("");

  const [customer, setCustomer] = useState<CustomerInfo>({
    name: "",
    phone: "",
    email: "",
  });

  const [packages, setPackages] = useState<PackageRec[]>(() => buildPackages(event, []));
  const [selectedPackageId, setSelectedPackageId] = useState<string>("essential");

  const selectedPackage = useMemo(
    () => packages.find((p) => p.id === selectedPackageId) ?? packages[0],
    [packages, selectedPackageId]
  );

  const [customLineItems, setCustomLineItems] = useState<LineItem[]>(() =>
    selectedPackage?.lineItems ?? defaultLineItemsForAddOns(event.addOns, event.theme, event.ageGroup, event.locationType)
  );

  const [date, setDate] = useState<string>("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");
  const selectedSlot = useMemo(() => slots.find((s) => s.id === selectedSlotId) ?? null, [slots, selectedSlotId]);

  const [paymentChoice, setPaymentChoice] = useState<PaymentChoice>("advance");
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [selectedVendorForPortfolio, setSelectedVendorForPortfolio] = useState<MockVendor | null>(null);
  const [selectedVendorTitle, setSelectedVendorTitle] = useState<string>("");
  const [interestedVendors, setInterestedVendors] = useState<Set<string>>(new Set());
  const [realVendors, setRealVendors] = useState<MockVendor[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [budgetAllocations, setBudgetAllocations] = useState<Map<string, number>>(new Map());
  const [selectedVendors, setSelectedVendors] = useState<Map<string, any>>(new Map());

  const total = useMemo(() => sumLineItems(customLineItems), [customLineItems]);
  const budgetRange = useMemo(() => budgetToRange(event.budget), [event.budget]);
  
  // Use real vendors if available, otherwise fall back to mock
  // Use ONLY real vendors from database (no mock data fallback)
  const mockVendors = useMemo(() => {
    return realVendors;
  }, [realVendors]);
  
  const vendorsByCategory = useMemo(() => {
    const groups = new Map<MockVendor["category"], MockVendor[]>();
    for (const vendor of mockVendors) {
      const curr = groups.get(vendor.category) ?? [];
      curr.push(vendor);
      groups.set(vendor.category, curr);
    }
    return groups;
  }, [mockVendors]);

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const [chatDraft, setChatDraft] = useState("");
  const [chat, setChat] = useState<
    { id: string; role: "assistant" | "user"; text: string; quickReplies?: { id: string; label: string }[] }[]
  >([
    {
      id: "a1",
      role: "assistant",
      text: "Let’s plan your birthday. First — what’s the age group?",
      quickReplies: [
        { id: "Kids", label: "Kids" },
        { id: "Teen", label: "Teen" },
        { id: "Adult", label: "Adult" },
      ],
    },
  ]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as Order;
      setOrder(saved);
      setEvent(saved.event);
      setCustomer(saved.customer ?? { name: "", phone: "", email: "" });
      setPackages(buildPackages(saved.event, []));
      setSelectedPackageId(saved.selectedPackageId);
      setCustomLineItems(saved.customLineItems);
      setDate(saved.slot.date);
      setSlots(buildSlots(saved.slot.date));
      setSelectedSlotId(saved.slot.id);
      setPaymentChoice(saved.payment.choice);
      setStep("dashboard");
    } catch {
      // ignore corrupted storage
    }
  }, []);

  useEffect(() => {
    setPackages(buildPackages(event, realVendors));
  }, [event, realVendors]);

  // Auto-fetch vendors when event details change
  useEffect(() => {
    if (event.addOns.length > 0 && event.city && event.budget > 0) {
      fetchVendorsFromDB();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event.addOns.join(','), event.city, event.budget, event.theme, event.guestCount]);

  useEffect(() => {
    const pkg = packages.find((p) => p.id === selectedPackageId) ?? packages[0];
    if (!pkg) return;
    setCustomLineItems(pkg.lineItems);
  }, [packages, selectedPackageId]); // reset items when package changes

  useEffect(() => {
    if (!chatEndRef.current) return;
    chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [chat.length]);

  // Fetch vendors from database
  async function fetchVendorsFromDB() {
    if (loadingVendors) return;
    
    setLoadingVendors(true);
    try {
      const params = new URLSearchParams({
        city: event.city,
        theme: event.theme,
        budget: event.budget.toString(),
        guestCount: event.guestCount.toString(),
      });

      // Add specifications if provided
      if (event.specifications && event.specifications.trim()) {
        params.append('specifications', event.specifications);
      }

      // Fetch vendors for each selected category
      const vendorPromises = event.addOns.map(async (addOn) => {
        const categoryMap: Record<AddOn, string> = {
          'Restaurant': 'restaurant',  // Fixed: was 'catering', should be 'restaurant'
          'Cake': 'cake',
          'Decoration': 'decorator',
          'Photographer': 'photographer',
          'DJ': 'dj',
        };
        
        const category = categoryMap[addOn];
        const response = await fetch(`/api/vendors?${params}&category=${category}`);
        const data = await response.json();
        return data.vendors || [];
      });

      const vendorArrays = await Promise.all(vendorPromises);
      const allVendors = vendorArrays.flat();

      // Convert database vendors to MockVendor format
      const convertedVendors: MockVendor[] = allVendors.map((v: any) => ({
        id: v.id,
        name: v.name,
        category: v.category === 'restaurant' ? 'Restaurant' :  // Fixed: was 'catering'
                  v.category === 'cake' ? 'Cake Artist' :
                  v.category === 'decorator' ? 'Decorator' :
                  v.category === 'photographer' ? 'Photographer' : 'DJ',
        city: v.city,
        area: v.area || v.city,
        description: v.description || `Professional ${v.category} service with ${v.review_count} reviews`,
        tags: v.tags || [],
        pricing: {
          type: v.category === 'restaurant' ? 'per_plate' as const : 'range' as const,  // Fixed: was 'catering'
          perPlate: v.category === 'restaurant' ? Math.round((v.price_min + v.price_max) / 2 / event.guestCount) : undefined,
          extraCharges: v.category === 'restaurant' ? Math.round(v.price_min * 0.1) : undefined,
          minPrice: v.category !== 'restaurant' ? v.price_min : undefined,
          maxPrice: v.category !== 'restaurant' ? v.price_max : undefined,
        },
        rating: v.rating,
        reviews: v.review_count,
        experienceYears: v.experience_years || Math.floor(v.review_count / 20) + 3,
        eventsDone: v.events_done || v.review_count * 2,
        portfolio: {
          // Use actual images from database if available, otherwise use emoji
          images: v.portfolio_images && v.portfolio_images.length > 0 
            ? v.portfolio_images 
            : v.banner_image 
              ? [v.banner_image, v.banner_image, v.banner_image]
              : [v.image_emoji, v.image_emoji, v.image_emoji],
          description: v.portfolio_description || v.description || `Professional ${v.category} service in ${v.city}`,
          highlights: v.portfolio_highlights && v.portfolio_highlights.length > 0
            ? v.portfolio_highlights.map((h: string) => `✓ ${h}`)
            : v.tags.slice(0, 5).map((tag: string) => `✓ ${tag}`),
        },
        imageGradient: "from-[rgba(107,63,160,0.25)] to-[rgba(255,200,87,0.18)]",
      }));

      setRealVendors(convertedVendors);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      // Fall back to mock data on error
    } finally {
      setLoadingVendors(false);
    }
  }

  // Fetch budget allocations from API
  async function fetchBudgetAllocations() {
    try {
      const categoryMap: Record<AddOn, string> = {
        'Restaurant': 'restaurant',  // Fixed: was 'catering'
        'Cake': 'cake',
        'Decoration': 'decorator',
        'Photographer': 'photographer',
        'DJ': 'dj',
      };
      
      const categories = event.addOns.map(addOn => categoryMap[addOn]).join(',');
      
      const response = await fetch(
        `/api/budget-allocation?eventType=birthday&categories=${categories}&totalBudget=${event.budget}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const allocations = new Map<string, number>();
        
        // Fix: API returns data.allocation (object), not data.allocations (array)
        if (data.allocation) {
          Object.entries(data.allocation).forEach(([category, amount]) => {
            allocations.set(category, amount as number);
          });
        }
        
        setBudgetAllocations(allocations);
      }
    } catch (error) {
      console.error('Error fetching budget allocations:', error);
    }
  }

  function toggleAddOn(addOn: AddOn) {
    setEvent((prev) => {
      const next = prev.addOns.includes(addOn)
        ? prev.addOns.filter((a) => a !== addOn)
        : [...prev.addOns, addOn];
      return { ...prev, addOns: next };
    });
  }

  // Assign tier based on vendor rating and price
  function assignTier(vendor: MockVendor, matchScore: number): 'standard' | 'user-friendly' | 'premium' {
    const avgPrice = vendor.pricing.type === 'per_plate' && vendor.pricing.perPlate
      ? (vendor.pricing.perPlate * event.guestCount) + (vendor.pricing.extraCharges || 0)
      : vendor.pricing.type === 'range'
        ? (vendor.pricing.minPrice! + vendor.pricing.maxPrice!) / 2
        : vendor.pricing.fixedPrice!;

    // Premium: High rating (4.5+) and high price
    if (vendor.rating >= 4.5 && avgPrice >= 15000) return 'premium';
    
    // User-friendly: Good rating (4.0+) and mid-range price
    if (vendor.rating >= 4.0 && avgPrice >= 8000) return 'user-friendly';
    
    // Standard: Everything else
    return 'standard';
  }

  // Calculate price range for vendor
  function calculatePriceRange(vendor: MockVendor, allocatedBudget?: number): { min: number; max: number } {
    let basePrice = 0;
    
    if (vendor.pricing.type === 'per_plate' && vendor.pricing.perPlate) {
      basePrice = (vendor.pricing.perPlate * event.guestCount) + (vendor.pricing.extraCharges || 0);
    } else if (vendor.pricing.type === 'range') {
      basePrice = (vendor.pricing.minPrice! + vendor.pricing.maxPrice!) / 2;
    } else {
      basePrice = vendor.pricing.fixedPrice!;
    }

    // Create a range of ±3000-5000 around base price
    const spread = Math.min(5000, Math.max(3000, basePrice * 0.15));
    let min = Math.round(basePrice - spread);
    let max = Math.round(basePrice + spread);

    // Cap at allocated budget if provided
    if (allocatedBudget) {
      max = Math.min(max, allocatedBudget);
      min = Math.min(min, allocatedBudget * 0.8);
    }

    return { min: Math.max(0, min), max };
  }

  // Handle vendor selection
  function handleVendorSelect(vendor: MockVendor, tier: string, priceRange: { min: number; max: number }) {
    setSelectedVendors(prev => {
      const newMap = new Map(prev);
      const categoryKey = vendor.category.toLowerCase().replace(' ', '_');
      
      // If already selected, deselect
      if (newMap.has(categoryKey) && newMap.get(categoryKey)?.id === vendor.id) {
        newMap.delete(categoryKey);
      } else {
        // Select this vendor
        newMap.set(categoryKey, {
          id: vendor.id,
          name: vendor.name,
          category: vendor.category,
          tier,
          price_range_min: priceRange.min,
          price_range_max: priceRange.max,
        });
      }
      
      return newMap;
    });
  }

  // Handle booking creation
  async function handleBookNow() {
    if (selectedVendors.size === 0) {
      setError('Please select at least one vendor to continue');
      return;
    }

    setCreatingOrder(true);
    setError('');

    try {
      // Calculate total amount (average of min and max)
      const totalMin = Array.from(selectedVendors.values()).reduce((sum, v) => sum + v.price_range_min, 0);
      const totalMax = Array.from(selectedVendors.values()).reduce((sum, v) => sum + v.price_range_max, 0);
      const totalAmount = Math.round((totalMin + totalMax) / 2);

      // Prepare selected vendors data
      const selectedVendorsData = Array.from(selectedVendors.entries()).map(([category, vendor]) => ({
        category: category,
        vendor_id: vendor.id,
        vendor_name: vendor.name,
        tier: vendor.tier,
        price_min: vendor.price_range_min,
        price_max: vendor.price_range_max,
      }));

      // Create booking via API
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customer.name,
          customerPhone: customer.phone,
          customerEmail: customer.email || undefined,
          eventType: event.occasion,
          eventDate: partyDate,
          eventTime: '18:00', // Default time, can be made configurable
          guestCount: event.guestCount,
          city: event.city,
          venueType: event.locationType,
          selectedVendors: selectedVendorsData,
          totalAmount: totalAmount,
          advancePercentage: 30,
          specialRequests: event.specifications || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create booking');
      }

      const booking = await response.json();

      // Redirect to booking confirmation page
      window.location.href = `/booking/${booking.id}`;
    } catch (error) {
      console.error('Error creating booking:', error);
      setError('Failed to create booking. Please try again.');
    } finally {
      setCreatingOrder(false);
    }
  }

  function applyChatAnswer(answer: string) {
    setChat((prev) => [...prev, { id: makeId("u"), role: "user", text: answer }]);

    const lastAssistant = [...chat].reverse().find((m) => m.role === "assistant");
    const prompt = lastAssistant?.text ?? "";

    if (prompt.includes("age group")) {
      const val = answer as AgeGroup;
      setEvent((p) => ({ ...p, ageGroup: val }));
      setChat((prev) => [
        ...prev,
        {
          id: makeId("a"),
          role: "assistant",
          text: "Nice. What’s your budget in ₹? (Example: 15000)",
        },
      ]);
      return;
    }

    if (prompt.includes("budget in ₹")) {
      const n = Number(String(answer).replace(/[^\d]/g, ""));
      if (Number.isFinite(n) && n > 0) setEvent((p) => ({ ...p, budget: n }));
      setChat((prev) => [
        ...prev,
        {
          id: makeId("a"),
          role: "assistant",
          text: "Where will it happen?",
          quickReplies: [
            { id: "Home", label: "Home" },
            { id: "Restaurant", label: "Restaurant" },
            { id: "City", label: "City" },
          ],
        },
      ]);
      return;
    }

    if (prompt.includes("Where will it happen")) {
      const val = answer as LocationType;
      setEvent((p) => ({ ...p, locationType: val }));
      setChat((prev) => [
        ...prev,
        {
          id: makeId("a"),
          role: "assistant",
          text: "Pick a theme.",
          quickReplies: [
            { id: "Cartoon", label: "Cartoon" },
            { id: "Romantic", label: "Romantic" },
            { id: "Luxury", label: "Luxury" },
            { id: "Surprise", label: "Surprise" },
          ],
        },
      ]);
      return;
    }

    if (prompt.includes("Pick a theme")) {
      const val = answer as Theme;
      setEvent((p) => ({ ...p, theme: val }));
      setChat((prev) => [
        ...prev,
        {
          id: makeId("a"),
          role: "assistant",
          text: "Which vendors do you want?",
          quickReplies: [
            { id: "Restaurant", label: "Restaurant" },
            { id: "Cake", label: "Cake" },
            { id: "Decoration", label: "Decoration" },
            { id: "Photographer", label: "Photographer" },
            { id: "DJ", label: "DJ" },
          ],
        },
      ]);
      return;
    }

    if (prompt.includes("Which vendors")) {
      const picked = answer as AddOn;
      toggleAddOn(picked);
      setChat((prev) => [
        ...prev,
        {
          id: makeId("a"),
          role: "assistant",
          text: "Got it. You can pick more vendors, or continue to recommendations.",
          quickReplies: [
            { id: "Restaurant", label: "Restaurant" },
            { id: "Cake", label: "Cake" },
            { id: "Decoration", label: "Decoration" },
            { id: "Photographer", label: "Photographer" },
            { id: "DJ", label: "DJ" },
            { id: "Continue", label: "Continue" },
          ],
        },
      ]);
      return;
    }

    if (answer === "Continue") {
      setStep("recommendations");
      return;
    }
  }

  async function goToRecommendations() {
    setError("");
    if (!customer.name.trim() || !customer.phone.trim()) {
      setError("Please enter your name and phone number to continue.");
      return;
    }
    if (!event.budget || event.budget < 1000) {
      setError("Please enter a budget of at least ₹1,000.");
      return;
    }
    if (!event.guestCount || event.guestCount < 1) {
      setError("Please enter an estimated guest count.");
      return;
    }
    if (!partyDate) {
      setError("Please select the date of your party.");
      return;
    }

    // Save request to database
    await saveRequestToDatabase();

    // Show confirmation message
    setStep("confirmation");
  }

  async function saveRequestToDatabase() {
    try {
      const requestData = {
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email || undefined,
        occasion: event.occasion,
        ageGroup: event.ageGroup,
        budget: event.budget,
        guestCount: event.guestCount,
        locationType: event.locationType,
        city: event.city,
        theme: event.theme,
        addOns: event.addOns,
        partyDate: partyDate,
        specifications: event.specifications || undefined,
        status: "pending" as const,
      };

      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const result = await response.json();
        // Show message if request was updated
        if (result.message && result.message.includes("updated")) {
          console.log("Request updated for existing customer");
        }
        
        // Create vendor suggestion for admin review
        await createVendorSuggestion(result.id);
      } else {
        console.error("Failed to save request to database");
      }
    } catch (error) {
      console.error("Error saving request:", error);
    }
  }

  async function createVendorSuggestion(requestId: string) {
    try {
      const suggestionData = {
        requestId: requestId,
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email || undefined,
        occasion: event.occasion,
        ageGroup: event.ageGroup,
        budget: event.budget,
        guestCount: event.guestCount,
        locationType: event.locationType,
        city: event.city,
        theme: event.theme,
        addOns: event.addOns,
        specifications: event.specifications || undefined,
        packageType: "essential",
      };

      const response = await fetch("/api/vendor-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(suggestionData),
      });

      if (response.ok) {
        console.log("✅ Vendor suggestion created successfully");
      } else {
        const errorData = await response.json();
        console.error("❌ Failed to create vendor suggestion:", errorData);
        
        // Check if it's a table missing error
        if (errorData.error && errorData.error.includes("initial_price")) {
          console.error("⚠️ DATABASE SETUP REQUIRED:");
          console.error("The vendor_suggestions table doesn't exist in your database.");
          console.error("\n📋 TO FIX:");
          console.error("1. Open Supabase Dashboard (https://supabase.com)");
          console.error("2. Go to SQL Editor");
          console.error("3. Copy and run the SQL from: COMPLETE_DATABASE_SETUP.sql");
          console.error("\n📖 See FIX_500_ERROR.md for detailed instructions");
          
          // Show user-friendly alert
          alert(
            "⚠️ Database Setup Required\n\n" +
            "Your request was saved, but vendor suggestions couldn't be created.\n\n" +
            "Admin: Please run COMPLETE_DATABASE_SETUP.sql in Supabase.\n" +
            "See FIX_500_ERROR.md for instructions."
          );
        }
      }
    } catch (error) {
      console.error("Error creating vendor suggestion:", error);
      // Don't block the user flow - request is already saved
    }
  }

  function calculateVendorPrice(vendor: MockVendor): { display: string; total: number } {
    if (vendor.pricing.type === "per_plate" && vendor.pricing.perPlate) {
      const plateTotal = vendor.pricing.perPlate * event.guestCount;
      const total = plateTotal + (vendor.pricing.extraCharges || 0);
      return {
        display: `₹${inr(vendor.pricing.perPlate)}/plate × ${event.guestCount} guests`,
        total
      };
    } else if (vendor.pricing.type === "range") {
      return {
        display: `₹${inr(vendor.pricing.minPrice!)} - ₹${inr(vendor.pricing.maxPrice!)}`,
        total: (vendor.pricing.minPrice! + vendor.pricing.maxPrice!) / 2
      };
    } else {
      return {
        display: `₹${inr(vendor.pricing.fixedPrice!)}`,
        total: vendor.pricing.fixedPrice!
      };
    }
  }

  function toggleInterestedVendor(vendorId: string) {
    setInterestedVendors(prev => {
      const newSet = new Set(prev);
      if (newSet.has(vendorId)) {
        newSet.delete(vendorId);
      } else {
        newSet.add(vendorId);
      }
      return newSet;
    });
  }

  function toggleLineItem(key: LineItemKey) {
    setCustomLineItems((prev) => {
      const exists = prev.some((i) => i.key === key);
      if (exists) {
        const item = prev.find((i) => i.key === key);
        if (item && item.removable === false) return prev;
        return prev.filter((i) => i.key !== key);
      }

      // Add sensible defaults based on event details
      if (key === "restaurant") {
        const restaurantVendors = vendorsByCategory.get("Restaurant") ?? [];
        const defaultVendor = restaurantVendors[0];
        let price = 32000;
        if (defaultVendor) {
          if (defaultVendor.pricing.type === "per_plate" && defaultVendor.pricing.perPlate) {
            price = (defaultVendor.pricing.perPlate * event.guestCount) + (defaultVendor.pricing.extraCharges || 0);
          } else if (defaultVendor.pricing.type === "range") {
            price = Math.round((defaultVendor.pricing.minPrice! + defaultVendor.pricing.maxPrice!) / 2);
          } else {
            price = defaultVendor.pricing.fixedPrice!;
          }
        }
        
        return [
          ...prev,
          {
            key: "restaurant",
            title: defaultVendor ? `${defaultVendor.name} (venue booking)` : "Restaurant venue booking",
            description: `${event.city} • for ~${event.guestCount} guests`,
            amount: price,
            removable: true,
            category: "core",
          },
        ];
      }
      if (key === "cake") {
        const cakeVendors = vendorsByCategory.get("Cake Artist") ?? [];
        const defaultVendor = cakeVendors[0];
        const basePrice = event.ageGroup === "Kids" ? 2400 : 2800;
        let price = basePrice;
        if (defaultVendor) {
          if (defaultVendor.pricing.type === "fixed") {
            price = defaultVendor.pricing.fixedPrice!;
          } else if (defaultVendor.pricing.type === "range") {
            price = Math.round((defaultVendor.pricing.minPrice! + defaultVendor.pricing.maxPrice!) / 2);
          }
        }
        
        return [
          ...prev,
          {
            key: "cake",
            title: defaultVendor ? `${defaultVendor.name} (custom cake)` : "Custom cake (1.5–2 lb)",
            description: `${event.theme}-matched design`,
            amount: price,
            removable: true,
            category: "core",
          },
        ];
      }
      if (key === "decoration") {
        const decoratorVendors = vendorsByCategory.get("Decorator") ?? [];
        const defaultVendor = decoratorVendors[0];
        const baseDecor = event.theme === "Luxury" ? 12000 : event.theme === "Romantic" ? 8000 : 6500;
        let price = baseDecor;
        if (defaultVendor) {
          if (defaultVendor.pricing.type === "range") {
            price = Math.round((defaultVendor.pricing.minPrice! + defaultVendor.pricing.maxPrice!) / 2);
          } else if (defaultVendor.pricing.type === "fixed") {
            price = defaultVendor.pricing.fixedPrice!;
          }
        }
        
        return [
          ...prev,
          {
            key: "decoration",
            title: defaultVendor ? `${defaultVendor.name} (${event.theme} decor)` : `${event.theme} decoration`,
            description: `${event.city} • ${event.theme} theme`,
            amount: price,
            removable: true,
            category: "core",
          },
        ];
      }
      if (key === "photographer") {
        const photographerVendors = vendorsByCategory.get("Photographer") ?? [];
        const defaultVendor = photographerVendors[0];
        let price = 6500;
        if (defaultVendor && defaultVendor.pricing.type === "fixed") {
          price = defaultVendor.pricing.fixedPrice!;
        }
        
        return [
          ...prev,
          {
            key: "photographer",
            title: defaultVendor ? `${defaultVendor.name} (2 hours)` : "Photographer (2 hours)",
            description: defaultVendor ? `${defaultVendor.reviews} reviews • rating ${defaultVendor.rating}` : "40–60 edited photos",
            amount: price,
            removable: true,
            category: "addon",
          },
        ];
      }
      if (key === "dj") {
        const djVendors = vendorsByCategory.get("DJ") ?? [];
        const defaultVendor = djVendors[0];
        let price = 6500;
        if (defaultVendor && defaultVendor.pricing.type === "fixed") {
          price = defaultVendor.pricing.fixedPrice!;
        }
        
        return [
          ...prev,
          {
            key: "dj",
            title: defaultVendor ? `${defaultVendor.name} (DJ set)` : "DJ & music (2 hours)",
            description: defaultVendor ? `${defaultVendor.experienceYears}y exp` : "Speaker + mic + playlists",
            amount: price,
            removable: true,
            category: "addon",
          },
        ];
      }
      if (key === "surprise") {
        return [
          ...prev,
          {
            key: "surprise",
            title: "Surprise add-on",
            description: "Entry reveal + confetti moment",
            amount: event.theme === "Surprise" ? 2200 : 1600,
            removable: true,
            category: "addon",
          },
        ];
      }
      if (key === "delivery") {
        // Using "delivery" key for entertainment option
        return [
          ...prev,
          {
            key: "delivery",
            title: "Entertainment package",
            description: "Games, activities & host",
            amount: event.ageGroup === "Kids" ? 4500 : 5500,
            removable: true,
            category: "addon",
          },
        ];
      }
      return prev;
    });
  }

  function upgradeCake(multiplier: number, label: string) {
    setCustomLineItems((prev) =>
      prev.map((i) => {
        if (i.key !== "cake") return i;
        const base = event.ageGroup === "Kids" ? 2400 : 2800;
        return {
          ...i,
          title: `Custom cake (${label})`,
          amount: Math.round(base * multiplier),
        };
      })
    );
  }

  function ensureSchedule() {
    setError("");
    if (!date) {
      setError("Please select a date to see available slots.");
      return false;
    }
    const nextSlots = buildSlots(date);
    setSlots(nextSlots);
    const firstAvail = nextSlots.find((s) => s.available);
    setSelectedSlotId(firstAvail?.id ?? nextSlots[0]?.id ?? "");
    return true;
  }

  async function confirmPayment() {
    setError("");
    if (!selectedSlot) {
      setError("Please pick a slot.");
      return;
    }
    setCreatingOrder(true);
    try {
      // demo latency
      await new Promise((r) => setTimeout(r, 800));
      const paidNow = paymentChoice === "full" ? total : Math.max(0, Math.round(total * 0.3));
      const dueLater = Math.max(0, total - paidNow);
      const nextOrder: Order = {
        id: `ORD-${Math.random().toString(16).slice(2, 8).toUpperCase()}`,
        createdAt: new Date().toISOString(),
        customer,
        event,
        selectedPackageId,
        customLineItems,
        total,
        slot: selectedSlot,
        payment: { choice: paymentChoice, paidNow, dueLater },
        status: "Booked",
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextOrder));
      setOrder(nextOrder);
      setStep("dashboard");
    } catch {
      setError("Payment failed. Please try again.");
    } finally {
      setCreatingOrder(false);
    }
  }

  function resetPlanner() {
    localStorage.removeItem(STORAGE_KEY);
    setOrder(null);
    setStep("requirements");
  }

  const stepDefs = useMemo(
    () =>
      [
        { id: "requirements", label: "Requirements", hint: "Answer a few questions" },
        { id: "confirmation", label: "Packages", hint: "AI suggestions" },
        { id: "payment", label: "Payment", hint: "Confirm booking" },
        { id: "dashboard", label: "Dashboard", hint: "Track status" },
      ] as const,
    []
  );

  const activeStepIndex = useMemo(() => {
    const idx = stepDefs.findIndex((s) => s.id === step);
    return idx < 0 ? 0 : idx;
  }, [step, stepDefs]);

  const stepProgress = useMemo(() => {
    if (stepDefs.length <= 1) return 0;
    return Math.round((activeStepIndex / (stepDefs.length - 1)) * 100);
  }, [activeStepIndex, stepDefs.length]);

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden bg-white border border-[var(--border)] rounded-[28px] p-5 sm:p-6 shadow-[0_10px_40px_rgba(26,15,46,0.10)]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[rgba(107,63,160,0.10)] blur-2xl" />
          <div className="absolute -bottom-28 -left-28 w-72 h-72 rounded-full bg-[rgba(255,200,87,0.14)] blur-2xl" />
        </div>

        <div className="relative flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2">
                <span className="text-xs font-medium tracking-widest uppercase text-[var(--text-muted)]">
                  Party planner
                </span>
                <span className="text-[0.7rem] px-2 py-1 rounded-full bg-[rgba(107,63,160,0.08)] text-[var(--purple)]">
                  {stepDefs[activeStepIndex]?.label}
                </span>
              </div>
              <div className="font-playfair font-bold text-[clamp(1.25rem,2.6vw,1.75rem)] leading-tight mt-2">
                Birthday planning, end-to-end
              </div>
              <div className="text-sm text-[var(--text-muted)] mt-1.5">
                From requirements → packages → booking → dashboard, with live price clarity.
              </div>
            </div>

            {/* Mode switcher */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMode("form")}
                className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                  mode === "form"
                    ? "bg-[var(--deep)] text-white border-[var(--deep)] shadow-[0_10px_24px_rgba(26,15,46,0.18)]"
                    : "bg-white border-[var(--border)] hover:border-[rgba(107,63,160,0.45)]"
                }`}
              >
                Smart form
              </button>
              <button
                type="button"
                disabled
                className="px-4 py-2 rounded-full text-sm border bg-white border-[var(--border)] text-[var(--text-muted)] opacity-50 cursor-not-allowed"
              >
                AI chat
              </button>
            </div>
          </div>

          {/* Step navigation */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {stepDefs.map((s, idx) => {
              const active = step === s.id;
              const done = idx < activeStepIndex;
              const isRequirements = s.id === "requirements";
              const isConfirmation = s.id === "confirmation";
              const isClickable = isRequirements || (isConfirmation && step === "confirmation");
              
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => isClickable && setStep(s.id)}
                  disabled={!isClickable}
                  className={`text-left rounded-2xl border px-3 py-3 transition-all ${
                    active
                      ? "bg-[rgba(107,63,160,0.10)] border-[rgba(107,63,160,0.30)]"
                      : done
                        ? "bg-white border-[rgba(29,158,117,0.25)] hover:border-[rgba(29,158,117,0.45)]"
                        : "bg-white border-[var(--border)]"
                  } ${!isClickable ? "opacity-50 cursor-not-allowed" : "hover:border-[rgba(107,63,160,0.30)]"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs font-medium">{s.label}</div>
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        active ? "bg-[var(--purple)]" : done ? "bg-[#1D9E75]" : "bg-[rgba(26,15,46,0.18)]"
                      }`}
                    />
                  </div>
                  <div className="text-[0.7rem] text-[var(--text-muted)] mt-1">{s.hint}</div>
                </button>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-[rgba(26,15,46,0.06)] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--purple)] via-[rgba(107,63,160,0.75)] to-[var(--gold)] transition-all"
                style={{ width: `${stepProgress}%` }}
              />
            </div>
            <div className="text-xs text-[var(--text-muted)] w-[52px] text-right">{stepProgress}%</div>
          </div>
        </div>
      </div>

      {/* Requirements */}
      {step === "requirements" && (
        <div className="bg-white border border-[var(--border)] rounded-[24px] p-6 shadow-[0_4px_24px_rgba(26,15,46,0.06)]">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="sm:col-span-1">
              <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest block mb-2">
                Your name
              </label>
              <input
                value={customer.name}
                onChange={(e) => setCustomer((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Nil"
                className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm outline-none focus:border-[var(--purple)] transition-colors"
              />
            </div>
            <div className="sm:col-span-1">
              <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest block mb-2">
                Phone / WhatsApp
              </label>
              <input
                value={customer.phone}
                onChange={(e) => setCustomer((p) => ({ ...p, phone: e.target.value }))}
                placeholder="e.g. +91 98xxxxxx"
                inputMode="tel"
                className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm outline-none focus:border-[var(--purple)] transition-colors"
              />
            </div>
            <div className="sm:col-span-1">
              <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest block mb-2">
                Email (optional)
              </label>
              <input
                value={customer.email ?? ""}
                onChange={(e) => setCustomer((p) => ({ ...p, email: e.target.value }))}
                placeholder="e.g. you@email.com"
                inputMode="email"
                className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm outline-none focus:border-[var(--purple)] transition-colors"
              />
            </div>
          </div>

          {mode === "chat" ? (
            <div>
              <div className="h-[380px] overflow-auto bg-[linear-gradient(180deg,rgba(255,255,255,0.6),rgba(255,255,255,0.0))] border border-[var(--border)] rounded-[24px] p-4 sm:p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                <div className="space-y-3">
                  {chat.map((m) => (
                    <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[88%] rounded-[22px] px-4 py-3 text-sm leading-[1.65] shadow-[0_10px_24px_rgba(26,15,46,0.06)] ${
                          m.role === "user"
                            ? "bg-[linear-gradient(180deg,rgba(26,15,46,0.96),rgba(26,15,46,0.88))] text-white"
                            : "bg-white/95 border border-[rgba(26,15,46,0.10)] backdrop-blur"
                        }`}
                      >
                        {m.text}
                        {m.quickReplies && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {m.quickReplies.map((q) => (
                              <button
                                type="button"
                                key={q.id}
                                onClick={() => applyChatAnswer(q.id)}
                                className="text-xs px-3 py-1.5 rounded-full bg-[rgba(107,63,160,0.10)] text-[var(--purple)] hover:bg-[rgba(107,63,160,0.16)] transition-colors"
                              >
                                {q.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <input
                  value={chatDraft}
                  onChange={(e) => setChatDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const msg = chatDraft.trim();
                      if (!msg) return;
                      setChatDraft("");
                      applyChatAnswer(msg);
                    }
                  }}
                  placeholder="Type your answer… (e.g. 15000)"
                  className="flex-1 bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm outline-none focus:border-[var(--purple)] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => {
                    const msg = chatDraft.trim();
                    if (!msg) return;
                    setChatDraft("");
                    applyChatAnswer(msg);
                  }}
                  className="px-5 py-3 rounded-xl bg-[var(--deep)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Send
                </button>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <div className="text-sm text-[var(--text-muted)]">
                  Your answers update the planner form automatically.
                </div>
                <button
                  type="button"
                  onClick={goToRecommendations}
                  className="px-6 py-3 rounded-full bg-[var(--purple)] text-white font-medium text-sm hover:bg-[var(--purple-light)] transition-colors"
                >
                  Continue to recommendations
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest block mb-2">
                  Occasion
                </label>
                <div className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm">
                  Birthday
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest block mb-2">
                  Age group
                </label>
                <select
                  value={event.ageGroup}
                  onChange={(e) => setEvent((p) => ({ ...p, ageGroup: e.target.value as AgeGroup }))}
                  className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm outline-none focus:border-[var(--purple)] transition-colors"
                >
                  <option value="Kids">Kids</option>
                  <option value="Teen">Teen</option>
                  <option value="Adult">Adult</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest block mb-2">
                  Budget (₹)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={event.budget}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d]/g, '');
                    const numValue = value ? Number(value) : 0;
                    setEvent((p) => ({ ...p, budget: numValue }));
                  }}
                  placeholder="e.g. 15000"
                  className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm outline-none focus:border-[var(--purple)] transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest block mb-2">
                  Estimated guests
                </label>
                <input
                  type="number"
                  min={1}
                  value={event.guestCount}
                  onChange={(e) => setEvent((p) => ({ ...p, guestCount: Number(e.target.value) }))}
                  placeholder="e.g. 30"
                  className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm outline-none focus:border-[var(--purple)] transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest block mb-2">
                  Location
                </label>
                <select
                  value={event.locationType}
                  onChange={(e) => setEvent((p) => ({ ...p, locationType: e.target.value as LocationType }))}
                  className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm outline-none focus:border-[var(--purple)] transition-colors"
                >
                  <option value="Home">Home</option>
                  <option value="Restaurant">Restaurant</option>
                  <option value="City">City</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest block mb-2">
                  City
                </label>
                <select
                  value={event.city}
                  onChange={(e) => setEvent((p) => ({ ...p, city: e.target.value }))}
                  className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm outline-none focus:border-[var(--purple)] transition-colors"
                >
                  <option value="Dehradun">Dehradun</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest block mb-2">
                  Party Date
                </label>
                <input
                  type="date"
                  value={partyDate}
                  onChange={(e) => setPartyDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm outline-none focus:border-[var(--purple)] transition-colors"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest block mb-2">
                  Theme
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(["Cartoon", "Romantic", "Luxury", "Surprise"] as Theme[]).map((t) => {
                    const active = event.theme === t;
                    return (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setEvent((p) => ({ ...p, theme: t }))}
                        className={`px-4 py-3 rounded-2xl border text-sm font-medium transition-colors ${
                          active
                            ? "bg-[rgba(107,63,160,0.10)] border-[rgba(107,63,160,0.30)] text-[var(--purple)]"
                            : "bg-white border-[var(--border)] hover:border-[rgba(107,63,160,0.35)]"
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest block mb-2">
                  Vendors
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(["Restaurant", "Cake", "Decoration", "Photographer", "DJ"] as AddOn[]).map((a) => {
                    const active = event.addOns.includes(a);
                    return (
                      <button
                        type="button"
                        key={a}
                        onClick={() => toggleAddOn(a)}
                        className={`px-4 py-3 rounded-2xl border text-sm font-medium transition-colors ${
                          active
                            ? "bg-[rgba(255,200,87,0.20)] border-[rgba(255,200,87,0.55)] text-[var(--deep)]"
                            : "bg-white border-[var(--border)] hover:border-[rgba(255,200,87,0.65)]"
                        }`}
                      >
                        {a}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest block mb-2">
                  Any special requirements or specifications?
                </label>
                <textarea
                  value={event.specifications ?? ""}
                  onChange={(e) => setEvent((p) => ({ ...p, specifications: e.target.value }))}
                  placeholder="e.g. Need vegetarian menu, outdoor seating preferred, specific color theme..."
                  rows={3}
                  className="w-full bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm outline-none focus:border-[var(--purple)] transition-colors resize-none"
                />
              </div>
            </div>
          )}

          {error && <p className="text-[var(--coral)] text-sm mt-4">{error}</p>}

          <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="text-sm text-[var(--text-muted)]">
              Budget reference: ₹{inr(budgetRange.min)}–₹{inr(budgetRange.max)}
            </div>
            <button
              type="button"
              onClick={goToRecommendations}
              className="px-6 py-3 rounded-full bg-[var(--purple)] text-white font-medium text-sm hover:bg-[var(--purple-light)] transition-colors"
            >
              Get AI recommendations
            </button>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {step === "confirmation" && (
        <div className="bg-white border border-[var(--border)] rounded-[24px] p-8 shadow-[0_4px_24px_rgba(26,15,46,0.06)] text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[var(--purple)] to-[var(--gold)] flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Message */}
          <h2 className="font-playfair font-bold text-3xl text-[var(--deep)] mb-4">
            Thank You, {customer.name}!
          </h2>
          <p className="text-lg text-[var(--text-muted)] mb-6 max-w-md mx-auto leading-relaxed">
            We've received your party planning request. Our team will review your requirements and send you personalized vendor recommendations and a complete plan by today.
          </p>

          {/* Details Summary */}
          <div className="bg-[var(--cream)] rounded-2xl p-6 mb-6 max-w-md mx-auto">
            <div className="space-y-3 text-left">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--text-muted)]">Budget</span>
                <span className="font-semibold text-[var(--deep)]">₹{inr(event.budget)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--text-muted)]">Guests</span>
                <span className="font-semibold text-[var(--deep)]">{event.guestCount} people</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--text-muted)]">Date</span>
                <span className="font-semibold text-[var(--deep)]">{partyDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--text-muted)]">Theme</span>
                <span className="font-semibold text-[var(--deep)]">{event.theme}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--text-muted)]">Contact</span>
                <span className="font-semibold text-[var(--deep)]">{customer.phone}</span>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-gradient-to-br from-[rgba(107,63,160,0.08)] to-[rgba(232,168,48,0.08)] rounded-2xl p-6 mb-6 max-w-md mx-auto">
            <h3 className="font-bold text-lg text-[var(--deep)] mb-4">What Happens Next?</h3>
            <div className="space-y-3 text-left">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--purple)] text-white flex items-center justify-center text-xs font-bold">1</div>
                <div>
                  <div className="font-medium text-sm text-[var(--deep)]">AI Matching</div>
                  <div className="text-xs text-[var(--text-muted)]">Our AI finds the best vendors for your requirements</div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--purple)] text-white flex items-center justify-center text-xs font-bold">2</div>
                <div>
                  <div className="font-medium text-sm text-[var(--deep)]">Team Review</div>
                  <div className="text-xs text-[var(--text-muted)]">Our experts verify and finalize recommendations</div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--purple)] text-white flex items-center justify-center text-xs font-bold">3</div>
                <div>
                  <div className="font-medium text-sm text-[var(--deep)]">You Receive Plan</div>
                  <div className="text-xs text-[var(--text-muted)]">Get your complete party plan via WhatsApp/Email by today</div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="text-sm text-[var(--text-muted)] mb-6">
            <p>We'll contact you at <span className="font-semibold text-[var(--deep)]">{customer.phone}</span></p>
            {customer.email && <p>and send details to <span className="font-semibold text-[var(--deep)]">{customer.email}</span></p>}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/"
              className="px-8 py-3 rounded-full bg-[var(--purple)] text-white font-medium hover:bg-[var(--purple-light)] transition-colors"
            >
              Back to Home
            </a>
            <a
              href={`https://wa.me/919876543210?text=Hi, I just submitted a party planning request for ${customer.name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 rounded-full border border-[var(--border)] text-[var(--deep)] font-medium hover:border-[var(--purple)] transition-colors"
            >
              💬 Chat on WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* Recommendations - Hidden for now */}
      {step === "recommendations" && (
        <div className="space-y-4">
          <div className="bg-white border border-[var(--border)] rounded-[24px] p-6 shadow-[0_4px_24px_rgba(26,15,46,0.06)]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="font-playfair font-bold text-2xl">Recommended packages</div>
                <div className="text-sm text-[var(--text-muted)] mt-1">
                  Based on your ₹{inr(event.budget)} budget, ~{event.guestCount} guests, {event.locationType.toLowerCase()} setup, and {event.theme} vibe.
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Show only the best/recommended package */}
            {packages.filter(p => p.recommended).slice(0, 1).map((p) => {
              const selected = selectedPackageId === p.id;
              const pTotal = sumLineItems(p.lineItems);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setSelectedPackageId(p.id);
                    setCustomLineItems(p.lineItems);
                  }}
                  className={`relative text-left bg-white border rounded-[26px] p-6 transition-all ${
                    selected
                      ? "border-[rgba(107,63,160,0.55)] ring-2 ring-[rgba(107,63,160,0.18)] shadow-[0_18px_50px_rgba(26,15,46,0.14)]"
                      : "border-[var(--border)] shadow-[0_6px_28px_rgba(26,15,46,0.07)] hover:border-[rgba(107,63,160,0.35)] hover:shadow-[0_18px_50px_rgba(26,15,46,0.12)]"
                  }`}
                >
                  {selected && (
                    <div className="absolute -top-3 -right-3">
                      <div className="px-3 py-1.5 rounded-full bg-[var(--deep)] text-white text-xs font-medium shadow-[0_14px_26px_rgba(26,15,46,0.18)]">
                        Selected
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${p.preview.gradient} border border-[rgba(107,63,160,0.18)]`}
                      >
                        <span className="text-2xl">{p.preview.emoji}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="font-playfair font-bold text-xl">{p.name}</div>
                          {p.recommended && (
                            <span className="text-[0.7rem] px-2 py-0.5 rounded-full bg-[rgba(29,158,117,0.12)] text-[#1D9E75] font-medium">
                              Recommended
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {p.why.slice(0, 3).map((w) => (
                            <span
                              key={w}
                              className="text-[0.7rem] px-2 py-1 rounded-full bg-[rgba(107,63,160,0.08)] text-[var(--purple)]"
                            >
                              {w}
                            </span>
                          ))}
                        </div>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {p.deliverables.slice(0, 4).map((d) => (
                            <div key={d} className="text-sm text-[var(--text-muted)]">
                              • {d}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="sm:text-right flex-shrink-0">
                      <div className="text-xs uppercase tracking-widest text-[var(--text-muted)]">Total</div>
                      <div className="font-playfair font-bold text-2xl text-[var(--purple)] mt-1">₹{inr(pTotal)}</div>
                      <div className="text-xs text-[var(--text-muted)] mt-1">Transparent breakdown inside</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="bg-white border border-[var(--border)] rounded-[24px] p-5 shadow-[0_6px_26px_rgba(26,15,46,0.08)]">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="font-semibold text-lg">🎯 AI-Matched Vendors</div>
              <div className="text-xs text-[var(--text-muted)]">Select one vendor per category</div>
            </div>

            {mockVendors.length === 0 && (
              <div className="text-sm text-[var(--text-muted)] bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-3 mb-4">
                Select vendor types in Requirements to see vendor cards here.
              </div>
            )}

            {Array.from(vendorsByCategory.entries()).map(([category, vendors]) => {
              const categoryKey = category.toLowerCase().replace(' ', '_');
              const allocatedBudget = budgetAllocations.get(categoryKey) || 0;
              
              return (
                <div key={category} className="mb-8 last:mb-0">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-playfair font-bold text-xl text-[var(--deep)]">{category}</h3>
                      <p className="text-sm text-[var(--text-muted)] mt-0.5">
                        Top {vendors.length} matches • Budget allocated: ₹{inr(allocatedBudget)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vendors.map((vendor) => {
                      const tier = assignTier(vendor, vendor.rating * 2);
                      const priceRange = calculatePriceRange(vendor, allocatedBudget);
                      const isSelected = selectedVendors.get(categoryKey)?.id === vendor.id;
                      
                      // Convert MockVendor to VendorTierCard format
                      const tierVendor = {
                        id: vendor.id,
                        name: vendor.name,
                        display_tier: tier,
                        category: categoryKey,
                        rating: vendor.rating,
                        review_count: vendor.reviews,
                        price_range_min: priceRange.min,
                        price_range_max: priceRange.max,
                        banner_image: vendor.portfolio.images[0]?.startsWith('http') ? vendor.portfolio.images[0] : null,
                        image_emoji: vendor.portfolio.images[0]?.startsWith('http') ? '🎉' : vendor.portfolio.images[0],
                        portfolio_description: vendor.portfolio.description,
                        portfolio_highlights: vendor.portfolio.highlights,
                        experience_years: vendor.experienceYears,
                        events_done: vendor.eventsDone,
                      };
                      
                      return (
                        <VendorTierCard
                          key={vendor.id}
                          vendor={tierVendor}
                          onSelect={() => handleVendorSelect(vendor, tier, priceRange)}
                          isSelected={isSelected}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total Cost Summary - Show if vendors are selected */}
          {selectedVendors.size > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <div className="bg-gradient-to-br from-[rgba(107,63,160,0.08)] to-[rgba(255,200,87,0.08)] border border-[var(--border)] rounded-[24px] p-6">
                  <h3 className="font-playfair font-bold text-2xl mb-4">Your Selected Vendors</h3>
                  <div className="space-y-3">
                    {Array.from(selectedVendors.entries()).map(([category, vendor]) => (
                      <div key={category} className="bg-white rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <div className="font-medium text-[var(--deep)]">{vendor.category}</div>
                          <div className="text-xs text-[var(--text-muted)] mt-0.5">
                            {vendor.tier} tier • {vendor.name.toLowerCase()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-[var(--purple)]">
                            ₹{inr(vendor.price_range_min)} - ₹{inr(vendor.price_range_max)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-1">
                <TotalCostSummary
                  categoryCosts={Array.from(selectedVendors.entries()).map(([category, vendor]) => ({
                    category: category,
                    categoryLabel: vendor.category,
                    priceMin: vendor.price_range_min,
                    priceMax: vendor.price_range_max,
                    vendorName: vendor.name,
                    tier: vendor.tier,
                  }))}
                  advancePercentage={30}
                />
              </div>
            </div>
          )}

          <div className="bg-[var(--deep)] text-white rounded-[24px] px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="text-sm text-[rgba(255,255,255,0.55)]">
                {selectedVendors.size > 0 ? 'Selected vendors total' : 'Package total'}
              </div>
              <div className="font-playfair font-bold text-3xl">
                {selectedVendors.size > 0 
                  ? `₹${inr(Array.from(selectedVendors.values()).reduce((sum, v) => sum + v.price_range_min, 0))} - ₹${inr(Array.from(selectedVendors.values()).reduce((sum, v) => sum + v.price_range_max, 0))}`
                  : `₹${inr(total)}`
                }
              </div>
              <div className="text-sm text-[rgba(255,255,255,0.55)] mt-1">
                {selectedVendors.size > 0 
                  ? `30% advance: ₹${inr(Math.round(Array.from(selectedVendors.values()).reduce((sum, v) => sum + v.price_range_min, 0) * 0.3))} - ₹${inr(Math.round(Array.from(selectedVendors.values()).reduce((sum, v) => sum + v.price_range_max, 0) * 0.3))}`
                  : `Budget reference: ₹${inr(budgetRange.min)}–₹${inr(budgetRange.max)}`
                }
              </div>
            </div>
            <div className="flex gap-3">
              {selectedVendors.size > 0 ? (
                <button
                  type="button"
                  onClick={handleBookNow}
                  disabled={creatingOrder}
                  className="px-6 py-3 rounded-full bg-[var(--gold)] text-[var(--deep)] font-medium text-sm hover:bg-[var(--gold-light)] transition-colors disabled:opacity-50"
                >
                  {creatingOrder ? 'Creating booking...' : 'Book Now'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setStep("payment")}
                  className="px-6 py-3 rounded-full bg-[var(--gold)] text-[var(--deep)] font-medium text-sm hover:bg-[var(--gold-light)] transition-colors"
                >
                  Continue to payment
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment */}
      {step === "payment" && (
        <div className="bg-white border border-[var(--border)] rounded-[24px] p-6 shadow-[0_4px_24px_rgba(26,15,46,0.06)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="font-playfair font-bold text-2xl">Payment</div>
              <div className="text-sm text-[var(--text-muted)] mt-1">Instant confirmation (mock payment in this MVP).</div>
            </div>
            <button
              type="button"
              onClick={() => setStep("dashboard")}
              className="px-5 py-2.5 rounded-full border border-[var(--border)] text-sm font-medium hover:border-[rgba(107,63,160,0.35)] transition-colors"
            >
              View dashboard
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-[var(--cream)] border border-[var(--border)] rounded-[20px] p-5">
              <div className="text-xs font-medium tracking-widest uppercase text-[var(--text-muted)] mb-3">
                Choose payment option
              </div>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setPaymentChoice("advance")}
                  className={`w-full text-left rounded-2xl border px-4 py-4 transition-colors ${
                    paymentChoice === "advance"
                      ? "bg-white border-[rgba(107,63,160,0.35)]"
                      : "bg-white/70 border-[var(--border)] hover:border-[rgba(107,63,160,0.25)]"
                  }`}
                >
                  <div className="font-medium">Partial payment (advance)</div>
                  <div className="text-sm text-[var(--text-muted)] mt-1">Pay 30% now to lock the slot.</div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentChoice("full")}
                  className={`w-full text-left rounded-2xl border px-4 py-4 transition-colors ${
                    paymentChoice === "full"
                      ? "bg-white border-[rgba(107,63,160,0.35)]"
                      : "bg-white/70 border-[var(--border)] hover:border-[rgba(107,63,160,0.25)]"
                  }`}
                >
                  <div className="font-medium">Full payment</div>
                  <div className="text-sm text-[var(--text-muted)] mt-1">Pay now and we start vendor confirmations.</div>
                </button>
              </div>

              <div className="mt-5 rounded-2xl bg-white border border-[var(--border)] p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Total</span>
                  <span className="font-semibold">₹{inr(total)}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-[var(--text-muted)]">Pay now</span>
                  <span className="font-semibold">
                    ₹{inr(paymentChoice === "full" ? total : Math.max(0, Math.round(total * 0.3)))}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-[var(--text-muted)]">Due later</span>
                  <span className="font-semibold">
                    ₹{inr(paymentChoice === "full" ? 0 : Math.max(0, total - Math.round(total * 0.3)))}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[var(--border)] rounded-[20px] p-5">
              <div className="text-xs font-medium tracking-widest uppercase text-[var(--text-muted)]">
                Confirm & pay
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Slot</span>
                  <span className="font-medium">{selectedSlot ? `${selectedSlot.date} · ${selectedSlot.time}` : "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Package</span>
                  <span className="font-medium">{selectedPackage?.name ?? "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">City</span>
                  <span className="font-medium">{event.city}</span>
                </div>
              </div>

              {error && <p className="text-[var(--coral)] text-sm mt-4">{error}</p>}

              <button
                type="button"
                disabled={creatingOrder}
                onClick={confirmPayment}
                className="mt-5 w-full px-6 py-3.5 rounded-full bg-[var(--purple)] text-white font-medium text-sm hover:bg-[var(--purple-light)] transition-colors disabled:opacity-60"
              >
                {creatingOrder ? "Confirming…" : "Pay & confirm"}
              </button>

              <div className="mt-4 text-xs text-[var(--text-muted)] leading-[1.6]">
                EMI option can be added later. For now, this flow creates an instant confirmation and opens your dashboard.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard */}
      {step === "dashboard" && (
        <div className="bg-white border border-[var(--border)] rounded-[24px] p-6 shadow-[0_4px_24px_rgba(26,15,46,0.06)]">
          {!order ? (
            <div>
              <div className="font-playfair font-bold text-2xl">No booking yet</div>
              <div className="text-sm text-[var(--text-muted)] mt-1">
                Complete the payment step to generate an order dashboard.
              </div>
              <button
                type="button"
                onClick={() => setStep("requirements")}
                className="mt-5 px-6 py-3 rounded-full bg-[var(--purple)] text-white font-medium text-sm hover:bg-[var(--purple-light)] transition-colors"
              >
                Start planning
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="text-xs font-medium tracking-widest uppercase text-[var(--text-muted)]">Order</div>
                  <div className="font-playfair font-bold text-2xl mt-1">{order.id}</div>
                  <div className="text-sm text-[var(--text-muted)] mt-1">
                    {order.slot.date} · {order.slot.time} · {order.event.locationType} · {order.event.city}
                  </div>
                  <div className="text-sm text-[var(--text-muted)] mt-1">Estimated guests: ~{order.event.guestCount}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={resetPlanner}
                    className="px-5 py-2.5 rounded-full border border-[var(--border)] text-sm font-medium hover:border-[rgba(107,63,160,0.35)] transition-colors"
                  >
                    New plan
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep("customize")}
                    className="px-5 py-2.5 rounded-full bg-[var(--deep)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Modify
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-[var(--cream)] border border-[var(--border)] rounded-[20px] p-5">
                  <div className="text-xs font-medium tracking-widest uppercase text-[var(--text-muted)]">
                    Event timeline
                  </div>
                  <div className="mt-4 space-y-3">
                    {(
                      [
                      { t: "Booked", d: "Order confirmed instantly" },
                      { t: "Assigned", d: "Vendors assigned to your event" },
                      { t: "Vendors Confirmed", d: "All vendors confirmed their slots" },
                      { t: "On the way", d: "Team is en route" },
                      { t: "Setup started", d: "Setup in progress" },
                      { t: "Completed", d: "Event completed successfully" },
                      ] as const
                    ).map((s, idx, arr) => {
                      const currentIdx = Math.max(0, arr.findIndex((x) => x.t === order.status));
                      const done = idx <= currentIdx;
                      const active = idx === currentIdx;
                      return (
                        <div key={s.t} className="flex items-start gap-3">
                          <div
                            className={`w-3.5 h-3.5 rounded-full mt-1 ${
                              active
                                ? "bg-[var(--purple)] shadow-[0_0_0_6px_rgba(107,63,160,0.12)]"
                                : done
                                  ? "bg-[#1D9E75]"
                                  : "bg-[rgba(26,15,46,0.18)]"
                            }`}
                          />
                          <div>
                            <div className={`font-medium text-sm ${active ? "text-[var(--purple)]" : ""}`}>{s.t}</div>
                            <div className="text-xs text-[var(--text-muted)] mt-0.5">{s.d}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white border border-[var(--border)] rounded-[20px] p-5">
                  <div className="text-xs font-medium tracking-widest uppercase text-[var(--text-muted)]">
                    Vendor & support
                  </div>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-muted)]">Customer</span>
                      <span className="font-medium">{order.customer?.name || "—"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-muted)]">Phone</span>
                      <span className="font-medium">{order.customer?.phone || "—"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-muted)]">Package</span>
                      <span className="font-medium">{packages.find((p) => p.id === order.selectedPackageId)?.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-muted)]">Paid</span>
                      <span className="font-medium">₹{inr(order.payment.paidNow)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-muted)]">Due</span>
                      <span className="font-medium">₹{inr(order.payment.dueLater)}</span>
                    </div>
                  </div>

                  <div className="mt-5 bg-[var(--deep)] text-white rounded-[18px] px-5 py-4 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-[rgba(255,255,255,0.55)] uppercase tracking-widest">Total</div>
                      <div className="font-playfair font-bold text-2xl">₹{inr(order.total)}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep("payment")}
                      className="px-5 py-2.5 rounded-full bg-[var(--gold)] text-[var(--deep)] font-medium text-sm hover:bg-[var(--gold-light)] transition-colors"
                    >
                      Contact support
                    </button>
                  </div>

                  <div className="mt-4 text-xs text-[var(--text-muted)] leading-[1.6]">
                    In production, this dashboard would show assigned vendor names, phone numbers, live tracking, and a
                    support chat.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Portfolio Modal */}
      {selectedVendorForPortfolio && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedVendorForPortfolio(null)}
        >
          <div
            className="relative bg-white rounded-[24px] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[0_20px_60px_rgba(26,15,46,0.3)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedVendorForPortfolio(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-xl hover:bg-white transition-colors shadow-lg"
            >
              ×
            </button>

            {/* Header with gradient */}
            <div className={`relative h-40 bg-gradient-to-br ${selectedVendorForPortfolio.imageGradient} p-6`}>
              <div className="absolute bottom-4 left-6">
                <h3 className="font-playfair font-bold text-2xl text-white mb-1 drop-shadow-lg">
                  {selectedVendorTitle}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-medium">
                    <span className="text-yellow-500">⭐</span>
                    <span className="text-[var(--deep)]">{selectedVendorForPortfolio.rating}</span>
                    <span className="text-[var(--text-muted)]">({selectedVendorForPortfolio.reviews} reviews)</span>
                  </span>
                  <span className="inline-flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-medium text-[var(--purple)]">
                    📍 {selectedVendorForPortfolio.area}
                  </span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Description */}
              <div className="mb-6">
                <h4 className="font-semibold text-sm uppercase tracking-wider text-[var(--text-muted)] mb-2">About</h4>
                <p className="text-[var(--deep)] leading-relaxed">{selectedVendorForPortfolio.portfolio.description}</p>
              </div>

              {/* Highlights */}
              <div className="mb-6">
                <h4 className="font-semibold text-sm uppercase tracking-wider text-[var(--text-muted)] mb-3">What&apos;s Included</h4>
                <div className="space-y-2">
                  {selectedVendorForPortfolio.portfolio.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-[var(--purple)] mt-0.5">✓</span>
                      <span className="text-sm text-[var(--deep)]">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Portfolio Images & Videos */}
              <div className="mb-6">
                <h4 className="font-semibold text-sm uppercase tracking-wider text-[var(--text-muted)] mb-3">Portfolio</h4>
                
                {/* Images Grid */}
                {selectedVendorForPortfolio.portfolio.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                    {selectedVendorForPortfolio.portfolio.images.map((img, idx) => {
                      // Check if img is a URL or emoji
                      const isUrl = img.startsWith('http://') || img.startsWith('https://') || img.startsWith('/');
                      
                      return (
                        <div
                          key={idx}
                          className={`aspect-square rounded-xl overflow-hidden ${isUrl ? 'bg-[var(--cream)]' : `bg-gradient-to-br ${selectedVendorForPortfolio.imageGradient} flex items-center justify-center text-4xl`} border border-[var(--border)]`}
                        >
                          {isUrl ? (
                            <img
                              src={img}
                              alt={`${selectedVendorForPortfolio.category} portfolio ${idx + 1}`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                // Fallback to gradient with emoji if image fails to load
                                e.currentTarget.style.display = 'none';
                                const parent = e.currentTarget.parentElement;
                                if (parent) {
                                  parent.className = `aspect-square rounded-xl bg-gradient-to-br ${selectedVendorForPortfolio.imageGradient} flex items-center justify-center text-4xl border border-[var(--border)]`;
                                  parent.textContent = ['🎉', '✨', '🎊', '🎈', '🎁', '🎂'][idx % 6];
                                }
                              }}
                            />
                          ) : (
                            <span>{img}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {/* Videos */}
                {selectedVendorForPortfolio.portfolio.videos && selectedVendorForPortfolio.portfolio.videos.length > 0 && (
                  <div className="space-y-3">
                    {selectedVendorForPortfolio.portfolio.videos.map((video, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl overflow-hidden bg-[var(--cream)] border border-[var(--border)]"
                      >
                        <video
                          controls
                          className="w-full"
                          preload="metadata"
                          onError={(e) => {
                            // Hide video if it fails to load
                            e.currentTarget.parentElement!.style.display = 'none';
                          }}
                        >
                          <source src={video} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Placeholder if no media */}
                {selectedVendorForPortfolio.portfolio.images.length === 0 && 
                 (!selectedVendorForPortfolio.portfolio.videos || selectedVendorForPortfolio.portfolio.videos.length === 0) && (
                  <div className="grid grid-cols-3 gap-3">
                    {[0, 1, 2].map((idx) => (
                      <div
                        key={idx}
                        className={`aspect-square rounded-xl bg-gradient-to-br ${selectedVendorForPortfolio.imageGradient} flex items-center justify-center text-4xl`}
                      >
                        {['🎉', '✨', '🎊'][idx]}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Location Map (for restaurants only) */}
              {selectedVendorForPortfolio.category === "Restaurant" && selectedVendorForPortfolio.location && (
                <div className="mb-6">
                  <h4 className="font-semibold text-sm uppercase tracking-wider text-[var(--text-muted)] mb-3">Approximate Location</h4>
                  <div className="bg-[var(--cream)] rounded-xl overflow-hidden border border-[var(--border)]">
                    {/* Area info */}
                    <div className="p-4 border-b border-[var(--border)] bg-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[var(--purple)]">📍</span>
                          <span className="text-sm font-medium text-[var(--deep)]">{selectedVendorForPortfolio.area}, {selectedVendorForPortfolio.city}</span>
                        </div>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] mt-2">
                        Exact address will be provided after booking confirmation
                      </p>
                    </div>
                    {/* Map - showing approximate area */}
                    <div className="relative w-full h-64">
                      <iframe
                        src={`https://www.google.com/maps?q=${selectedVendorForPortfolio.location.lat},${selectedVendorForPortfolio.location.lng}&hl=en&z=14&output=embed`}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Approximate Location"
                      />
                      {/* Overlay to prevent interaction (optional) */}
                      <div className="absolute inset-0 pointer-events-none" />
                    </div>
                  </div>
                </div>
              )}

              {/* Experience Stats */}
              <div className="mb-6 grid grid-cols-3 gap-3">
                <div className="bg-[var(--cream)] rounded-xl p-3 text-center">
                  <div className="font-playfair font-bold text-2xl text-[var(--purple)]">
                    {selectedVendorForPortfolio.experienceYears}+
                  </div>
                  <div className="text-xs text-[var(--text-muted)] mt-1">Years Experience</div>
                </div>
                <div className="bg-[var(--cream)] rounded-xl p-3 text-center">
                  <div className="font-playfair font-bold text-2xl text-[var(--purple)]">
                    {selectedVendorForPortfolio.eventsDone}+
                  </div>
                  <div className="text-xs text-[var(--text-muted)] mt-1">Events Done</div>
                </div>
                <div className="bg-[var(--cream)] rounded-xl p-3 text-center">
                  <div className="font-playfair font-bold text-2xl text-[var(--purple)]">
                    {selectedVendorForPortfolio.rating}
                  </div>
                  <div className="text-xs text-[var(--text-muted)] mt-1">Rating</div>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-[var(--deep)] text-white rounded-xl p-4 mb-4">
                <div className="text-sm text-white/70 mb-1">
                  {selectedVendorForPortfolio.pricing.type === "per_plate" ? "Estimated Cost" : 
                   selectedVendorForPortfolio.pricing.type === "range" ? "Price Range" : "Package Price"}
                </div>
                <div className="font-playfair font-bold text-2xl">
                  {selectedVendorForPortfolio.pricing.type === "per_plate" 
                    ? `₹${inr(calculateVendorPrice(selectedVendorForPortfolio).total)}`
                    : calculateVendorPrice(selectedVendorForPortfolio).display}
                </div>
                {selectedVendorForPortfolio.pricing.type === "per_plate" && (
                  <div className="text-sm text-white/70 mt-2">
                    ₹{inr(selectedVendorForPortfolio.pricing.perPlate!)}/plate × {event.guestCount} guests
                    {selectedVendorForPortfolio.pricing.extraCharges ? ` + ₹${inr(selectedVendorForPortfolio.pricing.extraCharges)} extra` : ''}
                  </div>
                )}
              </div>

              {/* Action button */}
              <button
                type="button"
                onClick={() => {
                  toggleInterestedVendor(selectedVendorForPortfolio.id);
                  setSelectedVendorForPortfolio(null);
                }}
                className={`w-full px-6 py-3.5 rounded-xl font-medium transition-all ${
                  interestedVendors.has(selectedVendorForPortfolio.id)
                    ? "bg-[var(--purple)] text-white shadow-[0_4px_16px_rgba(107,63,160,0.3)]"
                    : "bg-[rgba(107,63,160,0.1)] text-[var(--purple)] hover:bg-[rgba(107,63,160,0.15)]"
                }`}
              >
                {interestedVendors.has(selectedVendorForPortfolio.id) ? "✓ Already Interested" : "I'm Interested"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
