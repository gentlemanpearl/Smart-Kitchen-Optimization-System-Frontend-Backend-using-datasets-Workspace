# Backend SWT Integration Guide

## Overview

Successfully integrated the "backend SWT" folder with all its MongoDB-based features into the main Smart Kitchen Optimization System. The system now has a unified backend that combines CSV recipe data with MongoDB inventory management.

## What Was Integrated

### 1. **Unified Backend Server** (`backend/unified-server.js`)
   - Combines CSV recipe backend (port 3001) with MongoDB inventory features
   - Supports both CSV recipes (5,556 recipes) and MongoDB inventory
   - Graceful fallback if MongoDB is not available

### 2. **MongoDB Inventory Management**
   - Full CRUD operations for inventory items
   - Categories: Grains, Spices, Dairy, Vegetables, Fruits, Lentils, Oils, Other
   - Perishable item tracking
   - Threshold-based low stock detection

### 3. **Waste Prediction**
   - AI-powered waste prediction based on usage patterns
   - Different logic for perishable vs non-perishable items
   - Risk levels: high, medium, low
   - Usage percentage calculations

### 4. **Frontend Integration**
   - **Inventory Page**: Now uses MongoDB backend with localStorage fallback
   - **Waste Management Page**: Integrated waste prediction feature
   - **Dashboard**: Updated to fetch from backend
   - **API Functions**: Added inventory CRUD and waste prediction endpoints

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

This will install mongoose for MongoDB support.

### 2. Configure MongoDB (Optional)

Create a `.env` file in the `backend` folder:

```env
DB_URL=mongodb://localhost:27017/smart-kitchen
# OR
MONGODB_URI=mongodb://localhost:27017/smart-kitchen

# Optional: CSV paths (if different from defaults)
RECIPES_CSV_PATH=C:\path\to\recipes.csv
CUISINE_CSV_PATH=C:\path\to\cuisine_updated.csv
IMAGES_DIR=C:\path\to\dishes-images

# Allow server to start without CSV files
ALLOW_EMPTY_DATA=false
```

### 3. Start the Unified Server

```bash
cd backend
npm run unified
```

Or for development with auto-reload:

```bash
npm run unified:dev
```

The server will:
- Load CSV recipes from the datasets folder
- Connect to MongoDB (if configured)
- Serve both CSV recipes and MongoDB inventory on port 3001

### 4. Start Frontend

```bash
npm run dev
```

## API Endpoints

### CSV Recipe Endpoints (Existing)
- `GET /api/recipes` - Get all recipes with search/filter
- `GET /api/recipes/:id` - Get recipe by ID
- `GET /api/cuisine` - Get cuisine recipes
- `GET /api/categories` - Get all categories
- `GET /api/courses` - Get all courses
- `GET /api/diets` - Get all diets
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/images/:filename` - Serve dish images

### MongoDB Inventory Endpoints (New)
- `GET /api/inventory` - Get all inventory items
- `GET /api/inventory/:id` - Get inventory item by ID
- `POST /api/inventory` - Create new inventory item
- `PUT /api/inventory/:id` - Update inventory item
- `DELETE /api/inventory/:id` - Delete inventory item
- `GET /api/inventory/waste-prediction` - Get waste predictions

### Health Check
- `GET /api/health` - Check server status and MongoDB connection

## Features

### Inventory Management
- **Backend Storage**: MongoDB (with localStorage fallback)
- **Categories**: 8 predefined categories
- **Units**: g, kg, pieces, ml, l, tsp, tbsp, cup
- **Perishable Tracking**: Mark items as perishable
- **Threshold Alerts**: Low stock detection

### Waste Prediction
- **Smart Analysis**: Different rules for perishable vs non-perishable
- **Risk Levels**: High, medium, low
- **Usage Patterns**: Tracks usage ratio vs threshold
- **Reasons**: Explains why items are at risk

### Frontend Features
- **Automatic Fallback**: Uses localStorage if backend unavailable
- **Real-time Updates**: Custom events for inventory changes
- **Loading States**: Proper loading indicators
- **Error Handling**: Graceful error handling with fallbacks

## Data Flow

1. **Inventory**: Frontend → MongoDB Backend → MongoDB Database
2. **Recipes**: Frontend → CSV Backend → CSV Files
3. **Waste Prediction**: Frontend → MongoDB Backend → Analyzes Inventory → Returns Predictions

## MongoDB Schema

### InventoryItem
```javascript
{
  name: String (required),
  category: String (enum: Grains, Spices, Dairy, Vegetables, Fruits, Lentils, Oils, Other),
  currentQuantity: Number (required, min: 0),
  unit: String (enum: g, kg, pieces, ml, l, tsp, tbsp, cup),
  threshold: Number (default: 0),
  perishable: Boolean (default: false),
  isPresent: Boolean (default: true),
  timestamps: true
}
```

## Notes

- The unified server works **without MongoDB** - it will use localStorage fallback
- CSV recipes continue to work as before
- All inventory operations gracefully fall back to localStorage if MongoDB is unavailable
- The backend SWT utilities (recipe matching, serving calculator, substitute finder) are available in `backend-swt/utils/` for future integration

## Next Steps (Optional Enhancements)

1. **Recipe Matching**: Integrate `recipeMatcher.js` to show "can make" recipes
2. **Serving Calculator**: Use `servingCalculator.js` to calculate max servings
3. **Substitute Finder**: Integrate `substituteFinder.js` for ingredient substitutions
4. **IoT Integration**: Add IoT sensor data endpoints
5. **Spoonacular API**: Integrate external recipe API

## Troubleshooting

### MongoDB Connection Issues
- Check if MongoDB is running: `mongod --version`
- Verify connection string in `.env`
- Server will continue without MongoDB (uses localStorage)

### CSV File Not Found
- Check file paths in `.env` or use default paths
- Set `ALLOW_EMPTY_DATA=true` to start without CSV files

### Frontend Can't Connect
- Ensure backend is running on port 3001
- Check browser console for CORS errors
- Verify `VITE_API_URL` if using custom URL

