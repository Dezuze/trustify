import type { Route } from "./+types/home";
import Card from "../components/Card";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { newsService, type NewsArticle } from "../services/newsService";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Trustify" },
    { name: "description", content: "Welcome to Trustify - Your trusted news source!" },
  ];
}

// Add the required loader function
export async function loader({ request }: Route.LoaderArgs) {
  // You can optionally pre-load some data here if needed
  // For now, we'll just return empty data since we're loading on the client side
  return {
    initialData: null
  };
}

interface NewsItem {
  id: string;
  image: string;
  title: string;
  dateTime: string;
  description: string;
  fullContent: string;
  tags: string[];
  source?: string;
  link?: string;
}

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const mobileCardsContainerRef = useRef<HTMLDivElement>(null);

  // Transform API articles to our NewsItem format
  const transformApiData = useCallback((articles: NewsArticle[]): NewsItem[] => {
    return articles.map(article => ({
      id: article.url,
      image: article.urlToImage || `https://picsum.photos/400/250?random=${Math.floor(Math.random() * 1000)}`,
      title: article.title,
      dateTime: newsService.formatDate(article.publishedAt),
      description: article.description || '',
      fullContent: article.content || article.description || '',
      tags: [
        article.source.name,
        ...(article.title.split(' ').slice(0, 2))
      ].filter(Boolean),
      source: article.source.name,
      link: article.url
    }));
  }, []);

  // Memoized data processing
  const filteredNewsData = useMemo(() => {
    return newsData.filter(news => {
      const matchesSearch = searchQuery === "" || 
        news.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        news.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        news.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesTag = selectedTag === "" || selectedTag === "All" || 
        news.tags.some(tag => tag.toLowerCase() === selectedTag.toLowerCase());
      
      return matchesSearch && matchesTag;
    });
  }, [newsData, searchQuery, selectedTag]);

  const availableTags = useMemo(() => {
    const categories = newsService.getAvailableCategories();
    const uniqueTags = Array.from(new Set([
      ...categories,
      ...newsData.flatMap(news => news.tags)
    ]));
    return uniqueTags.sort();
  }, [newsData]);

  // GSAP Animation setup for cards
  useEffect(() => {
    if (typeof window === "undefined") return;

    const setupScrollAnimations = () => {
      // Desktop cards animation
      if (cardsContainerRef.current) {
        const cards = cardsContainerRef.current.querySelectorAll('.news-card');
        
        cards.forEach((card, index) => {
          gsap.fromTo(card, 
            {
              opacity: 0,
              y: 100,
              scale: 0.8,
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.8,
              delay: index * 0.1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: card,
                start: "top 95%",
                end: "bottom 5%",
                toggleActions: "play none none reverse",
                once: false,
              }
            }
          );
        });
      }

      // Mobile cards animation
      if (mobileCardsContainerRef.current) {
        const mobileCards = mobileCardsContainerRef.current.querySelectorAll('.news-card');
        
        mobileCards.forEach((card, index) => {
          gsap.fromTo(card,
            {
              opacity: 0,
              x: index % 2 === 0 ? -50 : 50,
              scale: 0.9,
            },
            {
              opacity: 1,
              x: 0,
              scale: 1,
              duration: 0.6,
              delay: index * 0.15,
              ease: "back.out(1.7)",
              scrollTrigger: {
                trigger: card,
                start: "top 95%",
                end: "bottom 5%",
                toggleActions: "play none none reverse",
                once: false,
              }
            }
          );
        });
      }
    };

    const timeoutId = setTimeout(setupScrollAnimations, 100);

    return () => {
      clearTimeout(timeoutId);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [filteredNewsData]);

  // Refresh ScrollTrigger when data changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      ScrollTrigger.refresh();
    }
  }, [filteredNewsData, isDarkMode]);

  // Floating elements animation
  useEffect(() => {
    if (typeof window === "undefined") return;

    gsap.fromTo('.floating-btn', 
      { scale: 0, rotation: 180, opacity: 0 },
      { scale: 1, rotation: 0, opacity: 1, duration: 0.6, ease: "back.out(1.7)", stagger: 0.1, delay: 0.5 }
    );

    gsap.fromTo('.search-bar',
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.3 }
    );

    gsap.fromTo('.animate-title',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out", stagger: 0.2 }
    );

    gsap.fromTo('.animate-title img',
      { scale: 0, rotation: -180, opacity: 0 },
      { scale: 1, rotation: 0, opacity: 1, duration: 1.2, ease: "back.out(1.7)", delay: 0.2 }
    );
  }, []);

  // Load initial news data
  const loadInitialNews = useCallback(async () => {
    setInitialLoading(true);
    setError("");
    
    try {
      newsService.clearSeenArticles();
      const result = await newsService.fetchNews({ pageSize: 20, page: 1 });
      
      const transformedArticles = transformApiData(result.articles);
      setNewsData(transformedArticles);
      setCurrentPage(1);
      setHasMore(result.totalResults > 20);
    } catch (err) {
      setError("Failed to load news. Please try again later.");
      console.error('Error loading initial news:', err);
    } finally {
      setInitialLoading(false);
    }
  }, [transformApiData]);

  // Load more news for infinite scroll
  const loadMoreNews = useCallback(async () => {
    if (loading || !hasMore || searchQuery || selectedTag) return;
    
    setLoading(true);
    try {
      const nextPage = currentPage + 1;
      const result = await newsService.fetchNews({ pageSize: 20, page: nextPage });
      
      const transformedArticles = transformApiData(result.articles);
      
      if (transformedArticles.length === 0) {
        setHasMore(false);
      } else {
        setNewsData(prev => [...prev, ...transformedArticles]);
        setCurrentPage(nextPage);
        setHasMore((nextPage * 20) < result.totalResults);
      }
    } catch (err) {
      console.error('Error loading more news:', err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, searchQuery, selectedTag, currentPage, transformApiData]);

  // Search functionality
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      await loadInitialNews();
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      newsService.clearSeenArticles();
      const result = await newsService.searchNews(query, { pageSize: 50 });
      const transformedArticles = transformApiData(result.articles);
      setNewsData(transformedArticles);
      setHasMore(false);
    } catch (err) {
      console.error('Search error:', err);
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [loadInitialNews, transformApiData]);

  // Filter by category
  const filterByCategory = useCallback(async (category: string) => {
    if (!category || category === "All") {
      await loadInitialNews();
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      newsService.clearSeenArticles();
      const result = await newsService.fetchNewsByCategory(category.toLowerCase(), { pageSize: 50 });
      const transformedArticles = transformApiData(result.articles);
      setNewsData(transformedArticles);
      setHasMore(false);
    } catch (err) {
      console.error('Category filter error:', err);
      setError("Failed to filter news. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [loadInitialNews, transformApiData]);

  // Initialize news data
  useEffect(() => {
    loadInitialNews();
  }, [loadInitialNews]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !loading && !searchQuery && !selectedTag) {
          loadMoreNews();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const currentLoadingRef = loadingRef.current;
    if (currentLoadingRef) {
      observer.observe(currentLoadingRef);
    }

    return () => {
      if (currentLoadingRef) {
        observer.unobserve(currentLoadingRef);
      }
    };
  }, [hasMore, loading, searchQuery, selectedTag, loadMoreNews]);

  // Handlers
  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const toggleSearch = useCallback(() => {
    setIsSearchOpen(prev => {
      const newState = !prev;
      if (newState) {
        setTimeout(() => searchInputRef.current?.focus(), 300);
      } else {
        setSearchQuery("");
      }
      return newState;
    });
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    loadInitialNews();
  }, [loadInitialNews]);

  const handleTagSelect = useCallback((tag: string) => {
    setSelectedTag(prev => {
      const newTag = prev === tag ? "" : tag;
      filterByCategory(newTag);
      return newTag;
    });
  }, [filterByCategory]);

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  }, [searchQuery, performSearch]);

  // Modal handlers
  const openModal = useCallback((newsId: string) => {
    setActiveModal(newsId);
    document.body.classList.add('modal-open');
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
    document.body.classList.remove('modal-open');
  }, []);

  // Close modal on escape key
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeModal) {
        closeModal();
      }
    };

    if (activeModal) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [activeModal, closeModal]);

  if (initialLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900' 
          : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
      }`}>
        <div className="text-center space-y-6">
          <div className={`animate-spin rounded-full h-16 w-16 border-4 border-transparent mx-auto ${
            isDarkMode 
              ? 'border-t-blue-400 border-r-purple-400' 
              : 'border-t-blue-600 border-r-purple-600'
          }`} />
          <h2 className={`text-2xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Loading Latest News...
          </h2>
          <p className={`text-lg ${
            isDarkMode ? 'text-slate-400' : 'text-gray-600'
          }`}>
            Fetching the most recent stories for you
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-700 ease-in-out ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
    }`}>
      
      {/* Error Banner */}
      {error && (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white p-4 z-50 text-center">
          {error}
          <button 
            onClick={() => setError("")}
            className="ml-4 px-3 py-1 bg-red-600 rounded text-sm hover:bg-red-700"
          >
            Dismiss
          </button>
        </div>
      )}
      
      {/* Floating Action Buttons */}
      <div className="fixed top-6 right-6 z-50 flex flex-col space-y-4">
        <button
          onClick={toggleDarkMode}
          className={`floating-btn group relative p-4 rounded-2xl transition-all duration-500 transform hover:scale-110 active:scale-95 ${
            isDarkMode 
              ? 'bg-gradient-to-r from-slate-700 to-gray-600 text-amber-400 shadow-2xl shadow-slate-500/20' 
              : 'bg-gradient-to-r from-white to-blue-50 text-slate-700 shadow-2xl shadow-blue-500/20'
          } backdrop-blur-xl border-2 ${
            isDarkMode ? 'border-slate-600/50' : 'border-blue-200/50'
          }`}
          aria-label="Toggle dark mode"
        >
          <div className="relative w-6 h-6 flex items-center justify-center">
            <span className={`absolute transition-all duration-700 ${
              isDarkMode 
                ? 'opacity-100 rotate-0 scale-100' 
                : 'opacity-0 rotate-180 scale-0'
            }`}>
              ☀️
            </span>
            <span className={`absolute transition-all duration-700 ${
              !isDarkMode 
                ? 'opacity-100 rotate-0 scale-100' 
                : 'opacity-0 -rotate-180 scale-0'
            }`}>
              🌙
            </span>
          </div>
        </button>
      </div>

      {/* Mobile Search */}
      <div className="lg:hidden fixed top-6 left-6 z-50">
        <div className={`search-bar transition-all duration-500 ease-out ${
          isSearchOpen ? 'w-80' : 'w-14'
        }`}>
          <form onSubmit={handleSearchSubmit}>
            <div className={`flex items-center h-14 ${
              isDarkMode 
                ? 'bg-slate-800/90 border-slate-600/50' 
                : 'bg-white/90 border-blue-200/50'
            } border-2 backdrop-blur-xl rounded-2xl transition-all duration-500 shadow-2xl ${
              isDarkMode ? 'shadow-slate-500/20' : 'shadow-blue-500/20'
            }`}>
              {!isSearchOpen ? (
                <button
                  type="button"
                  onClick={toggleSearch}
                  className="w-14 h-12 flex items-center justify-center text-xl transition-transform duration-300 hover:scale-110 active:scale-95 flex-shrink-0"
                  aria-label="Open search"
                >
                  🔍
                </button>
              ) : (
                <>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search news..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`flex-1 min-w-0 px-4 py-3 rounded-l-2xl border-none outline-none ${
                      isDarkMode 
                        ? 'bg-transparent text-white placeholder-slate-400' 
                        : 'bg-transparent text-slate-900 placeholder-slate-500'
                    } focus:ring-2 focus:ring-blue-500/50 transition-all duration-300`}
                  />
                  <button
                    type="button"
                    onClick={toggleSearch}
                    className={`w-12 h-12 flex items-center justify-center rounded-r-2xl transition-all duration-300 flex-shrink-0 ${
                      isDarkMode 
                        ? 'text-slate-400 hover:text-white hover:bg-slate-700/50' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-blue-50/50'
                    }`}
                    aria-label="Close search"
                  >
                    ✕
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Desktop Search Bar */}
      <div className="hidden lg:block fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
        <form onSubmit={handleSearchSubmit}>
          <div className={`search-bar flex items-center space-x-4 p-6 rounded-3xl backdrop-blur-xl transition-all duration-500 ${
            isDarkMode 
              ? 'bg-slate-800/80 border-slate-600/50 shadow-2xl shadow-slate-500/20' 
              : 'bg-white/80 border-blue-200/50 shadow-2xl shadow-blue-500/20'
          } border-2`}>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🔍</span>
              <input
                type="text"
                placeholder="Search news, tags, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-96 p-4 rounded-2xl border-none outline-none transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-slate-700/50 text-white placeholder-slate-400' 
                    : 'bg-blue-50/70 text-slate-900 placeholder-slate-500'
                } focus:ring-2 focus:ring-blue-500/50 focus:w-[28rem]`}
              />
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className={`p-3 rounded-2xl transition-all duration-300 ${
                  isDarkMode 
                    ? 'hover:bg-slate-700/50 text-slate-400 hover:text-white' 
                    : 'hover:bg-blue-100/50 text-slate-500 hover:text-slate-700'
                }`}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden pt-24 pb-8 px-6">
        <div className="text-center space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-4 mb-4">
              <img 
                src="/logo.png" 
                alt="Trustify Logo" 
                className="w-16 h-16 object-contain animate-title transition-transform duration-300 hover:scale-110 hover:rotate-12 cursor-pointer"
              />
              <h1 className="animate-title text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent">
                Trustify
              </h1>
            </div>
            <p className={`animate-title text-lg font-medium ${
              isDarkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Your trusted news source
            </p>
          </div>
          
          {/* Mobile Tags */}
          <div className="flex flex-wrap justify-center gap-3 min-h-[40px]">
            <TagButton
              label="All"
              isSelected={selectedTag === "" || selectedTag === "All"}
              onClick={() => handleTagSelect("All")}
              isDarkMode={isDarkMode}
            />
            {availableTags.slice(0, 6).map((tag) => (
              <TagButton
                key={tag}
                label={tag.charAt(0).toUpperCase() + tag.slice(1)}
                isSelected={selectedTag === tag}
                onClick={() => handleTagSelect(tag)}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen">
        {/* Sidebar */}
        <div className={`w-96 p-10 flex flex-col justify-center sticky top-0 h-screen transition-all duration-700 ${
          isDarkMode 
            ? 'bg-gradient-to-b from-slate-800/20 to-slate-900/20' 
            : 'bg-gradient-to-b from-blue-50/60 to-white/60'
        } backdrop-blur-sm`}>
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-6 mb-6">
                <img 
                  src="/logo.png" 
                  alt="Trustify Logo" 
                  className="w-20 h-20 object-contain animate-title transition-transform duration-300 hover:scale-110 hover:rotate-12 cursor-pointer"
                />
                <h1 className="animate-title text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent">
                  Trustify
                </h1>
              </div>
              <p className={`animate-title text-2xl font-medium ${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Your trusted news source
              </p>
              <p className={`animate-title text-lg leading-relaxed max-w-sm mx-auto ${
                isDarkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Stay informed with the latest news and updates from around the world.
              </p>
            </div>
            
            {/* Desktop Tags - Fixed Grid Layout */}
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold ${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Filter by Category
              </h3>
              <div className="grid grid-cols-3 gap-3 min-h-[120px] max-w-sm mx-auto">
                <TagButton
                  label="All"
                  isSelected={selectedTag === "" || selectedTag === "All"}
                  onClick={() => handleTagSelect("All")}
                  isDarkMode={isDarkMode}
                />
                {availableTags.slice(0, 8).map((tag) => (
                  <TagButton
                    key={tag}
                    label={tag.charAt(0).toUpperCase() + tag.slice(1)}
                    isSelected={selectedTag === tag}
                    onClick={() => handleTagSelect(tag)}
                    isDarkMode={isDarkMode}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content - Fixed Grid Layout */}
        <div className="flex-1 p-10 pt-20">
          <div className="max-w-7xl mx-auto">
            <div ref={cardsContainerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {filteredNewsData.map((news, index) => (
                <div key={news.id} className="news-card flex">
                  <Card
                    image={news.image}
                    title={news.title}
                    dateTime={news.dateTime}
                    description={news.description}
                    fullContent={news.fullContent}
                    imageAlt={news.title}
                    isDarkMode={isDarkMode}
                    tags={news.tags}
                    onOpenModal={() => openModal(news.id)}
                  />
                </div>
              ))}
            </div>
            
            {/* Infinite Scroll Loading Indicator */}
            <div ref={loadingRef} className="mt-12">
              {loading && (
                <div className="flex justify-center items-center py-12">
                  <div className={`animate-spin rounded-full h-12 w-12 border-4 border-transparent ${
                    isDarkMode 
                      ? 'border-t-blue-400 border-r-purple-400' 
                      : 'border-t-blue-600 border-r-purple-600'
                  }`} />
                </div>
              )}
              
              {!hasMore && newsData.length > 0 && !searchQuery && !selectedTag && (
                <div className="text-center py-12 space-y-4">
                  <div className="text-4xl mb-4">📰</div>
                  <h3 className={`text-xl font-bold ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    You've reached the end!
                  </h3>
                  <p className={`text-lg ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    That's all the latest news for now
                  </p>
                </div>
              )}
              
              {hasMore && !loading && newsData.length > 0 && !searchQuery && !selectedTag && (
                <div className="text-center py-8">
                  <p className={`text-sm ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    Scroll for more news...
                  </p>
                </div>
              )}
            </div>
            
            <EmptyState 
              show={!!(searchQuery || selectedTag) && filteredNewsData.length === 0 && !loading} 
              isDarkMode={isDarkMode} 
            />
          </div>
        </div>
      </div>

      {/* Mobile Content - Fixed Grid Layout */}
      <div className="lg:hidden px-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <div ref={mobileCardsContainerRef} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredNewsData.map((news, index) => (
              <div key={news.id} className="news-card flex">
                <Card
                  image={news.image}
                  title={news.title}
                  dateTime={news.dateTime}
                  description={news.description}
                  fullContent={news.fullContent}
                  imageAlt={news.title}
                  isDarkMode={isDarkMode}
                  tags={news.tags}
                  onOpenModal={() => openModal(news.id)}
                />
              </div>
            ))}
          </div>
          
          {/* Mobile Infinite Scroll Loading Indicator */}
          <div ref={loadingRef} className="mt-8">
            {loading && (
              <div className="flex justify-center items-center py-8">
                <div className={`animate-spin rounded-full h-10 w-10 border-4 border-transparent ${
                  isDarkMode 
                    ? 'border-t-blue-400 border-r-purple-400' 
                    : 'border-t-blue-600 border-r-purple-600'
                }`} />
              </div>
            )}
            
            {!hasMore && newsData.length > 0 && !searchQuery && !selectedTag && (
              <div className="text-center py-8 space-y-3">
                <div className="text-3xl mb-2">📰</div>
                <h3 className={`text-lg font-bold ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  You've reached the end!
                </h3>
                <p className={`${
                  isDarkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  That's all the latest news for now
                </p>
              </div>
            )}
          </div>
          
          <EmptyState 
            show={!!(searchQuery || selectedTag) && filteredNewsData.length === 0 && !loading} 
            isDarkMode={isDarkMode} 
          />
        </div>
      </div>

      {/* Modal Backdrop Overlay for Card Popups */}
      {activeModal && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in"
          onClick={closeModal}
        >
          <div 
            className={`w-full h-full max-w-6xl max-h-[95vh] ${
              isDarkMode ? 'bg-slate-800' : 'bg-white'
            } rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-scale-in`}
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const activeNews = filteredNewsData.find(news => news.id === activeModal);
              if (!activeNews) return null;
              
              return (
                <>
                  {/* Modal Header */}
                  <div className={`flex justify-between items-start p-6 border-b ${
                    isDarkMode ? 'border-slate-700' : 'border-gray-200'
                  }`}>
                    <div className="flex-1 pr-4">
                      <h2 className={`text-2xl font-bold mb-3 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {activeNews.title}
                      </h2>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {activeNews.tags.slice(0, 5).map((tag, index) => (
                          <span
                            key={index}
                            className={`px-3 py-1 text-sm font-semibold rounded-full ${
                              isDarkMode 
                                ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50' 
                                : 'bg-blue-100 text-blue-800 border border-blue-300'
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      {activeNews.source && (
                        <p className={`text-sm ${
                          isDarkMode ? 'text-slate-400' : 'text-gray-600'
                        }`}>
                          Source: {activeNews.source}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={closeModal}
                      className={`text-3xl font-bold transition-colors ${
                        isDarkMode 
                          ? 'text-slate-400 hover:text-white' 
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      ×
                    </button>
                  </div>
                  
                  {/* Modal Content */}
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="mb-6">
                      <div className="w-full max-h-96 overflow-hidden rounded-xl mb-4 bg-gray-100 dark:bg-gray-700">
                        <img 
                          src={activeNews.image} 
                          alt={activeNews.title}
                          className="w-full h-full object-contain"
                          style={{ maxHeight: '24rem' }}
                        />
                      </div>
                      <p className={`text-sm mb-4 font-medium ${
                        isDarkMode ? 'text-slate-400' : 'text-gray-600'
                      }`}>
                        {activeNews.dateTime}
                      </p>
                    </div>
                    
                    <div className="prose prose-lg max-w-none">
                      <p className={`leading-relaxed text-lg ${
                        isDarkMode ? 'text-slate-300' : 'text-gray-800'
                      }`}>
                        {activeNews.fullContent}
                      </p>
                    </div>
                  </div>
                  
                  {/* Modal Footer */}
                  <div className={`p-6 border-t flex justify-between ${
                    isDarkMode ? 'border-slate-700' : 'border-gray-200'
                  }`}>
                    {activeNews.link && (
                      <a
                        href={activeNews.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                          isDarkMode 
                            ? 'bg-blue-600 text-white hover:bg-blue-700' 
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        Read Full Article
                      </a>
                    )}
                    <button
                      onClick={closeModal}
                      className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                        isDarkMode 
                          ? 'bg-slate-600 text-white hover:bg-slate-500' 
                          : 'bg-gray-600 text-white hover:bg-gray-700'
                      }`}
                    >
                      Close Article
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Tailwind CSS Custom Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          html {
            scroll-behavior: smooth;
            scrollbar-width: thin;
            scrollbar-color: ${isDarkMode ? 'rgba(71, 85, 105, 0.4) transparent' : 'rgba(59, 130, 246, 0.4) transparent'};
          }
          
          ::-webkit-scrollbar {
            width: 8px;
          }
          
          ::-webkit-scrollbar-track {
            background: transparent;
          }
          
          ::-webkit-scrollbar-thumb {
            background: ${isDarkMode ? 'rgba(71, 85, 105, 0.4)' : 'rgba(59, 130, 246, 0.4)'};
            border-radius: 6px;
            transition: all 0.3s ease;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: ${isDarkMode ? 'rgba(71, 85, 105, 0.7)' : 'rgba(59, 130, 246, 0.7)'};
          }

          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes scale-in {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }

          .animate-fade-in {
            animation: fade-in 0.3s ease-out;
          }

          .animate-scale-in {
            animation: scale-in 0.3s ease-out;
          }

          body.modal-open {
            overflow: hidden;
          }
        `
      }} />
    </div>
  );
}

// Utility Components
const TagButton = ({ label, isSelected, onClick, isDarkMode }: {
  label: string;
  isSelected: boolean;
  onClick: () => void;
  isDarkMode: boolean;
}) => (
  <button
    onClick={onClick}
    title={label}
    className={`w-full px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 whitespace-nowrap truncate ${
      isSelected
        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
        : isDarkMode
          ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600/50'
          : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
    }`}
  >
    {label}
  </button>
);

const EmptyState = ({ show, isDarkMode }: { show: boolean; isDarkMode: boolean }) => (
  show ? (
    <div className="text-center py-16 space-y-4">
      <div className="text-6xl mb-4">🔍</div>
      <h3 className={`text-2xl font-bold ${
        isDarkMode ? 'text-slate-300' : 'text-slate-700'
      }`}>
        No news found
      </h3>
      <p className={`text-lg ${
        isDarkMode ? 'text-slate-400' : 'text-slate-600'
      }`}>
        Try different keywords or categories
      </p>
    </div>
  ) : null
);
