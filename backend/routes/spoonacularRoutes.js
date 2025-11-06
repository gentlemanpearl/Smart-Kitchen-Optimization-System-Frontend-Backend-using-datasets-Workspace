const express = require('express');
const axios = require('axios');
const router = express.Router();

// Simple list of common non-veg keywords for cross-check
const NON_VEG_KEYWORDS = [
  'chicken', 'mutton', 'fish', 'egg', 'beef', 'pork', 'lamb', 'shrimp', 'prawn', 'tuna', 'salmon'
];

router.get('/recipes', async (req, res) => {
  try {
    const { cuisine, diet } = req.query;
    const apiKey = process.env.SPOONACULAR_API_KEY;

    const response = await axios.get('https://api.spoonacular.com/recipes/complexSearch', {
      params: {
        apiKey,
        cuisine,
        addRecipeInformation: true,
        number: 20,
      },
    });

    const recipes = response.data.results.map((r) => {
      // Basic veg check using Spoonacular + keyword filtering
      const ingredientsList = (r.extendedIngredients || [])
        .map((i) => i.name.toLowerCase())
        .join(' ');

      const hasNonVegKeyword = NON_VEG_KEYWORDS.some((word) =>
        ingredientsList.includes(word)
      );

      const isVegetarian = r.vegetarian && !hasNonVegKeyword;
      const foodType = isVegetarian ? 'Vegetarian' : 'Non-Vegetarian';

      return {
        name: r.title,
        description: r.summary?.replace(/<[^>]*>/g, ''),
        cuisine: cuisine || r.cuisines?.[0] || 'General',
        serves: r.servings,
        preparationTime: r.readyInMinutes,
        difficulty:
          r.readyInMinutes > 45
            ? 'Hard'
            : r.readyInMinutes > 25
            ? 'Medium'
            : 'Easy',
        imageUrl: r.image,
        foodType,
        category: 'Main Course',
        ingredients: (r.extendedIngredients || []).map((i) => ({
          ingredientName: i.name,
          quantity: i.amount || 1,
          unit: i.unit || 'unit',
        })),
        steps: r.analyzedInstructions?.[0]?.steps?.map((s) => s.step) || [],
        tags: [foodType],
      };
    });

    res.json(recipes);
  } catch (error) {
    console.error('Spoonacular fetch error:', error.message);
    res.status(500).json({ message: 'Error fetching recipes from Spoonacular API' });
  }
});

module.exports = router;
