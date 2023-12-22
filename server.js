//app-name: pacific-stream-59101

import OpenAI from 'openai';

const openai = new OpenAI({
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
    // const openaiResponse = await openai.createChatCompletion({
    //   model: "gpt-3.5-turbo", // Using the ChatGPT model
    //   messages: [
    //     {"role": "system", "content": "what time is it now?"},
    //   ]
    // });

    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{"role": "user", "content": "Hello!"}],
    });

    // Send a response back to the frontend
    res.json({ 
      receivedData: userData, 
      message: "Data received successfully!", 
      openaiResult: chatCompletion.choices[0].message 
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).send('Error processing data with OpenAI');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
