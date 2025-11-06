const mongoose = require('mongoose');
require('dotenv').config();
const { generateMockData, checkExistingData } = require('../utils/mockDataGenerator.js');

const uri = process.env.DB_URL;

    const runDataGeneration = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        // Check if data already exists
        const existingData = await checkExistingData();
        console.log('\nCurrent database status:');
        console.log(`   - Inventory items: ${existingData.inventoryCount}`);
        console.log(`   - Recipes: ${existingData.recipeCount}`);

        if (existingData.hasInventory || existingData.hasRecipes) {
        console.log('\nDatabase already contains data.');
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const answer = await new Promise(resolve => {
            readline.question('Do you want to delete existing data and regenerate? (y/N): ', resolve);
        });

        readline.close();

        if (answer.toLowerCase() !== 'y') {
            console.log('Data generation cancelled.');
            process.exit(0);
        }
        }

        // Generate mock data
        await generateMockData();
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
    };

runDataGeneration();