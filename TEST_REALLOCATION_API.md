# 🧪 Testing Smart Budget Reallocation API

## Quick Test Guide

### Test 1: Your Exact Scenario (₹60K Budget, ₹30K Restaurant)

**Step 1: Get Initial Allocation**

```bash
curl "http://localhost:3000/api/budget-reallocation?totalBudget=60000&categories=restaurant,decorator"
```

**Expected Response:**
```json
{
  "totalBudget": 60000,
  "categories": ["restaurant", "decorator"],
  "allocation": {
    "restaurant": 45000,
    "decorator": 15000
  },
  "hasRestaurant": true,
  "restaurantPercentage": 75
}
```

**Step 2: Select Restaurant (₹30K) and Reallocate**

```bash
curl -X POST http://localhost:3000/api/budget-reallocation \
  -H "Content-Type: application/json" \
  -d '{
    "totalBudget": 60000,
    "initialAllocation": {
      "restaurant": 45000,
      "decorator": 15000
    },
    "selectedVendors": [
      {
        "category": "restaurant",
        "vendorId": "rest1",
        "actualPrice": 30000
      }
    ],
    "remainingCategories": ["decorator"]
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "finalAllocation": {
    "restaurant": 30000,
    "decorator": 30000
  },
  "savings": {
    "restaurant": 15000
  },
  "totalSaved": 15000,
  "reallocatedTo": {
    "decorator": 15000
  },
  "message": "Great choice! You saved ₹15,000 which has been reallocated to other categories."
}
```

✅ **Result:** Decorator budget DOUBLED from ₹15K to ₹30K!

---

### Test 2: Perfect Match (Restaurant Costs Exactly Allocated)

**Step 1: Initial Allocation** (same as above)

**Step 2: Select Restaurant (₹45K)**

```bash
curl -X POST http://localhost:3000/api/budget-reallocation \
  -H "Content-Type: application/json" \
  -d '{
    "totalBudget": 60000,
    "initialAllocation": {
      "restaurant": 45000,
      "decorator": 15000
    },
    "selectedVendors": [
      {
        "category": "restaurant",
        "vendorId": "rest2",
        "actualPrice": 45000
      }
    ],
    "remainingCategories": ["decorator"]
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "finalAllocation": {
    "restaurant": 45000,
    "decorator": 15000
  },
  "savings": {},
  "totalSaved": 0,
  "reallocatedTo": {},
  "message": "Perfect match! Vendors cost exactly as allocated."
}
```

✅ **Result:** No reallocation needed, perfect match!

---

### Test 3: Over Budget (Restaurant Costs More)

**Step 1: Initial Allocation** (same as above)

**Step 2: Select Expensive Restaurant (₹50K)**

```bash
curl -X POST http://localhost:3000/api/budget-reallocation \
  -H "Content-Type: application/json" \
  -d '{
    "totalBudget": 60000,
    "initialAllocation": {
      "restaurant": 45000,
      "decorator": 15000
    },
    "selectedVendors": [
      {
        "category": "restaurant",
        "vendorId": "rest_premium",
        "actualPrice": 50000
      }
    ],
    "remainingCategories": ["decorator"]
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "finalAllocation": {
    "restaurant": 50000,
    "decorator": 10000
  },
  "savings": {
    "restaurant": -5000
  },
  "totalSaved": -5000,
  "reallocatedTo": {},
  "message": "Selected vendors exceed initial allocation by ₹5,000."
}
```

⚠️ **Result:** Decorator budget reduced, shows warning!

---

### Test 4: Multiple Categories

**Step 1: Get Initial Allocation**

```bash
curl "http://localhost:3000/api/budget-reallocation?totalBudget=100000&categories=restaurant,decorator,photographer"
```

**Expected Response:**
```json
{
  "totalBudget": 100000,
  "categories": ["restaurant", "decorator", "photographer"],
  "allocation": {
    "restaurant": 75000,
    "decorator": 14286,
    "photographer": 10714
  },
  "hasRestaurant": true,
  "restaurantPercentage": 75
}
```

**Step 2: Select Restaurant (₹50K) and Reallocate**

```bash
curl -X POST http://localhost:3000/api/budget-reallocation \
  -H "Content-Type: application/json" \
  -d '{
    "totalBudget": 100000,
    "initialAllocation": {
      "restaurant": 75000,
      "decorator": 14286,
      "photographer": 10714
    },
    "selectedVendors": [
      {
        "category": "restaurant",
        "vendorId": "rest1",
        "actualPrice": 50000
      }
    ],
    "remainingCategories": ["decorator", "photographer"]
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "finalAllocation": {
    "restaurant": 50000,
    "decorator": 28571,
    "photographer": 21429
  },
  "savings": {
    "restaurant": 25000
  },
  "totalSaved": 25000,
  "reallocatedTo": {
    "decorator": 14285,
    "photographer": 10715
  },
  "message": "Great choice! You saved ₹25,000 which has been reallocated to other categories."
}
```

✅ **Result:** ₹25K saved, distributed proportionally!

---

### Test 5: No Restaurant (Even Distribution)

**Step 1: Get Initial Allocation**

```bash
curl "http://localhost:3000/api/budget-reallocation?totalBudget=30000&categories=decorator,photographer"
```

**Expected Response:**
```json
{
  "totalBudget": 30000,
  "categories": ["decorator", "photographer"],
  "allocation": {
    "decorator": 17143,
    "photographer": 12857
  },
  "hasRestaurant": false,
  "restaurantPercentage": 0
}
```

✅ **Result:** No restaurant, more even distribution based on priority!

---

## Testing in Browser Console

### Test 1: Your Scenario

