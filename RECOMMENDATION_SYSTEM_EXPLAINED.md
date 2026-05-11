# 🤖 AI Recommendation System - How It Works

## Overview

The UtsavAI recommendation system uses a **scoring algorithm** to match vendors with customer requirements. It analyzes multiple factors to rank vendors and show the best matches first.

## System Architecture

```
User Input → API Request → Database Query → AI Scoring → Sorted Results → Display
```

## Step-by-Step Process

### 1. User Provides Event Details

The user fills out the event planning form with:
- **City**: Dehradun, Mumbai, Delhi, etc.
- **Theme**: Cartoon, Romantic, Luxury, Surprise
- **Budget**: Total budget (e.g., ₹15,000)
- **Guest Count**: Number of guests (e.g., 30)
- **Categories**: Decorator, Catering, Cake, etc.

### 2. API Request

The frontend makes a request to `/api/vendors` with parameters:
```
GET /api/vendors?city=Dehradun&theme=Cartoon&budget=15000&guestCount=30&category=decorator
```

### 3. Database Query

The system queries Supabase database:
```sql
SELECT * FROM vendors
WHERE city = 'Dehradun'
  AND category = 'decorator'
  AND verified = true
ORDER BY rating DESC
```

### 4. AI Scoring Algorithm

Each vendor gets a **match score** (0-16 points) based on 5 factors:

#### Factor 1: Rating Score (0-5 points)
```typescript
score += vendor.rating;
```
- Vendor with 4.8 rating → +4.8 points
- Vendor with 4.2 rating → +4.2 points

**Why?** Higher-rated vendors provide better service.

#### Factor 2: Price Match Score (0-3 points)
```typescript
const avgPrice = (vendor.price_min + vendor.price_max) / 2;
const budgetPerCategory = totalBudget / 5; // Divide budget across categories

if (avgPrice <= budgetPerCategory * 0.8) {
  score += 3; // Well within budget
} else if (avgPrice <= budgetPerCategory) {
  score += 2; // Within budget
} else if (avgPrice <= budgetPerCategory * 1.2) {
  score += 1; // Slightly over budget
}
```

**Example:**
- Total Budget: ₹15,000
- Budget per category: ₹15,000 / 5 = ₹3,000
- Vendor A: ₹2,000 (80% of budget) → +3 points ✅
- Vendor B: ₹2,800 (93% of budget) → +2 points
- Vendor C: ₹3,500 (117% of budget) → +1 point
- Vendor D: ₹5,000 (167% of budget) → +0 points

**Why?** Prioritize vendors within customer's budget.

#### Factor 3: Theme Match Score (0-5 points)
```typescript
// Theme keywords mapping
const themeKeywords = {
  'Cartoon': ['cartoon', 'kids', 'children', 'fun', 'colorful', 'playful', 'animated', 'character'],
  'Romantic': ['romantic', 'elegant', 'intimate', 'couple', 'love', 'roses', 'candles', 'soft'],
  'Luxury': ['luxury', 'premium', 'elegant', 'sophisticated', 'high-end', 'exclusive', 'deluxe', 'royal'],
  'Surprise': ['surprise', 'special', 'unique', 'creative', 'unexpected', 'wow', 'amazing']
};

// Check vendor tags against theme keywords
let tagMatches = 0;
for (const tag of vendor.tags) {
  for (const keyword of themeKeywords[theme]) {
    if (tag.toLowerCase().includes(keyword.toLowerCase())) {
      tagMatches++;
      break;
    }
  }
}
score += Math.min(tagMatches * 2, 5); // Max 5 points
```

**Example (Cartoon Theme):**
- Vendor tags: ['kids', 'colorful', 'balloon', 'fun']
- Matches: 'kids' ✓, 'colorful' ✓, 'fun' ✓ = 3 matches
- Score: 3 × 2 = 6, capped at 5 → +5 points

**Why?** Match vendors who specialize in the requested theme.

