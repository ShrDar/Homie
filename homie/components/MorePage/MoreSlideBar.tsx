"use client"

import { useState, useEffect } from 'react';
import { Session } from 'next-auth';
import { motion, AnimatePresence } from "motion/react";
import Image from 'next/image';

export default function MoreSlideBar({ session }: { session: Session | null | undefined }) {
    const [selectedStyle, setSelectedStyle] = useState<'normie' | 'horizontal'>('normie');
    const [currentStyle, setCurrentStyle] = useState<'normie' | 'horizontal'>('normie');
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        const savedStyle = localStorage.getItem('sidebarType');
        if (savedStyle === 'normie' || savedStyle === 'horizontal') {
            setSelectedStyle(savedStyle);
            setCurrentStyle(savedStyle);
        }
    }, []);

    const handleApplyChanges = () => {
        localStorage.setItem('sidebarType', selectedStyle);
        window.location.reload();
    };

    if (!session) return null;

    return (
        <div className="p-8">
            <div className="flex flex-col lg:flex-row gap-8 w-full max-w-4xl mx-auto">
                <motion.div 
                    className={`flex-1 p-8 rounded-2xl cursor-pointer flex flex-col items-center justify-center lg:gap-6 transition-all duration-300 backdrop-blur-sm ${
                        selectedStyle === 'horizontal' 
                        ? 'bg-bgPrimary shadow-lg shadow-bgPrimary/20' 
                        : 'bg-white/5'
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
                        selectedStyle === 'horizontal' ? 'text-white' : 'text-gray-400'
                    }`}>
                        Horizontal Sidebar
                    </span>
                </motion.div>
                
                <motion.div 
                    className={`flex-1 p-8 rounded-2xl cursor-pointer flex flex-col items-center justify-center lg:gap-6 transition-all duration-300 backdrop-blur-sm ${
                        selectedStyle === 'normie' 
                        ? 'bg-bgPrimary shadow-lg shadow-bgPrimary/20' 
                        : 'bg-white/5'
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
                        selectedStyle === 'normie' ? 'text-white' : 'text-gray-400'
                    }`}>
                        Normie Sidebar
                    </span>
                </motion.div>
            </div>

            <div className="flex justify-center gap-4 mt-6 w-full">
                <motion.button
                    className="px-4 py-2 rounded-lg font-medium text-sm bg-bgPrimary text-white hover:bg-white/20 w-full"
                    onClick={() => setShowPreview(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    Preview
                </motion.button>

                <motion.button
                    className={`px-4 py-2 rounded-lg font-medium text-sm w-full transition-all duration-300 ${
                        selectedStyle !== currentStyle 
                        ? 'bg-bgPrimary text-white shadow-lg shadow-bgPrimary/20' 
                        : 'bg-bgPrimary/50 text-gray-400'
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