import type { Route } from "./+types/news";
import { fetchAllNews } from "../services/scrapers.server";
import { analyzeNews, type AnalyzedCluster } from "../services/analyzer.server";
import { useTheme } from "../components/ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Trustify | Headlines & Bias Map" },
    { name: "description", content: "Real-time AI news clustering and bias analysis" },
  ];
}

// Create a global cache to survive dev server purges
declare global {
  var __newsCache: {
    data: AnalyzedCluster[];
    timestamp: number;
  } | undefined;
}

const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export async function loader({}: Route.LoaderArgs) {
  try {
    // Return cached data if valid
    if (globalThis.__newsCache && (Date.now() - globalThis.__newsCache.timestamp) < CACHE_DURATION_MS) {
      console.log("Serving news from cache. Time remaining:", Math.round((CACHE_DURATION_MS - (Date.now() - globalThis.__newsCache.timestamp)) / 60000), "mins");
      return { clusters: globalThis.__newsCache.data, error: null };
    }

    console.log("--- Cache Expired/Empty: Starting Fresh Fetch ---");
    console.time("fetchAllNews");
    const rawArticles = await fetchAllNews();
    console.timeEnd("fetchAllNews");
    
    if (rawArticles.length === 0) {
      // If we failed but have stale cache, serve stale cache
      if (globalThis.__newsCache) {
        console.warn("Fetch failed, serving stale cache.");
        return { clusters: globalThis.__newsCache.data, error: null };
      }
      return { clusters: [], error: "Our scrapers were unable to establish a connection with global news sources." };
    }

    console.time("analyzeNews");
    const clusters = await analyzeNews(rawArticles);
    console.timeEnd("analyzeNews");
    
    // Update cache
    globalThis.__newsCache = {
      data: clusters,
      timestamp: Date.now()
    };
    
    return { clusters, error: null };
  } catch (error: any) {
    console.error("News Loader Error:", error);
    // Fallback to stale cache if catastrophic error
    if (globalThis.__newsCache) {
      return { clusters: globalThis.__newsCache.data, error: null };
    }
    return { clusters: [], error: error.message || "Failed to analyze the current news cycle." };
  }
}

