import { GoogleGenAI } from '@google/genai';
import type { NewsArticle } from './scrapers.server';

export interface AnalyzedCluster {
  id: string;
  topic: string;
  generalSummary: string;
  articles: Array<{
    title: string;
    source: string;
    url: string;
    biasAssessment: string; // Brief description
    biasScore: number; // A number from -100 (Extreme Left) to 100 (Extreme Right), 0 is Neutral
    imageUrl?: string;
  }>;
}

// Function to call the LLM and analyze the fetched news
export async function analyzeNews(articles: NewsArticle[]): Promise<AnalyzedCluster[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
  You are an expert news analyst and bias detection assistant.
  I will provide you with a list of news headlines scraped from various top news outlets.
  
  Your task is to:
  1. Cluster SIMILAR news articles together (same event or topic). Ignore articles that don't match with any others if they are minor, or create a single-article cluster if it's a major event.
  2. For each cluster, write a brief, objective 'generalSummary' of the event.
  3. For each article in the cluster, provide a 'biasAssessment' evaluating the headline's bias (e.g., loaded language, framing). KEEP this assessment very brief (1-2 sentences).
  4. For each article, provide a 'biasScore' as a raw integer from -100 to 100. (-100 = Extreme Left/Liberal bias, 0 = Neutral/Center, 100 = Extreme Right/Conservative bias). Analyze the specific headline and standard leanings of the source to determine this. MAKE SURE this is always a valid number.
  
  Articles data:
  ${JSON.stringify(articles.map(a => ({ title: a.title, source: a.source, url: a.url })), null, 2)}
  
  Return the results STRICTLY as a JSON array of objects matching this TypeScript interface:
  interface AnalyzedCluster {
    id: string; // generate a unique id like topic-1
    topic: string; // brief topic name
    generalSummary: string;
    articles: Array<{
      title: string;
      source: string;
      url: string;
      biasAssessment: string;
      biasScore: number;
    }>;
  }
  
  Do not include markdown codeblocks (\`\`\`json etc) in your response, just the raw JSON array.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.1, // very low temp for strict structured output
      }
    });

    const text = response.text || '[]';
    // Clean up to parse JSON in case the model returns markdown
    let jsonStr = text.trim();
    if (jsonStr.startsWith('\`\`\`json')) {
      jsonStr = jsonStr.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    } else if (jsonStr.startsWith('\`\`\`')) {
      jsonStr = jsonStr.replace(/\`\`\`/g, '').trim();
    }

    const result: AnalyzedCluster[] = JSON.parse(jsonStr);
    
    // Map original image URLs back into the AI results
    result.forEach(cluster => {
      cluster.articles.forEach(aiArticle => {
        const originalArticle = articles.find(a => a.url === aiArticle.url);
        aiArticle.imageUrl = originalArticle?.imageUrl || '';
        
        // Ensure biasScore is a number (sometimes AI sends strings)
        if (typeof aiArticle.biasScore === 'string') {
          aiArticle.biasScore = parseInt(aiArticle.biasScore, 10) || 0;
        }
      });
    });

    return result;
  } catch (error) {
    console.error('Error analyzing news with Gemini:', error);
    return [];
  }
}
