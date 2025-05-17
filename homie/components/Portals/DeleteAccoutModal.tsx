"use client"

import { toast } from "sonner";
import { logout } from "@/actions/auth";
import { storage } from "@/config/AppWriteClient";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";

export default function DeleteAccountModal({openDeleteModal, setOpenDeleteModal, user}: {openDeleteModal: boolean, setOpenDeleteModal: any, user: any}) {
    const [stopHover, setStopHover] = useState(false);
    const [isDefaultMode, setIsDefaultMode] = useState(true);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        setIsDefaultMode(savedTheme ? savedTheme === 'default' : true);
    }, []);

    if(!openDeleteModal) {
        return null;
    }
    const handleDelete = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${user._id}`, {
                method: "DELETE",
            });

            if (user.image && !user.image.startsWith("htt")) {
                try {
                    await storage.deleteFile(process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || "", user.image);
                } catch (imageError) {
                    console.error("Error deleting profile image:", imageError);
                }
            }
            
            if (response.ok) {
                toast.success("Account deleted successfully");
                logout();
        } else {
            const errorMessage = await response.text();
            toast.error(`Error: ${errorMessage}`);
        }
        } catch (err) {
        toast.error("Error deleting account");
        console.error("Error deleting user:", err);
        }
    };

    return(
        <AnimatePresence>
            <motion.div 
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpenDeleteModal(false)} 
                className="fixed top-[50%] z-[90] left-[50%] translate-x-[-50%] translate-y-[-50%] h-screen w-full bg-[#000] bg-opacity-50 backdrop-blur-sm"
            />
            <div 
                key="modal"
                className={`fixed p-10 w-[70%] md:w-[50%] lg:w-[30%] flex flex-col gap-8 justify-center items-center rounded-[15px] ${isDefaultMode ? 'bg-bgSecondary text-fontPrimary' : 'bg-white text-gray-800'} top-[50%] z-[100] left-[50%] translate-x-[-50%] translate-y-[-50%] sulphur`}
            >
                <motion.p 
                    initial={{ y: -20 }}
                    animate={{ y: 0 }}
                    className="text-lg"
                >
                    Delete Account
                </motion.p>
                <motion.div 
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    className={`${isDefaultMode ? 'bg-bgPrimary' : 'bg-gray-100'} p-10 rounded-[15px] w-full flex justify-center items-center`}
                >
                    <p className="text-center">Are you leaving us ? 😢</p>
                </motion.div>
                <div className="flex justify-center items-center w-full gap-4">
                    <motion.div 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setOpenDeleteModal(false)} 
                        onMouseEnter={() => setStopHover(true)}
                        onMouseLeave={() => setStopHover(false)}
                        className={`w-full cursor-pointer rounded-[15px] p-2 gap-2 ${isDefaultMode ? 'bg-bgPrimary' : 'bg-gray-100'} flex justify-center items-center`}
                    >
                        <p>Stop</p>
                        {stopHover && <motion.p initial={{x: -10}} animate={{x: 0}} >🙌🏻</motion.p>}
                    </motion.div>
                    <motion.div 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete()} 
                        className={`w-full cursor-pointer rounded-[15px] p-2 ${isDefaultMode ? 'bg-bgPrimary' : 'bg-gray-100'} text-[#d45353] flex justify-center items-center`}
                    >
                        <p>Delete</p>
                    </motion.div>
                </div>
            </div>
        </AnimatePresence>
    );
}