// -----------------------------------------
// COMPONENT: Bias Map
// -----------------------------------------
function BiasMap({ articles }: { articles: AnalyzedCluster['articles'] }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      className="mt-8 mb-10 bg-neutral-100 dark:bg-neutral-900/60 p-6 md:p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 transition-colors duration-300 relative"
    >
      <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      </div>
      <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400 mb-8 text-center flex items-center justify-center gap-2">
        <span className="w-8 h-[1px] bg-neutral-300 dark:bg-neutral-700"></span>
        Bias Spectrum Analysis
        <span className="w-8 h-[1px] bg-neutral-300 dark:bg-neutral-700"></span>
      </h3>
      
      <div className="relative w-full h-14 flex items-center">
        {/* Gradient Bar */}
        <div className="absolute w-full h-4 rounded-full bg-gradient-to-r from-blue-600 via-purple-500 to-red-600 opacity-90 shadow-inner" />
        
        {/* Labels */}
        <div className="absolute w-full flex justify-between top-8 text-[10px] font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-500">
          <span className="text-blue-600 dark:text-blue-500">Left</span>
          <span className="text-purple-600 dark:text-purple-500">Center</span>
          <span className="text-red-600 dark:text-red-500">Right</span>
        </div>

        {/* Center Line Marker */}
        <div className="absolute left-1/2 w-[2px] h-8 bg-black/20 dark:bg-white/30 -translate-x-1/2 rounded-full" />

        {/* Plotting points */}
        {articles.map((article, idx) => {
          const score = typeof article.biasScore === 'number' ? article.biasScore : 0;
          const leftPercent = Math.max(0, Math.min(100, (score + 100) / 2));
          
          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + (idx * 0.1), type: "spring" }}
              className="absolute group z-10 -translate-x-1/2 -translate-y-1/2 cursor-crosshair"
              style={{ left: `${leftPercent}%`, top: '50%' }}
            >
              <div className="w-6 h-6 rounded-full border-4 border-white dark:border-[#1a1a1a] text-black bg-neutral-900 dark:bg-white shadow-lg transition-transform duration-300 group-hover:scale-125" />
              
              {/* Tooltip */}
              <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 flex flex-col items-center min-w-[200px]">
                <div className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs p-4 rounded-xl shadow-2xl">
                  <span className="font-black tracking-wider uppercase text-emerald-400 dark:text-emerald-600 mb-1 block text-[10px]">{article.source}</span>
                  <span className="font-serif italic leading-snug line-clamp-3">"{article.title}"</span>
                  <div className="mt-3 font-mono font-bold pt-2 border-t border-neutral-700 dark:border-neutral-200">
                    Bias Score: {score > 0 ? `+${score}` : score}
                  </div>
                </div>
                {/* Arrow */}
                <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-transparent border-t-neutral-900 dark:border-t-white" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// -----------------------------------------
// COMPONENT: Main Page
// -----------------------------------------
export default function NewsPage({ loaderData }: Route.ComponentProps) {
  const { clusters, error } = loaderData;
  const { theme, toggleTheme } = useTheme();
  
  // Real-time clock for the news header
  const [time, setTime] = useState("");
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#050505] text-neutral-900 dark:text-neutral-100 font-sans selection:bg-emerald-500/30 transition-colors duration-300 overflow-x-hidden">
      
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-black/80 border-b border-neutral-200 dark:border-neutral-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="font-black text-2xl tracking-tighter text-neutral-900 dark:text-white">
              TRUSTIFY<span className="text-emerald-500">.</span>
            </span>
            <span className="hidden sm:inline-block px-2 py-1 bg-neutral-100 dark:bg-neutral-900 rounded text-[10px] font-mono font-bold tracking-widest text-neutral-500 dark:text-neutral-400 uppercase border border-neutral-200 dark:border-neutral-800">
              Live Feed
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 text-xs font-mono text-neutral-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              UPDATED: {time}
            </div>
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors ring-1 ring-inset ring-neutral-200 dark:ring-neutral-800"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
        
        {/* News Website Hero */}
        <header className="border-b-4 border-black dark:border-white pb-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-8"
          >
            <div className="max-w-4xl">
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] uppercase font-serif">
                Today's <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">Headlines</span>
              </h1>
            </div>
            <div className="md:max-w-xs text-right">
              <p className="text-sm md:text-base font-medium text-neutral-600 dark:text-neutral-400 leading-relaxed border-l-2 md:border-l-0 md:border-r-2 border-emerald-500 pl-4 md:pl-0 md:pr-4">
                Global narratives parsed by artificial intelligence. We cluster similar events to expose media slant, giving you the unfiltered truth.
              </p>
            </div>
          </motion.div>
        </header>

        {/* Error State */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 p-8 text-red-900 dark:text-red-200 max-w-3xl mx-auto"
          >
            <h3 className="text-xl font-black uppercase mb-2">Transmission Error</h3>
            <p className="font-serif">{error}</p>
          </motion.div>
        )}

        {/* Loading State */}
        {!error && clusters.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 space-y-8">
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                  className="w-4 h-4 bg-black dark:bg-white rounded-full"
                />
              ))}
            </div>
            <p className="text-lg font-bold font-serif italic text-neutral-500">Compiling global intel...</p>
          </div>
        )}

        {/* Clustered News Feed */}
        {clusters.length > 0 && (
          <div className="space-y-24 pb-32">
            {clusters.map((cluster: AnalyzedCluster, clusterIdx: number) => (
              <motion.article 
                key={cluster.id} 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                {/* Cluster Header */}
                <div className="mb-10 lg:w-2/3">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-2 h-2 bg-emerald-500 rotate-45" />
                    <span className="text-xs font-black tracking-[0.2em] uppercase text-emerald-600 dark:text-emerald-400">
                      Developing Story • {cluster.articles.length} Sources
                    </span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black tracking-tight font-serif leading-tight mb-4">
                    {cluster.topic}
                  </h2>
                  <p className="text-xl font-medium text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-3xl">
                    {cluster.generalSummary}
                  </p>
                </div>

                {/* THE BIAS MAP */}
                <BiasMap articles={cluster.articles} />

                {/* Article Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mt-12">
                  {cluster.articles.map((article: AnalyzedCluster['articles'][0], idx: number) => {
                    // Determine semantic badge color based on score
                    const score = typeof article.biasScore === 'number' ? article.biasScore : 0;
                    let badgeColor = "bg-neutral-900 text-white dark:bg-white dark:text-black";
                    if (score <= -15) badgeColor = "bg-blue-600 text-white";
                    else if (score >= 15) badgeColor = "bg-red-600 text-white";

                    return (
                      <motion.a 
                        key={idx}
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ y: -8, transition: { duration: 0.2 } }}
                        className="group flex flex-col bg-white dark:bg-[#111] rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-2xl transition-shadow duration-300 relative"
                      >
                        {/* Image Header with AI Fallback */}
                        <div className="relative h-56 w-full overflow-hidden border-b border-neutral-100 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900">
                          <img 
                            src={article.imageUrl || `https://source.unsplash.com/featured/800x600/?journalism,news,${encodeURIComponent(cluster.topic.split(' ').slice(0, 3).join(','))}`} 
                            alt={article.title}
                            className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 ${!article.imageUrl && 'opacity-60 dark:opacity-40 grayscale select-none'}`}
                            loading="lazy"
                          />
                          
                          {/* Score Badge */}
                          <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-black shadow-lg ${badgeColor}`}>
                            BIAS: {score > 0 ? `+${score}` : score}
                          </div>
                          
                          {/* Publisher Badge */}
                          <div className="absolute bottom-0 left-0 bg-white dark:bg-[#111] px-4 py-2 rounded-tr-xl border-t border-r border-neutral-200 dark:border-neutral-800 text-xs font-black tracking-widest uppercase shadow-sm">
                            {article.source} {!article.imageUrl && ' (Stock)'}
                          </div>
                        </div>
                        
                        {/* Card Body */}
                        <div className="p-6 flex flex-col flex-grow">
                          <h3 className="text-xl font-bold font-serif leading-snug mb-4 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {article.title}
                          </h3>
                          
                          <div className="mt-auto pt-4 border-t border-neutral-100 dark:border-neutral-800/50">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">AI Assessment</h4>
                            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 leading-relaxed">
                              {article.biasAssessment}
                            </p>
                          </div>
                        </div>
                      </motion.a>
                    );
                  })}
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
