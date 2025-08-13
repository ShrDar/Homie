
import { useState, useEffect } from "react";

export default function MoreShortcuts() {
  const [isDefaultMode, setIsDefaultMode] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const savedTheme = window.localStorage.getItem('theme');
      setIsDefaultMode(savedTheme ? savedTheme === 'default' : true);
    } catch (error) {
      console.warn('Failed to access localStorage:', error);
      setIsDefaultMode(true);
    }
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto p-6 h-full flex flex-col gap-3">
      <h2 className={`text-2xl text-center font-semibold ${isDefaultMode ? 'text-fontPrimary' : 'text-gray-600'}`}>
        Keyboard Shortcuts
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Sign Out Shortcut */}
        <div className={`${
          isDefaultMode ? 'bg-bgSecondary' : 'bg-blue-50'
        } rounded-lg p-4 flex flex-col items-center justify-center gap-4 hover:bg-opacity-80 transition-all duration-200`}>
          <div className="flex items-center gap-2">
            <kbd className={`px-4 py-2 text-lg font-semibold ${
              isDefaultMode ? 'text-fontPrimary bg-bgPrimary border-[#666666]' : 'text-gray-600 bg-white border-blue-200'
            } border-2 rounded-lg`}>
              Ctrl
            </kbd>
            <span className={`text-xl ${isDefaultMode ? 'text-fontPrimary' : 'text-gray-600'}`}>+</span>
            <kbd className={`px-4 py-2 text-lg font-semibold ${
              isDefaultMode ? 'text-fontPrimary bg-bgPrimary border-[#666666]' : 'text-gray-600 bg-white border-blue-200'
            } border-2 rounded-lg`}>
              Q
            </kbd>
          </div>
          <span className={`${isDefaultMode ? 'text-[#AAAAAA]' : 'text-gray-500'} text-sm`}>Sign Out</span>
        </div>        
      </div>
    </div>
  );
}