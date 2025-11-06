# Backend Integration Guide

## Overview

The backend API has been successfully created and integrated with your frontend. The backend serves recipe data from your CSV datasets and dish images.

## Quick Start

### 1. Start the Backend Server

Open a terminal and run:

```bash
cd backend
npm start
```

The server will start on `http://localhost:3001`

### 2. Start the Frontend

Open another terminal and run:

```bash
npm run dev
```

The frontend will start on `http://localhost:8080` (or the port shown)

## What's Been Created

### Backend (`backend/` folder)
- ✅ Express.js API server (`server.js`)
- ✅ CSV parsing for recipes and cuisine data
- ✅ RESTful API endpoints
- ✅ Image serving for dish images
- ✅ CORS enabled for frontend integration
- ✅ Search and filter functionality
- ✅ Pagination support

### Frontend Updates
- ✅ API utility functions (`src/lib/api.js`)
- ✅ Updated Recipes component to fetch from backend
- ✅ Loading and error states
- ✅ Image display integration
- ✅ Backend health check

## API Endpoints

### Main Endpoints:
- `GET /api/recipes` - Get recipes with search/filter
- `GET /api/recipes/:id` - Get recipe by ID
- `GET /api/cuisine` - Get cuisine recipes
- `GET /api/categories` - Get all categories
- `GET /api/courses` - Get all courses
- `GET /api/diets` - Get all diets
- `GET /api/images/:filename` - Serve dish images
- `GET /api/health` - Health check

## Data Sources

The backend loads data from:
- `Recepie Backend datasets/recepie datasets/recipes.csv`
- `Recepie Backend datasets/cuisine_updated.csv`
- `Recepie Backend datasets/dishes-img-data/dishes-images/` (images)

## Features

### Search & Filter
- Search by recipe name, ingredients, or description
- Filter by category/cuisine
- Pagination support

### Image Display
- Automatic image loading from backend
- Fallback handling for missing images
- Support for both local and external image URLs

### Error Handling
- Backend connection status check
- User-friendly error messages
- Loading states during data fetch

## Troubleshooting

### Backend won't start
1. Check that Node.js is installed: `node --version`
2. Install dependencies: `cd backend && npm install`
3. Check that CSV files exist in the expected location

### Images not loading
- The backend tries multiple paths to find images
- Check console logs for image path information
- Ensure images directory exists relative to backend folder

### Frontend can't connect to backend
1. Ensure backend is running on port 3001
2. Check browser console for CORS errors
3. Verify `VITE_API_URL` environment variable if using custom URL

## Next Steps

### Recommended Enhancements:
1. **Recipe Details Page** - Create a detailed view for individual recipes
2. **Inventory Integration** - Check if ingredients are available in inventory
3. **Favorites** - Add ability to favorite recipes
4. **Recipe Ratings** - Allow users to rate recipes
5. **Advanced Filters** - Add more filtering options (diet, cuisine, course)

## Development

To run both frontend and backend simultaneously:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev  # Auto-reload on changes
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

## Production Deployment

For production:
1. Build the frontend: `npm run build`
2. Set environment variables for API URL
3. Deploy backend to a Node.js hosting service
4. Deploy frontend to a static hosting service

## API Response Examples

### Get Recipes
```json
{
  "total": 100,
  "count": 10,
  "offset": 0,
  "limit": 10,
  "recipes": [
    {
      "id": "1",
      "name": "Recipe Name",
      "prepTime": 30,
      "cookTime": 45,
      "servings": 4,
      "rating": 4.5,
      "imgSrc": "image.jpg"
    }
  ]
}
```

## Support

If you encounter issues:
1. Check backend console for errors
2. Check browser console for frontend errors
3. Verify CSV file paths are correct
4. Ensure all dependencies are installed

