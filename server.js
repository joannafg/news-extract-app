import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';

dotenv.config();

const app = express();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY 
});

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
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{"role": "user", "content": "the news article might be in English or Chinese. summarize this news article, news article link is:" + userData.inputs[0]}],
    });

    // Send a response back to the frontend
    res.json({ 
      receivedData: userData.inputs[0], 
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
