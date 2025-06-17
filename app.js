const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const eventRoutes = require('./routes/events');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ This line adds the root route so "/" works
app.get('/', (req, res) => {
  res.send('🎉 Smart Event Planner backend is running!');
});

app.use('/events', eventRoutes);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch(err => console.error("❌ MongoDB connection error:", err));
