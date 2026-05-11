# Enhanced Vendor Suggestion System - Implementation Guide

## Overview
This system allows the admin to see ALL 3 AI-matched vendor options per category (not just the top pick), and select which one to use for the customer's event.

## Current State
- AI matches 1 vendor per category (Restaurant, Cake, Decorator, etc.)
- Admin can only see the top AI pick
- No way to see alternative vendor options

## Target State
- AI matches 3 vendors per category
- Admin sees all 3 options per category in expandable sections
- Admin can select which vendor to use from the 3 options
- Selected vendors are highlighted and used for final pricing

## Implementation Steps

### Step 1: Database Schema Update ✅
**File**: `ADD_VENDOR_OPTIONS_COLUMN.sql`

Run this SQL in Supabase to add:
- `vendor_options` JSONB column - stores all matched vendors per category
- `selected_vendor_indices` JSONB column - tracks which vendor is selected per category

**Status**: SQL file ready, needs to be run by user

### Step 2: Update API to Store All Vendor Options
**File**: `src/app/api/vendor-suggestions/route.ts`

Changes needed:
1. Modify `autoMatchVendors()` to return 3 vendors per category (not just 1)
2. Store all matched vendors in `vendor_options` JSONB field
3. Keep backward compatibility with existing `vendor_1_id`, `vendor_2_id`, `vendor_3_id` fields

**Status**: Ready to implement

### Step 3: Update Admin UI
**File**: `src/components/admin/VendorSuggestionsManager.tsx`

Changes needed:
1. Parse `vendor_options` JSONB to display all options per category
2. Create expandable sections per category (Restaurant, Cake, Decorator, etc.)
3. Show 3 vendor cards per category with radio buttons for selection
4. Update selection state when admin chooses a vendor
5. Save selected vendors back to database

**Status**: Ready to implement

## Data Structure

### vendor_options JSONB Format
```json
{
  "restaurant": [
    {
      "id": "vendor_id_1",
      "name": "Olive Banquets",
      "category": "restaurant",
      "price": 15000,
      "rating": 4.5,
      "match_score": 28.5,
      "description": "Premium banquet hall...",
      "tags": ["Buffet", "AC Hall"]
    },
    {
      "id": "vendor_id_2",
      "name": "Royal Garden",
      "category": "restaurant",
      "price": 18000,
      "rating": 4.7,
      "match_score": 26.3
    },
    {
      "id": "vendor_id_3",
      "name": "Celebration Hub",
      "category": "restaurant",
      "price": 12000,
      "rating": 4.3,
      "match_score": 24.1
    }
  ],
  "cake": [
    // 3 cake vendor options
  ],
  "decorator": [
    // 3 decorator options
  ]
}
```

### selected_vendor_indices JSONB Format
```json
{
  "restaurant": 0,  // Index of selected vendor (0, 1, or 2)
  "cake": 1,
  "decorator": 0
}
```

## Benefits
1. **Transparency**: Admin sees all AI-matched options, not just the top pick
2. **Flexibility**: Admin can override AI selection if needed
3. **Better Matching**: Customer gets the best vendor based on admin's expertise
4. **Audit Trail**: System tracks which vendors were matched and which were selected

## Next Steps
1. ✅ User runs `ADD_VENDOR_OPTIONS_COLUMN.sql` in Supabase
2. ⏳ Update API to match and store 3 vendors per category
3. ⏳ Update Admin UI to display and select from vendor options
4. ⏳ Test complete flow: form submission → AI matching → admin selection → customer approval
