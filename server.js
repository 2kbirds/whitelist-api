const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Use environment variable for the API key
const WHITELIST_API_KEY = process.env.API_KEY || "default-key";

// Your whitelist data
const whitelist = {
  "123456789": true,
  "987654321": true
};

// Define a GET endpoint for the whitelist
app.get('/getWhitelist', (req, res) => {
  const apiKey = req.headers['x-roblox-api-key'];

  if (apiKey !== WHITELIST_API_KEY) {
    return res.status(403).send('Forbidden: Invalid API key');
  }

  res.json(whitelist);
});

// Start the server
app.listen(port, () => {
  console.log(`Whitelist API running on port ${port}`);
});