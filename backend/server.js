const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json()); // Middleware to parse JSON requests

// Example route
app.get('/', (req, res) => {
  res.send('Hello World we0g8!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
