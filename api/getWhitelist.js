const express = require('express');
const app = express();

const WHITELIST_API_KEY = process.env.API_KEY || "default-key";  // Using environment variable
const whitelist = { "123456789": true, "44246458": true };

app.get('/getWhitelist', (req, res) => {
  const apiKey = req.headers['x-roblox-api-key'];

  if (apiKey !== WHITELIST_API_KEY) {
    return res.status(403).send('Forbidden: Invalid API key');
  }

  res.json(whitelist);
});

module.exports = (req, res) => {
  app(req, res);
};