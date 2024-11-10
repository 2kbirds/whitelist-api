const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

// Environment variables
const SERVER_API_KEY = process.env.SERVER_API_KEY;
const ROBLOX_API_KEY = process.env.ROBLOX_API_KEY;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || "";

// In-memory storage for whitelist codes
const whitelistCodes = {};

// Middleware to parse JSON bodies
app.use(express.json());

// **Generate a new whitelist code** endpoint - server only
app.post('/generateCode', (req, res) => {
  const apiKey = req.headers['x-server-api-key'];
  if (apiKey !== SERVER_API_KEY) {
    return res.status(403).send('Forbidden: Invalid API key');
  }

  const code = `CODE-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
  whitelistCodes[code] = false;

  if (DISCORD_WEBHOOK_URL) {
    axios.post(DISCORD_WEBHOOK_URL, {
      content: `A new whitelist code has been generated: **${code}**`
    }).catch((error) => {
      console.error('Failed to send Discord notification:', error.message);
    });
  }

  res.json({ success: true, code });
});

// **Validate a whitelist code** endpoint - accessible by Roblox clients
app.post('/validateCode', (req, res) => {
  const apiKey = req.headers['x-roblox-api-key'];
  if (apiKey !== ROBLOX_API_KEY) {
    return res.status(403).send('Forbidden: Invalid API key');
  }

  const { code } = req.body;
  if (!whitelistCodes.hasOwnProperty(code)) {
    return res.status(404).send('Invalid or expired code.');
  }

  if (whitelistCodes[code]) {
    return res.status(400).send('Code already used.');
  }

  whitelistCodes[code] = true; // Mark code as used
  res.json({ success: true, message: 'Code validated successfully.' });
});

// Start the server
app.listen(port, () => {
  console.log(`Whitelist API running on port ${port}`);
});
