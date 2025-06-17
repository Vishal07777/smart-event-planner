const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  name: String,
  location: String,
  date: String,
  eventType: String,
  weather: Object,
  suitability: String
});

module.exports = mongoose.model('Event', EventSchema);
