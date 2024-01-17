import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import axios from 'axios';
import cheerio from 'cheerio';
import puppeteer from 'puppeteer';



dotenv.config();

const app = express();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY 
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

/**
 * Scrapes the content from a given URL using Cheerio and Puppeteer.
 * If Cheerio fails to scrape, Puppeteer is used as a fallback.
 * @param {string} url - The URL of the webpage to scrape.
 * @returns {string|null} - The scraped content as a string, or null if an error occurs.
 */
const scrapeContent = async (url) => {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    $('script, style').remove();

    const content = $('body').text();

    return content.trim();
  } catch (error) {
    console.error(`Error scraping content with Cheerio: ${error.message}`);
    try {
      const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });      
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle2' , timeout: 30000 });

      const puppeteerContent = await page.evaluate(() => {
        return document.querySelector('body').innerText;
      });

      await browser.close();
      return puppeteerContent.trim();
    } catch (puppeteerError) {
      console.error(`Error scraping content with Puppeteer: ${puppeteerError.message}`);
      return null;
    }
  }
};

/**
 * Cleans and truncates a given text to a maximum character limit.
 * Removes extra whitespace and line breaks, and truncates if longer than maxChars.
 * @param {string} text - The text to be cleaned and truncated.
 * @param {number} maxChars - The maximum number of characters the text should have.
 * @returns {string} - The cleaned and possibly truncated text.
 */
const cleanAndTruncateText = (text, maxChars) => {
  let cleanedText = text
        .replace(/[\r\n\t]+/g, ' ') 
        .replace(/\s+/g, ' ') 
        .trim();

  return cleanedText.length > maxChars ? cleanedText.slice(0, maxChars) + '...' : cleanedText;
};

/**
 * Extracts the substring after the first colon found in the input string.
 * @param {string} inputString - The string containing the colon-separated data.
 * @returns {string} - The substring after the colon, or an empty string if no colon is found.
 */
function extractAfterColon(inputString) {
  const parts = inputString.split(': ');
  if (parts.length > 1) {
      return parts[1].trim(); 
  }
  return ''; 
}

/**
 * Parses the response from the OpenAI API and extracts structured data.
 * The response is expected to have specific markers (like '1.', '2.', etc.) to identify sections.
 * @param {string} response - The response string from the OpenAI API.
 * @returns {object} - An object containing parsed data with keys like date, mediaName, title, etc.
 */
function parseAIResponse(response) {
  const lines = response.split('\n');
    let parsedData = {
        date: "",
        mediaName: "",
        title: "",
        articleSummary: "",
        mediaBackgroundSummary: ""
    };

    let currentSection = '';

    lines.forEach(line => {
      if (line.startsWith('1.')) {
          currentSection = 'date';
          parsedData.date = extractAfterColon(line.substring(3).trim());
      } else if (line.startsWith('2.')) {
          currentSection = 'mediaName';
          parsedData.mediaName = extractAfterColon(line.substring(3).trim());
      } else if (line.startsWith('3.')) {
          currentSection = 'title';
          parsedData.title = extractAfterColon(line.substring(3).trim());
      } else if (line.startsWith('4.')) {
          currentSection = 'articleSummary';
          parsedData.articleSummary = extractAfterColon(line.substring(3).trim());
      } else if (line.startsWith('5.')) {
          currentSection = 'mediaBackgroundSummary';
          parsedData.mediaBackgroundSummary = extractAfterColon(line.substring(3).trim());
      } else {
          if (currentSection === 'articleSummary') {
              parsedData.articleSummary += ' ' + line.trim();
          } else if (currentSection === 'mediaBackgroundSummary') {
              parsedData.mediaBackgroundSummary += ' ' + line.trim();
          }
      }
  });

    return parsedData;
}

/**
 * Sends a message to OpenAI's chat completion and returns the response.
 * @param {string} message - The message content to send to the OpenAI API.
 * @returns {Promise<string>} - A promise that resolves to the response message from OpenAI.
 */
async function getChatResponse(message) {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{"role": "user", "content": message},],
  });
  return response.choices[0].message;
}

/**
 * Determines if a given string is a valid URL.
 * @param {string} str - The string to check.
 * @returns {boolean} - True if the string is a URL, false otherwise.
 */
const isValidUrl = (str) => {
  try {
    new URL(str);
    return true;
  } catch (_) {
    return false;
  }
};

/**
 * Express GET route handler for the root path. Sends a success message.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {void}
 */
app.get('/', (req, res) => {
  res.send('Successfully fetched from backend : )');
});

/**
 * Express POST route handler for submitting and processing data.
 * Receives a user request with a URL or text content, processes it, and returns the result.
 * @param {object} req - The request object, containing user data in its body.
 * @param {object} res - The response object used to send back the processed data.
 * @returns {void}
 */
app.post('/submit', async (req, res) => {
  const userData = req.body;
  console.log(userData);
  let scrapedContent;   

  try {
    if(isValidUrl(userData.inputs[0])) {
      scrapedContent = await scrapeContent(userData.inputs[0]);
      if (!scrapedContent) {
        throw new Error('Failed to scrape content or content is empty.');
      }
    } else {
      scrapedContent = userData.inputs[0]; 
    }
    
    const preparedContent = cleanAndTruncateText(scrapedContent, 1200);

    const combinedPrompt = `
    I have a news article for which I need specific information extracted and summarized. The article's URL is ${userData.inputs[0]}. Firstly, translate the following text to English:

    ${preparedContent}

    After translating, please organize the extracted information into a clearly structured format as follows:

    1. Date of the News Article: In the format of 17 February, 2009. Provide the publication date here, if available in the content; otherwise, please infer from the URL or state 'Unknown'. 
    2. Media/Publication Name: If not clear from the content, deduce the name of the media or publication from the URL: ${userData.inputs[0]}. 
    3. Article Title: Provide the title of the news article here; if not available in the content, please infer from the article's URL. 
    4. Article Summary: Provide a positive, concise summary of the news article here. 
    5. Background of the Media/Publication: If not available in the content, please find and provide a positive summary about the background of the media or publication from online sources. 

    Please ensure each piece of information is succinctly presented right after its corresponding number and label.
    `;

    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4-1106-preview", //"gpt-3.5-turbo", //
      messages: [{"role": "user", "content": combinedPrompt}, ],
    });

    const aiResponse = chatCompletion.choices[0].message.content;
    const parsedResponse = parseAIResponse(aiResponse);

    res.json({ 
      scrapedContent: scrapedContent,
      processedContent: preparedContent,  
      message: "Data received successfully!", 
      parsedData: parsedResponse
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).send('Error processing data with OpenAI');
  }
});

