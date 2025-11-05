// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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

