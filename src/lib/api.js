// API Configuration: prefer VITE_API_URL, else use current host for LAN access
const runtimeHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${runtimeHost}:5000`;

// Fetch recipes from backend
export async function fetchRecipes(options = {}) {
  const { search = '', category = 'all', limit = 50, offset = 0 } = options;
  
  const params = new URLSearchParams({
    ...(search && { search }),
    ...(category && category !== 'all' && { category }),
    limit: limit.toString(),
    offset: offset.toString()
  });
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/recipes?${params}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching recipes:', error);
    throw error;
  }
}

// Fetch cuisine recipes
export async function fetchCuisineRecipes(options = {}) {
  const { search = '', cuisine = 'all', course = 'all', diet = 'all', limit = 50, offset = 0 } = options;
  
  const params = new URLSearchParams({
    ...(search && { search }),
    ...(cuisine && cuisine !== 'all' && { cuisine }),
    ...(course && course !== 'all' && { course }),
    ...(diet && diet !== 'all' && { diet }),
    limit: limit.toString(),
    offset: offset.toString()
  });
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/cuisine?${params}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching cuisine recipes:', error);
    throw error;
  }
}

// Fetch recipe by ID
export async function fetchRecipeById(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/recipes/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching recipe:', error);
    throw error;
  }
}

// Fetch categories
export async function fetchCategories() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/categories`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

// Fetch courses
export async function fetchCourses() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/courses`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
}

// Fetch diets
export async function fetchDiets() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/diets`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching diets:', error);
    return [];
  }
}

// Get image URL
export function getImageUrl(imageSrc) {
  if (!imageSrc) return null;
  
  // If it's already a full URL, return it
  if (imageSrc.startsWith('http')) {
    return imageSrc;
  }
  
  // If it's a local image path, try to get from backend
  const imageName = imageSrc.split('/').pop();
  return `${API_BASE_URL}/api/images/${imageName}`;
}

// Fetch dashboard statistics
export async function fetchDashboardStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/stats`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
}

// Check backend health
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    if (!response.ok) {
      return false;
    }
    const data = await response.json();
    return data.status === 'ok';
  } catch (error) {
    return false;
  }
}

// ========== INVENTORY API FUNCTIONS ==========
// Fetch all inventory items
export async function fetchInventoryItems() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/inventory`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching inventory:', error);
    // Fallback to localStorage if backend fails
    const saved = localStorage.getItem('kitchenInventory');
    return saved ? JSON.parse(saved) : [];
  }
}

// Create inventory item
export async function createInventoryItem(item) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating inventory item:', error);
    throw error;
  }
}

// Update inventory item
export async function updateInventoryItem(id, item) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/inventory/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating inventory item:', error);
    throw error;
  }
}

// Delete inventory item
export async function deleteInventoryItem(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/inventory/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    throw error;
  }
}

// Fetch waste prediction
export async function fetchWastePrediction() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/inventory/waste-prediction`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching waste prediction:', error);
    return [];
  }
}

// Fetch total inventory count
export async function fetchTotalInventory() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/inventory/stats/total`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.total || 0;
  } catch (error) {
    console.error('Error fetching total inventory:', error);
    // Fallback to localStorage
    const saved = localStorage.getItem('kitchenInventory');
    return saved ? JSON.parse(saved).length : 0;
  }
}

// Fetch low stock items
export async function fetchLowStockItems() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/inventory/low-stock`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    // Fallback to localStorage
    const saved = localStorage.getItem('kitchenInventory');
    if (saved) {
      const items = JSON.parse(saved);
      return items
        .filter(item => {
          if (!item.threshold || item.threshold === 0) return false;
          return (item.quantity || item.currentQuantity || 0) <= item.threshold;
        })
        .map(item => ({
          _id: item.id,
          name: item.name,
          category: item.category,
          currentQuantity: item.quantity || item.currentQuantity,
          unit: item.unit,
          threshold: item.threshold,
          percentage: Math.round(((item.quantity || item.currentQuantity) / item.threshold) * 100)
        }));
    }
    return [];
  }
}

// ========== MEAL PLANNER API FUNCTIONS ==========
// Fetch all meal plans
export async function fetchMealPlans(options = {}) {
  try {
    const { day, mealType, week } = options;
    const params = new URLSearchParams();
    if (day) params.append('day', day);
    if (mealType) params.append('mealType', mealType);
    if (week) params.append('week', week);
    
    const response = await fetch(`${API_BASE_URL}/api/meal-plans?${params}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching meal plans:', error);
    // Fallback to localStorage
    const saved = localStorage.getItem('mealPlans');
    return saved ? JSON.parse(saved) : [];
  }
}

// Create meal plan
export async function createMealPlan(mealPlan) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/meal-plans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mealPlan)
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating meal plan:', error);
    throw error;
  }
}

// Update meal plan
export async function updateMealPlan(id, mealPlan) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/meal-plans/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mealPlan)
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating meal plan:', error);
    throw error;
  }
}

// Delete meal plan
export async function deleteMealPlan(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/meal-plans/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error deleting meal plan:', error);
    throw error;
  }
}

// ========== WASTE MANAGEMENT API FUNCTIONS ==========
// Fetch all waste records
export async function fetchWasteRecords(options = {}) {
  try {
    const { category, reason, startDate, endDate } = options;
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (reason) params.append('reason', reason);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await fetch(`${API_BASE_URL}/api/waste?${params}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching waste records:', error);
    // Fallback to localStorage
    const saved = localStorage.getItem('wasteItems');
    const records = saved ? JSON.parse(saved) : [];
    return {
      records,
      stats: {
        totalWastedItems: records.length,
        totalCost: records.reduce((sum, r) => sum + (r.estimatedCost || 0), 0),
        thisMonth: records.filter(r => {
          const recordDate = new Date(r.dateWasted);
          const now = new Date();
          return recordDate.getMonth() === now.getMonth() && 
                 recordDate.getFullYear() === now.getFullYear();
        }).length
      }
    };
  }
}

// Create waste record
export async function createWasteRecord(wasteRecord) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/waste`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(wasteRecord)
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating waste record:', error);
    throw error;
  }
}

// Update waste record
export async function updateWasteRecord(id, wasteRecord) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/waste/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(wasteRecord)
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating waste record:', error);
    throw error;
  }
}

// Delete waste record
export async function deleteWasteRecord(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/waste/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error deleting waste record:', error);
    throw error;
  }
}

// Fetch waste statistics
export async function fetchWasteStats(options = {}) {
  try {
    const { startDate, endDate } = options;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await fetch(`${API_BASE_URL}/api/waste/stats?${params}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching waste stats:', error);
    return {
      totalWastedItems: 0,
      totalCost: 0,
      thisMonthCount: 0,
      thisMonthCost: 0,
      categoryBreakdown: {},
      reasonBreakdown: {}
    };
  }
}

