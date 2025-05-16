import { FiSun } from "react-icons/fi";
import { FiMoon } from "react-icons/fi";
import { useState, useEffect } from "react";
import { motion } from "motion/react";

export default function MoreAppearance() {
    const [isDefaultMode, setIsDefaultMode] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme ? savedTheme === 'default' : true;
    });

    useEffect(() => {
        localStorage.setItem('theme', isDefaultMode ? 'default' : 'light');
    }, [isDefaultMode]);

    return (
        <div className="flex flex-col items-center justify-center lg:items-stretch lg:flex-row gap-8 lg:p-8 w-full lg:max-w-4xl lg:mx-auto h-full ">
            <motion.div 
                className={`w-full p-8 rounded-2xl cursor-pointer flex flex-col items-center justify-center gap-6 transition-all duration-300 backdrop-blur-sm ${
                    isDefaultMode 
                    ? 'bg-bgPrimary shadow-lg shadow-bgPrimary/20' 
                    : 'bg-white/5'
                }`}
                onClick={() => setIsDefaultMode(true)}
                whileHover={{ scale: 1.03, translateY: -8 }}
                
            >
                <FiMoon size={40} className={`transition-colors duration-300 ${isDefaultMode ? 'text-white' : 'text-gray-400'}`} />
                <span className={`font-medium text-lg transition-colors duration-300 ${isDefaultMode ? 'text-white' : 'text-gray-400'}`}>
                    Default
                </span>
            </motion.div>
            
            <motion.div 
                className={`w-full p-8 rounded-2xl cursor-pointer flex flex-col items-center justify-center gap-6 transition-all duration-300 backdrop-blur-sm ${
                    !isDefaultMode 
                    ? 'bg-bgPrimary shadow-lg shadow-bgPrimary/20' 
                    : 'bg-white/5'
                }`}
                onClick={() => setIsDefaultMode(false)}
                whileHover={{ scale: 1.03, translateY: -8 }}
                
            >
                <FiSun size={40} className={`transition-colors duration-300 ${!isDefaultMode ? 'text-white' : 'text-gray-400'}`} />
                <span className={`font-medium text-lg transition-colors duration-300 ${!isDefaultMode ? 'text-white' : 'text-gray-400'}`}>
                    Light
                </span>
            </motion.div>
        </div>
    )
}