"use client"

import { motion, AnimatePresence } from "motion/react"
import { logout } from "@/actions/auth"
import { createPortal } from "react-dom"
import { useEffect, useState } from "react"

export default function LogOutModal({ setOpenLogOutModal }: { setOpenLogOutModal: (value: boolean) => void }) {
    const [mounted, setMounted] = useState(false);
    const [isDefaultMode, setIsDefaultMode] = useState(true);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        setIsDefaultMode(savedTheme ? savedTheme === 'default' : true);
    }, []);

    const handleLogout = async () => {
        await logout();
    };

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            <motion.div 
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpenLogOutModal(false)} 
                className="fixed top-[50%] z-[305] left-[50%] translate-x-[-50%] translate-y-[-50%] h-screen w-full bg-[#000] bg-opacity-50 backdrop-blur-sm"
            />
            <div 
                key="modal"
                className={`fixed p-10 w-[70%] md:w-[50%] lg:w-[30%] flex flex-col gap-8 justify-center items-center rounded-[15px] ${isDefaultMode ? 'bg-bgSecondary' : 'bg-white'} top-[50%] z-[310] left-[50%] translate-x-[-50%] translate-y-[-50%] ${isDefaultMode ? 'text-fontPrimary' : 'text-gray-800'} sulphur`}
            >
                <motion.p 
                    initial={{ y: -20 }}
                    animate={{ y: 0 }}
                    className="text-lg"
                >
                    Yeet Out
                </motion.p>
                <motion.div 
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    className={`${isDefaultMode ? 'bg-bgPrimary' : 'bg-gray-100'} p-10 rounded-[15px] w-full flex justify-center items-center`}
                >
                    <p className="text-center">Taking a break? See you bilis! 👋</p>
                </motion.div>
                <div className="flex justify-center items-center w-full gap-4">
                    <motion.div 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setOpenLogOutModal(false)} 
                        className={`w-full cursor-pointer rounded-[15px] p-2 gap-2 ${isDefaultMode ? 'bg-bgPrimary' : 'bg-gray-100'} flex justify-center items-center`}
                    >
                        <p>Stay</p>
                    </motion.div>
                    <motion.div 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLogout} 
                        className={`w-full cursor-pointer rounded-[15px] p-2 ${isDefaultMode ? 'bg-bgPrimary' : 'bg-gray-100'} text-[#d45353] flex justify-center items-center`}
                    >
                        <p>Logout</p>
                    </motion.div>
                </div>
            </div>
        </AnimatePresence>,
        document.body
    );
}