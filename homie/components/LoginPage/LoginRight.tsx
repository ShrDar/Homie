"use client"

import { useState } from "react"
import axios from "axios";
import EntryBtn from "../Button/EntryBtn";
import Image from "next/image";
import Link from "next/link";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { loginWithCreds } from "@/actions/auth";
import { toast, Toaster } from "sonner";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { motion } from "motion/react";

export default function LoginRight() {
    
    const { executeRecaptcha } = useGoogleReCaptcha(); 

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loggingIn, setLoggingIn] = useState(false);

    const handleSubmit = async() => {
        if(email == "" || password == "") {
            toast.error("Empty Fields");
            return;
        }
        
        if (!executeRecaptcha) {
            console.log("not available to execute recaptcha")
            return;
        }
        setLoggingIn(true);
      
        const gRecaptchaToken = await executeRecaptcha('inquirySubmit');

    
        const response = await axios({
        method: "post",
        url: "/api/recaptchaSubmit",
        data: {
            gRecaptchaToken,
        },
        headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
        },
        });
    
        if (response?.data?.success === true) {
            const result = await loginWithCreds(email, password);
            if (result?.error) {
                toast.error("Invalid Credentials");
                setLoggingIn(false);
            }
        } else {
            console.log(`Failure with score: ${response?.data?.score}`);
            setLoggingIn(false);
        }

    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="loginRightContainer w-full flex flex-col gap-6 justify-center items-center sulphur"
        >
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
                className="typeBoxContainer w-full flex flex-col justify-center selection:bg-[#2d2d2d] items-center gap-8"
            >
                <motion.input 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: "spring", stiffness: 400, duration: 0.4 }}
                    whileFocus={{ scale: 1.02 }}
                    onChange={(e) => setEmail(e.target.value)} 
                    value={email} 
                    onKeyDown={handleKeyDown}
                    className="w-full bg-[#666666] focus:border-[2px] focus:outline-none focus:border-[#2a2a2a] text-fontPrimary placeholder:text-fontPrimary px-6 py-3 rounded-[6px]" 
                    type="text" 
                    placeholder="Email" 
                />
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: "spring", stiffness: 400, duration: 0.4, delay: 0.1 }}
                    className="w-full relative"
                >
                    <motion.input 
                        whileFocus={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 400, duration: 0.4 }}
                        onChange={(e) => setPassword(e.target.value)} 
                        value={password} 
                        onKeyDown={handleKeyDown}
                        className="w-full bg-[#666666] focus:border-[2px] focus:outline-none focus:border-[#2a2a2a] text-fontPrimary placeholder:text-fontPrimary px-6 py-3 rounded-[6px]" 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Enter your password" 
                    />
                    <motion.button 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white"
                    >
                        {showPassword ? <FaRegEyeSlash /> : <FaRegEye/>}
                    </motion.button>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: "spring", stiffness: 400, duration: 0.4, delay: 0.2 }}
                    className="w-full"
                >
                    <EntryBtn name={loggingIn ? "Logging In" : "Login"} click={handleSubmit} />
                </motion.div>
            </motion.div>
            <div className="loginWithContainer mt-6 w-full flex items-center justify-center">
                <motion.div 
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "40%" }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                    className="h-[1px] bg-fontPrimary"
                />
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="w-[25%]"
                >
                    <p className="text-xs">Or Login With</p>
                </motion.div>
                <motion.div 
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "40%" }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                    className="h-[1px] bg-fontPrimary"
                />
            </div>
            <motion.div 
                // initial={{ opacity: 0 }}
                // animate={{ opacity: 1 }}
                // transition={{ delay: 0.6, staggerChildren: 0.1 }}
                onClick={() => {
                    toast.info("Feature under maintainance 🏗")
                }}
                title="Under Maintainance"
                className="thirdPartyContainer w-full flex cursor-not-allowed"
            >
                <div className="flex gap-8 w-full justify-center items-center pointer-events-none">
                    <motion.div 
                        // initial={{ opacity: 0, y: 20 }}
                        // animate={{ opacity: 1, y: 0 }}
                        // whileHover={{ scale: 1.05 }}
                        // whileTap={{ scale: 0.95 }}
                        // onClick={() => {
                        //     login("google")
                        //     setLoggingIn(true)
                        // }} 
                        className="thirdPartyGoogle cursor-pointer w-full flex items-center border-[1px] border-fontPrimary p-2 rounded-[10px] justify-center gap-5 hover:bg-bgPrimary transition-all duration-100 "
                    >
                        <Image src={"/logo/googlePlain.png"} alt="" width={500} height={500} className="w-[30px]" />
                        <p>Google</p>
                    </motion.div>
                    <motion.div 
                        // initial={{ opacity: 0, y: 20 }}
                        // animate={{ opacity: 1, y: 0 }}
                        // whileHover={{ scale: 1.05 }}
                        // whileTap={{ scale: 0.95 }}
                        // onClick={() => {
                        //     login("github")
                        //     setLoggingIn(true)
                        // }} 
                        className="thirdPartyGoogle cursor-pointer w-full flex items-center border-[1px] border-fontPrimary p-2 rounded-[10px] justify-center gap-5 hover:bg-bgPrimary transition-all duration-100"
                    >
                        <Image src={"/logo/githubPlain.png"} alt="" width={500} height={500} className="w-[30px]" />
                        <p>GitHub</p>
                    </motion.div>
                </div>
            </motion.div>
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="w-full flex justify-center items-center"
            >
                <p className="text-xs">Don{"'"}t Have an account? <span className="text-lg font-bold hover:text-bgPrimary transition-all duration-100"><Link href={'/signup'}>Sign Up</Link></span> dawg</p>
            </motion.div>
            <Toaster richColors />
        </motion.div>
    )
}