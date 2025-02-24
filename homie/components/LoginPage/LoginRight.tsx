"use client"

import { useState } from "react"
import axios from "axios";
import EntryBtn from "../Button/EntryBtn";
import Image from "next/image";
import Link from "next/link";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { login, loginWithCreds } from "@/actions/auth";
import { toast, Toaster } from "sonner";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

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
                toast.error(result.error);
                setLoggingIn(false);
            }
        } else {
            console.log(`Failure with score: ${response?.data?.score}`);
            setLoggingIn(false);
        }

    }


    return (
        <div className="loginRightContainer w-full flex flex-col gap-6 justify-center items-center sulphur">
            <div className="typeBoxContainer w-full flex flex-col justify-center selection:bg-[#2d2d2d] items-center gap-8">
                <input onChange={(e) => setEmail(e.target.value)} value={email} className="w-full bg-[#666666] focus:border-[2px] focus:outline-none focus:border-[#2a2a2a] text-fontPrimary placeholder:text-fontPrimary px-6 py-3 rounded-[6px]" type="text" placeholder="Email" />
                <div className="w-full relative">
                    <input 
                        onChange={(e) => setPassword(e.target.value)} 
                        value={password} 
                        className="w-full bg-[#666666] focus:border-[2px] focus:outline-none focus:border-[#2a2a2a] text-fontPrimary placeholder:text-fontPrimary px-6 py-3 rounded-[6px]" 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Enter your password" 
                    />
                    <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white"
                    >
                        {showPassword ? (
                            <FaRegEyeSlash />
                        ) : (
                            <FaRegEye/>
                        )}
                    </button>
                </div>
                <EntryBtn name={loggingIn ? "Logging In" : "Login"} click={handleSubmit} />
            </div>
            <div className="loginWithContainer mt-6 w-full flex items-center justify-center">
                <div className="w-[40%] h-[1px] bg-fontPrimary"></div>
                <div className="w-[25%]">
                    <p className="text-xs">Or Login With</p>
                </div>
                <div className="w-[40%] h-[1px] bg-fontPrimary"></div>
            </div>
            <div className="thirdPartyContainer w-full flex">
                <div className="flex gap-8 w-full justify-center items-center">
                    <div onClick={() => login("google")} className="thirdPartyGoogle cursor-pointer w-full flex items-center border-[1px] border-fontPrimary p-2 rounded-[10px] justify-center gap-5 hover:bg-bgPrimary transition-all duration-100">
                        <Image src={"/logo/googlePlain.png"} alt="" width={500} height={500} className="w-[30px]" />
                        <p>Google</p>
                    </div>
                    <div onClick={() => login("github")} className="thirdPartyGoogle cursor-pointer w-full flex items-center border-[1px] border-fontPrimary p-2 rounded-[10px] justify-center gap-5 hover:bg-bgPrimary transition-all duration-100">
                        <Image src={"/logo/githubPlain.png"} alt="" width={500} height={500} className="w-[30px]" />
                        <p>GitHub</p>
                    </div>
                </div>
            </div>
            <div className="w-full flex justify-center items-center">
                <p className="text-xs">Don{"'"}t Have an account? <span className="text-lg font-bold hover:text-bgPrimary transition-all duration-100"><Link href={'/signup'}>Sign Up</Link></span> dawg</p>
            </div>
            <Toaster richColors />
        </div>
    )
}