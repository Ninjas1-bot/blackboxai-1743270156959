const express = require('express');
const cors = require('cors');
const { stmts } = require('./db');

const app = express();
const PORT = 8000;

// Middleware
app.use(cors());
app.use(express.json());

// API Endpoints
app.post('/api/locations', (req, res) => {
  const { latitude, longitude } = req.body;
  stmts.insertLocation.run(latitude, longitude);
  res.status(201).json({ message: 'Location saved successfully' });
});

app.get('/api/locations', (req, res) => {
  const locations = stmts.getLocations.all();
  res.json(locations);
});

app.delete('/api/locations', (req, res) => {
  stmts.clearLocations.run();
  res.json({ message: 'Location history cleared' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});