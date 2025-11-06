const Recipe = require('../model/Recipe');

/**
 * Find substitutes for missing ingredients in a recipe
 * @param {Object} recipe - The recipe object
 * @param {Array} inventory - Array of available inventory items
 * @returns {Object} - Substitution suggestions
 */
const findSubstitutes = async (recipe, inventory) => {
    const missingIngredients = [];
    const substitutionSuggestions = [];
    const inventoryNames = inventory.map(item => item.name.toLowerCase());


    for (const ingredient of recipe.ingredients) {
        const hasIngredient = inventoryNames.includes(ingredient.ingredientName.toLowerCase());
        
        if (!hasIngredient) {
        missingIngredients.push(ingredient);

        // Check if recipe has predefined substitutes
        const predefinedSubstitutes = recipe.possibleSubstitutes?.find(
            sub => sub.original.toLowerCase() === ingredient.ingredientName.toLowerCase()
        );

        if (predefinedSubstitutes) {
            // Check which substitutes are available in inventory
            const availableSubstitutes = predefinedSubstitutes.substitutes.filter(substitute =>
            inventoryNames.includes(substitute.name.toLowerCase())
            );

            substitutionSuggestions.push({
            missingIngredient: ingredient.ingredientName,
            requiredQuantity: ingredient.quantity,
            unit: ingredient.unit,
            availableSubstitutes: availableSubstitutes.length > 0 ? availableSubstitutes : predefinedSubstitutes.substitutes,
            hasAvailableSubstitute: availableSubstitutes.length > 0
            });
        } else {
            // Generic substitution logic (can be expanded)
            const genericSubstitutes = getGenericSubstitutes(ingredient.ingredientName);
            const availableGenericSubstitutes = genericSubstitutes.filter(substitute =>
            inventoryNames.includes(substitute.name.toLowerCase())
            );

            substitutionSuggestions.push({
            missingIngredient: ingredient.ingredientName,
            requiredQuantity: ingredient.quantity,
            unit: ingredient.unit,
            availableSubstitutes: availableGenericSubstitutes.length > 0 ? availableGenericSubstitutes : genericSubstitutes,
            hasAvailableSubstitute: availableGenericSubstitutes.length > 0,
            isGeneric: true
            });
        }
        }
    }

    return {
        missingIngredients,
        substitutionSuggestions,
        canMakeWithSubstitutes: substitutionSuggestions.every(suggestion => suggestion.hasAvailableSubstitute),
        totalMissing: missingIngredients.length
    };
    };

    /**
     * Generic substitute database for common Indian ingredients
     */
    const getGenericSubstitutes = (ingredientName) => {
    const substituteMap = {
        // Dairy
        'paneer': [{ name: 'Tofu', ratio: 1.0, notes: 'Different texture but works well' }],
        'ghee': [{ name: 'Vegetable Oil', ratio: 1.0, notes: 'Neutral flavor' }, { name: 'Butter', ratio: 1.0, notes: 'Similar richness' }],
        'fresh cream': [{ name: 'Malai', ratio: 1.0, notes: 'Similar texture' }, { name: 'Coconut Milk', ratio: 1.5, notes: 'Dairy-free option' }],
        'yogurt': [{ name: 'Buttermilk', ratio: 1.0, notes: 'Similar tanginess' }, { name: 'Lemon Juice', ratio: 0.5, notes: 'Use with milk' }],
        
        // Lentils
        'toor dal': [{ name: 'Masoor Dal', ratio: 1.0, notes: 'Similar cooking time' }, { name: 'Moong Dal', ratio: 1.0, notes: 'Lighter flavor' }],
        'chana dal': [{ name: 'Yellow Split Peas', ratio: 1.0, notes: 'Similar texture' }],
        
        // Spices
        'garam masala': [{ name: 'Curry Powder', ratio: 1.0, notes: 'Different flavor profile' }],
        'cumin seeds': [{ name: 'Cumin Powder', ratio: 0.5, notes: 'Use half quantity' }],
        
        // Vegetables
        'tomato': [{ name: 'Tomato Puree', ratio: 0.5, notes: 'Use half quantity' }, { name: 'Tamarind Paste', ratio: 0.3, notes: 'For acidity' }],
        'onion': [{ name: 'Onion Powder', ratio: 0.1, notes: 'Use 1/10th quantity' }, { name: 'Shallots', ratio: 1.5, notes: 'Similar flavor' }],
        'ginger': [{ name: 'Ginger Powder', ratio: 0.2, notes: 'Use 1/5th quantity' }],
        'garlic': [{ name: 'Garlic Powder', ratio: 0.1, notes: 'Use 1/10th quantity' }]
    };

    return substituteMap[ingredientName.toLowerCase()] || [
        { name: 'No known substitute', ratio: 1, notes: 'Consider omitting or finding alternative recipe' }
    ];
    };

module.exports = { findSubstitutes };