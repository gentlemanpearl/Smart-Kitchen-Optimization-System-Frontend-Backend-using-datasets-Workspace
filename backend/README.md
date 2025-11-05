# Smart Kitchen Backend API

Backend API server for the Smart Kitchen Optimization System that serves recipe data from CSV datasets.

## Features

- ✅ RESTful API endpoints for recipes
- ✅ CSV data parsing and loading
- ✅ Image serving for dish images
- ✅ Search and filter functionality
- ✅ Pagination support
- ✅ CORS enabled for frontend integration

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

## Running the Server

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The server will start on `http://localhost:3001` by default.

## API Endpoints

### Health Check
- `GET /api/health` - Check server status and data loading stats

### Recipes
- `GET /api/recipes` - Get all recipes with optional filters
  - Query parameters:
    - `search` - Search term (name, ingredients, cuisine path)
    - `category` - Filter by category
    - `cuisine` - Filter by cuisine type
    - `limit` - Number of results (default: 50)
    - `offset` - Pagination offset (default: 0)

- `GET /api/recipes/:id` - Get recipe by ID

### Cuisine Recipes
- `GET /api/cuisine` - Get cuisine recipes with filters
  - Query parameters:
    - `search` - Search term
    - `cuisine` - Filter by cuisine
    - `course` - Filter by course type
    - `diet` - Filter by diet type
    - `limit` - Number of results
    - `offset` - Pagination offset

- `GET /api/cuisine/:name` - Get cuisine recipe by name

### Metadata
- `GET /api/categories` - Get all unique categories
- `GET /api/courses` - Get all unique courses
- `GET /api/diets` - Get all unique diet types

### Images
- `GET /api/images/:filename` - Serve dish images

## Data Sources

The backend loads data from CSV files located in:
- `../Recepie Backend datasets/recepie datasets/recipes.csv`
- `../Recepie Backend datasets/cuisine_updated.csv`
- `../Recepie Backend datasets/dishes-img-data/dishes-images/` (images)

## Environment Variables

Create a `.env` file in the backend directory (optional):
```
PORT=3001
```

## Example API Calls

```bash
# Get all recipes
curl http://localhost:3001/api/recipes

# Search recipes
curl http://localhost:3001/api/recipes?search=chicken&limit=10

# Get recipe by ID
curl http://localhost:3001/api/recipes/1

# Get categories
curl http://localhost:3001/api/categories

# Health check
curl http://localhost:3001/api/health
```

## Response Format

### Recipes List Response
```json
{
  "total": 100,
  "count": 10,
  "offset": 0,
  "limit": 10,
  "recipes": [...]
}
```

### Recipe Object
```json
{
  "id": "1",
  "name": "Recipe Name",
  "prepTime": 30,
  "cookTime": 45,
  "totalTime": "1 hrs 15 mins",
  "servings": 4,
  "ingredients": "...",
  "directions": "...",
  "rating": 4.5,
  "url": "https://...",
  "cuisinePath": "/Category/Subcategory",
  "imgSrc": "image.jpg"
}
```

## Integration with Frontend

The frontend is configured to connect to `http://localhost:3001` by default. You can change this by setting the `VITE_API_URL` environment variable in the frontend.

## Troubleshooting

1. **Images not loading**: Make sure the image directory path is correct relative to the backend folder
2. **CSV not loading**: Check that the CSV files exist in the expected location
3. **CORS errors**: Ensure CORS is enabled (it is by default)

## Development

To watch for file changes and auto-restart:
```bash
npm run dev
```

