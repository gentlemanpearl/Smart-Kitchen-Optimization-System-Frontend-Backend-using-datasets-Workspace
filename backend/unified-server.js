// Unified Backend Server - Combines CSV recipes and MongoDB features
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import csv from 'csv-parser';
import { createReadStream } from 'fs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static images
const envImagesPath = process.env.IMAGES_DIR && existsSync(process.env.IMAGES_DIR)
  ? process.env.IMAGES_DIR
  : null;

const possibleImagePaths = envImagesPath ? [envImagesPath] : [
  path.join(process.env.USERPROFILE || '', 'Downloads', 'imgs', 'Recepie Backend datasets', 'dishes-img-data', 'dishes-images'),
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

// ========== CSV RECIPES BACKEND (Existing) ==========
let recipesData = [];
let cuisineData = [];

// Load recipes CSV
function loadRecipes() {
  return new Promise((resolve, reject) => {
    const recipes = [];
    const envRecipesPath = process.env.RECIPES_CSV_PATH && existsSync(process.env.RECIPES_CSV_PATH)
      ? process.env.RECIPES_CSV_PATH
      : null;

    const possiblePaths = envRecipesPath ? [envRecipesPath] : [
      path.join(process.env.USERPROFILE || '', 'Downloads', 'imgs', 'Recepie Backend datasets', 'recepie datasets', 'recipes.csv'),
      path.join(__dirname, '..', '..', '..', 'Recepie Backend datasets', 'recepie datasets', 'recipes.csv'),
      path.join(process.cwd(), '..', 'Recepie Backend datasets', 'recepie datasets', 'recipes.csv'),
      path.join(__dirname, '..', '..', 'Recepie Backend datasets', 'recepie datasets', 'recipes.csv'),
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
        console.warn('⚠️  Recipes CSV not found. Starting with empty recipes.');
        recipesData = [];
        return resolve([]);
      }
      return reject(new Error(`Recipes CSV file not found. Tried paths: ${possiblePaths.join(', ')}`));
    }
    
    createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
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
        console.log(`📊 Loaded ${recipes.length} CSV recipes`);
        resolve(recipes);
      })
      .on('error', reject);
  });
}

// Load cuisine CSV
function loadCuisine() {
  return new Promise((resolve, reject) => {
    const cuisines = [];
    const envCuisinePath = process.env.CUISINE_CSV_PATH && existsSync(process.env.CUISINE_CSV_PATH)
      ? process.env.CUISINE_CSV_PATH
      : null;

    const possiblePaths = envCuisinePath ? [envCuisinePath] : [
      path.join(process.env.USERPROFILE || '', 'Downloads', 'imgs', 'Recepie Backend datasets', 'cuisine_updated.csv'),
      path.join(__dirname, '..', '..', '..', 'Recepie Backend datasets', 'cuisine_updated.csv'),
      path.join(process.cwd(), '..', 'Recepie Backend datasets', 'cuisine_updated.csv'),
      path.join(__dirname, '..', '..', 'Recepie Backend datasets', 'cuisine_updated.csv'),
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
        console.warn('⚠️  Cuisine CSV not found. Starting with empty cuisine data.');
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
        console.log(`🍽️  Loaded ${cuisines.length} cuisine recipes`);
        resolve(cuisines);
      })
      .on('error', reject);
  });
}

// ========== MONGODB MODELS (From backend-swt) ==========
// Import MongoDB models
const InventoryItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, enum: ['Grains', 'Spices', 'Dairy', 'Vegetables', 'Fruits', 'Lentils', 'Oils', 'Other'] },
  currentQuantity: { type: Number, required: true, min: 0 },
  unit: { type: String, required: true, enum: ['g', 'kg', 'pieces', 'ml', 'l', 'tsp', 'tbsp', 'cup'] },
  threshold: { type: Number, default: 0 },
  perishable: { type: Boolean, default: false },
  isPresent: { type: Boolean, default: true }
}, { timestamps: true });

const InventoryItem = mongoose.model('InventoryItem', InventoryItemSchema);

