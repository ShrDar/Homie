"use client"
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { useEffect, useState } from 'react'

export default function PageTitle() {
    const pathname = usePathname();
    const [isDefaultMode, setIsDefaultMode] = useState(true);
    const [isMounted, setIsMounted] = useState(false); // Track if the component is mounted

    useEffect(() => {
        setIsMounted(true); // Set to true when the component is mounted on the client
    }, []);

    useEffect(() => {
        if (isMounted && typeof window !== 'undefined' && window.localStorage) {
            const savedTheme = localStorage.getItem('theme');
            setIsDefaultMode(savedTheme ? savedTheme === 'default' : true);
        }
    }, [isMounted]); // This will run after the component is mounted

    const getPageTitle = () => {
        const path = pathname?.slice(1);
        
        if (path === "") return 'Posts';
        
        if(path.startsWith('profile/')) return 'Profile';
        if(path.startsWith('homie/')) return 'Homie';
        if(path.startsWith('yap/')) return 'Yap';
        if(path.startsWith("admin/")) return '';
        if(path.startsWith("posts")) return 'Posts';
        if(path.startsWith("teas")) return 'Teas';

        return path.charAt(0).toUpperCase() + path.slice(1);
    }

    const title = getPageTitle();

    if (!isMounted) {
        return null; // Avoid rendering on the server
    }

    return (
        <div 
            className="fixed right-8 cursor-default sulphur md:flex flex-col hidden hover:animate-pulse"
        >
            <h1 className={`text-xl uppercase tracking-[8px] ${isDefaultMode ? 'text-[#ffffff6e]' : 'text-gray-400'} [writing-mode:vertical-lr] rotate-180`}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${pathname}`}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={{
                            hidden: { opacity: 0 },
                            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                        }}
                    >
                        {title.split('').map((char, index) => (
                            <motion.span
                                key={index}
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0 }
                                }}
                            >
                                {char}
                            </motion.span>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </h1>
        </div>
    )
}
