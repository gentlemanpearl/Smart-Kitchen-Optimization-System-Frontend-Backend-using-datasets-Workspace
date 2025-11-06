const InventoryItem = require('../model/InventoryItem.js');

/**
 * Calculate how many people can be served with current inventory for a specific recipe
 * @param {Object} recipe - The recipe object
 * @param {Array} inventory - Array of inventory items
 * @returns {Object} - Object containing max servings and limiting ingredients
 */
const calculateMaxServing = async (recipe, inventory) => {
    try {
        let maxServingPerIngredient = [];
        const limitingIngredients = [];

        // Convert inventory array to a map for faster lookup
        const inventoryMap = new Map();
        inventory.forEach(item => {
        inventoryMap.set(item.name.toLowerCase(), item);
        });

        // Check each ingredient in the recipe
        for (const ingredient of recipe.ingredients) {
        const invItem = inventoryMap.get(ingredient.ingredientName.toLowerCase());
        
        if (!invItem || invItem.currentQuantity <= 0) {
            // Ingredient not available at all
            maxServingPerIngredient.push(0);
            limitingIngredients.push({
            ingredient: ingredient.ingredientName,
            required: ingredient.quantity,
            available: 0,
            unit: ingredient.unit,
            message: 'Not available in inventory'
            });
            continue;
        }

        // Convert to common units for calculation (simplified approach)
        const availableQuantity = invItem.currentQuantity;
        const requiredPerServe = ingredient.quantity;

        // Basic unit conversion (you can expand this as needed)
        const conversionRates = {
            'kg': { 'g': 1000, 'kg': 1 },
            'g': { 'g': 1, 'kg': 0.001 },
            'l': { 'ml': 1000, 'l': 1 },
            'ml': { 'ml': 1, 'l': 0.001 },
            'tbsp': { 'tsp': 3, 'tbsp': 1 },
            'tsp': { 'tsp': 1, 'tbsp': 0.333 },
            'cup': { 'ml': 240, 'cup': 1 } // Approximate conversion
        };

        let availableConverted = availableQuantity;
        let requiredConverted = requiredPerServe;

        // Convert to common unit if different units
        if (invItem.unit !== ingredient.unit && conversionRates[invItem.unit] && conversionRates[invItem.unit][ingredient.unit]) {
            availableConverted = availableQuantity * conversionRates[invItem.unit][ingredient.unit];
        }

        const servesFromThisIngredient = Math.floor(availableConverted / requiredConverted);
        maxServingPerIngredient.push(servesFromThisIngredient);

        if (servesFromThisIngredient === 0) {
            limitingIngredients.push({
            ingredient: ingredient.ingredientName,
            required: requiredConverted,
            available: availableConverted,
            unit: ingredient.unit,
            message: 'Insufficient quantity'
            });
        }
        }

        // The limiting ingredient determines the max serves
        const maxServing = Math.min(...maxServingPerIngredient);

        return {
        maxServing: maxServing > 0 ? maxServing : 0,
        canMake: maxServing > 0,
        limitingIngredients: maxServing === 0 ? limitingIngredients : [],
        details: maxServingPerIngredient.map((serves, index) => ({
            ingredient: recipe.ingredients[index].ingredientName,
            servesPossible: serves
        }))
        };
    } catch (error) {
        console.error('Error in serving calculation:', error);
        throw error;
    }
    };

    /**
     * Calculate serving capacity for all recipes
     * @param {Array} recipes - Array of recipe objects
     * @param {Array} inventory - Array of inventory items
     * @returns {Array} - Array of recipes with serving information
     */
    const calculateAllRecipesServing = async (recipes, inventory) => {
    const recipesWithServing = [];

    for (const recipe of recipes) {
        const servingInfo = await calculateMaxServing(recipe, inventory);
        recipesWithServing.push({
        ...recipe.toObject ? recipe.toObject() : recipe,
        servingInfo
        });
    }

    return recipesWithServing.sort((a, b) => b.servingInfo.maxServing - a.servingInfo.maxServing);
    };

module.exports = { calculateMaxServing, calculateAllRecipesServing };