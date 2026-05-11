/**
 * Frontend Integration Example for Smart Budget Reallocation
 * 
 * This file shows how to integrate the smart reallocation API
 * into your PlanForm component.
 * 
 * Copy the relevant parts into your actual PlanForm.tsx
 */

import { useState, useEffect } from 'react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface VendorSelection {
  category: string;
  vendorId: string;
  vendorName: string;
  actualPrice: number;
}

interface BudgetAllocation {
  [category: string]: number;
}

interface ReallocationResponse {
  success: boolean;
  finalAllocation: BudgetAllocation;
  savings: Record<string, number>;
  totalSaved: number;
  reallocatedTo: Record<string, number>;
  message: string;
}

// ============================================================================
// EXAMPLE COMPONENT
// ============================================================================

export function SmartBudgetReallocationExample() {
  // State management
  const [totalBudget, setTotalBudget] = useState(60000);
  const [selectedCategories, setSelectedCategories] = useState(['restaurant', 'decorator']);
  const [initialAllocation, setInitialAllocation] = useState<BudgetAllocation>({});
  const [currentAllocation, setCurrentAllocation] = useState<BudgetAllocation>({});
  const [selectedVendors, setSelectedVendors] = useState<VendorSelection[]>([]);
  const [reallocationMessage, setReallocationMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // ============================================================================
  // STEP 1: Get Initial Allocation (75/25 Rule)
  // ============================================================================
  
  useEffect(() => {
    const fetchInitialAllocation = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/budget-reallocation?totalBudget=${totalBudget}&categories=${selectedCategories.join(',')}`
        );
        const data = await response.json();
        
        setInitialAllocation(data.allocation);
        setCurrentAllocation(data.allocation);
        
        console.log('Initial allocation:', data.allocation);
      } catch (error) {
        console.error('Error fetching initial allocation:', error);
      } finally {
        setLoading(false);
      }
    };

    if (totalBudget && selectedCategories.length > 0) {
      fetchInitialAllocation();
    }
  }, [totalBudget, selectedCategories]);

  // ============================================================================
  // STEP 2: Handle Vendor Selection
  // ============================================================================
  
  const handleVendorSelect = async (
    category: string,
    vendorId: string,
    vendorName: string,
    actualPrice: number
  ) => {
    try {
      setLoading(true);

      // Add to selected vendors
      const newSelection: VendorSelection = {
        category,
        vendorId,
        vendorName,
        actualPrice,
      };

      const updatedSelections = [...selectedVendors, newSelection];
      setSelectedVendors(updatedSelections);

      // Calculate remaining categories
      const selectedCategoryNames = updatedSelections.map(v => v.category);
      const remaining = selectedCategories.filter(
        cat => !selectedCategoryNames.includes(cat)
      );

      // Trigger reallocation
      await reallocateBudget(updatedSelections, remaining);

    } catch (error) {
      console.error('Error selecting vendor:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // STEP 3: Reallocate Budget
  // ============================================================================
  
  const reallocateBudget = async (
    selections: VendorSelection[],
    remainingCategories: string[]
  ) => {
    try {
      const response = await fetch('/api/budget-reallocation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalBudget,
          initialAllocation,
          selectedVendors: selections,
          remainingCategories,
        }),
      });

      const data: ReallocationResponse = await response.json();

      if (data.success) {
        // Update current allocation
        setCurrentAllocation(data.finalAllocation);
        setReallocationMessage(data.message);

        // Log reallocation details
        console.log('Reallocation complete:', {
          finalAllocation: data.finalAllocation,
          totalSaved: data.totalSaved,
          reallocatedTo: data.reallocatedTo,
        });

        // Show notification to user
        if (data.totalSaved > 0) {
          showSuccessNotification(data);
        } else if (data.totalSaved < 0) {
          showWarningNotification(data);
        }
      }
    } catch (error) {
      console.error('Error reallocating budget:', error);
    }
  };

  // ============================================================================
  // STEP 4: Show Notifications
  // ============================================================================
  
  const showSuccessNotification = (data: ReallocationResponse) => {
    // You can use your preferred notification library
    console.log('✅ Success:', data.message);
    
    // Example: Show which categories got more budget
    Object.entries(data.reallocatedTo).forEach(([category, amount]) => {
      console.log(`  ${category}: +₹${amount.toLocaleString('en-IN')}`);
    });
  };

  const showWarningNotification = (data: ReallocationResponse) => {
    console.warn('⚠️ Warning:', data.message);
  };

  // ============================================================================
  // STEP 5: Fetch Vendors with Updated Budget
  // ============================================================================
  
  const fetchVendorsForCategory = async (category: string) => {
    const allocatedBudget = currentAllocation[category] || 0;
    
    try {
      const response = await fetch(
        `/api/vendors?category=${category}&budget=${allocatedBudget}&city=Dehradun`
      );
      const data = await response.json();
      return data.vendors;
    } catch (error) {
      console.error(`Error fetching vendors for ${category}:`, error);
      return [];
    }
  };

  // ============================================================================
  // RENDER UI
  // ============================================================================
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Smart Budget Reallocation Demo</h1>

      {/* Budget Input */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Budget Configuration</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Total Budget: ₹{totalBudget.toLocaleString('en-IN')}
            </label>
            <input
              type="range"
              min="10000"
              max="200000"
              step="5000"
              value={totalBudget}
              onChange={(e) => setTotalBudget(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Budget Allocation Display */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Budget Allocation</h2>
        
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : (
          <div className="space-y-3">
            {/* Initial Allocation */}
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Initial Allocation (75/25 Rule)
              </h3>
              {Object.entries(initialAllocation).map(([category, amount]) => (
                <div key={category} className="flex justify-between items-center py-2">
                  <span className="capitalize">{category}</span>
                  <span className="font-semibold">
                    ₹{amount.toLocaleString('en-IN')}
                    <span className="text-sm text-gray-500 ml-2">
                      ({Math.round((amount / totalBudget) * 100)}%)
                    </span>
                  </span>
                </div>
              ))}
            </div>

            {/* Current Allocation (after reallocation) */}
            {selectedVendors.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h3 className="text-sm font-medium text-green-600 mb-2">
                  Current Allocation (After Reallocation)
                </h3>
                {Object.entries(currentAllocation).map(([category, amount]) => {
                  const initial = initialAllocation[category] || 0;
                  const diff = amount - initial;
                  const isIncreased = diff > 0;
                  
                  return (
                    <div key={category} className="flex justify-between items-center py-2">
                      <span className="capitalize">{category}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          ₹{amount.toLocaleString('en-IN')}
                        </span>
                        {diff !== 0 && (
                          <span className={`text-sm ${isIncreased ? 'text-green-600' : 'text-red-600'}`}>
                            {isIncreased ? '+' : ''}₹{diff.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reallocation Message */}
      {reallocationMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">🎉 {reallocationMessage}</p>
        </div>
      )}

      {/* Selected Vendors */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Selected Vendors</h2>
        {selectedVendors.length === 0 ? (
          <p className="text-gray-500">No vendors selected yet</p>
        ) : (
          <div className="space-y-2">
            {selectedVendors.map((vendor, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b">
                <div>
                  <span className="font-medium">{vendor.vendorName}</span>
                  <span className="text-sm text-gray-500 ml-2">({vendor.category})</span>
                </div>
                <span className="font-semibold">
                  ₹{vendor.actualPrice.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Example Vendor Selection Buttons */}
      <div className="p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Select Vendors (Demo)</h2>
        
        {/* Restaurant Options */}
        <div className="mb-4">
          <h3 className="font-medium mb-2">Restaurant Options</h3>
          <div className="space-y-2">
            <button
              onClick={() => handleVendorSelect('restaurant', 'rest1', 'Olive Banquets', 30000)}
              className="w-full p-3 text-left border rounded hover:bg-gray-50"
              disabled={selectedVendors.some(v => v.category === 'restaurant')}
            >
              <div className="flex justify-between">
                <span>Olive Banquets</span>
                <span className="font-semibold">₹30,000</span>
              </div>
            </button>
            <button
              onClick={() => handleVendorSelect('restaurant', 'rest2', 'Royal Garden', 45000)}
              className="w-full p-3 text-left border rounded hover:bg-gray-50"
              disabled={selectedVendors.some(v => v.category === 'restaurant')}
            >
              <div className="flex justify-between">
                <span>Royal Garden Restaurant</span>
                <span className="font-semibold">₹45,000</span>
              </div>
            </button>
            <button
              onClick={() => handleVendorSelect('restaurant', 'rest3', 'Celebration Hub', 25000)}
              className="w-full p-3 text-left border rounded hover:bg-gray-50"
              disabled={selectedVendors.some(v => v.category === 'restaurant')}
            >
              <div className="flex justify-between">
                <span>Celebration Hub</span>
                <span className="font-semibold">₹25,000</span>
              </div>
            </button>
          </div>
        </div>

        {/* Decorator Options */}
        <div>
          <h3 className="font-medium mb-2">
            Decorator Options 
            {currentAllocation.decorator && (
              <span className="text-sm text-gray-500 ml-2">
                (Budget: ₹{currentAllocation.decorator.toLocaleString('en-IN')})
              </span>
            )}
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => handleVendorSelect('decorator', 'dec1', 'Celebration Decor Co.', 12000)}
              className="w-full p-3 text-left border rounded hover:bg-gray-50"
              disabled={selectedVendors.some(v => v.category === 'decorator')}
            >
              <div className="flex justify-between">
                <span>Celebration Decor Co.</span>
                <span className="font-semibold">₹12,000</span>
              </div>
            </button>
            <button
              onClick={() => handleVendorSelect('decorator', 'dec2', 'Dream Decorators', 28000)}
              className="w-full p-3 text-left border rounded hover:bg-gray-50"
              disabled={selectedVendors.some(v => v.category === 'decorator')}
            >
              <div className="flex justify-between">
                <span>Dream Decorators</span>
                <span className="font-semibold">₹28,000</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// USAGE INSTRUCTIONS
// ============================================================================

/**
 * HOW TO INTEGRATE INTO YOUR PLANFORM:
 * 
 * 1. Copy the state management section into your PlanForm component
 * 2. Copy the useEffect for initial allocation
 * 3. Copy the handleVendorSelect function
 * 4. Copy the reallocateBudget function
 * 5. Update your vendor selection UI to call handleVendorSelect
 * 6. Display the reallocation message to users
 * 7. Update vendor lists when budget changes
 * 
 * EXAMPLE INTEGRATION:
 * 
 * // In your existing PlanForm.tsx
 * const [currentAllocation, setCurrentAllocation] = useState({});
 * 
 * // When user clicks on a vendor card
 * <VendorCard
 *   onClick={() => handleVendorSelect(
 *     vendor.category,
 *     vendor.id,
 *     vendor.name,
 *     vendor.price
 *   )}
 * />
 * 
 * // Show reallocation notification
 * {reallocationMessage && (
 *   <div className="notification">
 *     {reallocationMessage}
 *   </div>
 * )}
 */

// ============================================================================
// TESTING SCENARIOS
// ============================================================================

/**
 * TEST SCENARIO 1: Your Exact Case
 * - Budget: ₹60,000
 * - Categories: Restaurant, Decorator
 * - Select: Olive Banquets (₹30,000)
 * - Expected: Decorator budget increases from ₹15,000 to ₹30,000
 * 
 * TEST SCENARIO 2: Over Budget
 * - Budget: ₹60,000
 * - Categories: Restaurant, Decorator
 * - Select: Royal Garden (₹45,000)
 * - Expected: No reallocation, perfect match
 * 
 * TEST SCENARIO 3: Multiple Categories
 * - Budget: ₹100,000
 * - Categories: Restaurant, Decorator, Photographer
 * - Select: Restaurant (₹50,000)
 * - Expected: ₹25,000 distributed between Decorator and Photographer
 */

export default SmartBudgetReallocationExample;
