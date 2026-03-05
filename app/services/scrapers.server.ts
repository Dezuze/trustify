import * as cheerio from 'cheerio';

export interface NewsArticle {
  title: string;
  source: string;
  url: string;
  imageUrl?: string;
}

const TIMEOUT = 5000; // Force a strict 5-second timeout on all sources

export async function scrapeCNN(): Promise<NewsArticle[]> {
  const articles: NewsArticle[] = [];
  try {
    const response = await fetch('https://www.cnn.com/', { signal: AbortSignal.timeout(TIMEOUT) });
    if (!response.ok) return [];
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    $('.container__item').each((i, element) => {
      if (articles.length >= 5) return;
      
      const titleEl = $(element).find('.container__headline-text');
      const title = titleEl.text().trim();
      
      let linkEl = $(element).find('a').first();
      let url = linkEl.attr('href') || '';
      if (url.startsWith('/')) url = 'https://www.cnn.com' + url;
      
      const imgEl = $(element).find('img.image__picture');
      let imageUrl = imgEl.attr('src') || '';
      
      if (title && url) {
        articles.push({ title, source: 'CNN', url, imageUrl });
      }
    });
  } catch (error) {
    console.error('CNN Scraper Timeout or Error:', error);
  }
  return articles;
}

export async function scrapeFoxNews(): Promise<NewsArticle[]> {
  const articles: NewsArticle[] = [];
  try {
    const response = await fetch('https://www.foxnews.com/', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(TIMEOUT)
    });
    if (!response.ok) return [];
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    $('article').each((i, element) => {
      if (articles.length >= 5) return;
      
      const titleEl = $(element).find('.title > a');
      const title = titleEl.text().trim();
      let url = titleEl.attr('href') || '';
      if (url.startsWith('//')) url = 'https:' + url;
      else if (url.startsWith('/')) url = 'https://www.foxnews.com' + url;
      
      const imgEl = $(element).find('img');
      let imageUrl = imgEl.attr('src') || '';
      if (imageUrl.startsWith('//')) imageUrl = 'https:' + imageUrl;
      
      // Ignore tiny icons or blank gifs
      if (imageUrl.includes('data:image') || imageUrl.includes('blank.gif')) {
         imageUrl = '';
      }
      
      if (title && url && url !== 'https://www.foxnews.com') {
        articles.push({ title, source: 'Fox News', url, imageUrl });
      }
    });
  } catch (error) {
    console.error('Fox News Scraper Timeout or Error:', error);
  }
  return articles;
}

export async function scrapeBBC(): Promise<NewsArticle[]> {
  const articles: NewsArticle[] = [];
  try {
    const response = await fetch('https://www.bbc.com/news', { signal: AbortSignal.timeout(TIMEOUT) });
    if (!response.ok) return [];
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    $('[data-testid="card-headline"]').each((i, element) => {
      if (articles.length >= 5) return;
      const title = $(element).text().trim();
      const linkEl = $(element).closest('a');
      let url = linkEl.attr('href') || '';
      if (url.startsWith('/')) url = 'https://www.bbc.com' + url;
      
      const container = linkEl.parent().parent();
      const imgEl = container.find('img');
      const imageUrl = imgEl.attr('src') || '';
      
      if (title && url) {
        articles.push({ title, source: 'BBC', url, imageUrl });
      }
    });
  } catch (error) {
    console.error('BBC Scraper Timeout or Error:', error);
  }
  return articles;
}

export async function scrapeNYT(): Promise<NewsArticle[]> {
  const articles: NewsArticle[] = [];
  try {
    const response = await fetch('https://www.nytimes.com/', { signal: AbortSignal.timeout(TIMEOUT) });
    if (!response.ok) return [];
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    $('section[data-testid="block-TopStories"] article').each((i, element) => {
      if (articles.length >= 5) return;
      const title = $(element).find('p.indicate-hover').text().trim() || $(element).find('h3').text().trim();
      const linkEl = $(element).find('a').first();
      let url = linkEl.attr('href') || '';
      if (url.startsWith('/')) url = 'https://www.nytimes.com' + url;
      
      const imgEl = $(element).find('img');
      // NYT often uses srcset, try to get the first one if src is empty
      let imageUrl = imgEl.attr('src') || '';
      if (!imageUrl && imgEl.attr('srcset')) {
        imageUrl = imgEl.attr('srcset')?.split(' ')[0] || '';
      }
      
      if (title && url && url.includes('20')) {
        articles.push({ title, source: 'New York Times', url, imageUrl });
      }
    });
  } catch (error) {
    console.error('NYT Scraper Timeout or Error:', error);
  }
  return articles;
}

export async function scrapeNDTV(): Promise<NewsArticle[]> {
  const articles: NewsArticle[] = [];
  try {
    const response = await fetch('https://www.ndtv.com/india', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      signal: AbortSignal.timeout(TIMEOUT)
    });
    if (!response.ok) return [];
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    $('.news_Itm').each((i, element) => {
      if (articles.length >= 5) return;
      const titleEl = $(element).find('.newsHdng a');
      const title = titleEl.text().trim();
      let url = titleEl.attr('href') || '';
      
      const imgEl = $(element).find('.newsItm-img img');
      let imageUrl = imgEl.attr('src') || '';
      
      if (title && url) {
        articles.push({ title, source: 'NDTV', url, imageUrl });
      }
    });
  } catch (error) {
    console.error('NDTV Scraper Timeout or Error:', error);
  }
  return articles;
}

