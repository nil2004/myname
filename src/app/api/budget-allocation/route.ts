import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventType = searchParams.get('eventType') || 'birthday';
    const categoriesParam = searchParams.get('categories') || '';
    const totalBudget = parseInt(searchParams.get('totalBudget') || '10000');

    const categories = categoriesParam.split(',').filter(Boolean);

    if (categories.length === 0) {
      return NextResponse.json({ 
        error: 'No categories provided' 
      }, { status: 400 });
    }

    // Budget allocation percentages based on event type and category
    // IMPROVED: Restaurant/Catering gets majority of budget
    const allocationRules: Record<string, Record<string, number>> = {
      birthday: {
        restaurant: 70,  // Restaurant gets 70% (majority)
        catering: 70,    // Catering gets 70% (majority)
        decorator: 20,   // Remaining categories share the rest
        photographer: 15,
        cake: 8,
        dj: 10,
        entertainment: 5,
      },
      wedding: {
        restaurant: 65,
        catering: 65,
        decorator: 25,
        photographer: 20,
        dj: 10,
        entertainment: 5,
        cake: 5,
      },
      corporate: {
        restaurant: 60,
        catering: 60,
        decorator: 20,
        photographer: 15,
        dj: 15,
        entertainment: 10,
      },
    };

    const rules = allocationRules[eventType] || allocationRules.birthday;

    // Calculate total percentage for requested categories
    let totalPercentage = 0;
    const hasRestaurant = categories.includes('restaurant') || categories.includes('catering');
    
    categories.forEach(category => {
      totalPercentage += rules[category] || 0;
    });

    // If restaurant/catering is selected, give it priority
    // Otherwise, distribute more evenly
    let allocation: Record<string, number> = {};
    
    if (hasRestaurant) {
      // Restaurant gets 70-80% of budget
      const restaurantCategory = categories.find(c => c === 'restaurant' || c === 'catering');
      if (restaurantCategory) {
        const restaurantBudget = Math.round(totalBudget * 0.75); // 75% for restaurant
        allocation[restaurantCategory] = restaurantBudget;
        
        // Remaining budget distributed among other categories
        const remainingBudget = totalBudget - restaurantBudget;
        const otherCategories = categories.filter(c => c !== restaurantCategory);
        
        if (otherCategories.length > 0) {
          // Distribute remaining budget proportionally
          let otherTotal = 0;
          otherCategories.forEach(cat => {
            otherTotal += rules[cat] || 0;
          });
          
          otherCategories.forEach(category => {
            const percentage = otherTotal > 0 ? (rules[category] || 0) / otherTotal : 1 / otherCategories.length;
            allocation[category] = Math.round(remainingBudget * percentage);
          });
        }
      }
    } else {
      // No restaurant - distribute more evenly based on priority
      const normalizationFactor = totalPercentage > 0 ? 100 / totalPercentage : 1;
      
      categories.forEach(category => {
        const percentage = (rules[category] || 0) * normalizationFactor;
        allocation[category] = Math.round((totalBudget * percentage) / 100);
      });
    }

    return NextResponse.json({
      eventType,
      totalBudget,
      categories,
      allocation,
      percentages: categories.reduce((acc, cat) => {
        acc[cat] = Math.round((allocation[cat] / totalBudget) * 100);
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (error) {
    console.error('Error in budget allocation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
