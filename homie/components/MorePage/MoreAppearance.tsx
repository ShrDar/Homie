import { FiSun } from "react-icons/fi";
import { FiMoon } from "react-icons/fi";
import { useState } from "react";
import { motion } from "motion/react";

export default function MoreAppearance() {
    const [isDefaultMode, setIsDefaultMode] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme ? savedTheme === 'default' : true;
    });

    const handleThemeChange = (isDefault: boolean) => {
        setIsDefaultMode(isDefault);
        localStorage.setItem('theme', isDefault ? 'default' : 'light');
        window.location.reload();
    };

    return (
        <div className="flex flex-col items-center justify-center lg:items-stretch lg:flex-row gap-8 lg:p-8 w-full lg:max-w-4xl lg:mx-auto h-full">
            <motion.div 
                className={`w-full p-8 rounded-2xl cursor-pointer flex flex-col items-center justify-center gap-6 transition-all duration-300 backdrop-blur-sm ${
                    isDefaultMode 
                    ? 'bg-bgPrimary shadow-lg shadow-bgPrimary/20' 
                    : 'bg-gray-200'
                }`}
                onClick={() => handleThemeChange(true)}
                whileHover={{ scale: 1.03, translateY: -8 }}
            >
                <FiMoon size={40} className={`transition-colors duration-300 ${
                    isDefaultMode ? 'text-white' : 'text-gray-600'
                }`} />
                <span className={`font-medium text-lg transition-colors duration-300 ${
                    isDefaultMode ? 'text-white' : 'text-gray-600'
                }`}>
                    Default
                </span>
            </motion.div>
            
            <motion.div 
                className={`w-full p-8 rounded-2xl cursor-pointer flex flex-col items-center justify-center gap-6 transition-all duration-300 backdrop-blur-sm ${
                    !isDefaultMode 
                    ? 'bg-blue-50 shadow-lg shadow-blue-200/50 border-2 border-blue-200' 
                    : 'bg-white/5'
                }`}
                onClick={() => handleThemeChange(false)}
                whileHover={{ scale: 1.03, translateY: -8 }}
            >
                <FiSun size={40} className={`transition-colors duration-300 ${
                    !isDefaultMode ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <span className={`font-medium text-lg transition-colors duration-300 ${
                    !isDefaultMode ? 'text-blue-600' : 'text-gray-400'
                }`}>
                    Light
                </span>
            </motion.div>
        </div>
    )
}