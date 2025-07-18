// Official NewsAPI.org service for fetching news articles
import API_CONFIG from '../config/api';

export interface NewsArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

export interface NewsResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
}

export interface NewsFilters {
  category?: string;
  country?: string;
  language?: string;
  q?: string;
  sources?: string;
  pageSize?: number;
  page?: number;
  sortBy?: 'relevancy' | 'popularity' | 'publishedAt';
}

class NewsService {
  private baseUrl = API_CONFIG.NEWS_API_BASE_URL;
  private apiKey = API_CONFIG.NEWS_API_KEY;
  private seenArticleUrls = new Set<string>(); // Track seen articles to prevent duplicates

  clearSeenArticles() {
    this.seenArticleUrls.clear();
  }

  async fetchTopHeadlines(filters: NewsFilters = {}): Promise<NewsResponse> {
    const params = new URLSearchParams({
      apiKey: this.apiKey,
    });

    // Add parameters
    if (filters.country) {
      params.append('country', filters.country);
    } else {
      params.append('country', API_CONFIG.DEFAULT_PARAMS.country);
    }

    if (filters.category) {
      params.append('category', filters.category);
    }

    if (filters.sources) {
      params.append('sources', filters.sources);
      // Remove country when using sources (API requirement)
      params.delete('country');
    }

    if (filters.q) {
      params.append('q', filters.q);
    }

    if (filters.pageSize && filters.pageSize <= 100) {
      params.append('pageSize', filters.pageSize.toString());
    } else {
      params.append('pageSize', API_CONFIG.DEFAULT_PARAMS.pageSize.toString());
    }

    if (filters.page) {
      params.append('page', filters.page.toString());
    }

    const url = `${this.baseUrl}/top-headlines?${params}`;
    console.log('🔍 Making API request to:', url);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      console.log('📡 Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`Failed to fetch news: ${response.status} ${response.statusText}`);
      }

      const data: NewsResponse = await response.json();
      console.log('✅ API Response received. Total results:', data.totalResults);
      console.log('✅ Articles length:', data.articles?.length);
      
      if (data.status !== 'ok') {
        throw new Error(`API returned error status: ${data.status}`);
      }

      // Filter out duplicates
      const uniqueArticles = data.articles.filter(article => {
        if (this.seenArticleUrls.has(article.url)) {
          console.log('🔄 Skipping duplicate article:', article.title);
          return false;
        }
        this.seenArticleUrls.add(article.url);
        return true;
      });

      console.log('✅ Unique articles after deduplication:', uniqueArticles.length);

      return {
        ...data,
        articles: this.transformArticles(uniqueArticles),
      };
    } catch (error) {
      console.error('💥 Error fetching news:', error);
      throw error;
    }
  }

  async fetchEverything(filters: NewsFilters = {}): Promise<NewsResponse> {
    const params = new URLSearchParams({
      apiKey: this.apiKey,
    });

    // Add parameters for everything endpoint
    if (filters.q) {
      params.append('q', filters.q);
    } else {
      // Default query for everything endpoint
      params.append('q', 'news');
    }

    if (filters.sources) {
      params.append('sources', filters.sources);
    }

    if (filters.language) {
      params.append('language', filters.language);
    } else {
      params.append('language', API_CONFIG.DEFAULT_PARAMS.language);
    }

    if (filters.sortBy) {
      params.append('sortBy', filters.sortBy);
    } else {
      params.append('sortBy', 'publishedAt');
    }

    if (filters.pageSize && filters.pageSize <= 100) {
      params.append('pageSize', filters.pageSize.toString());
    } else {
      params.append('pageSize', API_CONFIG.DEFAULT_PARAMS.pageSize.toString());
    }

    if (filters.page) {
      params.append('page', filters.page.toString());
    }

    const url = `${this.baseUrl}/everything?${params}`;
    console.log('🔍 Making API request to:', url);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      console.log('📡 Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`Failed to fetch news: ${response.status} ${response.statusText}`);
      }

      const data: NewsResponse = await response.json();
      console.log('✅ API Response received. Total results:', data.totalResults);
      console.log('✅ Articles length:', data.articles?.length);
      
      if (data.status !== 'ok') {
        throw new Error(`API returned error status: ${data.status}`);
      }

      // Filter out duplicates
      const uniqueArticles = data.articles.filter(article => {
        if (this.seenArticleUrls.has(article.url)) {
          console.log('🔄 Skipping duplicate article:', article.title);
          return false;
        }
        this.seenArticleUrls.add(article.url);
        return true;
      });

      console.log('✅ Unique articles after deduplication:', uniqueArticles.length);

      return {
        ...data,
        articles: this.transformArticles(uniqueArticles),
      };
    } catch (error) {
      console.error('💥 Error fetching news:', error);
      throw error;
    }
  }

  // Main fetch method - defaults to top headlines
  async fetchNews(filters: NewsFilters = {}): Promise<NewsResponse> {
    // Use everything endpoint for search queries
    if (filters.q && filters.q.trim()) {
      return this.fetchEverything(filters);
    } else {
      return this.fetchTopHeadlines(filters);
    }
  }

  async searchNews(query: string, filters: NewsFilters = {}): Promise<NewsResponse> {
    return this.fetchEverything({
      ...filters,
      q: query.trim(),
      sortBy: 'relevancy'
    });
  }

  async fetchNewsByCategory(category: string, filters: Omit<NewsFilters, 'category'> = {}): Promise<NewsResponse> {
    return this.fetchTopHeadlines({
      ...filters,
      category,
    });
  }

  async fetchSources(): Promise<{ status: string; sources: any[] }> {
    const url = `${this.baseUrl}/sources?apiKey=${this.apiKey}`;
    console.log('🔍 Fetching sources from:', url);

    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status !== 'ok') {
        throw new Error(`Failed to fetch sources: ${data.status}`);
      }

      return data;
    } catch (error) {
      console.error('💥 Error fetching sources:', error);
      throw error;
    }
  }

  private transformArticles(articles: NewsArticle[]): NewsArticle[] {
    return articles.map(article => ({
      ...article,
      // Ensure we have fallback values for missing data
      title: article.title || 'Untitled Article',
      description: article.description || 'No description available.',
      content: article.content || article.description || 'No content available.',
      urlToImage: article.urlToImage || null,
      source: article.source || { id: null, name: 'Unknown Source' },
      publishedAt: article.publishedAt || new Date().toISOString(),
      author: article.author || 'Unknown Author',
      url: article.url || '#',
    }));
  }

  // Helper method to format publication date
  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Unknown date';
    }
  }

  // Get available categories from the API config
  getAvailableCategories(): string[] {
    return API_CONFIG.CATEGORIES;
  }

  // Get available countries from the API config
  getAvailableCountries(): string[] {
    return API_CONFIG.COUNTRIES;
  }

  // Get available languages from the API config
  getAvailableLanguages(): string[] {
    return API_CONFIG.LANGUAGES;
  }
}

export const newsService = new NewsService();
export default newsService;
