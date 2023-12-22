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
  res.json({ req: req.body, message: "Data received successfully!" });
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
