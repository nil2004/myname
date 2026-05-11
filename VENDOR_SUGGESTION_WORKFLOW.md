# Vendor Suggestion Workflow - Complete Guide

## Overview

The vendor suggestion system is a hybrid AI + manual workflow that helps admins match customers with the best vendors for their events.

## Complete Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CUSTOMER JOURNEY                          │
└─────────────────────────────────────────────────────────────────┘

1. Customer visits /plan page
   ↓
2. Fills out party planning form
   - Name, phone, email
   - City, budget, guest count
   - Theme, occasion, age group
   - Vendor categories (Restaurant, Cake, etc.)
   - Special specifications
   ↓
3. Submits form
   ↓
4. System creates:
   - Request record (in requests table)
   - Vendor suggestion (in vendor_suggestions table)
   ↓
5. AI Auto-Matching Algorithm runs:
   - Filters vendors by city
   - Matches theme keywords
   - Checks budget compatibility
   - Analyzes customer specifications
   - Scores vendors (0-40+ points)
   - Selects top 3 vendors
   ↓
6. Suggestion created with status: "pending_admin_review"

┌─────────────────────────────────────────────────────────────────┐
│                         ADMIN JOURNEY                            │
└─────────────────────────────────────────────────────────────────┘

7. Admin opens /admin panel
   ↓
8. Clicks "Vendor Suggestions" tab
   ↓
9. Sees list of suggestions with status "PENDING ADMIN REVIEW"
   ↓
10. Admin reviews AI suggestions:
    - Checks if vendors match requirements
    - Verifies pricing is within budget
    - Reviews customer specifications
    ↓
11. Admin has 3 options:

    Option A: Accept AI Suggestions
    ├─ Click "✓ Approve & Send"
    ├─ Status → "waiting_customer_approval"
    └─ Ready to send to customer

    Option B: Customize Suggestions
    ├─ Click "✏️ Edit Suggestions"
    ├─ Change vendor selections
    ├─ Add admin notes
    ├─ Click "Save & Approve"
    ├─ Status → "approved"
    └─ Then click "✓ Approve & Send"

    Option C: Delete & Start Over
    ├─ Click "🗑️" delete button
    └─ Remove suggestion completely

┌─────────────────────────────────────────────────────────────────┐
│                    CUSTOMER APPROVAL (Future)                    │
└─────────────────────────────────────────────────────────────────┘

12. Customer receives notification (email/SMS)
    ↓
13. Customer views suggestions in customer portal
    ↓
14. Customer has 3 options:

    Option A: Approve
    ├─ Status → "customer_approved"
    └─ Proceed to payment

    Option B: Request Changes
    ├─ Status → "admin_customizing"
    └─ Admin makes adjustments

    Option C: Reject
    ├─ Status → "customer_rejected"
    └─ Admin creates new suggestions

┌─────────────────────────────────────────────────────────────────┐
│                    PAYMENT & CONFIRMATION                        │
└─────────────────────────────────────────────────────────────────┘

15. Customer proceeds to payment
    ↓
16. Status → "payment_pending"
    ↓
17. Payment completed
    ↓
18. Status → "payment_completed"
    ↓
19. Booking confirmed
    ↓
20. Status → "confirmed"
    ↓
21. Vendors notified
    ↓
22. Event day coordination
```

## Status Flow

```
pending_admin_review
    ↓
admin_customizing (optional)
    ↓
approved
    ↓
waiting_customer_approval
    ↓
customer_approved / customer_rejected
    ↓
payment_pending
    ↓
payment_completed
    ↓
confirmed
    ↓
