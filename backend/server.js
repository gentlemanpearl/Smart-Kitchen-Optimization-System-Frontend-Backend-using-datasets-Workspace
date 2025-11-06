import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, existsSync } from 'fs';
import csv from 'csv-parser';
import { createReadStream } from 'fs';
import dotenv from 'dotenv';

// Load environment variables (optional)
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static images - prefer env path, else try multiple possible paths
const envImagesPath = process.env.IMAGES_DIR && existsSync(process.env.IMAGES_DIR)
  ? process.env.IMAGES_DIR
  : null;

const possibleImagePaths = envImagesPath ? [envImagesPath] : [
  // Primary location: imgs folder in Downloads
  path.join(process.env.USERPROFILE || '', 'Downloads', 'imgs', 'Recepie Backend datasets', 'dishes-img-data', 'dishes-images'),
  // Alternative locations
  path.join(__dirname, '..', '..', '..', 'Recepie Backend datasets', 'dishes-img-data', 'dishes-images'),
  path.join(process.cwd(), '..', 'Recepie Backend datasets', 'dishes-img-data', 'dishes-images'),
  path.join(__dirname, '..', '..', 'Recepie Backend datasets', 'dishes-img-data', 'dishes-images'),
  path.join(__dirname, '..', 'Recepie Backend datasets', 'dishes-img-data', 'dishes-images')
];

let imagesPath = null;
for (const imgPath of possibleImagePaths) {
  if (existsSync(imgPath)) {
    imagesPath = imgPath;
    break;
  }
}

if (imagesPath) {
  app.use('/api/images', express.static(imagesPath));
  console.log(`📸 Serving images from: ${imagesPath}`);
} else {
  console.warn('⚠️  Images directory not found. Image serving disabled.');
}

// Data storage
let recipesData = [];
let cuisineData = [];

// Load recipes CSV
function loadRecipes() {
  return new Promise((resolve, reject) => {
    const recipes = [];
    // Try env path first, then multiple possible paths
    const envRecipesPath = process.env.RECIPES_CSV_PATH && existsSync(process.env.RECIPES_CSV_PATH)
      ? process.env.RECIPES_CSV_PATH
      : null;

    const possiblePaths = envRecipesPath ? [envRecipesPath] : [
      // Primary location: imgs folder in Downloads
      path.join(process.env.USERPROFILE || '', 'Downloads', 'imgs', 'Recepie Backend datasets', 'recepie datasets', 'recipes.csv'),
      // Alternative locations
      path.join(__dirname, '..', '..', '..', 'Recepie Backend datasets', 'recepie datasets', 'recipes.csv'),
      path.join(process.cwd(), '..', 'Recepie Backend datasets', 'recepie datasets', 'recipes.csv'),
      path.join(__dirname, '..', '..', 'Recepie Backend datasets', 'recepie datasets', 'recipes.csv'),
      // Additional fallback: Downloads folder common absolute pattern
      path.join(process.env.USERPROFILE || '', 'Downloads', 'Recepie Backend datasets', 'recepie datasets', 'recipes.csv')
    ];
    
    let csvPath = null;
    for (const p of possiblePaths) {
      if (existsSync(p)) {
        csvPath = p;
        break;
      }
    }
    
    if (!csvPath) {
      if (process.env.ALLOW_EMPTY_DATA === 'true') {
        console.warn('⚠️  Recipes CSV not found. Starting with empty recipes (ALLOW_EMPTY_DATA=true).');
        recipesData = [];
        return resolve([]);
      }
      return reject(new Error(`Recipes CSV file not found. Tried paths: ${possiblePaths.join(', ')}`));
    }
    
    createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        // Clean and parse the data
        const recipe = {
          id: row[''] || recipes.length.toString(),
          name: row.recipe_name || '',
          prepTime: parseInt(row.prep_time) || 0,
          cookTime: parseInt(row.cook_time) || 0,
          totalTime: row.total_time || '',
          servings: parseInt(row.servings) || 1,
          yield: row.yield || '',
          ingredients: row.ingredients || '',
          directions: row.directions || '',
          rating: parseFloat(row.rating) || 0,
          url: row.url || '',
          cuisinePath: row.cuisine_path || '',
          nutrition: row.nutrition || '',
          timing: row.timing || '',
          imgSrc: row.img_src || ''
        };
        recipes.push(recipe);
      })
      .on('end', () => {
        recipesData = recipes;
        console.log(`Loaded ${recipes.length} recipes`);
        resolve(recipes);
      })
      .on('error', reject);
  });
}

