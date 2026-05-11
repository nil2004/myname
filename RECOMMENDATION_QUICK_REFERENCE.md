# 🎯 Recommendation System - Quick Reference

## How It Works (Simple Version)

The system gives each vendor a **score from 0-16 points** based on 5 factors:

### 🌟 The 5 Scoring Factors

| Factor | Points | What It Measures |
|--------|--------|------------------|
| **1. Rating** | 0-5 | Service quality (vendor's star rating) |
| **2. Price Match** | 0-3 | How well price fits customer's budget |
| **3. Theme Match** | 0-5 | How well vendor matches event theme |
| **4. Experience** | 0-2 | Number of reviews (track record) |
| **5. Verification** | 0-1 | Platform verified vendor |
| **TOTAL** | **0-16** | **Overall match score** |

## Scoring Examples

### Example 1: Perfect Match
```
Vendor: "Party Perfect Decor"
Theme: Cartoon
Budget: ₹15,000 (₹3,000 per category)

✓ Rating: 4.6 → +4.6 points
✓ Price: ₹5,500 (within budget) → +2 points
✓ Tags: [kids, cartoon, fun] → +5 points
✓ Reviews: 164 → +2 points
✓ Verified: Yes → +1 point
─────────────────────────────
TOTAL: 14.6 points → PREMIUM TIER 🌟
```

### Example 2: Wrong Theme
```
Vendor: "Elegant Events"
Theme: Cartoon (but vendor does luxury)
Budget: ₹15,000 (₹3,000 per category)

✓ Rating: 4.8 → +4.8 points
✗ Price: ₹12,000 (too expensive) → +0 points
✗ Tags: [luxury, premium] (no match) → +0 points
✓ Reviews: 89 → +1 point
✓ Verified: Yes → +1 point
─────────────────────────────
TOTAL: 6.8 points → BUDGET TIER 💰
```

## Tier System

| Tier | Score Range | Badge | Meaning |
|------|-------------|-------|---------|
| **Premium** | ≥ 13 points | 🌟 | Best match for your event |
| **Standard** | 10-12.9 points | ⭐ | Good match, reliable choice |
| **Budget** | < 10 points | 💰 | Available but less ideal |

## Theme Keywords

When you select a theme, the system looks for these keywords in vendor tags:

### 🎈 Cartoon Theme
`cartoon`, `kids`, `children`, `fun`, `colorful`, `playful`, `animated`, `character`

### 💕 Romantic Theme
`romantic`, `elegant`, `intimate`, `couple`, `love`, `roses`, `candles`, `soft`

### ✨ Luxury Theme
`luxury`, `premium`, `elegant`, `sophisticated`, `high-end`, `exclusive`, `deluxe`, `royal`

### 🎁 Surprise Theme
`surprise`, `special`, `unique`, `creative`, `unexpected`, `wow`, `amazing`

## Price Matching Logic

Budget is divided equally across selected categories:

```
Total Budget: ₹15,000
Categories: 5 (Decorator, Cake, Photographer, DJ, Catering)
Budget per category: ₹15,000 / 5 = ₹3,000
```

Then vendors are scored based on how their price compares:

| Vendor Price | Score | Label |
|--------------|-------|-------|
| ≤ ₹2,400 (80%) | +3 points | Well within budget ✓✓✓ |
| ≤ ₹3,000 (100%) | +2 points | Within budget ✓✓ |
| ≤ ₹3,600 (120%) | +1 point | Slightly over ✓ |
| > ₹3,600 (>120%) | +0 points | Over budget ✗ |

## How to Get Better Recommendations

### For Vendors (Admin Panel)

1. **Add Relevant Tags**
   ```
   Bad:  tags: ['decoration']
   Good: tags: ['kids', 'cartoon', 'colorful', 'balloon', 'fun', 'birthday']
   ```

2. **Keep Pricing Accurate**
   ```
   Update price_min and price_max regularly
   ```

3. **Get More Reviews**
   ```
   More reviews = higher experience score
   ```

4. **Get Verified**
   ```
   Verified vendors get +1 bonus point
   ```

### For Customers

1. **Be Specific with Theme**
   - Choose the theme that best matches your vision
   - System will find vendors who specialize in that theme

2. **Set Realistic Budget**
   - System divides budget across categories
   - Too low = fewer matches
   - Too high = includes expensive options

3. **Select Relevant Categories**
   - Only select what you actually need
   - More categories = budget spread thinner

## API Endpoint

```
GET /api/vendors?city={city}&theme={theme}&budget={budget}&guestCount={count}&category={category}
```

**Parameters:**
- `city` - Event city (e.g., "Dehradun")
- `theme` - Event theme (e.g., "Cartoon")
- `budget` - Total budget in rupees (e.g., "15000")
- `guestCount` - Number of guests (e.g., "30")
- `category` - Vendor category (e.g., "decorator")

**Response:**
```json
{
  "vendors": [
    {
      "id": "uuid",
      "name": "Party Perfect Decor",
      "matchScore": 14.6,
      "rating": 4.6,
      "price_min": 3000,
      "price_max": 8000,
      "tags": ["kids", "cartoon", "fun"],
      ...
    }
  ]
}
```

## Real-World Flow

```
1. User fills form
   ↓
2. System queries database
   ↓
3. AI scores each vendor (0-16 points)
   ↓
4. Vendors sorted by score
   ↓
5. Assigned to tiers (Premium/Standard/Budget)
   ↓
6. Displayed to user (best matches first)
```

## Key Benefits

✅ **Smart Matching** - Not just price or rating, considers everything
✅ **Budget-Aware** - Prioritizes affordable options
✅ **Theme-Specific** - Finds specialists for your event type
✅ **Experience-Weighted** - Rewards proven vendors
✅ **Transparent** - Clear scoring system

## Common Questions

**Q: Why is a cheaper vendor ranked lower?**
A: Price is only 1 of 5 factors. If they don't match the theme or have low ratings, they'll score lower overall.

**Q: Why is an expensive vendor showing up?**
A: If they have excellent ratings, match the theme perfectly, and are verified, they can still score high despite price.

**Q: How do I see only budget options?**
A: Look for vendors in the "Budget Tier" section, or adjust your total budget lower.

**Q: Can I change the scoring weights?**
A: Yes! Edit `/src/app/api/vendors/route.ts` and adjust the point values for each factor.

## Summary

The recommendation system uses **AI scoring** to match vendors with your event:

- **5 factors** analyzed per vendor
- **0-16 points** total score
- **3 tiers** (Premium/Standard/Budget)
- **Best matches** shown first

It's smart, transparent, and gets better as more vendors join the platform!

---

**For detailed technical explanation, see:** `RECOMMENDATION_SYSTEM_EXPLAINED.md`
**For visual flow diagram, see:** `RECOMMENDATION_FLOW.txt`
