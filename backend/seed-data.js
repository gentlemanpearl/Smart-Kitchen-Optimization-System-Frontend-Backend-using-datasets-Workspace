// Seed script to populate MongoDB with initial data
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// MongoDB connection
const mongoUri = process.env.DB_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-kitchen';

// Schemas
const InventoryItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, enum: ['Grains', 'Spices', 'Dairy', 'Vegetables', 'Fruits', 'Lentils', 'Oils', 'Other'] },
  currentQuantity: { type: Number, required: true, min: 0 },
  unit: { type: String, required: true, enum: ['g', 'kg', 'pieces', 'ml', 'l', 'tsp', 'tbsp', 'cup'] },
  threshold: { type: Number, default: 0 },
  perishable: { type: Boolean, default: false },
  isPresent: { type: Boolean, default: true }
}, { timestamps: true });

const MealPlanSchema = new mongoose.Schema({
  day: { type: String, required: true, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
  mealType: { type: String, required: true, enum: ['breakfast', 'lunch', 'dinner', 'snack'] },
  recipeName: { type: String, required: true },
  recipeId: { type: String, default: '' },
  notes: { type: String, default: '' },
  servings: { type: Number, default: 4 },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

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

const InventoryItem = mongoose.model('InventoryItem', InventoryItemSchema);
const MealPlan = mongoose.model('MealPlan', MealPlanSchema);
const WasteRecord = mongoose.model('WasteRecord', WasteRecordSchema);

// Seed data
const seedInventory = [
  { name: 'Rice', category: 'Grains', currentQuantity: 2000, unit: 'g', threshold: 500, perishable: false },
  { name: 'Wheat Flour', category: 'Grains', currentQuantity: 1500, unit: 'g', threshold: 1000, perishable: false },
  { name: 'Tomatoes', category: 'Vegetables', currentQuantity: 500, unit: 'g', threshold: 300, perishable: true },
  { name: 'Onions', category: 'Vegetables', currentQuantity: 800, unit: 'g', threshold: 500, perishable: true },
  { name: 'Potatoes', category: 'Vegetables', currentQuantity: 1000, unit: 'g', threshold: 600, perishable: true },
  { name: 'Milk', category: 'Dairy', currentQuantity: 500, unit: 'ml', threshold: 1000, perishable: true },
  { name: 'Butter', category: 'Dairy', currentQuantity: 200, unit: 'g', threshold: 250, perishable: true },
  { name: 'Turmeric Powder', category: 'Spices', currentQuantity: 50, unit: 'g', threshold: 100, perishable: false },
  { name: 'Red Chili Powder', category: 'Spices', currentQuantity: 30, unit: 'g', threshold: 100, perishable: false },
  { name: 'Cumin Seeds', category: 'Spices', currentQuantity: 20, unit: 'g', threshold: 50, perishable: false },
  { name: 'Coriander Powder', category: 'Spices', currentQuantity: 25, unit: 'g', threshold: 100, perishable: false },
  { name: 'Garlic', category: 'Vegetables', currentQuantity: 100, unit: 'g', threshold: 200, perishable: true },
  { name: 'Ginger', category: 'Vegetables', currentQuantity: 50, unit: 'g', threshold: 100, perishable: true },
  { name: 'Green Chilies', category: 'Vegetables', currentQuantity: 50, unit: 'g', threshold: 100, perishable: true },
  { name: 'Lentils', category: 'Lentils', currentQuantity: 1000, unit: 'g', threshold: 500, perishable: false },
  { name: 'Cooking Oil', category: 'Oils', currentQuantity: 500, unit: 'ml', threshold: 1000, perishable: false },
  { name: 'Salt', category: 'Spices', currentQuantity: 200, unit: 'g', threshold: 500, perishable: false },
  { name: 'Sugar', category: 'Other', currentQuantity: 500, unit: 'g', threshold: 1000, perishable: false },
  { name: 'Eggs', category: 'Dairy', currentQuantity: 6, unit: 'pieces', threshold: 12, perishable: true },
  { name: 'Bread', category: 'Other', currentQuantity: 2, unit: 'pieces', threshold: 4, perishable: true }
];

const seedWasteRecords = [
  {
    itemName: 'Bananas',
    category: 'fruit',
    quantity: 200,
    unit: 'g',
    reason: 'spoiled',
    dateWasted: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    estimatedCost: 50,
    notes: 'Overripe bananas'
  },
  {
    itemName: 'Milk',
    category: 'dairy',
    quantity: 250,
    unit: 'ml',
    reason: 'expired',
    dateWasted: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    estimatedCost: 30,
    notes: 'Expired milk carton'
  },
  {
    itemName: 'Leftover Curry',
    category: 'other',
    quantity: 300,
    unit: 'g',
    reason: 'leftover',
    dateWasted: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    estimatedCost: 100,
    notes: 'Leftover from dinner'
  }
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await InventoryItem.deleteMany({});
    await MealPlan.deleteMany({});
    await WasteRecord.deleteMany({});

    // Insert inventory items
    console.log('Seeding inventory items...');
    const inventoryItems = await InventoryItem.insertMany(seedInventory);
    console.log(`✅ Inserted ${inventoryItems.length} inventory items`);

    // Insert waste records
    console.log('Seeding waste records...');
    const wasteRecords = await WasteRecord.insertMany(seedWasteRecords);
    console.log(`✅ Inserted ${wasteRecords.length} waste records`);

    // Insert sample meal plans
    console.log('Seeding meal plans...');
    const mealPlans = await MealPlan.insertMany([
      {
        day: 'Monday',
        mealType: 'breakfast',
        recipeName: 'Scrambled Eggs',
        servings: 2,
        notes: 'Quick breakfast'
      },
      {
        day: 'Monday',
        mealType: 'lunch',
        recipeName: 'Vegetable Curry',
        servings: 4,
        notes: 'With rice'
      },
      {
        day: 'Tuesday',
        mealType: 'dinner',
        recipeName: 'Dal Tadka',
        servings: 4,
        notes: 'Lentil curry'
      }
    ]);
    console.log(`✅ Inserted ${mealPlans.length} meal plans`);

    console.log('\n✅ Database seeded successfully!');
    console.log(`   - ${inventoryItems.length} inventory items`);
    console.log(`   - ${wasteRecords.length} waste records`);
    console.log(`   - ${mealPlans.length} meal plans`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();

