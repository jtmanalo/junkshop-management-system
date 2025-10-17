const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Temporary MongoDB connection string placeholder.
// Replace with a real connection string or set MONGODB_URI in environment.
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://user:password@cluster0.example.mongodb.net/mydatabase?retryWrites=true&w=majority';

// Middleware
app.use(express.json());

// Simple test endpoint
app.get('/test', (req, res) => {
  res.status(200).send('success');
});

// Connect to MongoDB and start server
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to connect to MongoDB:', err.message);
  // Start server even if DB connection fails to allow testing the /test endpoint
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} (no DB)`);
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  } catch (e) {
    console.error('Error during MongoDB disconnect', e.message);
  }
  process.exit(0);
});
