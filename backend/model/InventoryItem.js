const mongoose = require('mongoose');

const InventoryItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Grains', 'Spices', 'Dairy', 'Vegetables', 'Fruits', 'Lentils', 'Oils', 'Other']
    },
    currentQuantity: {
        type: Number,
        required: true,
        min: 0
    },
    unit: {
        type: String,
        required: true,
        enum: ['g', 'kg', 'pieces', 'ml', 'l', 'tsp', 'tbsp', 'cup']
    },
    threshold: {
        type: Number,
        default: 0
    },
    // ADD THIS NEW FIELD
    perishable: {
        type: Boolean,
        default: false
    },
    isPresent: {
        type: Boolean,
        default: true
    }
    }, { 
    timestamps: true 
});

module.exports = mongoose.model('InventoryItem', InventoryItemSchema);