#### Factor 4: Experience Bonus (0-2 points)
```typescript
if (vendor.review_count >= 100) {
  score += 2; // Highly experienced
} else if (vendor.review_count >= 50) {
  score += 1; // Moderately experienced
}
```

**Example:**
- Vendor A: 150 reviews → +2 points
- Vendor B: 75 reviews → +1 point
- Vendor C: 30 reviews → +0 points

**Why?** More reviews = more experience and reliability.

#### Factor 5: Verified Bonus (0-1 point)
```typescript
if (vendor.verified) {
  score += 1;
}
```

**Why?** Verified vendors have been vetted by the platform.

### 5. Total Score Calculation

**Maximum Possible Score: 16 points**

Example calculation for a decorator:
```
Vendor: "Celebration Decor Co."
- Rating: 4.8 → +4.8 points
- Price: ₹5,000 (within budget) → +2 points
- Theme match: 3 tags match → +5 points (capped)
- Reviews: 131 reviews → +2 points
- Verified: Yes → +1 point
─────────────────────────────
Total Score: 14.8 / 16 points
```

### 6. Sorting & Ranking

Vendors are sorted by match score (highest first):
```typescript
scoredVendors.sort((a, b) => b.matchScore - a.matchScore);
```

**Result:**
1. Vendor A: 14.8 points (Best Match)
2. Vendor B: 12.5 points
3. Vendor C: 10.2 points
4. Vendor D: 8.7 points

### 7. Tier Assignment

Based on score, vendors are assigned to tiers:
- **Premium Tier**: Score ≥ 13 points
- **Standard Tier**: Score 10-12.9 points
- **Budget Tier**: Score < 10 points

### 8. Display to User

Vendors are displayed in cards showing:
- Match score (hidden from user, used for sorting)
- Tier badge (Premium/Standard/Budget)
- Pricing
- Rating and reviews
- Experience

## Real-World Example

### User Input:
```
Event Type: Birthday
City: Dehradun
Theme: Cartoon
Budget: ₹15,000
Guest Count: 30
Categories: Decorator, Cake
```

### Decorator Category Results:

#### Vendor 1: "Dream Decorators"
```
Rating: 4.9 → +4.9 points
Price: ₹8,000 (avg)
  Budget per category: ₹7,500
  Ratio: 107% → +1 point
Tags: ['kids', 'cartoon', 'colorful', 'balloon']
  Matches: 4 → +5 points (capped)
Reviews: 156 → +2 points
Verified: Yes → +1 point
─────────────────────────
Total: 13.9 points → PREMIUM TIER
```

#### Vendor 2: "Party Perfect Decor"
```
Rating: 4.6 → +4.6 points
Price: ₹5,500 (avg)
  Budget per category: ₹7,500
  Ratio: 73% → +3 points
Tags: ['kids', 'budget-friendly']
  Matches: 1 → +2 points
Reviews: 164 → +2 points
Verified: Yes → +1 point
─────────────────────────
Total: 12.6 points → STANDARD TIER
```

#### Vendor 3: "Elegant Events"
```
Rating: 4.8 → +4.8 points
Price: ₹12,000 (avg)
  Budget per category: ₹7,500
  Ratio: 160% → +0 points
Tags: ['luxury', 'premium', 'elegant']
  Matches: 0 → +0 points (wrong theme)
Reviews: 89 → +1 point
Verified: Yes → +1 point
─────────────────────────
Total: 6.8 points → BUDGET TIER
```

**Display Order:**
1. Dream Decorators (13.9) - Premium
2. Party Perfect Decor (12.6) - Standard
3. Elegant Events (6.8) - Budget

## Algorithm Strengths

### 1. Multi-Factor Analysis
- Not just based on price or rating
- Considers theme, experience, and verification
- Holistic matching

### 2. Budget-Aware
- Divides budget across categories
- Prioritizes affordable options
- Still shows premium options if they match well

