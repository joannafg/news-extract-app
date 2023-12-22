//app-name: pacific-stream-59101

const { Configuration, OpenAIApi } = require('openai');

const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // Ensure your API key is stored in .env file
}));

const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json()); // Middleware to parse JSON requests

// Test route
app.get('/', (req, res) => {
  res.send('Successfully fetched from backend : )');
});

// app.post('/submit', (req, res) => {
//   const userData = req.body;
//   console.log(userData);  // Process or log the data as needed

//   // Send a response back to the frontend
//   res.json({ receivedData: req.body, message: "Data received successfully!" });
// });

app.post('/submit', async (req, res) => {
  const userData = req.body;
  console.log(userData);  // Log the user data

  try {
    // Call OpenAI's API
    const openaiResponse = await openai.createCompletion({
      model: "text-davinci-003", // You can choose a different model as needed
      prompt: "Say 'Hello World' in a creative way based on this input: " + userData.input,
      max_tokens: 50
    });

    // Send a response back to the frontend
    res.json({ 
      receivedData: req.body, 
      message: "Data received successfully!", 
      openaiResult: openaiResponse.data.choices[0].text.trim() 
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).send('Error processing data with OpenAI');
  }
});




app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
