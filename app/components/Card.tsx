import React from 'react';

interface CardProps {
  image: string;
  title: string;
  dateTime: string;
  description: string;
  fullContent: string;
  imageAlt?: string;
  isDarkMode: boolean;
  tags: string[];
  onOpenModal?: () => void;
}

const Card: React.FC<CardProps> = ({ 
  image, 
  title, 
  dateTime, 
  description, 
  imageAlt = '',
  isDarkMode,
  tags,
  onOpenModal
}) => {
  return (
    <div 
      className={`group ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700 shadow-lg shadow-white/10 hover:shadow-white/20' 
          : 'bg-white border-blue-200 shadow-lg shadow-blue-200/40 hover:shadow-blue-300/60 border-2'
      } rounded-xl overflow-hidden w-full transition-all duration-300 cursor-pointer transform hover:scale-105 hover:-translate-y-2`}
      onClick={onOpenModal}
    >
      <div className="w-full h-48 overflow-hidden">
        <img 
          src={image} 
          alt={imageAlt || title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>
      <div className="p-4">
        <h3 className={`text-lg font-bold mb-3 line-clamp-2 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          {title}
        </h3>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 hover:scale-105 ${
                isDarkMode 
                  ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50 hover:bg-blue-600/40' 
                  : 'bg-blue-100 text-blue-800 border border-blue-300 hover:bg-blue-200'
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
        
        <p className={`text-sm mb-3 font-medium ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {dateTime}
        </p>
        <p className={`text-sm leading-relaxed line-clamp-3 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {description}
        </p>
      </div>
    </div>
  );
};

export default Card;