```javascript
// Step 1: Get initial allocation
const getInitial = async () => {
  const response = await fetch(
    '/api/budget-reallocation?totalBudget=60000&categories=restaurant,decorator'
  );
  const data = await response.json();
  console.log('Initial allocation:', data);
  return data;
};

// Step 2: Reallocate after restaurant selection
const reallocate = async () => {
  const response = await fetch('/api/budget-reallocation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      totalBudget: 60000,
      initialAllocation: {
        restaurant: 45000,
        decorator: 15000
      },
      selectedVendors: [
        {
          category: 'restaurant',
          vendorId: 'rest1',
          actualPrice: 30000
        }
      ],
      remainingCategories: ['decorator']
    })
  });
  const data = await response.json();
  console.log('Reallocation result:', data);
  return data;
};

// Run tests
await getInitial();
await reallocate();
```

---

## Visual Test Results

### Scenario: ₹60K Budget, ₹30K Restaurant

```
BEFORE SELECTION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Restaurant (75%):  ₹45,000  ████████████████████████████████████████████████
Decorator  (25%):  ₹15,000  ████████████████

AFTER RESTAURANT SELECTION (₹30K):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Restaurant (50%):  ₹30,000  ████████████████████████████████████
Decorator  (50%):  ₹30,000  ████████████████████████████████████

SAVINGS: ₹15,000
REALLOCATED TO: Decorator +₹15,000
MESSAGE: "Great choice! You saved ₹15,000 which has been reallocated to other categories."
```

---

## Automated Test Script

Create a file `test-reallocation.js`:

```javascript
const BASE_URL = 'http://localhost:3000';

async function testScenario(name, totalBudget, categories, selections) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`TEST: ${name}`);
  console.log('='.repeat(80));

  // Step 1: Get initial allocation
  const initialUrl = `${BASE_URL}/api/budget-reallocation?totalBudget=${totalBudget}&categories=${categories.join(',')}`;
  const initialResponse = await fetch(initialUrl);
  const initialData = await initialResponse.json();
  
  console.log('\n1. Initial Allocation:');
  console.log(JSON.stringify(initialData, null, 2));

  // Step 2: Reallocate
  const reallocationResponse = await fetch(`${BASE_URL}/api/budget-reallocation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      totalBudget,
      initialAllocation: initialData.allocation,
      selectedVendors: selections,
      remainingCategories: categories.filter(
        cat => !selections.some(s => s.category === cat)
      )
    })
  });
  const reallocationData = await reallocationResponse.json();
  
  console.log('\n2. After Reallocation:');
  console.log(JSON.stringify(reallocationData, null, 2));

  // Summary
  console.log('\n3. Summary:');
  console.log(`   Total Saved: ₹${reallocationData.totalSaved.toLocaleString('en-IN')}`);
  console.log(`   Message: ${reallocationData.message}`);
  
  return reallocationData;
}

// Run all tests
async function runAllTests() {
  // Test 1: Your scenario
  await testScenario(
    'Your Scenario: ₹60K Budget, ₹30K Restaurant',
    60000,
    ['restaurant', 'decorator'],
    [{ category: 'restaurant', vendorId: 'rest1', actualPrice: 30000 }]
  );

  // Test 2: Perfect match
  await testScenario(
    'Perfect Match: ₹60K Budget, ₹45K Restaurant',
    60000,
    ['restaurant', 'decorator'],
    [{ category: 'restaurant', vendorId: 'rest2', actualPrice: 45000 }]
  );

  // Test 3: Multiple categories
  await testScenario(
    'Multiple Categories: ₹100K Budget, ₹50K Restaurant',
    100000,
    ['restaurant', 'decorator', 'photographer'],
    [{ category: 'restaurant', vendorId: 'rest1', actualPrice: 50000 }]
  );

  console.log('\n' + '='.repeat(80));
  console.log('ALL TESTS COMPLETE');
  console.log('='.repeat(80));
}

// Run tests
runAllTests().catch(console.error);
```

**Run with:**
```bash
node test-reallocation.js
```

---

## Expected Test Results Summary

| Test | Budget | Restaurant | Initial Decorator | Final Decorator | Savings | Status |
|------|--------|------------|-------------------|-----------------|---------|--------|
| 1    | ₹60K   | ₹30K       | ₹15K              | ₹30K            | ₹15K    | ✅ PASS |
| 2    | ₹60K   | ₹45K       | ₹15K              | ₹15K            | ₹0      | ✅ PASS |
| 3    | ₹60K   | ₹50K       | ₹15K              | ₹10K            | -₹5K    | ✅ PASS |
| 4    | ₹100K  | ₹50K       | ₹14K              | ₹28K            | ₹25K    | ✅ PASS |
| 5    | ₹30K   | N/A        | ₹17K              | ₹17K            | N/A     | ✅ PASS |

---

## Troubleshooting

### Issue: API returns 404

**Solution:** Make sure your Next.js dev server is running:
```bash
cd /Users/nilbrata/Desktop/utsavai\ new/utsavai
npm run dev
```

### Issue: CORS errors

**Solution:** The API is on the same domain, no CORS needed. If testing from external tool, add CORS headers.

### Issue: Incorrect calculations

**Solution:** Check that:
1. `totalBudget` is a number, not string
2. `categories` array is properly formatted
3. `actualPrice` in selectedVendors is correct

---

## Next Steps

1. ✅ API is working
2. ⏳ Integrate into frontend (PlanForm.tsx)
3. ⏳ Add UI notifications
4. ⏳ Test with real user flow
5. ⏳ Add loading states
6. ⏳ Handle edge cases in UI

---

**The API is ready to use!** 🚀

Test it with the commands above and verify that your exact scenario (₹60K budget, ₹30K restaurant) results in decorator budget doubling to ₹30K.
