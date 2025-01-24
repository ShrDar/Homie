"use client"
import { useState } from "react"
import EntryBtn from "../Button/EntryBtn";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import axios from "axios";
import Link from "next/link";
import { signupWithCreds } from "@/actions/auth";
import { toast } from "sonner";
import { redirect } from "next/navigation";

export default function SignUpClient() {
    const { executeRecaptcha } = useGoogleReCaptcha();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    const handleSubmit = async() => {
        if (password !== confirmPassword) {
            toast.error("Passwords don't match!");
            return;
        }

        if (!executeRecaptcha) {
            toast.error("Recaptcha not available");
            return;
        }

        const gRecaptchaToken = await executeRecaptcha('inquirySubmit');
    
        const response = await axios({
            method: "post",
            url: "/api/recaptchaSubmit",
            data: { gRecaptchaToken },
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json",
            },
        });
    
        if (response?.data?.success === true) {
            const result = await signupWithCreds(email, password);
            
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Account created successfully!");
                redirect("/login");
            }
        } else {
            toast.error("Captcha verification failed!");
        }
    }

    return (
        <div className="w-full flex flex-col justify-center items-center gap-8">
            <div className="typeBoxContainer w-full flex flex-col justify-center selection:bg-[#2d2d2d] items-center gap-8" >
                <input onChange={(e) => setEmail(e.target.value)} value={email} className="w-full bg-[#666666] focus:border-[2px] focus:outline-none focus:border-[#2a2a2a] text-fontPrimary placeholder:text-[#fff] px-6 py-3 rounded-[6px]" type="text" placeholder="Email" />
                <input onChange={(e) => setPassword(e.target.value)} value={password} className="w-full bg-[#666666] focus:border-[2px] focus:outline-none focus:border-[#2a2a2a] text-[#fff] placeholder:text-[#fff] px-6 py-3 rounded-[6px]" type="text" placeholder="Password" />
                <input onChange={(e) => setConfirmPassword(e.target.value)} value={confirmPassword} className="w-full bg-[#666666] focus:border-[2px] focus:outline-none focus:border-[#2a2a2a] text-[#fff] placeholder:text-[#fff] px-6 py-3 rounded-[6px]" type="text" placeholder="Confirm password" />
                <EntryBtn name="Sign Up" click={handleSubmit} />
            </div>
            <div className="w-full flex justify-center items-center">
                <p className="text-xs">Already a Homie? <span className="text-lg font-bold hover:text-bgPrimary transition-all duration-100"><Link href={'/login'}>Log In</Link></span> dawg</p>
            </div>
        </div>
    )
}