export async function scrapeTOI(): Promise<NewsArticle[]> {
  const articles: NewsArticle[] = [];
  try {
    const response = await fetch('https://timesofindia.indiatimes.com/india', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      signal: AbortSignal.timeout(TIMEOUT)
    });
    if (!response.ok) return [];
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    $('figure').each((i, element) => {
      if (articles.length >= 5) return;
      const linkEl = $(element).find('a');
      const title = linkEl.attr('title') || $(element).find('figcaption').text().trim();
      let url = linkEl.attr('href') || '';
      if (url.startsWith('/')) url = 'https://timesofindia.indiatimes.com' + url;
      
      const imgEl = $(element).find('img');
      const imageUrl = imgEl.attr('data-src') || imgEl.attr('src') || '';
      
      if (title && url && url.includes('/articleshow/')) {
        articles.push({ title, source: 'Times of India', url, imageUrl });
      }
    });
  } catch (error) {
    console.error('TOI Scraper Timeout or Error:', error);
  }
  return articles;
}

export async function scrapeHT(): Promise<NewsArticle[]> {
  const articles: NewsArticle[] = [];
  try {
    const response = await fetch('https://www.hindustantimes.com/india-news', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      signal: AbortSignal.timeout(TIMEOUT)
    });
    if (!response.ok) return [];
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    $('.cartHolder').each((i, element) => {
      if (articles.length >= 5) return;
      const titleEl = $(element).find('h3.hdg3 a');
      const title = titleEl.text().trim();
      let url = titleEl.attr('href') || '';
      if (url.startsWith('/')) url = 'https://www.hindustantimes.com' + url;
      
      const imgEl = $(element).find('figure img');
      // HT often uses 'data-src', 'data-original' or 'data-srcset' for the real image, and 'src' is a tiny placeholder
      let imageUrl = imgEl.attr('data-src') || imgEl.attr('data-original') || imgEl.attr('src') || '';
      
      // If it's a srcset, grab the highest resolution one
      if (!imgEl.attr('data-src') && imgEl.attr('data-srcset')) {
          const sources = imgEl.attr('data-srcset')?.split(',').pop()?.trim().split(' ')[0];
          if (sources) imageUrl = sources;
      }
      
      if (title && url) {
        articles.push({ title, source: 'Hindustan Times', url, imageUrl });
      }
    });
  } catch (error) {
    console.error('HT Scraper Timeout or Error:', error);
  }
  return articles;
}

export async function scrapeIndianExpress(): Promise<NewsArticle[]> {
  const articles: NewsArticle[] = [];
  try {
    const response = await fetch('https://indianexpress.com/section/india/', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      signal: AbortSignal.timeout(TIMEOUT)
    });
    if (!response.ok) return [];
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    $('.articles').each((i, element) => {
      if (articles.length >= 5) return;
      const titleEl = $(element).find('h2.title a');
      const title = titleEl.text().trim();
      let url = titleEl.attr('href') || '';
      
      const imgEl = $(element).find('.snaps img');
      // Indian Express uses data-lazy-src or data-src for the real image
      let imageUrl = imgEl.attr('data-lazy-src') || imgEl.attr('data-src') || imgEl.attr('src') || '';
      
      if (title && url) {
        articles.push({ title, source: 'Indian Express', url, imageUrl });
      }
    });
  } catch (error) {
    console.error('Indian Express Scraper Timeout or Error:', error);
  }
  return articles;
}

export async function scrapeTheHindu(): Promise<NewsArticle[]> {
  const articles: NewsArticle[] = [];
  try {
    const response = await fetch('https://www.thehindu.com/news/national/', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      signal: AbortSignal.timeout(TIMEOUT)
    });
    if (!response.ok) return [];
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    $('.element').each((i, element) => {
      if (articles.length >= 5) return;
      const titleEl = $(element).find('.title a');
      const title = titleEl.text().trim();
      let url = titleEl.attr('href') || '';
      
      const imgEl = $(element).find('.picture img');
      const imageUrl = imgEl.attr('data-src-template') || imgEl.attr('src') || '';
      
      if (title && url) {
        articles.push({ title, source: 'The Hindu', url, imageUrl });
      }
    });
  } catch (error) {
    console.error('The Hindu Scraper Timeout or Error:', error);
  }
  return articles;
}

export async function fetchAllNews(): Promise<NewsArticle[]> {
  const results = await Promise.allSettled([
    scrapeCNN(),
    scrapeFoxNews(),
    scrapeBBC(),
    scrapeNYT(),
    scrapeNDTV(),
    scrapeTOI(),
    scrapeHT(),
    scrapeIndianExpress(),
    scrapeTheHindu()
  ]);
  
  const allArticles: NewsArticle[] = [];
  results.forEach(result => {
    if (result.status === 'fulfilled') {
      allArticles.push(...result.value);
    }
  });

  // Global Image Cleanup Pass
  // Empty out data URIs, tracking pixels, avatars, or low-res thumbnails based on common URL patterns.
  allArticles.forEach(article => {
    if (article.imageUrl) {
      const url = article.imageUrl.toLowerCase();
      
      // Reject if it's a known junk pattern
      if (
        url.startsWith('data:') ||
        url.includes('blank.gif') ||
        url.includes('spacer') ||
        url.includes('avatar') ||
        url.includes('favicon') ||
        url.includes('1x1') // common tracking pixel
      ) {
        article.imageUrl = '';
      }
      
      // Reject if it's a tiny thumbnail (e.g., contains 150x150, 48x48, max-width-120)
      if (/[_-]\d{2,3}x\d{2,3}[_.-]/i.test(url) && !url.includes('1000') && !url.includes('800')) {
          article.imageUrl = '';
      }
    }
  });
  
  return allArticles;
}
