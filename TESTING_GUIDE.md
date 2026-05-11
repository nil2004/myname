# Testing Guide - Admin Panel Vendor Suggestions

## Quick Test Steps

### Step 1: Create a Test Request
1. Open your browser and go to: `http://localhost:3000/plan`
2. Fill out the form:
   - **Name:** Test Customer
   - **Phone:** 9876543210
   - **Email:** test@example.com
   - **City:** Dehradun
   - **Budget:** 15000
   - **Guest Count:** 30
   - **Theme:** Cartoon
   - **Vendors:** Check "Restaurant" and "Decoration"
   - **Specifications:** "need outdoor space for kids games"
3. Click "Continue" or submit the form
4. The form will automatically:
   - Save the request to database
   - Create AI-matched vendor suggestions

### Step 2: View in Admin Panel
1. Go to: `http://localhost:3000/admin`
2. Click on the **"Vendor Suggestions"** tab (🎯 icon)
3. You should see:
   - Your test suggestion with status "PENDING ADMIN REVIEW"
   - Customer name, phone, and requirements
   - 3 AI-matched vendors (if available in your database)
   - Total package price

### Step 3: Test Admin Actions

#### Edit Suggestions:
1. Click **"✏️ Edit Suggestions"** button
2. A modal will open showing:
   - Customer requirements summary
   - 3 dropdown menus to select different vendors
   - Admin notes field
3. Try changing vendor selections
4. Add a note like "Adjusted vendors based on availability"
5. Click **"Save & Approve"**
6. The suggestion status will change to "APPROVED"

#### Approve & Send:
1. Find a suggestion with status "PENDING ADMIN REVIEW"
2. Click **"✓ Approve & Send"** button
3. Confirm the action
4. Status will change to "WAITING CUSTOMER APPROVAL"

#### Filter by Status:
1. Use the dropdown at the top to filter:
   - All Status
   - Pending Admin Review
   - Admin Customizing
   - Approved
   - Waiting Customer Approval
   - Customer Approved
   - Customer Rejected

#### Refresh:
1. Click the **"🔄 Refresh"** button to reload suggestions

### Step 4: Verify Data

#### Check Console Logs:
1. Open browser DevTools (F12)
2. Go to Console tab
3. You should see:
   - "Fetched suggestions: {suggestions: [...], total: X}"
   - "Vendor suggestion created successfully" (when form is submitted)

#### Check Network Tab:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Look for these API calls:
   - `POST /api/requests` - Should return 201 Created
   - `POST /api/vendor-suggestions` - Should return 201 Created
   - `GET /api/vendor-suggestions` - Should return 200 OK with data
   - `GET /api/vendors` - Should return 200 OK with vendor list

## Troubleshooting

### No Suggestions Showing?
**Check:**
1. Did you submit a request from `/plan` page?
2. Open browser console - any errors?
3. Check Network tab - is API returning data?
4. Try clicking "🔄 Refresh" button

**Solution:**
- If no suggestions exist, submit a new request from `/plan` page
- Make sure your database has vendors in the same city you selected

### Vendors Not Matching?
**Check:**
1. Do you have vendors in the database for the selected city?
2. Are vendors marked as `verified: true`?
3. Check vendor price ranges - are they within budget?

**Solution:**
- Add vendors to database using the "Vendors" tab in admin panel
- Make sure vendors have correct city, category, and pricing

### Edit Modal Not Working?
**Check:**
1. Browser console for errors
2. Are vendors loading in the dropdown?

**Solution:**
- Make sure `/api/vendors` endpoint is working
- Check that vendors exist in database

### Status Not Updating?
**Check:**
1. Network tab - is PUT request successful?
2. Console for error messages

**Solution:**
- Check Supabase connection
- Verify RLS policies allow updates

## Expected Behavior

### When Form is Submitted:
1. Request is saved to `requests` table
2. Vendor suggestion is created in `vendor_suggestions` table
3. AI matches 3 vendors based on:
   - City match
   - Budget compatibility
   - Theme relevance
   - Customer specifications
   - Vendor ratings

### In Admin Panel:
1. All suggestions are listed with newest first
2. Each suggestion shows:
   - Customer info
   - Event requirements
   - 3 vendor choices with prices
   - Total package price
   - Status badge
   - Action buttons
3. Admin can:
   - Filter by status
   - Edit vendor selections
   - Add notes
   - Approve and send to customer
   - Delete suggestions

## Sample Test Data

If you need to add test vendors, use the admin panel:
1. Go to `/admin`
2. Click "Vendors" tab
3. Click "➕ Add Vendor"
4. Fill in:
   - Name: "Test Restaurant"
   - Category: Restaurant
   - City: Dehradun
   - Price Range: 5000-15000
   - Rating: 4.5
   - Tags: "buffet", "kids-friendly", "outdoor"
   - Verified: Yes

## Success Criteria

✅ Form submission creates both request and vendor suggestion
✅ Admin panel shows suggestions with correct status
✅ Filter dropdown works for all statuses
✅ Edit modal opens and allows vendor selection
✅ Save & Approve updates the suggestion
✅ Approve & Send changes status correctly
✅ Total price displays correctly
✅ Status badges show correct colors
✅ Refresh button reloads data

## Need Help?

If something isn't working:
1. Check browser console for errors
2. Check Network tab for failed API calls
3. Check the server terminal for backend errors
4. Review `ADMIN_VENDOR_SUGGESTIONS_FIX.md` for implementation details
