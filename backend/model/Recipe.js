const mongoose = require('mongoose');

const IngredientRequirementSchema = new mongoose.Schema({
    ingredientName: { 
        type: String, 
        required: true,
        trim: true
    },
    quantity: { 
        type: Number, 
        required: true,
        min: 0
    },
    unit: { 
        type: String, 
        required: true,
        enum: [
            'g', 'kg', 
            'ml', 'l', 
            'tsp', 'tbsp', 'cup', 'pinch',
            'pieces', 'cloves', 'slices',
            'inch', 'cm',
            'small', 'medium', 'large',
            'bunch', 'handful'
        ]
    }
    });

    const SubstituteSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    ratio: {
        type: Number,
        default: 1,
        min: 0.1
    },
    notes: String
    });

    const RecipeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    description: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        required: true,
        enum: ['Main Course', 'Appetizer', 'Dessert', 'Bread', 'Rice', 'Curry', 'Snack', 'Breakfast', 'Beverage']
    },
    cuisine: {
    type: String,
    enum: ['Indian', 'Mexican', 'Thai', 'Chinese', 'Japanese'],
    default: 'Indian'
    },

    ingredients: [IngredientRequirementSchema],
    steps: {
        type: [String],
        required: true,
        validate: {
        validator: function(steps) {
            return steps.length > 0;
        },
        message: 'At least one step is required'
        }
    },
    serves: {
        type: Number,
        required: true,
        min: 1
    },
    preparationTime: {
        type: Number, // in minutes
        required: true,
        min: 1
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium'
    },
    foodType: {
    type: String,
    enum: ['Veg', 'Non-Veg'],
    default: 'Veg'
    },
    possibleSubstitutes: [{
        original: String,
        substitutes: [SubstituteSchema]
    }],
    imageUrl: {
        type: String,
        default: ''
    },
    tags: [String]
    }, { 
    timestamps: true 
    });

// Index for better search performance
RecipeSchema.index({ name: 'text', description: 'text', tags: 'text' });
RecipeSchema.index({ category: 1, cuisine: 1 });

module.exports = mongoose.model('Recipe', RecipeSchema);