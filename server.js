//app-name: pacific-stream-59101

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

app.post('/submit', (req, res) => {
  const userData = req.body;
  console.log(userData);  // Process or log the data as needed

  // Send a response back to the frontend
  res.json({ receivedData: req.body, message: "Data received successfully!" });
});

// app.post('/submit', async (req, res) => {
//   try {
//     const userData = req.body;
//     const links = req.body.req.inputs[0]
//     console.log(req.body.inputs[0])
//     const response = await openai.createCompletion({
//       model: "text-davinci-003", // Or whichever model you intend to use
//       prompt: "Summarize the webiste" + userData.text, 
//       max_tokens: 150,
//     });

//     res.json({ 
//       originalData: userData, 
//       testing: "testing0", 
//       openaiResponse: response.data.choices[0].text.trim()
//     });
//   } catch (error) {
//     console.error('Error with OpenAI API:', error);
//     res.status(500).send('Error processing data with OpenAI');
//   }
// });



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
