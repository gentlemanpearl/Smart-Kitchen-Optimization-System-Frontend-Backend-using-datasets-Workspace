const mongoose = require('mongoose');
const InventoryItem = require('../model/InventoryItem.js');
const Recipe = require('../model/Recipe.js');

// Sample Inventory Data
const sampleInventory = [
    { name: 'Rice', category: 'Grains', currentQuantity: 2000, unit: 'g', threshold: 500 },
    { name: 'Wheat Flour', category: 'Grains', currentQuantity: 5000, unit: 'g', threshold: 1000 },
    { name: 'Paneer', category: 'Dairy', currentQuantity: 400, unit: 'g', threshold: 100 },
    { name: 'Tomato', category: 'Vegetables', currentQuantity: 8, unit: 'pieces', threshold: 2 },
    { name: 'Onion', category: 'Vegetables', currentQuantity: 10, unit: 'pieces', threshold: 3 },
    { name: 'Vegetable Oil', category: 'Oils', currentQuantity: 500, unit: 'ml', threshold: 100 },
    { name: 'Salt', category: 'Other', currentQuantity: 200, unit: 'g', threshold: 30 },
    { name: 'Sugar', category: 'Other', currentQuantity: 300, unit: 'g', threshold: 50 }
    ];

    // Sample Global Recipes
    const sampleRecipes = [
    {
        name: "Masala Dosa",
        description: "Crispy fermented crepe with spicy potato filling",
        category: "Breakfast",
        cuisine: "Indian",
        serves: 2,
        preparationTime: 60,
        difficulty: "Medium",
        ingredients: [
        { ingredientName: "Rice Flour", quantity: 200, unit: "g" },
        { ingredientName: "Urad Dal", quantity: 50, unit: "g" },
        { ingredientName: "Potato", quantity: 3, unit: "pieces" }
        ],
        steps: ["Prepare batter", "Cook filling", "Fry dosa and fill", "Serve hot"],
        tags: ["indian", "vegetarian", "breakfast"]
    },
    {
        name: "Tacos",
        description: "Corn tortillas filled with spiced vegetables and beans",
        category: "Main Course",
        cuisine: "Mexican",
        serves: 2,
        preparationTime: 30,
        difficulty: "Easy",
        ingredients: [
        { ingredientName: "Tortilla", quantity: 4, unit: "pieces" },
        { ingredientName: "Kidney Beans", quantity: 100, unit: "g" },
        { ingredientName: "Tomato", quantity: 1, unit: "pieces" }
        ],
        steps: ["Cook beans", "Prepare filling", "Warm tortillas", "Assemble tacos"],
        tags: ["mexican", "streetfood"]
    },
    {
        name: "Pad Thai",
        description: "Stir-fried rice noodles with tofu, peanuts, and tamarind sauce",
        category: "Main Course",
        cuisine: "Thai",
        serves: 2,
        preparationTime: 25,
        difficulty: "Medium",
        ingredients: [
        { ingredientName: "Rice Noodles", quantity: 200, unit: "g" },
        { ingredientName: "Tofu", quantity: 100, unit: "g" },
        { ingredientName: "Peanuts", quantity: 20, unit: "g" }
        ],
        steps: ["Soak noodles", "Fry tofu", "Add sauce and mix everything"],
        tags: ["thai", "noodles"]
    },
    {
        name: "Fried Rice",
        description: "Stir-fried rice with vegetables and soy sauce",
        category: "Main Course",
        cuisine: "Chinese",
        serves: 2,
        preparationTime: 20,
        difficulty: "Easy",
        ingredients: [
        { ingredientName: "Cooked Rice", quantity: 200, unit: "g" },
        { ingredientName: "Soy Sauce", quantity: 2, unit: "tbsp" },
        { ingredientName: "Carrot", quantity: 1, unit: "pieces" }
        ],
        steps: ["Stir-fry vegetables", "Add rice and sauce", "Mix and serve"],
        tags: ["chinese", "quick"]
    },
    {
        name: "Sushi Rolls",
        description: "Vinegared rice with vegetables rolled in seaweed",
        category: "Snack",
        cuisine: "Japanese",
        serves: 2,
        preparationTime: 40,
        difficulty: "Hard",
        ingredients: [
        { ingredientName: "Sushi Rice", quantity: 200, unit: "g" },
        { ingredientName: "Nori Sheet", quantity: 2, unit: "pieces" },
        { ingredientName: "Cucumber", quantity: 1, unit: "pieces" }
        ],
        steps: ["Cook rice", "Lay nori", "Roll and slice sushi"],
        tags: ["japanese", "rice", "snack"]
    }
    ];

    // ✅ Function to generate mock data
    const generateMockData = async () => {
    try {
        console.log('Starting mock data generation...');

        // Clear old data
        await InventoryItem.deleteMany({});
        await Recipe.deleteMany({});
        console.log('Cleared existing data');

        // Insert inventory
        const inventoryItems = await InventoryItem.insertMany(sampleInventory);
        console.log(`Added ${inventoryItems.length} inventory items`);

        // Insert recipes
        const recipes = await Recipe.insertMany(sampleRecipes);
        console.log(`Added ${recipes.length} recipes`);

        console.log('✅ Mock data generation completed successfully');
        return { inventoryItems, recipes };
    } catch (error) {
        console.error('Error generating mock data:', error);
        throw error;
    }
    };

    // ✅ Optional check function
    const checkExistingData = async () => {
    const inventoryCount = await InventoryItem.countDocuments();
    const recipeCount = await Recipe.countDocuments();
    return { hasInventory: inventoryCount > 0, hasRecipes: recipeCount > 0 };
    };

    // ✅ Export everything
    module.exports = {
    generateMockData,
    checkExistingData,
    sampleInventory,
    sampleRecipes
    };

// Log exported keys (for debug)
console.log("Exports from mockDataGenerator:", Object.keys(module.exports));
