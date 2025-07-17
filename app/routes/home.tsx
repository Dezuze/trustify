import type { Route } from "./+types/home";
import Card from "../components/Card";
import { useState, useEffect, useCallback } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Trustify" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

interface NewsItem {
  id?: string;
  image: string;
  title: string;
  dateTime: string;
  description: string;
  fullContent: string;
}                                       

// Move baseNewsData outside component to prevent re-creation
const baseNewsData: NewsItem[] = [
  {
    image: "/path/to/image1.jpg",
    title: "Breaking News: Technology Advances",
    dateTime: "July 17, 2025 - 2:30 PM",
    description: "Latest developments in technology that are changing the world.",
    fullContent: "This is the full article content about technology advances. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris."
  },
  {
    image: "/path/to/image2.jpg",
    title: "Sports Update: Championship Results",
    dateTime: "July 17, 2025 - 1:15 PM",
    description: "Exciting championship results from this week's games.",
    fullContent: "Complete coverage of the championship results with detailed analysis and player statistics. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
  },
  {
    image: "/path/to/image3.jpg",
    title: "Health & Wellness Tips",
    dateTime: "July 17, 2025 - 12:00 PM",
    description: "Essential tips for maintaining your health and wellness.",
    fullContent: "Comprehensive guide to health and wellness including nutrition advice, exercise routines, and mental health tips. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
  },
  {
    image: "/path/to/image4.jpg",
    title: "Business Market Analysis",
    dateTime: "July 17, 2025 - 10:45 AM",
    description: "In-depth analysis of current market trends and predictions.",
    fullContent: "Detailed market analysis covering various sectors and future predictions for investors and business owners."
  },
  {
    image: "/path/to/image5.jpg",
    title: "Environmental News",
    dateTime: "July 17, 2025 - 9:30 AM",
    description: "Important updates on environmental conservation efforts.",
    fullContent: "Latest news on environmental conservation, climate change initiatives, and sustainable development projects worldwide."
  },
  {
    image: "/path/to/image6.jpg",
    title: "Entertainment Highlights",
    dateTime: "July 17, 2025 - 8:15 AM",
    description: "Latest entertainment news and celebrity updates.",
    fullContent: "Comprehensive entertainment coverage including movie releases, celebrity news, and industry updates."
  }
];

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Generate more news data for infinite scroll
  const generateMoreNews = useCallback((pageNum: number): NewsItem[] => {
    // Generate consistent dates based on page and index
    return baseNewsData.map((item, index) => {
      const baseTime = new Date('2025-07-17T14:30:00').getTime();
      const timeOffset = (pageNum - 1) * 86400000 + index * 3600000; // 1 day per page + 1 hour per item
      const newsDate = new Date(baseTime - timeOffset);
      
      return {
        ...item,
        id: `${pageNum}-${index}`,
        title: pageNum === 1 ? item.title : `${item.title} - Update ${pageNum}`,
        dateTime: newsDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };
    });
  }, []); // Remove baseNewsData from dependencies

  // Initialize news data
  useEffect(() => {
    setNewsData(generateMoreNews(1));
  }, [generateMoreNews]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (loading) return;
    
    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = document.documentElement.scrollTop;
    const clientHeight = document.documentElement.clientHeight;
    
    if (scrollTop + clientHeight >= scrollHeight - 1000) {
      setLoading(true);
      setTimeout(() => {
        setNewsData(prev => [...prev, ...generateMoreNews(page + 1)]);
        setPage(prev => prev + 1);
        setLoading(false);
      }, 500);
    }
  }, [loading, page, generateMoreNews]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <div className={`min-h-screen transition-all duration-500 ease-in-out ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Dark Mode Toggle */}
      <div className="fixed top-6 right-6 z-50">
        <button
          onClick={toggleDarkMode}
          className={`group relative p-3 rounded-full transition-all duration-500 ease-in-out transform hover:scale-110 ${
            isDarkMode 
              ? 'bg-gradient-to-r from-gray-700 to-gray-600 text-yellow-400 shadow-lg shadow-gray-800/50' 
              : 'bg-gradient-to-r from-gray-100 to-white text-gray-700 shadow-lg shadow-gray-200/50'
          } backdrop-blur-sm border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}
        >
          <div className="relative w-6 h-6 flex items-center justify-center">
            <span className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
              isDarkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-180 scale-50'
            }`}>
              ☀️
            </span>
            <span className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
              !isDarkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-180 scale-50'
            }`}>
              🌙
            </span>
          </div>
          
          <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
            isDarkMode ? 'bg-yellow-400/20' : 'bg-blue-400/20'
          } opacity-0 group-hover:opacity-100 group-active:scale-95`}></div>
        </button>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden pt-20 pb-8 px-4 text-center">
        <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          📰 Trustify
        </div>
        <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Your trusted news source
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen">
        {/* Left Sidebar */}
        <div className="w-80 p-8 flex flex-col justify-center sticky top-0 h-screen">
          <div className="text-center">
            <div className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              📰 Trustify
            </div>
            <div className={`text-xl font-medium mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Your trusted news source
            </div>
            <div className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Stay informed with the latest news and updates from around the world.
            </div>
          </div>
        </div>

        {/* News Content Area */}
        <div className="flex-1 p-8 pt-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {newsData.map((news, index) => (
                <div 
                  key={news.id || `news-${index}`}
                  className={`${
                    index % 3 === 1 ? 'md:mt-8' : 
                    index % 3 === 2 ? 'xl:mt-16' : ''
                  }`}
                >
                  <Card
                    image={news.image}
                    title={news.title}
                    dateTime={news.dateTime}
                    description={news.description}
                    fullContent={news.fullContent}
                    imageAlt={news.title}
                    isDarkMode={isDarkMode}
                  />
                </div>
              ))}
            </div>
            
            {loading && (
              <div className="flex justify-center items-center py-8">
                <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
                  isDarkMode ? 'border-blue-400' : 'border-blue-600'
                }`}></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden px-4 pb-8">
        <div className="max-w-sm mx-auto">
          <div className="grid grid-cols-1 gap-6">
            {newsData.map((news, index) => (
              <Card
                key={news.id || `mobile-news-${index}`}
                image={news.image}
                title={news.title}
                dateTime={news.dateTime}
                description={news.description}
                fullContent={news.fullContent}
                imageAlt={news.title}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
          
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
                isDarkMode ? 'border-blue-400' : 'border-blue-600'
              }`}></div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          ::-webkit-scrollbar {
            width: 8px;
          }
          
          ::-webkit-scrollbar-track {
            background: transparent;
          }
          
          ::-webkit-scrollbar-thumb {
            background: ${isDarkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(156, 163, 175, 0.3)'};
            border-radius: 4px;
            transition: all 0.3s ease;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: ${isDarkMode ? 'rgba(75, 85, 99, 0.6)' : 'rgba(156, 163, 175, 0.6)'};
          }
          
          html {
            scrollbar-width: thin;
            scrollbar-color: ${isDarkMode ? 'rgba(75, 85, 99, 0.3) transparent' : 'rgba(156, 163, 175, 0.3) transparent'};
          }
        `
      }} />
    </div>
  );
}
