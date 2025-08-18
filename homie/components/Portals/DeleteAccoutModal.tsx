"use client"

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { logout } from "@/actions/auth";
import { storage } from "@/config/AppWriteClient";
import bcrypt from "bcrypt-edge";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { FaCheck } from "react-icons/fa6";

export default function DeleteAccountModal({openDeleteModal, setOpenDeleteModal, user}: {openDeleteModal: boolean, setOpenDeleteModal: any, user: any}) {
    const [stopHover, setStopHover] = useState(false);
    const [isDefaultMode, setIsDefaultMode] = useState(true);
    const [displayCurrentPasswordInput, setDisplayCurrentPasswordInput] = useState(true);
    const [currentPassword, setCurrentPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [currentPasswordError, setCurrentPasswordError] = useState("");
    const [displayCurrentPassTick, setDisplayCurrentPassTick] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
            const savedTheme = localStorage.getItem('theme');
            setIsDefaultMode(savedTheme ? savedTheme === 'default' : true);
        }
    }, []);

    if(!openDeleteModal) {
        return null;
    }

    const checkPass = async() => {
        try {
            const verify = await bcrypt.compareSync(currentPassword, user.hashedPassword)
            if(verify) {
                toast.success("Password Verified 🔓");
                setDisplayCurrentPasswordInput(false);
            } else {
                toast.error("Wrong Password 🔐");
            }
        } catch (err) {
            console.error(err);
        }
    }

    const validateCurrentPassword = (password: string) => {
        if(password.length >= 8) {
            setDisplayCurrentPassTick(true);
        } else {
            setDisplayCurrentPassTick(false);
        }
        setCurrentPasswordError("")
    }

    const backToDefault = () => {
        setOpenDeleteModal(false);
        setDisplayCurrentPasswordInput(true);
        setCurrentPassword("");
        setDisplayCurrentPassTick(false);
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
                onClick={() => backToDefault()} 
                className="fixed top-[50%] z-[90] left-[50%] translate-x-[-50%] translate-y-[-50%] h-screen w-full bg-[#000] bg-opacity-50 backdrop-blur-sm"
            />
            <div 
                key="modal"
                className={`fixed p-10 w-[70%] md:w-[50%] lg:w-[30%] flex flex-col gap-8 justify-center items-center rounded-[15px] ${isDefaultMode ? 'bg-bgSecondary text-fontPrimary' : 'bg-white text-gray-800'} top-[50%] z-[100] left-[50%] translate-x-[-50%] translate-y-[-50%] sulphur`}
            >
                {displayCurrentPasswordInput ? (
                    <motion.div 
                        className="w-full flex justify-center items-center gap-3"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 20, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="w-full relative">
                            <input 
                                onChange={(e) => {
                                    setCurrentPassword(e.target.value);
                                    validateCurrentPassword(e.target.value);
                                }} 
                                value={currentPassword} 
                                maxLength={128}
                                className={`w-full ${isDefaultMode ? 'bg-bgPrimary text-fontPrimary placeholder:text-fontPrimary' : 'bg-gray-100 text-gray-800 placeholder:text-gray-500'} border-2 focus:outline-none selection:bg-[#666] ${
                                    currentPasswordError 
                                        ? 'border-red-500' 
                                        : 'border-transparent focus:border-[#666666]'
                                } px-6 py-3 rounded-[6px]`}
                                type={showPassword ? "text" : "password"}
                                placeholder="Verify Password" 
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDefaultMode ? 'text-white' : 'text-gray-600'}`}
                            >
                                {showPassword ? <FaRegEyeSlash /> : <FaRegEye/>}
                            </button>
                        </div>
                        <div onClick={() => checkPass()} className={`${isDefaultMode ? 'bg-bgPrimary' : 'bg-gray-100'} rounded-full p-2 cursor-pointer hover:brightness-[0.8] transition-all duration-150 ${displayCurrentPassTick ? "flex" : "hidden"}`}>
                            <FaCheck size={20} />
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        className="w-full flex flex-col justify-center items-center gap-4"
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        transition={{ duration: 0.2 }}
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
                            <p className="text-center">Are you leaving us? 😢</p>
                        </motion.div>
                        <div className="flex justify-center items-center w-full gap-4">
                            <motion.div 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => backToDefault()} 
                                onMouseEnter={() => setStopHover(true)}
                                onMouseLeave={() => setStopHover(false)}
                                className={`w-full cursor-pointer rounded-[15px] p-2 gap-2 ${isDefaultMode ? 'bg-bgPrimary' : 'bg-gray-100'} flex justify-center items-center`}
                            >
                                <p>Cancel</p>
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
                    </motion.div>
                )}
            </div>
        </AnimatePresence>
    );
}
