import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import axios from 'axios';
import cheerio from 'cheerio';


dotenv.config();

const app = express();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY 
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

const scrapeContent = async (url) => {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Remove script and style elements
    $('script, style, header, footer, nav').remove();

    // Attempt to get text from body or main content areas
    const content = $('main, article, section, .content, .article, .post, body').text();

    return content.trim();
  } catch (error) {
    console.error(`Error scraping content: ${error.message}`);
    return null;
  }
};

// Function to clean and truncate text
const cleanAndTruncateText = (text, maxChars) => {
  // Remove irrelevant characters using regular expression
  let cleanedText = text.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();

  // Truncate to approximate token limit
  return cleanedText.length > maxChars ? cleanedText.slice(0, maxChars) + '...' : cleanedText;
};


// Test route
app.get('/', (req, res) => {
  res.send('Successfully fetched from backend : )');
});

app.post('/submit', async (req, res) => {
  const userData = req.body;
  console.log(userData);  // Log the user data

  try {
    const scrapedContent = await scrapeContent(userData.inputs[0]);
    if (!scrapedContent) {
      throw new Error('Failed to scrape content or content is empty.');
    }

    const preparedContent = cleanAndTruncateText(scrapedContent, 1000);

    const translationAndSummarizationPrompt = `Translate the following text to English and then provide a summary:\n\n${preparedContent}`;
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{"role": "user", "content": translationAndSummarizationPrompt}],
    });

    // Send a response back to the frontend
    res.json({ 
      scrapedContent: scrapedContent, 
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
