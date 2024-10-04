const express = require('express');
const getGPT4js = require('gpt4js');

const app = express();
const PORT = 5000; // Fixed port number

// Middleware to parse JSON bodies
app.use(express.json());

// Define a route for the chat API
app.post('/api/chat', async (req, res) => {
  const messages = req.body.messages;

  // Validate input
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages should be a non-empty array' });
  }

  try {
    const GPT4js = await getGPT4js();
    const provider = GPT4js.createProvider('Nextway'); // Adjust provider as needed

    // Call the AI with the messages
    const responseText = await provider.chatCompletion(messages, { model: 'gpt-4o-free' });

    console.log('AI Response:', responseText); // Log the AI response

    res.json({ response: responseText });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
