import React, { useState, useEffect } from 'react';

interface CardProps {
  image: string;
  title: string;
  dateTime: string;
  description: string;
  fullContent: string;
  imageAlt?: string;
  isDarkMode: boolean;
}

const Card: React.FC<CardProps> = ({ 
  image, 
  title, 
  dateTime, 
  description, 
  fullContent,
  imageAlt = '',
  isDarkMode
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Close modal when clicking outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  return (
    <>
      {/* Card */}
      <div 
        className={`${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700 shadow-lg shadow-white/10 hover:shadow-white/20' 
            : 'bg-white border-gray-200 shadow-md hover:shadow-lg'
        } border rounded-lg overflow-hidden max-w-sm transition-all duration-300 cursor-pointer transform hover:scale-105 mx-auto`}
        onClick={openModal}
      >
        <div className="w-full h-48 overflow-hidden">
          <img 
            src={image} 
            alt={imageAlt || title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          />
        </div>
        <div className="p-4">
          <h3 className={`text-lg font-semibold mb-2 line-clamp-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {title}
          </h3>
          <p className={`text-sm mb-3 ${
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

      {/* Full Screen Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2 sm:p-4"
          onClick={handleBackdropClick}
        >
          <div className={`${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } rounded-lg w-full h-full sm:w-[95vw] sm:h-[95vh] overflow-hidden flex flex-col shadow-2xl`}>
            {/* Modal Header */}
            <div className={`flex justify-between items-center p-4 sm:p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h2 className={`text-xl sm:text-2xl font-bold pr-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {title}
              </h2>
              <button
                onClick={closeModal}
                className={`text-2xl sm:text-3xl font-bold transition-colors ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-white' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                ×
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="mb-6">
                <img 
                  src={image} 
                  alt={imageAlt || title}
                  className="w-full h-48 sm:h-64 md:h-80 object-cover rounded-lg mb-4"
                />
                <p className={`text-sm mb-4 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {dateTime}
                </p>
              </div>
              
              <div className="prose prose-lg max-w-none">
                <p className={`leading-relaxed whitespace-pre-wrap text-base sm:text-lg ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {fullContent}
                </p>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className={`p-4 sm:p-6 border-t flex justify-end ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <button
                onClick={closeModal}
                className={`px-6 py-2 rounded transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-600 text-white hover:bg-gray-500' 
                    : 'bg-gray-500 text-white hover:bg-gray-600'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Card;