// Meal Planner Schema
const MealPlanSchema = new mongoose.Schema({
  day: { type: String, required: true, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
  mealType: { type: String, required: true, enum: ['breakfast', 'lunch', 'dinner', 'snack'] },
  recipeName: { type: String, required: true },
  recipeId: { type: String, default: '' },
  notes: { type: String, default: '' },
  servings: { type: Number, default: 4 },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

const MealPlan = mongoose.model('MealPlan', MealPlanSchema);

// Waste Record Schema
const WasteRecordSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  category: { type: String, required: true, enum: ['vegetable', 'fruit', 'meat', 'dairy', 'grain', 'other'] },
  quantity: { type: Number, required: true, min: 0 },
  unit: { type: String, required: true, enum: ['g', 'kg', 'ml', 'l', 'pieces', 'cups', 'tbsp', 'tsp'] },
  reason: { type: String, required: true, enum: ['expired', 'spoiled', 'overcooked', 'leftover', 'other'] },
  dateWasted: { type: Date, default: Date.now },
  estimatedCost: { type: Number, default: 0, min: 0 },
  notes: { type: String, default: '' }
}, { timestamps: true });

const WasteRecord = mongoose.model('WasteRecord', WasteRecordSchema);

// Recipe Schema (from backend SWT)
const IngredientRequirementSchema = new mongoose.Schema({
  ingredientName: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 0 },
  unit: { type: String, required: true, enum: ['g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'pinch', 'pieces', 'cloves', 'slices', 'inch', 'cm', 'small', 'medium', 'large', 'bunch', 'handful'] }
});

const SubstituteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ratio: { type: Number, default: 1, min: 0.1 },
  notes: String
});

const RecipeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  description: { type: String, default: '' },
  category: { type: String, required: true, enum: ['Main Course', 'Appetizer', 'Dessert', 'Bread', 'Rice', 'Curry', 'Snack', 'Breakfast', 'Beverage'] },
  cuisine: { type: String, enum: ['Indian', 'Mexican', 'Thai', 'Chinese', 'Japanese'], default: 'Indian' },
  ingredients: [IngredientRequirementSchema],
  steps: { type: [String], required: true, validate: { validator: (steps) => steps.length > 0, message: 'At least one step is required' } },
  serves: { type: Number, required: true, min: 1 },
  preparationTime: { type: Number, required: true, min: 1 },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  foodType: { type: String, enum: ['Veg', 'Non-Veg'], default: 'Veg' },
  possibleSubstitutes: [{ original: String, substitutes: [SubstituteSchema] }],
  imageUrl: { type: String, default: '' },
  tags: [String]
}, { timestamps: true });

RecipeSchema.index({ name: 'text', description: 'text', tags: 'text' });
RecipeSchema.index({ category: 1, cuisine: 1 });

const Recipe = mongoose.model('Recipe', RecipeSchema);

// IoT Reading Schema (from backend SWT)
const IoTReadingSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  gas: { type: Number, default: 0 },
  weight: { type: Number, default: 0 },
  fire: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const IoTReading = mongoose.model('IoTReading', IoTReadingSchema);

