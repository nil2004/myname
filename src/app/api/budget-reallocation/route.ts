import { NextResponse } from 'next/server';

/**
 * Smart Budget Reallocation API
 * 
 * This endpoint handles dynamic budget reallocation based on actual vendor prices.
 * When a customer selects a vendor that costs less than allocated, the unused budget
 * is reallocated to other categories.
 * 
 * Example: ₹60K budget, Restaurant allocated ₹45K but costs ₹30K
 * → Unused ₹15K is reallocated to Decorator (₹15K → ₹30K)
 */

export interface VendorSelection {
  category: string;
  vendorId: string;
  actualPrice: number;
}

export interface ReallocationRequest {
  totalBudget: number;
  initialAllocation: Record<string, number>;
  selectedVendors: VendorSelection[];
  remainingCategories: string[];
}

export interface ReallocationResponse {
  success: boolean;
  finalAllocation: Record<string, number>;
  savings: Record<string, number>;
  totalSaved: number;
  reallocatedTo: Record<string, number>;
  message: string;
}

export async function POST(request: Request) {
  try {
    const body: ReallocationRequest = await request.json();
    const { totalBudget, initialAllocation, selectedVendors, remainingCategories } = body;

    // Validate input
    if (!totalBudget || !initialAllocation || !selectedVendors) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate savings from selected vendors
    const savings: Record<string, number> = {};
    let totalSaved = 0;
    const finalAllocation: Record<string, number> = { ...initialAllocation };

    for (const selection of selectedVendors) {
      const allocated = initialAllocation[selection.category] || 0;
      const actual = selection.actualPrice;
      const saved = allocated - actual;

      if (saved > 0) {
        savings[selection.category] = saved;
        totalSaved += saved;
        finalAllocation[selection.category] = actual;
      } else {
        // Vendor costs more than allocated
        finalAllocation[selection.category] = actual;
      }
    }

    // Reallocate saved budget to remaining categories
    const reallocatedTo: Record<string, number> = {};

    if (totalSaved > 0 && remainingCategories.length > 0) {
      // Priority weights for reallocation
      const priorityWeights: Record<string, number> = {
        'restaurant': 30,
        'catering': 30,
        'decorator': 25,
        'photographer': 20,
        'cake': 10,
        'dj': 15,
        'entertainment': 8,
      };

      // Calculate total priority for remaining categories
      let totalPriority = 0;
      for (const category of remainingCategories) {
        totalPriority += priorityWeights[category.toLowerCase()] || 10;
      }

      // Distribute saved budget proportionally
      for (const category of remainingCategories) {
        const priority = priorityWeights[category.toLowerCase()] || 10;
        const proportion = priority / totalPriority;
        const additionalBudget = Math.round(totalSaved * proportion);

        reallocatedTo[category] = additionalBudget;
        finalAllocation[category] = (finalAllocation[category] || 0) + additionalBudget;
      }
    }

    // Generate message
    let message = '';
    if (totalSaved > 0) {
      message = `Great choice! You saved ₹${totalSaved.toLocaleString('en-IN')} which has been reallocated to other categories.`;
    } else if (totalSaved < 0) {
      message = `Selected vendors exceed initial allocation by ₹${Math.abs(totalSaved).toLocaleString('en-IN')}.`;
    } else {
      message = 'Perfect match! Vendors cost exactly as allocated.';
    }

    const response: ReallocationResponse = {
      success: true,
      finalAllocation,
      savings,
      totalSaved,
      reallocatedTo,
      message,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in budget reallocation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for calculating initial allocation with 75/25 rule
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const totalBudget = parseInt(searchParams.get('totalBudget') || '0');
    const categoriesParam = searchParams.get('categories') || '';

    const categories = categoriesParam.split(',').filter(Boolean);

    if (!totalBudget || categories.length === 0) {
      return NextResponse.json(
        { error: 'Missing totalBudget or categories' },
        { status: 400 }
      );
    }

    // Check if restaurant/catering is selected
    const hasRestaurant = categories.some(
      (cat) => cat.toLowerCase() === 'restaurant' || cat.toLowerCase() === 'catering'
    );

    const allocation: Record<string, number> = {};

    if (hasRestaurant) {
      // Restaurant gets 75% of budget
      const restaurantCategory = categories.find(
        (cat) => cat.toLowerCase() === 'restaurant' || cat.toLowerCase() === 'catering'
      );

      if (restaurantCategory) {
        const restaurantBudget = Math.round(totalBudget * 0.75);
        allocation[restaurantCategory] = restaurantBudget;

        // Remaining 25% distributed among other categories
        const remainingBudget = totalBudget - restaurantBudget;
        const otherCategories = categories.filter((cat) => cat !== restaurantCategory);

        if (otherCategories.length > 0) {
          // Priority weights for other categories
          const priorityWeights: Record<string, number> = {
            decorator: 25,
            photographer: 20,
            cake: 10,
            dj: 15,
            entertainment: 8,
          };

          let totalPriority = 0;
          for (const cat of otherCategories) {
            totalPriority += priorityWeights[cat.toLowerCase()] || 10;
          }

          for (const category of otherCategories) {
            const priority = priorityWeights[category.toLowerCase()] || 10;
            const proportion = priority / totalPriority;
            allocation[category] = Math.round(remainingBudget * proportion);
          }
        }
      }
    } else {
      // No restaurant - distribute more evenly based on priority
      const priorityWeights: Record<string, number> = {
        decorator: 25,
        photographer: 20,
        cake: 10,
        dj: 15,
        entertainment: 8,
      };

      let totalPriority = 0;
      for (const cat of categories) {
        totalPriority += priorityWeights[cat.toLowerCase()] || 10;
      }

      for (const category of categories) {
        const priority = priorityWeights[category.toLowerCase()] || 10;
        const proportion = priority / totalPriority;
        allocation[category] = Math.round(totalBudget * proportion);
      }
    }

    return NextResponse.json({
      totalBudget,
      categories,
      allocation,
      hasRestaurant,
      restaurantPercentage: hasRestaurant ? 75 : 0,
    });
  } catch (error) {
    console.error('Error in GET budget reallocation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
