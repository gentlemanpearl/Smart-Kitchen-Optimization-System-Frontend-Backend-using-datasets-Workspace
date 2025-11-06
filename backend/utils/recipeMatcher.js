const { calculateMaxServing } = require('./servingCalculator');
const { findSubstitutes } = require('./substituteFinder');

/**
 * Find recipes based on available ingredients
 * @param {Array} recipes - Array of all recipes
 * @param {Array} inventory - Array of available inventory items
 * @returns {Object} - Categorized recipes
 */
    const findMatchingRecipes = async (recipes, inventory) => {
    const results = {
        canMakeNow: [],       // Recipes that can be made with current inventory
        canMakeWithSubstitutes: [], // Recipes that need substitutes but substitutes are available
        missingOneOrTwo: [],  // Recipes missing 1-2 ingredients (no substitutes available)
        cannotMake: []        // Recipes missing multiple ingredients
    };

    const inventoryNames = inventory.map(item => item.name.toLowerCase());

    for (const recipe of recipes) {
        const servingInfo = await calculateMaxServing(recipe, inventory);
        const substituteInfo = await findSubstitutes(recipe, inventory);

        const recipeWithInfo = {
        ...recipe.toObject ? recipe.toObject() : recipe,
        servingInfo,
        substituteInfo
        };

        // Categorize the recipe
        if (servingInfo.canMake) {
        results.canMakeNow.push(recipeWithInfo);
        } else if (substituteInfo.canMakeWithSubstitutes) {
        results.canMakeWithSubstitutes.push(recipeWithInfo);
        } else if (substituteInfo.totalMissing <= 2) {
        results.missingOneOrTwo.push(recipeWithInfo);
        } else {
        results.cannotMake.push(recipeWithInfo);
        }
    }

    // Sort each category by number of missing ingredients or serving capacity
    results.canMakeNow.sort((a, b) => b.servingInfo.maxServing - a.servingInfo.maxServing);
    results.canMakeWithSubstitutes.sort((a, b) => a.substituteInfo.totalMissing - b.substituteInfo.totalMissing);
    results.missingOneOrTwo.sort((a, b) => a.substituteInfo.totalMissing - b.substituteInfo.totalMissing);

    return results;
    };

    /**
     * Find recipes that use specific ingredients (to reduce waste)
     * @param {Array} recipes - Array of all recipes
     * @param {Array} ingredientNames - Array of ingredient names to use up
     * @returns {Array} - Recipes that use the specified ingredients
     */
    const findRecipesByIngredients = async (recipes, ingredientNames) => {
    const matchingRecipes = [];

    for (const recipe of recipes) {
        const recipeIngredients = recipe.ingredients.map(ing => ing.ingredientName.toLowerCase());
        const matches = ingredientNames.filter(ing => recipeIngredients.includes(ing.toLowerCase()));
        
        if (matches.length > 0) {
        matchingRecipes.push({
            recipe: recipe.toObject ? recipe.toObject() : recipe,
            matchingIngredients: matches,
            matchCount: matches.length
        });
        }
    }

    return matchingRecipes.sort((a, b) => b.matchCount - a.matchCount);
    };

module.exports = { findMatchingRecipes, findRecipesByIngredients };