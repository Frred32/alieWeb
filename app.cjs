const express = require('express');
const getGPT4js = require('gpt4js');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 5000; // Fixed port number
const KEYS_FILE = 'Keys.json';

// Middleware to parse JSON bodies
app.use(express.json());

// Load keys from file or initialize if not present
let keys = {};
if (fs.existsSync(KEYS_FILE)) {
  keys = JSON.parse(fs.readFileSync(KEYS_FILE, 'utf-8'));
} else {
  fs.writeFileSync(KEYS_FILE, JSON.stringify({}));
}

// Endpoint to generate a unique key
app.post('/api/generate', (req, res) => {
  const { messageLimit } = req.body; // Get message limit from request body
  const limit = messageLimit > 0 ? messageLimit : 100; // Default to 100 if limit is invalid

  const newKey = uuidv4();
  keys[newKey] = { messagesUsed: 0, messageLimit: limit }; // Store both used and limit
  fs.writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2));
  res.json({ key: newKey, remainingMessages: limit });
});

// Define a route for the chat API
app.post('/api/chat', async (req, res) => {
  const { messages, key } = req.body;

  console.log('Received request:', req.body); // Log incoming request

  if (!key || !keys[key]) {
    return res.status(401).json({ error: 'Invalid or missing key' });
  }

  if (keys[key].messagesUsed >= keys[key].messageLimit) {
    return res.status(403).json({ error: 'Message limit reached for this key' });
  }

  try {
    const GPT4js = await getGPT4js();
    const provider = GPT4js.createProvider('Nextway'); // Adjust provider as needed
    
    // Ensure messages are properly formatted
    const text = await provider.chatCompletion(messages, { model: 'gpt-4o-free' });
    
    console.log('AI Response:', text); // Log the AI response

    keys[key].messagesUsed++;
    fs.writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2));

    res.json({ response: text });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