// ========== CSV RECIPE ROUTES ==========
// Get all recipes (CSV)
app.get('/api/recipes', (req, res) => {
  const { search, category, cuisine, limit, offset } = req.query;
  
  let filtered = [...recipesData];
  
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(recipe => 
      recipe.name.toLowerCase().includes(searchLower) ||
      recipe.ingredients.toLowerCase().includes(searchLower) ||
      recipe.cuisinePath.toLowerCase().includes(searchLower)
    );
  }
  
  if (category && category !== 'all') {
    filtered = filtered.filter(recipe => 
      recipe.cuisinePath.toLowerCase().includes(category.toLowerCase())
    );
  }
  
  if (cuisine && cuisine !== 'all') {
    filtered = filtered.filter(recipe => 
      recipe.cuisinePath.toLowerCase().includes(cuisine.toLowerCase())
    );
  }
  
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

// Get recipe by ID (CSV)
app.get('/api/recipes/:id', (req, res) => {
  const recipe = recipesData.find(r => r.id === req.params.id);
  if (!recipe) {
    return res.status(404).json({ error: 'Recipe not found' });
  }
  res.json(recipe);
});

// Get cuisine recipes (CSV)
app.get('/api/cuisine', (req, res) => {
  const { search, cuisine, course, diet, limit, offset } = req.query;
  
  let filtered = [...cuisineData];
  
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(recipe => 
      recipe.name.toLowerCase().includes(searchLower) ||
      recipe.description.toLowerCase().includes(searchLower) ||
      recipe.ingredients.toLowerCase().includes(searchLower)
    );
  }
  
  if (cuisine && cuisine !== 'all') {
    filtered = filtered.filter(recipe => 
      recipe.cuisine.toLowerCase() === cuisine.toLowerCase()
    );
  }
  
  if (course && course !== 'all') {
    filtered = filtered.filter(recipe => 
      recipe.course.toLowerCase() === course.toLowerCase()
    );
  }
  
  if (diet && diet !== 'all') {
    filtered = filtered.filter(recipe => 
      recipe.diet.toLowerCase() === diet.toLowerCase()
    );
  }
  
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

// Get categories
app.get('/api/categories', (req, res) => {
  const categories = [...new Set(recipesData.map(r => {
    const pathParts = r.cuisinePath.split('/').filter(p => p);
    return pathParts[0] || 'Uncategorized';
  }))].filter(Boolean);
  
  res.json(categories.sort());
});

// Get courses
app.get('/api/courses', (req, res) => {
  const courses = [...new Set(cuisineData.map(r => r.course).filter(Boolean))];
  res.json(courses.sort());
});

// Get diets
app.get('/api/diets', (req, res) => {
  const diets = [...new Set(cuisineData.map(r => r.diet).filter(Boolean))];
  res.json(diets.sort());
});

// Dashboard stats endpoint
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const totalRecipes = recipesData.length + cuisineData.length;
    
    // Get inventory stats from MongoDB
    let totalInventoryItems = 0;
    let lowStockItems = 0;
    let recipesCanMake = 0;
    
    if (mongoose.connection.readyState === 1) {
      try {
        const inventory = await InventoryItem.find();
        totalInventoryItems = inventory.length;
        lowStockItems = inventory.filter(item => {
          if (!item.threshold || item.threshold === 0) return false;
          return item.currentQuantity <= item.threshold;
        }).length;
        
        // Simple recipe matching: count recipes that might be makeable
        // This is a simplified version - can be enhanced with recipeMatcher
        recipesCanMake = Math.floor(totalInventoryItems / 5); // Rough estimate
      } catch (mongoError) {
        console.warn('Could not get inventory stats:', mongoError.message);
      }
    }
    
    res.json({
      totalRecipes,
      recipesCount: recipesData.length,
      cuisineRecipesCount: cuisineData.length,
      totalInventoryItems,
      lowStockItems,
      recipesCanMake,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ 
      error: 'Failed to get dashboard stats',
      message: error.message 
    });
  }
});

// ========== MONGODB INVENTORY ROUTES ==========
// GET all inventory items
app.get('/api/inventory', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      // MongoDB not connected, return empty array or localStorage fallback
      return res.json([]);
    }
    const items = await InventoryItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET waste prediction (from backend SWT)
app.get('/api/inventory/waste-prediction', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json([]);
    }
    const inventory = await InventoryItem.find();
    
    const perishableCategories = ['Dairy', 'Vegetables', 'Fruits'];
    const nonPerishableCategories = ['Grains', 'Spices', 'Lentils', 'Oils'];
    
    const wasteItems = inventory
      .filter(item => {
        if (!item.threshold || item.threshold === 0) return false;
        
        const usageRatio = item.currentQuantity / item.threshold;
        
        if (perishableCategories.includes(item.category) || item.perishable) {
          const isLowUsage = usageRatio < 0.3;
          const isExcessQuantity = usageRatio > 2;
          return isLowUsage || isExcessQuantity;
        } else if (nonPerishableCategories.includes(item.category)) {
          const isVeryLowUsage = usageRatio < 0.1;
          const isVeryExcessQuantity = usageRatio > 5;
          return isVeryLowUsage || isVeryExcessQuantity;
        }
        
        return false;
      })
      .map(item => {
        const usageRatio = item.currentQuantity / item.threshold;
        let wasteRisk = 'medium';
        let reasons = [];
        const isPerishable = perishableCategories.includes(item.category) || item.perishable;

        if (isPerishable) {
          if (usageRatio < 0.3) {
            wasteRisk = 'high';
            reasons.push(`Low usage - might spoil before use`);
          }
          if (usageRatio > 2) {
            wasteRisk = 'high';
            reasons.push(`Excess quantity - might not get used before spoiling`);
          }
        } else {
          if (usageRatio < 0.1) {
            wasteRisk = 'low';
            reasons.push(`Very low usage - consider if you need this item`);
          }
          if (usageRatio > 5) {
            wasteRisk = 'medium';
            reasons.push(`Large quantity - might expire before use`);
          }
        }

        return {
          _id: item._id,
          name: item.name,
          category: item.category,
          currentQuantity: item.currentQuantity,
          unit: item.unit,
          threshold: item.threshold,
          perishable: isPerishable,
          wasteRisk,
          reasons,
          usagePercentage: Math.round(usageRatio * 100)
        };
      });

    res.json(wasteItems);
  } catch (error) {
    console.error('Waste prediction error:', error);
    res.status(500).json({ 
      message: 'Failed to generate waste prediction',
      error: error.message 
    });
  }
});

