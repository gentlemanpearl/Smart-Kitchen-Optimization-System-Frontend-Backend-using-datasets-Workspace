const express = require('express');
const router = express.Router();
const Recipe = require('../model/Recipe');
const InventoryItem = require('../model/InventoryItem.js'); // Make sure to add this import
const { generateMockData } = require('../utils/mockDataGenerator');


router.get('/with-serving-info', async (req, res) => {
    try {
        const { calculateAllRecipesServing } = require('../utils/servingCalculator');
        const inventory = await InventoryItem.find();
        const recipes = await Recipe.find();
        
        const recipesWithServing = await calculateAllRecipesServing(recipes, inventory);
        res.json(recipesWithServing);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    });

    router.get('/can-make', async (req, res) => {
    try {
        const { findMatchingRecipes } = require('../utils/recipeMatcher');
        const inventory = await InventoryItem.find();
        const recipes = await Recipe.find();
        
        const categorizedRecipes = await findMatchingRecipes(recipes, inventory);
        res.json(categorizedRecipes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    });

    router.get('/use-ingredients', async (req, res) => {
    try {
        const { findRecipesByIngredients } = require('../utils/recipeMatcher');
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

    
    router.get('/suggestions/available', async (req, res) => {
    try {
        const { findMatchingRecipes } = require('../utils/recipeMatcher');
        const inventory = await InventoryItem.find();
        const recipes = await Recipe.find();
        
        const categorizedRecipes = await findMatchingRecipes(recipes, inventory);
        res.json(categorizedRecipes.canMakeNow); // Return only recipes that can be made now
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    });

    router.get('/suggestions/can-make', async (req, res) => {
    try {
        const { findMatchingRecipes } = require('../utils/recipeMatcher');
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


    router.get('/', async (req, res) => {
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

    // POST create new recipe
    router.post('/', async (req, res) => {
    try {
        const newRecipe = new Recipe(req.body);
        const savedRecipe = await newRecipe.save();
        res.status(201).json(savedRecipe);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
    });

    // Generate mock data route
    router.post('/generate-mock-data', async (req, res) => {
    try {
        const mockData = require('../utils/mockDataGenerator');

        if (typeof mockData.generateMockData !== 'function') {
        throw new Error('generateMockData function not found in mockDataGenerator');
        }

        const result = await mockData.generateMockData();

        res.json({
        message: 'Mock data generated successfully',
        data: result
        });
    } catch (error) {
        console.error('Error generating mock data:', error);
        res.status(500).json({ message: error.message });
    }
});


    router.get('/:id', async (req, res) => {
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

    // GET substitution suggestions for a specific recipe
    router.get('/:id/substitutes', async (req, res) => {
    try {
        console.log('Substitutes request for recipe ID:', req.params.id);
        
        const { findSubstitutes } = require('../utils/substituteFinder');
        const recipe = await Recipe.findById(req.params.id);
        const inventory = await InventoryItem.find();
        
        if (!recipe) {
        console.log('Recipe not found');
        return res.status(404).json({ message: 'Recipe not found' });
        }
        
        console.log('Recipe:', recipe.name);
        console.log('Inventory items:', inventory.length);
        
        const substituteInfo = await findSubstitutes(recipe, inventory);
        
        console.log('Substitutes found:', {
        missing: substituteInfo.missingIngredients.length,
        suggestions: substituteInfo.substitutionSuggestions.length
        });
        
        res.json(substituteInfo);
    } catch (error) {
        console.error('Substitutes error:', error);
        res.status(500).json({ 
        message: 'Error finding substitutes',
        error: error.message 
        });
    }
});

    router.put('/:id', async (req, res) => {
    try {
        const updatedRecipe = await Recipe.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
        );
        
        if (!updatedRecipe) {
        return res.status(404).json({ message: 'Recipe not found' });
        }
        
        res.json(updatedRecipe);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
    });

    router.delete('/:id', async (req, res) => {
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

// GET list of available cuisines
router.get('/cuisines/list', async (req, res) => {
    try {
        const cuisines = await Recipe.distinct('cuisine');
        res.json(cuisines);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;