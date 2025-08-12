import axios from "axios";
import * as cheerio from "cheerio";

async function scrapeTitle(url: string): Promise<string | null> {
  try {
    const { data } = await axios.get(url); // Fetch HTML
    const $ = cheerio.load(data); // Load HTML into Cheerio
    const title = $("title").text(); // Extract <title> content
    return title || null;
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return null;
  }
}

// Example usage
(async () => {
  const title = await scrapeTitle("https://example.com");
  console.log("Page Title:", title);
})();