completed / cancelled
```

## AI Matching Algorithm Details

### Input Parameters:
- `city` - Must match exactly
- `budget` - Vendors within 120% of budget considered
- `addOns` - Selected vendor categories
- `theme` - Keywords for matching
- `guestCount` - For per-plate pricing calculations
- `specifications` - Customer's custom requirements

### Scoring System (per vendor):

| Factor | Points | Description |
|--------|--------|-------------|
| Base Rating | 0-5 | Vendor's star rating |
| Price Match | 0-3 | Within budget (3), slightly over (1) |
| Theme in Description | 0-5 | Theme keywords found in description |
| Theme in Tags | 0-5 | Theme keywords found in tags |
| Specs in Description | 0-8 | Customer specs matched in description |
| Specs in Tags | 0-8 | Customer specs matched in tags |
| Specs in Portfolio | 0-5 | Customer specs matched in highlights |
| Experience Bonus | 0-2 | 10+ years (2), 5+ years (1) |
| Events Done Bonus | 0-2 | 200+ events (2), 100+ events (1) |
| Guest Suitability | 0-2 | For restaurants with per-plate pricing |

**Maximum Score:** 45 points

### Example Scoring:

**Customer Request:**
- City: Dehradun
- Budget: ₹15,000
- Theme: Cartoon
- Specifications: "outdoor space, kids games, colorful decorations"

**Vendor A (Decorator):**
- Rating: 4.8 → 4.8 points
- Price: ₹8,000 (within budget) → 3 points
- Description contains "cartoon", "colorful" → 3 points
- Tags: ["kids-themes", "outdoor", "colorful"] → 6 points
- Specs match: "outdoor", "colorful" → 4 points
- Experience: 8 years → 1 point
- Events: 220 → 2 points
- **Total: 23.8 points** ⭐ Selected

**Vendor B (Decorator):**
- Rating: 4.5 → 4.5 points
- Price: ₹18,000 (over budget) → 0 points
- Description contains "elegant", "luxury" → 0 points
- Tags: ["premium", "wedding"] → 0 points
- Specs match: none → 0 points
- Experience: 12 years → 2 points
- Events: 300 → 2 points
- **Total: 8.5 points** ❌ Not selected

## Database Schema

### vendor_suggestions Table

```sql
CREATE TABLE vendor_suggestions (
  -- Identity
  id UUID PRIMARY KEY,
  request_id UUID REFERENCES requests(id),
  
  -- Customer Info
  customer_name VARCHAR(255),
  customer_phone VARCHAR(20),
  customer_email VARCHAR(255),
  
  -- Event Requirements
  occasion VARCHAR(100),
  age_group VARCHAR(50),
  budget INT,
  guest_count INT,
  location_type VARCHAR(50),
  city VARCHAR(100),
  theme VARCHAR(50),
  add_ons TEXT[],
  specifications TEXT,
  
  -- Vendor 1
  vendor_1_id UUID,
  vendor_1_name VARCHAR(255),
  vendor_1_category VARCHAR(50),
  vendor_1_price INT,
  vendor_1_auto_matched BOOLEAN,
  
  -- Vendor 2
  vendor_2_id UUID,
  vendor_2_name VARCHAR(255),
  vendor_2_category VARCHAR(50),
  vendor_2_price INT,
  vendor_2_auto_matched BOOLEAN,
  
  -- Vendor 3
  vendor_3_id UUID,
  vendor_3_name VARCHAR(255),
  vendor_3_category VARCHAR(50),
  vendor_3_price INT,
  vendor_3_auto_matched BOOLEAN,
  
  -- Package
  package_type VARCHAR(50),
  package_name VARCHAR(255),
  package_description TEXT,
  
  -- Pricing
  initial_price INT,
  admin_adjusted_price INT,
  final_price INT,
  discount_amount INT,
  discount_reason TEXT,
  
  -- Customization
  customizations JSONB,
  admin_notes TEXT,
  
  -- Scheduling
  event_date DATE,
  event_time VARCHAR(50),
  event_duration VARCHAR(50),
  setup_time VARCHAR(50),
  slot_confirmed BOOLEAN,
  
  -- Status
  status VARCHAR(50),
  
  -- Workflow Tracking
  reviewed_by VARCHAR(255),
  reviewed_at TIMESTAMP,
  finalized_by VARCHAR(255),
  finalized_at TIMESTAMP,
  sent_to_customer_at TIMESTAMP,
  customer_viewed_at TIMESTAMP,
  customer_approved_at TIMESTAMP,
  
  -- Payment
  payment_method VARCHAR(50),
  payment_status VARCHAR(50),
  payment_id VARCHAR(255),
  paid_amount INT,
  paid_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

### GET /api/vendor-suggestions
Fetch all vendor suggestions with optional filters.

**Query Parameters:**
- `status` - Filter by status
- `requestId` - Filter by request ID

**Response:**
```json
{
  "suggestions": [...],
  "total": 5
}
```

### POST /api/vendor-suggestions
Create a new vendor suggestion with AI matching.

**Request Body:**
```json
{
  "requestId": "uuid",
  "customerName": "John Doe",
  "customerPhone": "9876543210",
  "customerEmail": "john@example.com",
  "occasion": "Birthday",
  "ageGroup": "Kids",
  "budget": 15000,
  "guestCount": 30,
  "locationType": "Home",
  "city": "Dehradun",
  "theme": "Cartoon",
  "addOns": ["Restaurant", "Decoration"],
  "specifications": "outdoor space, kids games",
  "packageType": "essential"
}
```

**Response:**
```json
{
  "id": "uuid",
  "status": "pending_admin_review",
  "vendor_1_id": "uuid",
  "vendor_1_name": "Party Perfect Decor",
  ...
}
```

### PUT /api/vendor-suggestions
Update an existing vendor suggestion.

**Request Body:**
```json
{
  "id": "uuid",
  "vendor1Id": "uuid",
  "vendor1Name": "New Vendor",
  "vendor1Category": "decorator",
  "vendor1Price": 8000,
  "vendor1AutoMatched": false,
  "adminNotes": "Changed based on availability",
  "status": "approved"
}
```

### DELETE /api/vendor-suggestions?id=uuid
Delete a vendor suggestion.

## Admin Panel Features

### Current Features:
✅ View all vendor suggestions
✅ Filter by status
✅ Edit vendor selections
✅ Add admin notes
✅ Approve and send to customer
✅ Delete suggestions
✅ Refresh data
✅ AI-powered vendor matching
✅ Customer specifications matching

### Future Features:
🔜 Manual suggestion creation
🔜 Email/SMS notifications
🔜 Customer portal
🔜 Payment integration
🔜 Booking confirmation
🔜 Vendor notifications
🔜 Calendar integration
🔜 Analytics dashboard

## Best Practices

### For Admins:
1. **Review AI suggestions carefully** - AI is good but not perfect
2. **Check vendor availability** - Call vendors before finalizing
3. **Add detailed notes** - Help track why changes were made
4. **Verify pricing** - Ensure prices are current and accurate
5. **Consider customer specs** - Read specifications carefully
6. **Communicate with customer** - Call if requirements are unclear

### For Developers:
1. **Keep AI algorithm updated** - Add new scoring factors as needed
2. **Monitor match quality** - Track how often admins change suggestions
3. **Optimize performance** - Cache vendor data when possible
4. **Add logging** - Track all status changes for analytics
5. **Test edge cases** - What if no vendors match? Budget too low?
6. **Handle errors gracefully** - Show helpful messages to admins

## Troubleshooting

### AI Not Matching Well?
- Check vendor data quality (descriptions, tags, portfolio)
- Adjust scoring weights in algorithm
- Add more theme keywords
- Improve specification keyword extraction

### Suggestions Not Showing?
- Verify request was created
- Check vendor_suggestions table in database
- Look for API errors in console
- Ensure RLS policies allow read access

### Status Not Updating?
- Check Supabase connection
- Verify RLS policies allow updates
- Look for validation errors
- Check network tab for failed requests

## Performance Optimization

### Current:
- Vendor matching runs on every request submission
- All vendors loaded for each match
- No caching

### Recommended:
- Cache vendor data in Redis
- Pre-calculate vendor scores
- Use database indexes
- Implement pagination
- Add background job queue for matching

## Security Considerations

1. **Input Validation** - Sanitize all customer inputs
2. **RLS Policies** - Restrict access to suggestions
3. **Admin Authentication** - Verify admin role before allowing edits
4. **Rate Limiting** - Prevent abuse of API endpoints
5. **Data Privacy** - Protect customer information
6. **Audit Logging** - Track all changes to suggestions

## Metrics to Track

1. **Match Quality**
   - % of AI suggestions accepted without changes
   - Average admin edit time
   - Customer approval rate

2. **Performance**
   - API response times
   - Matching algorithm execution time
   - Database query performance

3. **Business**
   - Conversion rate (suggestions → bookings)
   - Average order value
   - Customer satisfaction scores