// Load cuisine CSV
function loadCuisine() {
  return new Promise((resolve, reject) => {
    const cuisines = [];
    // Try env path first, then multiple possible paths
    const envCuisinePath = process.env.CUISINE_CSV_PATH && existsSync(process.env.CUISINE_CSV_PATH)
      ? process.env.CUISINE_CSV_PATH
      : null;

    const possiblePaths = envCuisinePath ? [envCuisinePath] : [
      // Primary location: imgs folder in Downloads
      path.join(process.env.USERPROFILE || '', 'Downloads', 'imgs', 'Recepie Backend datasets', 'cuisine_updated.csv'),
      // Alternative locations
      path.join(__dirname, '..', '..', '..', 'Recepie Backend datasets', 'cuisine_updated.csv'),
      path.join(process.cwd(), '..', 'Recepie Backend datasets', 'cuisine_updated.csv'),
      path.join(__dirname, '..', '..', 'Recepie Backend datasets', 'cuisine_updated.csv'),
      // Additional fallback: Downloads folder common absolute pattern
      path.join(process.env.USERPROFILE || '', 'Downloads', 'Recepie Backend datasets', 'cuisine_updated.csv')
    ];
    
    let csvPath = null;
    for (const p of possiblePaths) {
      if (existsSync(p)) {
        csvPath = p;
        break;
      }
    }
    
    if (!csvPath) {
      if (process.env.ALLOW_EMPTY_DATA === 'true') {
        console.warn('⚠️  Cuisine CSV not found. Starting with empty cuisine data (ALLOW_EMPTY_DATA=true).');
        cuisineData = [];
        return resolve([]);
      }
      return reject(new Error(`Cuisine CSV file not found. Tried paths: ${possiblePaths.join(', ')}`));
    }
    
    createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        const cuisine = {
          name: row.name || '',
          imageUrl: row.image_url || '',
          description: row.description || '',
          cuisine: row.cuisine || '',
          course: row.course || '',
          diet: row.diet || '',
          prepTime: row.prep_time || '',
          ingredients: row.ingredients || '',
          instructions: row.instructions || '',
          imageAvailable: row.image_available || 'false'
        };
        cuisines.push(cuisine);
      })
      .on('end', () => {
        cuisineData = cuisines;
        console.log(`Loaded ${cuisines.length} cuisine recipes`);
        resolve(cuisines);
      })
      .on('error', reject);
  });
}

// API Routes

// Get all recipes
app.get('/api/recipes', (req, res) => {
  const { search, category, cuisine, limit, offset } = req.query;
  
  let filtered = [...recipesData];
  
  // Search filter
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(recipe => 
      recipe.name.toLowerCase().includes(searchLower) ||
      recipe.ingredients.toLowerCase().includes(searchLower) ||
      recipe.cuisinePath.toLowerCase().includes(searchLower)
    );
  }
  
  // Category filter (from cuisine_path)
  if (category && category !== 'all') {
    filtered = filtered.filter(recipe => 
      recipe.cuisinePath.toLowerCase().includes(category.toLowerCase())
    );
  }
  
  // Cuisine filter
  if (cuisine && cuisine !== 'all') {
    filtered = filtered.filter(recipe => 
      recipe.cuisinePath.toLowerCase().includes(cuisine.toLowerCase())
    );
  }
  
  // Pagination
  const start = parseInt(offset) || 0;
  const end = limit ? start + parseInt(limit) : filtered.length;
  const paginated = filtered.slice(start, end);
  
  res.json({
    total: filtered.length,
    count: paginated.length,
    offset: start,
    limit: parseInt(limit) || filtered.length,
    recipes: paginated
  });
});

