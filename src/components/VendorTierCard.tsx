"use client";

import { useState } from "react";

interface VendorTierCardProps {
  vendor: {
    id: string;
    name: string;
    display_tier: string;
    category: string;
    rating: number;
    review_count: number;
    price_range_min: number;
    price_range_max: number;
    banner_image: string | null;
    image_emoji: string;
    portfolio_description: string;
    portfolio_highlights: string[];
    experience_years: number;
    events_done: number;
  };
  onSelect: () => void;
  isSelected: boolean;
}

export default function VendorTierCard({ vendor, onSelect, isSelected }: VendorTierCardProps) {
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);

  // Debug: Log vendor data to see what we're getting
  console.log('VendorTierCard - vendor data:', {
    name: vendor.name,
    banner_image: vendor.banner_image,
    image_emoji: vendor.image_emoji
  });

  async function handleViewPortfolio(e: React.MouseEvent) {
    e.stopPropagation();
    setShowPortfolio(true);
    
    // Only fetch from API if we don't have portfolio data and the ID looks like a UUID
    // (UUIDs have dashes, mock IDs like 'dec3' don't)
    const isUUID = vendor.id.includes('-');
    
    console.log('Opening portfolio for:', vendor.name);
    console.log('Vendor ID:', vendor.id, 'Is UUID:', isUUID);
    
    if (!portfolioData && isUUID) {
      setLoadingPortfolio(true);
      try {
        const response = await fetch(`/api/vendors/${vendor.id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch vendor: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched portfolio data from API:', data);
        setPortfolioData(data);
      } catch (error) {
        console.error('Error fetching portfolio:', error);
        // Use vendor data as fallback
        console.log('Using vendor data as fallback:', vendor);
        setPortfolioData(vendor);
      } finally {
        setLoadingPortfolio(false);
      }
    } else if (!portfolioData) {
      // For mock data (non-UUID IDs), use the vendor data directly
      console.log('Using vendor data directly (non-UUID):', vendor);
      setPortfolioData(vendor);
    } else {
      console.log('Using existing portfolio data:', portfolioData);
    }
  }

  function formatPrice(amount: number): string {
    if (amount >= 100000) {
      return `${(amount / 100000).toFixed(1)}K`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toLocaleString();
  }

  // Tier-specific styling
  const tierConfig = {
    premium: {
      gradient: 'from-[#FFF5E6] to-[#FFE8CC]',
      badge: 'bg-[#FFF5E6] text-[#D4A017]',
      icon: '⭐',
      locationBg: 'bg-[#FFE8CC]',
      locationText: 'text-[#D4A017]',
    },
    standard: {
      gradient: 'from-[#F5F5F5] to-[#E8E8E8]',
      badge: 'bg-[#F5F5F5] text-[#666666]',
      icon: '⭐',
      locationBg: 'bg-[#E8E8E8]',
      locationText: 'text-[#666666]',
    },
    budget: {
      gradient: 'from-[#E8F5F1] to-[#D1EBE3]',
      badge: 'bg-[#E8F5F1] text-[#1D9E75]',
      icon: '⭐',
      locationBg: 'bg-[#D1EBE3]',
      locationText: 'text-[#1D9E75]',
    },
  };

  const tierKey = vendor.display_tier.toLowerCase() as keyof typeof tierConfig;
  const config = tierConfig[tierKey] || tierConfig.standard;

  return (
    <div
      onClick={onSelect}
      className={`bg-white rounded-2xl overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
        isSelected
          ? 'ring-2 ring-[var(--purple)] shadow-lg'
          : 'border border-gray-200 hover:border-[var(--purple-light)]'
      }`}
    >
      {/* Top Section - Banner Image or Gradient Background with Rating */}
      <div className={`relative h-32 ${vendor.banner_image ? 'bg-gray-200' : `bg-gradient-to-br ${config.gradient}`} px-4 py-5 pb-8`}>
        {/* Banner Image */}
        {vendor.banner_image ? (
          <div className="absolute inset-0 w-full h-full">
            <img
              src={vendor.banner_image}
              alt={vendor.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('Image failed to load:', vendor.banner_image);
                // Fallback to gradient if image fails to load
                const target = e.target as HTMLImageElement;
                const parent = target.parentElement;
                if (parent) {
                  parent.className = `absolute inset-0 w-full h-full bg-gradient-to-br ${config.gradient}`;
                  parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-4xl">${vendor.image_emoji}</div>`;
                }
              }}
              onLoad={() => {
                console.log('Image loaded successfully:', vendor.banner_image);
              }}
            />
            {/* Overlay for better text visibility */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent"></div>
          </div>
        ) : (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center text-4xl">
            {vendor.image_emoji}
          </div>
        )}

        {/* Rating Badge - Top Right */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white px-2.5 py-1 rounded-full shadow-sm z-10">
          <span className="text-yellow-500 text-sm">⭐</span>
          <span className="font-semibold text-sm">{vendor.rating}</span>
          <span className="text-xs text-gray-500">({vendor.review_count})</span>
        </div>

        {/* Location Badge - Top Left */}
        <div className={`relative inline-flex items-center gap-1 ${config.locationBg} ${config.locationText} px-2.5 py-1 rounded-full text-xs font-medium z-10`}>
          <span>📍</span>
          <span>Sahar...</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-4 pb-4 -mt-5 relative">
        {/* Tier Badge - LARGE */}
        <div className={`inline-flex items-center gap-2 ${config.badge} px-4 py-2.5 rounded-full text-base font-bold mb-3 shadow-sm`}>
          <span className="text-xl">{config.icon}</span>
          <span className="capitalize">{vendor.display_tier}</span>
        </div>

        {/* Vendor Name - SMALL */}
        <h3 className="font-medium text-xs text-gray-500 mb-2 line-clamp-1">
          {vendor.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">
          {vendor.portfolio_description}
        </p>

        {/* Experience Tags */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <span className="text-sm">🎯</span>
            <span className="font-medium">{vendor.experience_years}y</span>
            <span className="text-gray-400">exp</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <span className="text-sm">🎉</span>
            <span className="font-medium">{vendor.events_done}+</span>
            <span className="text-gray-400">events</span>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="mb-4">
          {/* Restaurant/Catering - Per Plate Pricing */}
          {(vendor.category.toLowerCase() === 'restaurant' || 
            vendor.category.toLowerCase() === 'catering') ? (
            <>
              <div className="text-xs text-gray-500 mb-1">Estimated Cost</div>
              <div className="font-bold text-2xl text-gray-900 mb-0.5">
                ₹{formatPrice(vendor.price_range_min)}
              </div>
              <div className="text-xs text-gray-500 leading-tight">
                ₹{formatPrice(Math.round(vendor.price_range_min / 30))}/plate × 30 guests<br />
                + ₹{formatPrice(Math.round(vendor.price_range_min * 0.1))} extra charges
              </div>
            </>
          ) : (
            /* Other Vendors - Price Range */
            <>
              <div className="text-xs text-gray-500 mb-1">Price Range</div>
              <div className="flex items-baseline gap-2">
                <div className="font-bold text-2xl text-gray-900">
                  ₹{formatPrice(vendor.price_range_min)}
                </div>
                <span className="text-gray-400">-</span>
                <div className="font-bold text-2xl text-gray-900">
                  ₹{formatPrice(vendor.price_range_max)}
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Fixed package price
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className={`flex-1 px-3 py-2 rounded-full font-medium text-xs transition-all ${
              isSelected
                ? 'bg-[var(--purple)] text-white'
                : 'border border-[var(--purple)] text-[var(--purple)] hover:bg-[rgba(107,63,160,0.05)]'
            }`}
          >
            {isSelected ? "I'm Interested" : "I'm Interested"}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewPortfolio(e);
            }}
            className="flex-1 px-3 py-2 rounded-full border border-gray-300 text-gray-700 font-medium text-xs hover:bg-gray-50 transition-all"
          >
            View Portfolio
          </button>
        </div>
      </div>

      {/* Portfolio Modal */}
      {showPortfolio && (
        <PortfolioModal
          vendor={vendor}
          portfolioData={portfolioData}
          loading={loadingPortfolio}
          onClose={() => setShowPortfolio(false)}
        />
      )}
    </div>
  );
}

// Portfolio Modal Component
function PortfolioModal({
  vendor,
  portfolioData,
  loading,
  onClose,
}: {
  vendor: any;
  portfolioData: any;
  loading: boolean;
  onClose: () => void;
}) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Use portfolioData if available (from API), otherwise use vendor data
  const data = portfolioData || vendor;
  
  // Get portfolio fields from database
  const images = data.portfolio_images || [];
  const videos = data.portfolio_videos || [];
  const highlights = data.portfolio_highlights || [];
  const description = data.portfolio_description || data.description || '';
  const bannerImage = data.banner_image;
  
  // Get vendor info
  const name = data.name;
  const category = data.category;
  const rating = data.rating;
  const reviewCount = data.review_count;
  const experienceYears = data.experience_years || 5;
  const eventsDone = data.events_done || reviewCount * 2;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-3xl flex items-center justify-between z-10">
          <div>
            <h2 className="font-playfair font-bold text-2xl text-gray-900">{name}</h2>
            <p className="text-sm text-gray-500 mt-0.5 capitalize">{category} Portfolio</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <span className="text-2xl text-gray-400">×</span>
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin"></div>
            <p className="text-gray-500 mt-4">Loading portfolio...</p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Banner/Main Image */}
            {bannerImage && (
              <div className="relative w-full h-80 rounded-2xl overflow-hidden bg-gray-100">
                <img
                  src={bannerImage}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Vendor Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4">
                <div className="text-sm text-purple-600 font-medium mb-1">Rating</div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⭐</span>
                  <span className="font-bold text-2xl text-gray-900">{rating}</span>
                  <span className="text-sm text-gray-500">({reviewCount} reviews)</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4">
                <div className="text-sm text-blue-600 font-medium mb-1">Experience</div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  <span className="font-bold text-2xl text-gray-900">{experienceYears}+</span>
                  <span className="text-sm text-gray-500">years</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4">
                <div className="text-sm text-green-600 font-medium mb-1">Events Done</div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎉</span>
                  <span className="font-bold text-2xl text-gray-900">{eventsDone}+</span>
                  <span className="text-sm text-gray-500">events</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {description && (
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-3">About</h3>
                <p className="text-gray-600 leading-relaxed">{description}</p>
              </div>
            )}

            {/* Highlights */}
            {highlights.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-3">Highlights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {highlights.map((highlight: string, index: number) => (
                    <div key={index} className="flex items-start gap-2 text-gray-700">
                      <span className="text-purple-600 mt-0.5">✓</span>
                      <span className="text-sm">{highlight.replace('✓ ', '')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio Images */}
            {images.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-3">Portfolio Gallery</h3>
                
                {/* Main Image */}
                <div className="relative w-full h-96 rounded-2xl overflow-hidden bg-gray-100 mb-4">
                  <img
                    src={images[selectedImageIndex]}
                    alt={`Portfolio ${selectedImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Navigation Arrows */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition-all"
                      >
                        ←
                      </button>
                      <button
                        onClick={() => setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition-all"
                      >
                        →
                      </button>
                    </>
                  )}
                  
                  {/* Image Counter */}
                  <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                    {selectedImageIndex + 1} / {images.length}
                  </div>
                </div>

                {/* Thumbnail Grid */}
                <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                  {images.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative aspect-square rounded-lg overflow-hidden ${
                        selectedImageIndex === index
                          ? 'ring-2 ring-purple-600'
                          : 'opacity-60 hover:opacity-100'
                      } transition-all`}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio Videos */}
            {videos.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-3">Video Portfolio</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {videos.map((video: string, index: number) => (
                    <div key={index} className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100">
                      <video
                        src={video}
                        controls
                        className="w-full h-full"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
              <h3 className="font-semibold text-lg text-gray-900 mb-3">Pricing</h3>
              
              {/* Restaurant/Catering - Per Plate Pricing */}
              {(vendor.category?.toLowerCase() === 'restaurant' || 
                vendor.category?.toLowerCase() === 'catering') ? (
                <>
                  <div className="mb-2">
                    <span className="text-3xl font-bold text-purple-600">
                      ₹{Math.round(vendor.price_range_min / 30)}
                    </span>
                    <span className="text-lg text-gray-600 ml-2">/plate</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    For 30 guests: ₹{(vendor.price_range_min / 1000).toFixed(1)}K - ₹{(vendor.price_range_max / 1000).toFixed(1)}K
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    + Extra charges for venue, decoration setup, and service
                  </p>
                </>
              ) : (
                /* Other Vendors - Price Range */
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-purple-600">
                      ₹{(vendor.price_range_min / 1000).toFixed(1)}K
                    </span>
                    <span className="text-gray-500">-</span>
                    <span className="text-3xl font-bold text-purple-600">
                      ₹{(vendor.price_range_max / 1000).toFixed(1)}K
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Fixed package price based on event requirements and customizations
                  </p>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  onClose();
                  // Trigger the select action
                }}
                className="flex-1 px-6 py-3 rounded-full bg-purple-600 text-white font-medium hover:bg-purple-700 transition-all"
              >
                Select This Vendor
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-full border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
