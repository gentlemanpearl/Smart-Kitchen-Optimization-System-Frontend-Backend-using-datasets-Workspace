const express = require('express');
const router = express.Router();
const IoTReading = require('../model/IoTReading');

// POST endpoint to receive sensor data
router.post('/sensor', async (req, res) => {
  try {
    const { deviceId, gas, weight, fire } = req.body;
    // Save to database
    const reading = new IoTReading({ deviceId, gas, weight, fire });
    await reading.save();

    // Check conditions and send alerts
    let alert = null;
    if (fire) {
      alert = ' Fire detected in kitchen!';
    } else if (gas > 400) {
      alert = ' High gas concentration detected!';
    } else if (weight < 200) {
      alert = ' Low weight detected – check inventory!';
    }

    res.json({ success: true, message: 'Sensor data saved', alert });
  } catch (error) {
    console.error('Error saving IoT data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Optional GET endpoint for viewing recent data
router.get('/latest', async (req, res) => {
  try {
    const data = await IoTReading.find().sort({ createdAt: -1 }).limit(5);
    res.json(data);
  } catch (error) {
    console.error('Error fetching IoT data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
