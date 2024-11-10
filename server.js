const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

const WHITELIST_API_KEY = process.env.API_KEY || "default-key";
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || "";  // Set this in Vercel env variables
const whitelistCodes = {};  // Store generated codes in-memory

// Middleware to parse JSON bodies
app.use(express.json());

// Generate a new whitelist code
app.post('/generateCode', (req, res) => {
  const apiKey = req.headers['x-roblox-api-key'];

  if (apiKey !== WHITELIST_API_KEY) {
    return res.status(403).send('Forbidden: Invalid API key');
  }

  // Generate a unique code (simple implementation)
  const code = `CODE-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
  whitelistCodes[code] = false;  // Store the code as unused

  // Notify via Discord webhook
  if (DISCORD_WEBHOOK_URL) {
    axios.post(DISCORD_WEBHOOK_URL, {
      content: `A new whitelist code has been generated: **${code}**`
    }).then(() => {
      console.log(`Discord webhook notification sent for code: ${code}`);
    }).catch((error) => {
      console.error('Failed to send Discord webhook notification:', error.message);
    });
  }

  res.json({ success: true, code });
});

// Validate a whitelist code
app.post('/validateCode', (req, res) => {
  const { code } = req.body;

  if (whitelistCodes[code] === undefined) {
    return res.status(404).send('Invalid or expired code.');
  }

  if (whitelistCodes[code]) {
    return res.status(400).send('Code already used.');
  }

  // Mark the code as used
  whitelistCodes[code] = true;
  res.json({ success: true, message: 'Code validated successfully.' });
});

// Start the server
app.listen(port, () => {
  console.log(`Whitelist API running on port ${port}`);
});
