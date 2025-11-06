const express = require('express');
const router = express.Router();
const InventoryItem = require('../model/InventoryItem');

// GET waste prediction - Smart version
router.get('/waste-prediction', async (req, res) => {
    try {
        const inventory = await InventoryItem.find();
        
        // Define perishable categories
        const perishableCategories = ['Dairy', 'Vegetables', 'Fruits'];
        const nonPerishableCategories = ['Grains', 'Spices', 'Lentils', 'Oils'];
        
        const wasteItems = inventory
        .filter(item => {
            // Skip items without threshold
            if (!item.threshold || item.threshold === 0) return false;
            
            const usageRatio = item.currentQuantity / item.threshold;
            
            // Different logic for perishable vs non-perishable items
            if (perishableCategories.includes(item.category) || item.perishable) {
            // PERISHABLE ITEMS: Strict rules
            const isLowUsage = usageRatio < 0.3;     // Below 30% of threshold
            const isExcessQuantity = usageRatio > 2; // Over 2x threshold
            return isLowUsage || isExcessQuantity;
            } else if (nonPerishableCategories.includes(item.category)) {
            // NON-PERISHABLE ITEMS: Lenient rules
            const isVeryLowUsage = usageRatio < 0.1;     // Below 10% of threshold
            const isVeryExcessQuantity = usageRatio > 5; // Over 5x threshold
            return isVeryLowUsage || isVeryExcessQuantity;
            }
            
            return false;
        })
        .map(item => {
            const usageRatio = item.currentQuantity / item.threshold;
            let wasteRisk = 'medium';
            let reasons = [];
            const isPerishable = perishableCategories.includes(item.category) || item.perishable;

            if (isPerishable) {
            if (usageRatio < 0.3) {
                wasteRisk = 'high';
                reasons.push(`Low usage - might spoil before use`);
            }
            if (usageRatio > 2) {
                wasteRisk = 'high';
                reasons.push(`Excess quantity - might not get used before spoiling`);
            }
            } else {
            if (usageRatio < 0.1) {
                wasteRisk = 'low';
                reasons.push(`Very low usage - consider if you need this item`);
            }
            if (usageRatio > 5) {
                wasteRisk = 'medium';
                reasons.push(`Large quantity - might expire before use`);
            }
            }

            return {
            _id: item._id,
            name: item.name,
            category: item.category,
            currentQuantity: item.currentQuantity,
            unit: item.unit,
            threshold: item.threshold,
            perishable: isPerishable,
            wasteRisk,
            reasons,
            usagePercentage: Math.round(usageRatio * 100)
            };
        });

        res.json(wasteItems);
    } catch (error) {
        console.error('Waste prediction error:', error);
        res.status(500).json({ 
        message: 'Failed to generate waste prediction',
        error: error.message 
        });
    }
});

    // GET all inventory items
    router.get('/', async (req, res) => {
    try {
        const items = await InventoryItem.find().sort({ createdAt: -1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    });

    // GET single inventory item by ID - This comes AFTER specific routes
    router.get('/:id', async (req, res) => {
    try {
        const item = await InventoryItem.findById(req.params.id);
        if (!item) {
        return res.status(404).json({ message: 'Item not found' });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    });

    // POST create new inventory item
    router.post('/', async (req, res) => {
    try {
        const newItem = new InventoryItem(req.body);
        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
    });

    // PUT update inventory item
    router.put('/:id', async (req, res) => {
    try {
        const updatedItem = await InventoryItem.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
        );
        
        if (!updatedItem) {
        return res.status(404).json({ message: 'Item not found' });
        }
        
        res.json(updatedItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
    });

    // DELETE inventory item
    router.delete('/:id', async (req, res) => {
    try {
        const deletedItem = await InventoryItem.findByIdAndDelete(req.params.id);
        
        if (!deletedItem) {
        return res.status(404).json({ message: 'Item not found' });
        }
        
        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;