
"use client"
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export default function PageTitle() {
    const pathname = usePathname();

    const getPageTitle = () => {
        const path = pathname?.slice(1);
        
        if (path === "") return 'Posts';
        
        if(path.startsWith('profile/')) return 'Profile';
        if(path.startsWith('homie/')) return 'Homie';
        if(path.startsWith('yap/')) return 'Yap';
        if(path.startsWith("admin/")) return '';

        return path.charAt(0).toUpperCase() + path.slice(1);
    }

    const title = getPageTitle();
    return (
        <div 
            className="fixed right-8 cursor-default sulphur md:flex flex-col hidden hover:animate-pulse"
        >
            <h1 className="text-xl uppercase tracking-[8px] text-[#ffffff6e] [writing-mode:vertical-lr] rotate-180">
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