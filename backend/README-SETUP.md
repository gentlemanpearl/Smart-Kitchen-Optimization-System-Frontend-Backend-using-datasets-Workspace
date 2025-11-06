# Smart Kitchen Backend Setup Guide

## MongoDB Setup

### Option 1: Install MongoDB Locally

1. **Download MongoDB Community Server**
   - Visit: https://www.mongodb.com/try/download/community
   - Download and install MongoDB for Windows

2. **Start MongoDB Service**
   - MongoDB should start automatically after installation
   - Or start manually: `net start MongoDB` (Windows)

3. **Verify MongoDB is Running**
   - Default connection: `mongodb://localhost:27017`
   - The backend will automatically connect to: `mongodb://localhost:27017/smart-kitchen`

### Option 2: Use MongoDB Atlas (Cloud)

1. **Create Free MongoDB Atlas Account**
   - Visit: https://www.mongodb.com/cloud/atlas
   - Create a free cluster

2. **Get Connection String**
   - Copy your MongoDB Atlas connection string
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/smart-kitchen`

3. **Set Environment Variable**
   ```bash
   # Create .env file in backend folder
   DB_URL=mongodb+srv://username:password@cluster.mongodb.net/smart-kitchen
   ```

## Seed Database with Initial Data

After MongoDB is set up, run the seed script to populate the database:

```bash
cd backend
npm run seed
```

This will create:
- 20 inventory items
- 3 waste records
- 3 sample meal plans

## Running the Backend

```bash
cd backend
npm run unified
```

Or for development with auto-reload:
```bash
npm run unified:dev
```

## Environment Variables

Create a `.env` file in the `backend` folder:

```env
# MongoDB Connection (optional - defaults to localhost)
DB_URL=mongodb://localhost:27017/smart-kitchen
# or for MongoDB Atlas:
# DB_URL=mongodb+srv://username:password@cluster.mongodb.net/smart-kitchen

# Server Port (optional - defaults to 5000)
PORT=5000

# Recipe CSV Paths (optional)
RECIPES_CSV_PATH=C:\Users\pkc14\Downloads\imgs\Recepie Backend datasets\recepie datasets\recipes.csv
CUISINE_CSV_PATH=C:\Users\pkc14\Downloads\imgs\Recepie Backend datasets\recepie datasets\cuisine.csv
IMAGES_DIR=C:\Users\pkc14\Downloads\imgs\Recepie Backend datasets\dishes-img-data\dishes-images

# Allow server to start without CSV files
ALLOW_EMPTY_DATA=true

# Spoonacular API Key (optional - for external recipe API)
SPOONACULAR_API_KEY=your_api_key_here
```

## API Endpoints

### Inventory
- `GET /api/inventory` - Get all inventory items
- `POST /api/inventory` - Create inventory item
- `GET /api/inventory/:id` - Get inventory item by ID
- `PUT /api/inventory/:id` - Update inventory item
- `DELETE /api/inventory/:id` - Delete inventory item
- `GET /api/inventory/low-stock` - Get low stock items
- `GET /api/inventory/stats/total` - Get total inventory count
- `GET /api/inventory/waste-prediction` - Get waste predictions

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Waste Management
- `GET /api/waste` - Get all waste records
- `POST /api/waste` - Create waste record
- `GET /api/waste/stats` - Get waste statistics

### Meal Planner
- `GET /api/meal-plans` - Get all meal plans
- `POST /api/meal-plans` - Create meal plan

### Recipes
- `GET /api/recipes` - Get CSV recipes
- `GET /api/recipes/mongodb` - Get MongoDB recipes
- `GET /api/recipes/can-make` - Get recipes that can be made

## Troubleshooting

### MongoDB Connection Failed
- Make sure MongoDB is installed and running
- Check if MongoDB service is started: `net start MongoDB` (Windows)
- Verify connection string in `.env` file
- The backend will continue to work without MongoDB (using localStorage fallback)

### No Data Showing
1. Make sure MongoDB is connected
2. Run the seed script: `npm run seed`
3. Check browser console for API errors
4. Verify backend is running on port 5000
5. Check frontend API URL is set to `http://localhost:5000`

