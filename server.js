//app-name: pacific-stream-59101

const { OpenAIApi } = require('openai');

const openai = new OpenAIApi({
  apiKey: process.env.OPENAI_API_KEY
});

const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Test route
app.get('/', (req, res) => {
  res.send('Successfully fetched from backend : )');
});

app.post('/submit', async (req, res) => {
  const userData = req.body;
  console.log(userData);  // Log the user data

  try {
    // Call OpenAI's Chat API
    const openaiResponse = await openai.createChatCompletion({
      model: "gpt-3.5-turbo", // Using the ChatGPT model
      messages: [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": userData.input} // User's input
        // You can add more messages if needed for context
      ]
    });

    // Send a response back to the frontend
    res.json({ 
      receivedData: userData, 
      message: "Data received successfully!", 
      openaiResult: openaiResponse.data.choices[0].message.content 
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).send('Error processing data with OpenAI');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