// GET single inventory item by ID
app.get('/api/inventory/:id', async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create new inventory item
app.post('/api/inventory', async (req, res) => {
  try {
    const newItem = new InventoryItem(req.body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update inventory item
app.put('/api/inventory/:id', async (req, res) => {
  try {
    const updatedItem = await InventoryItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE inventory item
app.delete('/api/inventory/:id', async (req, res) => {
  try {
    const deletedItem = await InventoryItem.findByIdAndDelete(req.params.id);
    
    if (!deletedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET total inventory count
app.get('/api/inventory/stats/total', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ total: 0 });
    }
    const total = await InventoryItem.countDocuments();
    res.json({ total });
  } catch (error) {
    console.error('Error fetching total inventory:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET low stock items
app.get('/api/inventory/low-stock', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ count: 0, items: [] });
    }
    const inventory = await InventoryItem.find();
    const lowStock = inventory
      .filter(item => {
        if (!item.threshold || item.threshold === 0) return false;
        return item.currentQuantity <= item.threshold;
      })
      .map(item => ({
        _id: item._id,
        name: item.name,
        category: item.category,
        currentQuantity: item.currentQuantity,
        unit: item.unit,
        threshold: item.threshold,
        percentage: Math.round((item.currentQuantity / item.threshold) * 100)
      }));
    
    res.json({
      count: lowStock.length,
      items: lowStock
    });
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    res.status(500).json({ message: error.message });
  }
});


// ========== MEAL PLANNER ROUTES ==========
// GET all meal plans
app.get('/api/meal-plans', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json([]);
    }
    const { day, mealType, week } = req.query;
    let filter = {};
    
    if (day) filter.day = day;
    if (mealType) filter.mealType = mealType;
    if (week) {
      // Filter by week (simplified - can be enhanced)
      const weekStart = new Date(week);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      filter.date = { $gte: weekStart, $lte: weekEnd };
    }
    
    const mealPlans = await MealPlan.find(filter).sort({ day: 1, mealType: 1 });
    res.json(mealPlans);
  } catch (error) {
    console.error('Error fetching meal plans:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET meal plan by ID
app.get('/api/meal-plans/:id', async (req, res) => {
  try {
    const mealPlan = await MealPlan.findById(req.params.id);
    if (!mealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }
    res.json(mealPlan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create meal plan
app.post('/api/meal-plans', async (req, res) => {
  try {
    const newMealPlan = new MealPlan(req.body);
    const savedMealPlan = await newMealPlan.save();
    res.status(201).json(savedMealPlan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update meal plan
app.put('/api/meal-plans/:id', async (req, res) => {
  try {
    const updatedMealPlan = await MealPlan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedMealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }
    
    res.json(updatedMealPlan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE meal plan
app.delete('/api/meal-plans/:id', async (req, res) => {
  try {
    const deletedMealPlan = await MealPlan.findByIdAndDelete(req.params.id);
    
    if (!deletedMealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }
    
    res.json({ message: 'Meal plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========== WASTE MANAGEMENT ROUTES ==========
// GET all waste records
app.get('/api/waste', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ records: [], stats: { totalWastedItems: 0, totalCost: 0, thisMonth: 0 } });
    }
    const { category, reason, startDate, endDate } = req.query;
    let filter = {};
    
    if (category) filter.category = category;
    if (reason) filter.reason = reason;
    if (startDate || endDate) {
      filter.dateWasted = {};
      if (startDate) filter.dateWasted.$gte = new Date(startDate);
      if (endDate) filter.dateWasted.$lte = new Date(endDate);
    }
    
    const wasteRecords = await WasteRecord.find(filter).sort({ dateWasted: -1 });
    
    // Calculate stats
    const totalWastedItems = wasteRecords.length;
    const totalCost = wasteRecords.reduce((sum, record) => sum + (record.estimatedCost || 0), 0);
    const thisMonth = wasteRecords.filter(record => {
      const recordDate = new Date(record.dateWasted);
      const now = new Date();
      return recordDate.getMonth() === now.getMonth() && 
             recordDate.getFullYear() === now.getFullYear();
    }).length;
    
    res.json({
      records: wasteRecords,
      stats: {
        totalWastedItems,
        totalCost,
        thisMonth
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET waste record by ID
app.get('/api/waste/:id', async (req, res) => {
  try {
    const wasteRecord = await WasteRecord.findById(req.params.id);
    if (!wasteRecord) {
      return res.status(404).json({ message: 'Waste record not found' });
    }
    res.json(wasteRecord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create waste record
app.post('/api/waste', async (req, res) => {
  try {
    const newWasteRecord = new WasteRecord(req.body);
    const savedWasteRecord = await newWasteRecord.save();
    res.status(201).json(savedWasteRecord);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update waste record
app.put('/api/waste/:id', async (req, res) => {
  try {
    const updatedWasteRecord = await WasteRecord.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedWasteRecord) {
      return res.status(404).json({ message: 'Waste record not found' });
    }
    
    res.json(updatedWasteRecord);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE waste record
app.delete('/api/waste/:id', async (req, res) => {
  try {
    const deletedWasteRecord = await WasteRecord.findByIdAndDelete(req.params.id);
    
    if (!deletedWasteRecord) {
      return res.status(404).json({ message: 'Waste record not found' });
    }
    
    res.json({ message: 'Waste record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET waste statistics
app.get('/api/waste/stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let filter = {};
    
    if (startDate || endDate) {
      filter.dateWasted = {};
      if (startDate) filter.dateWasted.$gte = new Date(startDate);
      if (endDate) filter.dateWasted.$lte = new Date(endDate);
    }
    
    const wasteRecords = await WasteRecord.find(filter);
    
    const totalWastedItems = wasteRecords.length;
    const totalCost = wasteRecords.reduce((sum, record) => sum + (record.estimatedCost || 0), 0);
    
    // This month stats
    const now = new Date();
    const thisMonthRecords = wasteRecords.filter(record => {
      const recordDate = new Date(record.dateWasted);
      return recordDate.getMonth() === now.getMonth() && 
             recordDate.getFullYear() === now.getFullYear();
    });
    const thisMonthCount = thisMonthRecords.length;
    const thisMonthCost = thisMonthRecords.reduce((sum, record) => sum + (record.estimatedCost || 0), 0);
    
    // Category breakdown
    const categoryBreakdown = {};
    wasteRecords.forEach(record => {
      categoryBreakdown[record.category] = (categoryBreakdown[record.category] || 0) + 1;
    });
    
    // Reason breakdown
    const reasonBreakdown = {};
    wasteRecords.forEach(record => {
      reasonBreakdown[record.reason] = (reasonBreakdown[record.reason] || 0) + 1;
    });
    
    res.json({
      totalWastedItems,
      totalCost,
      thisMonthCount,
      thisMonthCost,
      categoryBreakdown,
      reasonBreakdown
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========== MONGODB RECIPE ROUTES (from backend SWT) ==========
// These routes work with MongoDB Recipe model
// GET recipes with serving info
app.get('/api/recipes/with-serving-info', async (req, res) => {
  try {
    const { createRequire } = await import('module');
    const require = createRequire(import.meta.url);
    const { calculateAllRecipesServing } = require('./utils/servingCalculator.js');
    const inventory = await InventoryItem.find();
    const recipes = await Recipe.find();
    const recipesWithServing = await calculateAllRecipesServing(recipes, inventory);
    res.json(recipesWithServing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET recipes that can be made
app.get('/api/recipes/can-make', async (req, res) => {
  try {
    const { createRequire } = await import('module');
    const require = createRequire(import.meta.url);
    const { findMatchingRecipes } = require('./utils/recipeMatcher.js');
    const inventory = await InventoryItem.find();
    const recipes = await Recipe.find();
    const categorizedRecipes = await findMatchingRecipes(recipes, inventory);
    res.json(categorizedRecipes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET recipes by ingredients
app.get('/api/recipes/use-ingredients', async (req, res) => {
  try {
    const { createRequire } = await import('module');
    const require = createRequire(import.meta.url);
    const { findRecipesByIngredients } = require('./utils/recipeMatcher.js');
    const { ingredients } = req.query;
    if (!ingredients) {
      return res.status(400).json({ message: 'Ingredients parameter is required' });
    }
    const ingredientList = ingredients.split(',');
    const recipes = await Recipe.find();
    const matchingRecipes = await findRecipesByIngredients(recipes, ingredientList);
    res.json(matchingRecipes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET recipe suggestions - available
app.get('/api/recipes/suggestions/available', async (req, res) => {
  try {
    const { createRequire } = await import('module');
    const require = createRequire(import.meta.url);
    const { findMatchingRecipes } = require('./utils/recipeMatcher.js');
    const inventory = await InventoryItem.find();
    const recipes = await Recipe.find();
    const categorizedRecipes = await findMatchingRecipes(recipes, inventory);
    res.json(categorizedRecipes.canMakeNow);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET recipe suggestions - can make
app.get('/api/recipes/suggestions/can-make', async (req, res) => {
  try {
    const { createRequire } = await import('module');
    const require = createRequire(import.meta.url);
    const { findMatchingRecipes } = require('./utils/recipeMatcher.js');
    const inventory = await InventoryItem.find();
    const recipes = await Recipe.find();
    const categorizedRecipes = await findMatchingRecipes(recipes, inventory);
    res.json({
      canMakeNow: categorizedRecipes.canMakeNow,
      canMakeWithSubstitutes: categorizedRecipes.canMakeWithSubstitutes
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET MongoDB recipes (different from CSV recipes)
app.get('/api/recipes/mongodb', async (req, res) => {
  try {
    const { category, cuisine, difficulty, search } = req.query;
    let filter = {};
    if (category) filter.category = category;
    if (cuisine) filter.cuisine = cuisine;
    if (difficulty) filter.difficulty = difficulty;
    if (search) {
      filter.$text = { $search: search };
    }
    const recipes = await Recipe.find(filter).sort({ createdAt: -1 });
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create MongoDB recipe
app.post('/api/recipes/mongodb', async (req, res) => {
  try {
    const newRecipe = new Recipe(req.body);
    const savedRecipe = await newRecipe.save();
    res.status(201).json(savedRecipe);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET MongoDB recipe by ID
app.get('/api/recipes/mongodb/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET substitution suggestions for a recipe
app.get('/api/recipes/mongodb/:id/substitutes', async (req, res) => {
  try {
    const { createRequire } = await import('module');
    const require = createRequire(import.meta.url);
    const { findSubstitutes } = require('./utils/substituteFinder.js');
    const recipe = await Recipe.findById(req.params.id);
    const inventory = await InventoryItem.find();
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    const substituteInfo = await findSubstitutes(recipe, inventory);
    res.json(substituteInfo);
  } catch (error) {
    res.status(500).json({ message: error.message, error: error.message });
  }
});

// PUT update MongoDB recipe
app.put('/api/recipes/mongodb/:id', async (req, res) => {
  try {
    const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedRecipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.json(updatedRecipe);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE MongoDB recipe
app.delete('/api/recipes/mongodb/:id', async (req, res) => {
  try {
    const deletedRecipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!deletedRecipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET list of available cuisines (MongoDB)
app.get('/api/recipes/cuisines/list', async (req, res) => {
  try {
    const cuisines = await Recipe.distinct('cuisine');
    res.json(cuisines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========== IOT ROUTES (from backend SWT) ==========
// POST IoT sensor data
app.post('/api/iot/sensor', async (req, res) => {
  try {
    const { deviceId, gas, weight, fire } = req.body;
    const reading = new IoTReading({ deviceId, gas, weight, fire });
    await reading.save();
    
    let alert = null;
    if (fire) {
      alert = 'Fire detected in kitchen!';
    } else if (gas > 400) {
      alert = 'High gas concentration detected!';
    } else if (weight < 200) {
      alert = 'Low weight detected – check inventory!';
    }
    
    res.json({ success: true, message: 'Sensor data saved', alert });
  } catch (error) {
    console.error('Error saving IoT data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET latest IoT data
app.get('/api/iot/latest', async (req, res) => {
  try {
    const data = await IoTReading.find().sort({ createdAt: -1 }).limit(5);
    res.json(data);
  } catch (error) {
    console.error('Error fetching IoT data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== SPOONACULAR EXTERNAL API ROUTES (from backend SWT) ==========
// GET recipes from Spoonacular API
app.get('/api/external/recipes', async (req, res) => {
  try {
    const axios = (await import('axios')).default;
    const { cuisine, diet } = req.query;
    const apiKey = process.env.SPOONACULAR_API_KEY;
    
    if (!apiKey) {
      return res.status(400).json({ message: 'Spoonacular API key not configured' });
    }
    
    const NON_VEG_KEYWORDS = ['chicken', 'mutton', 'fish', 'egg', 'beef', 'pork', 'lamb', 'shrimp', 'prawn', 'tuna', 'salmon'];
    
    const response = await axios.get('https://api.spoonacular.com/recipes/complexSearch', {
      params: {
        apiKey,
        cuisine,
        addRecipeInformation: true,
        number: 20,
      },
    });
    
    const recipes = response.data.results.map((r) => {
      const ingredientsList = (r.extendedIngredients || [])
        .map((i) => i.name.toLowerCase())
        .join(' ');
      
      const hasNonVegKeyword = NON_VEG_KEYWORDS.some((word) => ingredientsList.includes(word));
      const isVegetarian = r.vegetarian && !hasNonVegKeyword;
      const foodType = isVegetarian ? 'Vegetarian' : 'Non-Vegetarian';
      
      return {
        name: r.title,
        description: r.summary?.replace(/<[^>]*>/g, ''),
        cuisine: cuisine || r.cuisines?.[0] || 'General',
        serves: r.servings,
        preparationTime: r.readyInMinutes,
        difficulty: r.readyInMinutes > 45 ? 'Hard' : r.readyInMinutes > 25 ? 'Medium' : 'Easy',
        imageUrl: r.image,
        foodType,
        category: 'Main Course',
        ingredients: (r.extendedIngredients || []).map((i) => ({
          ingredientName: i.name,
          quantity: i.amount || 1,
          unit: i.unit || 'unit',
        })),
        steps: r.analyzedInstructions?.[0]?.steps?.map((s) => s.step) || [],
        tags: [foodType],
      };
    });
    
    res.json(recipes);
  } catch (error) {
    console.error('Spoonacular fetch error:', error.message);
    res.status(500).json({ message: 'Error fetching recipes from Spoonacular API' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    recipesLoaded: recipesData.length,
    cuisineLoaded: cuisineData.length,
    mongoConnected: mongoose.connection.readyState === 1,
    timestamp: new Date().toISOString()
  });
});

// Start server
async function startServer() {
  try {
    // Load CSV data
    await loadRecipes();
    await loadCuisine();
    
    // Connect to MongoDB (optional - will work without it)
    const mongoUri = process.env.DB_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-kitchen';
    try {
      await mongoose.connect(mongoUri);
      console.log('✅ MongoDB connected successfully');
      console.log(`   Database: ${mongoUri}`);
    } catch (mongoError) {
      console.warn('⚠️  MongoDB connection failed (continuing without MongoDB):', mongoError.message);
      console.warn('   To enable MongoDB features:');
      console.warn('   1. Install MongoDB: https://www.mongodb.com/try/download/community');
      console.warn('   2. Start MongoDB service');
      console.warn('   3. Or set DB_URL environment variable to your MongoDB connection string');
      console.warn('   Inventory features will use localStorage fallback');
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Unified Server running on http://localhost:${PORT}`);
      console.log(`📊 CSV Recipes loaded: ${recipesData.length}`);
      console.log(`🍽️  Cuisine recipes loaded: ${cuisineData.length}`);
      console.log(`💾 MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Not connected'}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

startServer();

