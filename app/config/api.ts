const API_CONFIG = {
  NEWS_API_KEY: import.meta.env.VITE_NEWS_API_KEY || '4fdd773f0858423a817d1f4e551f1827',
  NEWS_API_BASE_URL: 'https://newsapi.org/v2',
  DEFAULT_PARAMS: {
    country: 'us',
    category: 'general',
    pageSize: 20,
    language: 'en'
  },
  CATEGORIES: ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'],
  COUNTRIES: ['us', 'gb', 'ca', 'au', 'de', 'fr', 'it', 'jp', 'kr', 'nl', 'no', 'se'],
  LANGUAGES: ['en', 'de', 'fr', 'it', 'nl', 'no', 'se']
};

export default API_CONFIG;
