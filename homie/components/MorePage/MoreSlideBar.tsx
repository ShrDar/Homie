"use client"

import { useState, useEffect } from 'react';
import { Session } from 'next-auth';
import { motion, AnimatePresence } from "motion/react";
import Image from 'next/image';
import Applying from '../ApplySettings/Applying';

export default function MoreSlideBar({ session }: { session: Session | null | undefined }) {
    const [selectedStyle, setSelectedStyle] = useState<'normie' | 'horizontal'>('normie');
    const [currentStyle, setCurrentStyle] = useState<'normie' | 'horizontal'>('normie');
    const [showPreview, setShowPreview] = useState(false);
    const [isDefaultMode, setIsDefaultMode] = useState(true);
    const [isApplying, setIsApplying] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedStyle = localStorage.getItem('sidebarType');
            if (savedStyle === 'normie' || savedStyle === 'horizontal') {
                setSelectedStyle(savedStyle);
                setCurrentStyle(savedStyle);
            }
            const savedTheme = localStorage.getItem('theme');
            setIsDefaultMode(savedTheme ? savedTheme === 'default' : true);
        }
    }, []);

    const handleApplyChanges = () => {
        setIsApplying(true);
        localStorage.setItem('sidebarType', selectedStyle);
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    };

    if (!session) return null;

    if (isApplying) {
        return <Applying settingName="Sidebar" />;
    }

    return (
        <div className="p-8">
            <div className="flex flex-col lg:flex-row gap-8 w-full max-w-4xl mx-auto">
                <motion.div 
                    className={`flex-1 p-8 rounded-2xl cursor-pointer flex flex-col items-center justify-center lg:gap-6 transition-all duration-300 backdrop-blur-sm ${
                        selectedStyle === 'horizontal' 
                        ? (isDefaultMode ? 'bg-bgPrimary shadow-lg shadow-bgPrimary/20' : 'bg-blue-500 shadow-lg shadow-blue-500/20')
                        : (isDefaultMode ? 'bg-white/5' : 'bg-gray-200')
                    }`}
                    onClick={() => setSelectedStyle('horizontal')}
                    whileHover={{ scale: 1.03, translateY: -8 }}
                >
                    <Image 
                        src={"/Sidebars/horizontalNavBar.jpg"}
                        alt='Horizontal Navbar'
                        width={1000}
                        height={1000}
                        className='rounded-[15px]'
                    />
                    <span className={`font-medium text-center text-sm lg:text-lg transition-colors duration-300 ${
                        selectedStyle === 'horizontal' 
                        ? (isDefaultMode ? 'text-white' : 'text-white')
                        : (isDefaultMode ? 'text-gray-400' : 'text-gray-600')
                    }`}>
                        Horizontal Sidebar
                    </span>
                </motion.div>
                
                <motion.div 
                    className={`flex-1 p-8 rounded-2xl cursor-pointer flex flex-col items-center justify-center lg:gap-6 transition-all duration-300 backdrop-blur-sm ${
                        selectedStyle === 'normie' 
                        ? (isDefaultMode ? 'bg-bgPrimary shadow-lg shadow-bgPrimary/20' : 'bg-blue-500 shadow-lg shadow-blue-500/20')
                        : (isDefaultMode ? 'bg-white/5' : 'bg-gray-200')
                    }`}
                    onClick={() => setSelectedStyle('normie')}
                    whileHover={{ scale: 1.03, translateY: -8 }}
                >
                    <Image
                        src={"/Sidebars/normieNavBar.jpg"}
                        alt='Normie Navbar'
                        width={1000}
                        height={1000}
                        className='rounded-[15px]'
                    />
                    <span className={`font-medium text-center text-sm lg:text-lg transition-colors duration-300 ${
                        selectedStyle === 'normie' 
                        ? (isDefaultMode ? 'text-white' : 'text-white')
                        : (isDefaultMode ? 'text-gray-400' : 'text-gray-600')
                    }`}>
                        Normie Sidebar
                    </span>
                </motion.div>
            </div>

            <div className="flex justify-center gap-4 mt-6 w-full">
                <motion.button
                    className={`px-4 py-2 rounded-lg font-medium text-sm w-full ${
                        isDefaultMode 
                        ? 'bg-bgPrimary text-white hover:bg-white/20' 
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                    onClick={() => setShowPreview(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    Preview
                </motion.button>

                <motion.button
                    className={`px-4 py-2 rounded-lg font-medium text-sm w-full transition-all duration-300 ${
                        selectedStyle !== currentStyle 
                        ? (isDefaultMode 
                            ? 'bg-bgPrimary text-white shadow-lg shadow-bgPrimary/20' 
                            : 'bg-blue-500 text-white shadow-lg shadow-blue-500/20')
                        : (isDefaultMode 
                            ? 'bg-bgPrimary/50 text-gray-400' 
                            : 'bg-blue-300 text-gray-600')
                    }`}
                    onClick={handleApplyChanges}
                    disabled={selectedStyle === currentStyle}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    Apply Changes
                </motion.button>
            </div>

            <AnimatePresence>
                {showPreview && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
                        onClick={() => setShowPreview(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="relative max-w-4xl w-full"
                            onClick={e => e.stopPropagation()}
                        >
                            <Image
                                src={selectedStyle === 'normie' ? "/Sidebars/normieNavBar.jpg" : "/Sidebars/horizontalNavBar.jpg"}
                                alt={`${selectedStyle} Navbar Preview`}
                                width={1920}
                                height={1080}
                                className="rounded-2xl w-full h-auto"
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}