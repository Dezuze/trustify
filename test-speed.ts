import { fetchAllNews } from './app/services/scrapers.server.js';
import { analyzeNews } from './app/services/analyzer.server.js';
import 'dotenv/config'; // Make sure this is installed or we just use process.env if loaded

async function run() {
  console.log('--- STARTING DIAGNOSTICS ---');
  
  const startScrape = Date.now();
  console.log('1. Fetching all news...');
  const articles = await fetchAllNews();
  const scrapeTime = Date.now() - startScrape;
  console.log(`✅ Scraped ${articles.length} articles in ${scrapeTime}ms`);
  
  if (articles.length === 0) {
    console.log('No articles scraped. Exiting.');
    return;
  }
  
  console.log('2. Sending to Gemini for analysis...');
  const startAnalyze = Date.now();
  try {
    const clusters = await analyzeNews(articles);
    const analyzeTime = Date.now() - startAnalyze;
    console.log(`✅ AI Analysis completed in ${analyzeTime}ms`);
    console.log(`Generated ${clusters.length} clusters.`);
  } catch (error) {
    console.error('❌ AI Analysis failed:', error);
  }
  
  console.log('--- DIAGNOSTICS COMPLETE ---');
}

run();
