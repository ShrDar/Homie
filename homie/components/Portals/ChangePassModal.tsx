"use client"

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import bcrypt from "bcrypt-edge";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { toast } from "sonner";
import { FaCheck } from "react-icons/fa6";

export default function ChangePassModal({ openChangePassModal, setOpenChangePassModal, user, setUser } : {openChangePassModal : boolean, setOpenChangePassModal: any, user: any, setUser: any}) {
    const [isDefaultMode, setIsDefaultMode] = useState(true);
    
    const [displayCurrentPasswordInput, setDisplayCurrentPasswordInput] = useState(true);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordConfirm, setNewPasswordConfirm] = useState("")
    const [showPassword, setShowPassword] = useState(false);
    
    const [currentPasswordError, setCurrentPasswordError] = useState("");
    const [newPasswordError, setNewPasswordError] = useState("");
    const [newPasswordConfirmError, setNewPasswordConfirmError] = useState("");
    
    const [displayCurrentPassTick, setDisplayCurrentPassTick] = useState(false);
    
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        setIsDefaultMode(savedTheme ? savedTheme === 'default' : true);
    }, []);
    
    if(!openChangePassModal) {
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

    const validateNewPassword = (password: string) => {
        if (!password) {
            setNewPasswordError("");
            setNewPasswordConfirm("");
        } else if (password.length < 8) {
            setNewPasswordError("Password must be at least 8 characters long 📏");
        } else if (/\s/.test(password)) {  // Regex to check for whitespace
            setNewPasswordError("Password cannot contain spaces");
        } else {
            setNewPasswordError("");
        }

        if(password === currentPassword) {
            setNewPasswordError("Use a new Password");
        }
        
        validateNewPasswordConfirm(newPasswordConfirm, newPassword);
    } 

    const validateNewPasswordConfirm = (confirmPass: string, pass: string = newPassword) => {
        if (!confirmPass) {
            setNewPasswordConfirmError("");
        } else if (confirmPass !== pass) {
            setNewPasswordConfirmError("Passwords don't match");
        } else if(confirmPass.length < 8) {
            setNewPasswordConfirmError("Password must be at least 8 characters long 📏");
        } else {
            setNewPasswordConfirmError("");
        }
    } 

    const handleChange = async() => {
        if(newPassword === "" || newPasswordConfirm == "") {
            toast.info("Empty Field 😓")
            return
        }

        if(newPasswordError) {
            toast.info(newPasswordError)
        } else if(newPasswordConfirmError){
            toast.info(newPasswordConfirmError)
        }

        if(newPasswordError || newPasswordConfirmError) {
            return;
        }

        const hPass = bcrypt.hashSync(newPasswordConfirm, 10);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${user._id}/passwordChange`, {
                method: 'PATCH',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({ hashedPassword: hPass }),
            });

            if (response.ok) {
                const refetchedResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${user._id}`);
                const updatedUser = await refetchedResponse.json();
                setUser(updatedUser);
            } else {
                toast.error('Failed To Change Pass 😔');
                return;
            }

        } catch(err) {
            console.error(err);
            toast.error('Failed To Change Pass 😔');
        }

        toast.success("Password Changed 🔒");
        backToDefault();
    }

    const backToDefault = () => {
        setOpenChangePassModal(false);
        setDisplayCurrentPasswordInput(true);
        setCurrentPassword("");
        setDisplayCurrentPassTick(false)
        setNewPassword("");
        setNewPasswordConfirm("");
        setCurrentPasswordError("");
        setNewPasswordError("");
        setNewPasswordConfirmError("");
    }

    return(
        <AnimatePresence>
            {openChangePassModal && (
                <>
                    <motion.div 
                        onClick={() => backToDefault()} 
                        className="fixed top-[50%] z-[90] left-[50%] translate-x-[-50%] translate-y-[-50%] h-screen w-full bg-[#000] bg-opacity-50 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    />
                    <div 
                        className={`fixed p-10 w-[70%] md:w-[50%] lg:w-[30%] flex flex-col gap-8 justify-center items-center rounded-[15px] ${isDefaultMode ? 'bg-bgSecondary text-fontPrimary' : 'bg-white text-gray-800'} top-[50%] z-[100] left-[50%] translate-x-[-50%] translate-y-[-50%] sulphur`}
                    >
                        {displayCurrentPasswordInput && (
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
                                        placeholder="Password" 
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDefaultMode ? 'text-white' : 'text-gray-600'}`}
                                    >
                                        {showPassword ? (
                                            <FaRegEyeSlash />
                                        ) : (
                                            <FaRegEye/>
                                        )}
                                    </button>
                                </div>
                                <div onClick={() => checkPass()} className={`${isDefaultMode ? 'bg-bgPrimary' : 'bg-gray-100'} rounded-full p-2 cursor-pointer hover:brightness-[0.8] transition-all duration-150 ${displayCurrentPassTick ? "flex" : "hidden"}`}>
                                    <FaCheck size={20} />
                                </div>
                            </motion.div>
                        )}
                        {!displayCurrentPasswordInput && (
                            <motion.div 
                                className="w-full flex flex-col justify-center items-center gap-4"
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="w-full relative">
                                    <input 
                                        onChange={(e) => {
                                            setNewPassword(e.target.value);
                                            validateNewPassword(e.target.value);
                                        }} 
                                        value={newPassword} 
                                        maxLength={128}
                                        className={`w-full ${isDefaultMode ? 'bg-bgPrimary text-fontPrimary placeholder:text-fontPrimary' : 'bg-gray-100 text-gray-800 placeholder:text-gray-500'} border-2 focus:outline-none selection:bg-[#666] ${
                                            newPasswordError 
                                                ? 'border-red-500' 
                                                : 'border-transparent focus:border-[#666666]'
                                        } px-6 py-3 rounded-[6px]`}
                                        type={showPassword ? "text" : "password"}
                                        placeholder="New Password" 
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDefaultMode ? 'text-white' : 'text-gray-600'}`}
                                    >
                                        {showPassword ? (
                                            <FaRegEyeSlash />
                                        ) : (
                                            <FaRegEye/>
                                        )}
                                    </button>
                                </div>

                                <div className="w-full relative">
                                    <input 
                                        onChange={(e) => {
                                            setNewPasswordConfirm(e.target.value);
                                            validateNewPasswordConfirm(e.target.value)
                                        }} 
                                        value={newPasswordConfirm} 
                                        className={`w-full ${isDefaultMode ? 'bg-bgPrimary text-fontPrimary placeholder:text-fontPrimary' : 'bg-gray-100 text-gray-800 placeholder:text-gray-500'} border-2 focus:outline-none selection:bg-[#666] ${
                                            newPasswordConfirmError 
                                                ? 'border-red-500' 
                                                : 'border-transparent focus:border-[#666666]'
                                        } px-6 py-3 rounded-[6px]`}
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Confirm password" 
                                    />
                                </div>

                                <div className="w-full flex justify-center items-center gap-4">
                                    <div onClick={() => backToDefault()} className={`${isDefaultMode ? 'bg-bgPrimary' : 'bg-gray-100'} w-full p-3 hover:brightness-[0.9] cursor-pointer rounded-[6px] flex justify-center items-center`}>
                                        <p className="text-[#FF6F6F]">Discard</p>
                                    </div>
                                    <div onClick={() => handleChange()} className={`${isDefaultMode ? 'bg-bgPrimary' : 'bg-gray-100'} w-full p-3 hover:brightness-[1.2] cursor-pointer rounded-[6px] flex justify-center items-center`}>
                                        <p className="text-[#5FB972]">Change</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