### 3. Theme-Specific
- Matches vendor specialization with event theme
- Uses keyword matching on vendor tags
- Avoids showing irrelevant vendors

### 4. Experience-Weighted
- Rewards vendors with proven track record
- Balances new vs. established vendors
- Considers review count

### 5. Transparent Scoring
- Each factor has clear weight
- Reproducible results
- Easy to debug and improve

## How to Improve Recommendations

### 1. Add More Vendor Tags
```sql
UPDATE vendors
SET tags = ARRAY['kids', 'cartoon', 'superhero', 'colorful', 'balloon', 'fun']
WHERE id = 'vendor-id';
```

More tags = better theme matching = higher scores

### 2. Keep Pricing Updated
```sql
UPDATE vendors
SET price_min = 5000, price_max = 15000
WHERE id = 'vendor-id';
```

Accurate pricing = better budget matching

### 3. Encourage Reviews
More reviews → higher experience bonus → better ranking

### 4. Verify Quality Vendors
```sql
UPDATE vendors
SET verified = true
WHERE id = 'vendor-id';
```

Verification = +1 point bonus

### 5. Add More Themes
```typescript
const themeKeywords = {
  'Cartoon': [...],
  'Romantic': [...],
  'Luxury': [...],
  'Surprise': [...],
  'Traditional': ['traditional', 'cultural', 'ethnic', 'classic'],
  'Modern': ['modern', 'contemporary', 'minimalist', 'trendy'],
  // Add more themes
};
```

## Advanced Features (Future)

### 1. Machine Learning
- Learn from user selections
- Improve scoring weights over time
- Personalized recommendations

### 2. Collaborative Filtering
- "Users who booked X also booked Y"
- Similar event recommendations
- Vendor combinations

### 3. Location-Based Scoring
- Distance from event venue
- Travel time consideration
- Area-specific preferences

### 4. Seasonal Adjustments
- Peak season pricing
- Availability-based scoring
- Demand-based ranking

### 5. User Feedback Loop
- Track booking success rate
- Adjust weights based on outcomes
- A/B testing different algorithms

## API Usage

### Basic Request (No AI Scoring)
```
GET /api/vendors?city=Dehradun&category=decorator
```
Returns vendors sorted by rating only.

### AI-Powered Request
```
GET /api/vendors?city=Dehradun&category=decorator&theme=Cartoon&budget=15000&guestCount=30
```
Returns vendors with AI match scores, sorted by relevance.

### Response Format
```json
{
  "vendors": [
    {
      "id": "uuid",
      "name": "Dream Decorators",
      "category": "decorator",
      "rating": 4.9,
      "review_count": 156,
      "price_min": 5000,
      "price_max": 15000,
      "tags": ["kids", "cartoon", "colorful"],
      "verified": true,
      "matchScore": 13.9
    }
  ]
}
```

## Testing the Algorithm

### Test Case 1: Budget-Conscious User
```
Budget: ₹10,000
Expected: Budget-friendly vendors ranked higher
```

### Test Case 2: Theme-Specific User
```
Theme: Cartoon
Expected: Vendors with kids/cartoon tags ranked higher
```

### Test Case 3: Quality-Focused User
```
Budget: ₹50,000
Expected: Premium vendors with high ratings ranked higher
```

## Summary

The recommendation system uses a **weighted scoring algorithm** that considers:

1. **Rating** (0-5 points) - Service quality
2. **Price Match** (0-3 points) - Budget fit
3. **Theme Match** (0-5 points) - Specialization
4. **Experience** (0-2 points) - Track record
5. **Verification** (0-1 point) - Platform trust

**Total: 0-16 points**

Vendors are ranked by score and displayed in tiers (Premium/Standard/Budget), ensuring customers see the most relevant options first.

The system is:
- ✅ Transparent
- ✅ Customizable
- ✅ Scalable
- ✅ Data-driven
- ✅ User-focused

---

**Want to improve recommendations?** Update vendor tags, keep pricing current, and encourage customer reviews!