// Get recipe by ID
app.get('/api/recipes/:id', (req, res) => {
  const recipe = recipesData.find(r => r.id === req.params.id);
  if (!recipe) {
    return res.status(404).json({ error: 'Recipe not found' });
  }
  res.json(recipe);
});

// Get all cuisine recipes
app.get('/api/cuisine', (req, res) => {
  const { search, cuisine, course, diet, limit, offset } = req.query;
  
  let filtered = [...cuisineData];
  
  // Search filter
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(recipe => 
      recipe.name.toLowerCase().includes(searchLower) ||
      recipe.description.toLowerCase().includes(searchLower) ||
      recipe.ingredients.toLowerCase().includes(searchLower)
    );
  }
  
  // Cuisine filter
  if (cuisine && cuisine !== 'all') {
    filtered = filtered.filter(recipe => 
      recipe.cuisine.toLowerCase() === cuisine.toLowerCase()
    );
  }
  
  // Course filter
  if (course && course !== 'all') {
    filtered = filtered.filter(recipe => 
      recipe.course.toLowerCase() === course.toLowerCase()
    );
  }
  
  // Diet filter
  if (diet && diet !== 'all') {
    filtered = filtered.filter(recipe => 
      recipe.diet.toLowerCase() === diet.toLowerCase()
    );
  }
  
  // Pagination
  const start = parseInt(offset) || 0;
  const end = limit ? start + parseInt(limit) : filtered.length;
  const paginated = filtered.slice(start, end);
  
  res.json({
    total: filtered.length,
    count: paginated.length,
    offset: start,
    limit: parseInt(limit) || filtered.length,
    recipes: paginated
  });
});

// Get cuisine recipe by name
app.get('/api/cuisine/:name', (req, res) => {
  const recipe = cuisineData.find(r => 
    r.name.toLowerCase().includes(req.params.name.toLowerCase())
  );
  if (!recipe) {
    return res.status(404).json({ error: 'Recipe not found' });
  }
  res.json(recipe);
});

// Get unique categories/cuisines
app.get('/api/categories', (req, res) => {
  const categories = [...new Set(recipesData.map(r => {
    const pathParts = r.cuisinePath.split('/').filter(p => p);
    return pathParts[0] || 'Uncategorized';
  }))].filter(Boolean);
  
  res.json(categories.sort());
});

// Get unique courses
app.get('/api/courses', (req, res) => {
  const courses = [...new Set(cuisineData.map(r => r.course).filter(Boolean))];
  res.json(courses.sort());
});

// Get unique diets
app.get('/api/diets', (req, res) => {
  const diets = [...new Set(cuisineData.map(r => r.diet).filter(Boolean))];
  res.json(diets.sort());
});

// Dashboard stats endpoint
app.get('/api/dashboard/stats', (req, res) => {
  const totalRecipes = recipesData.length + cuisineData.length;
  
  res.json({
    totalRecipes,
    recipesCount: recipesData.length,
    cuisineRecipesCount: cuisineData.length,
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    recipesLoaded: recipesData.length,
    cuisineLoaded: cuisineData.length,
    timestamp: new Date().toISOString()
  });
});

// Start server
async function startServer() {
  try {
    await loadRecipes();
  } catch (error) {
    console.error('Error loading recipes:', error.message);
    if (process.env.ALLOW_EMPTY_DATA === 'true') {
      console.warn('Starting server with empty recipes due to ALLOW_EMPTY_DATA=true');
      recipesData = [];
    } else {
      console.error('Set ALLOW_EMPTY_DATA=true or provide correct RECIPES_CSV_PATH.');
      process.exit(1);
      return;
    }
  }

  try {
    await loadCuisine();
  } catch (error) {
    console.error('Error loading cuisine:', error.message);
    if (process.env.ALLOW_EMPTY_DATA === 'true') {
      console.warn('Starting server with empty cuisine due to ALLOW_EMPTY_DATA=true');
      cuisineData = [];
    } else {
      console.error('Set ALLOW_EMPTY_DATA=true or provide correct CUISINE_CSV_PATH.');
      process.exit(1);
      return;
    }
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Recipes loaded: ${recipesData.length}`);
    console.log(`🍽️  Cuisine recipes loaded: ${cuisineData.length}`);
  });
}

startServer();

