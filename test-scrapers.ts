import * as scrapers from './app/services/scrapers.server.ts';

async function testScrapers() {
  console.log('--- STARTING SCRAPER DIAGNOSTICS ---\n');

  const sources = [
    { name: 'CNN', fn: scrapers.scrapeCNN },
    { name: 'Fox News', fn: scrapers.scrapeFoxNews },
    { name: 'BBC', fn: scrapers.scrapeBBC },
    { name: 'NYT', fn: scrapers.scrapeNYT },
    { name: 'NDTV', fn: scrapers.scrapeNDTV },
    { name: 'Times of India', fn: scrapers.scrapeTOI },
    { name: 'Hindustan Times', fn: scrapers.scrapeHT },
    { name: 'Indian Express', fn: scrapers.scrapeIndianExpress },
    { name: 'The Hindu', fn: scrapers.scrapeTheHindu }
  ];

  for (const scraper of sources) {
    console.log(`Testing ${scraper.name} scraper...`);
    try {
      const start = Date.now();
      const articles = await scraper.fn();
      const duration = Date.now() - start;
      
      console.log(`✅ Success in ${duration}ms! Found ${articles.length} articles.`);
      if (articles.length > 0) {
        articles.forEach((a, i) => {
            console.log(`   [Article ${i + 1}]`);
            console.log(`   Headline: "${a.title}"`);
            console.log(`   Img URL:  ${a.imageUrl ? a.imageUrl : '[NO IMAGE - WILL USE UNSPLASH FALLBACK]'}`);
            console.log(`   Link:     ${a.url}`);
            console.log(``);
        });
      } else {
        console.warn(`⚠️ Warning: No articles found for ${scraper.name}`);
      }
    } catch (error) {
       console.error(`❌ Error scraping ${scraper.name}:`, error);
    }
    console.log('--------------------------------------------------\n');
  }
}

testScrapers();
