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
    console.error(`Error scraping content with Cheerio: ${error.message}`);
    try {
      const browser = await puppeteer.launch({ headless: "new" });
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle2' , timeout: 6000 });

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

// Function to clean and truncate text
const cleanAndTruncateText = (text, maxChars) => {
  // Remove irrelevant characters using regular expression
  let cleanedText = text.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();

  // Truncate to approximate token limit
  return cleanedText.length > maxChars ? cleanedText.slice(0, maxChars) + '...' : cleanedText;
};

function extractAfterColon(inputString) {
  const parts = inputString.split(': ');
  if (parts.length > 1) {
      return parts[1].trim(); // Return the part after the colon
  }
  return ''; // Return empty string if no colon was found
}

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


// Test route
app.get('/', (req, res) => {
  res.send('Successfully fetched from backend : )');
});

async function getChatResponse(message) {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{"role": "user", "content": message},],
  });
  return response.choices[0].message;
}

app.post('/submit', async (req, res) => {
  const userData = req.body;
  console.log(userData);  // Log the user data

  try {
    const scrapedContent = await scrapeContent(userData.inputs[0]);
    if (!scrapedContent) {
      throw new Error('Failed to scrape content or content is empty.');
    }

    const preparedContent = cleanAndTruncateText(scrapedContent, 1200);

    const translationPrompt = `Translate the following text to English:\n\n${preparedContent}`;
    const datePrompt = `Based on the previously translated article, give me the date of the publication in the format of "date": "September 1, 2021"`;
    const mediaNamePrompt = `Based on the previously translated article, give me the name of the media/publication in the format of "mediaName": "Parenting Science Magazine" `;
    const titlePrompt = `Based on the previously translated article, give me the title of the news article in the format of "title": "Drama in Education, A “Shortcut” Enriching Children’s Life Experience"`;
    const articleSummaryPrompt = `Based on the previously translated article and online resources, give me a longer positive summary of news article in the format of  "articleSummary": "..." `;
    const mediaBackgroundSummaryPrompt = `Based on the previously translated article and online resources, give me a postive summary about the background of the media/publication in the format of "mediaBackgroundSummary": "..."`;

    // const translationResponse = await getChatResponse(translationPrompt);
    // const dateResponse = await getChatResponse(translationResponse+"\n\n"+datePrompt);

    // const chatCompletion = await openai.chat.completions.create({
    //   model: "gpt-3.5-turbo",
    //   messages: [{"role": "user", "content": translationPrompt}, 
    //   {"role": "user", "content": datePrompt}, 
    //   {"role": "user", "content": mediaNamePrompt}, 
    //   {"role": "user", "content": titlePrompt}, 
    //   {"role": "user", "content": articleSummaryPrompt}, 
    //   {"role": "user", "content": mediaBackgroundSummaryPrompt},],
    // });

    const combinedPrompt = `
    I have a news article from which I need specific information extracted and summarized. Firstly, translate the following text to English:

    ${preparedContent}

    After translating, please organize the extracted information into a clearly structured format as follows:

    1. Date of the News Article: [Provide the publication date here]
    2. Media/Publication Name: [Provide the name of the media or publication here]
    3. Article Title: [Provide the title of the news article here]
    4. Article Summary: [Provide a positive, concise summary of the news article here]
    5. Background of the Media/Publication: [Provide a positive summary of the media or publication's background here]

    Please ensure each piece of information is succinctly presented right after its corresponding number and label.
    `;

    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", //"gpt-4-1106-preview",
      messages: [{"role": "user", "content": combinedPrompt}, ],
    });

    const aiResponse = chatCompletion.choices[0].message.content;
    const parsedResponse = parseAIResponse(aiResponse);

    // Send a response back to the frontend
    res.json({ 
      scrapedContent: scrapedContent,
      processedContent: preparedContent,  
      // combinedPrompt: combinedPrompt, 
      // receivedData: userData.inputs, 
      message: "Data received successfully!", 
      // chatCompletion: chatCompletion, 
      // openaiResult: "...", 
      parsedData: parsedResponse
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).send('Error processing data with OpenAI');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

