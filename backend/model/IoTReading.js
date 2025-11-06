const mongoose = require('mongoose');

const IoTReadingSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  gas: { type: Number, default: 0 },
  weight: { type: Number, default: 0 },
  fire: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('IoTReading', IoTReadingSchema);
