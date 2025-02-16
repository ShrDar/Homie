"use client"
import { useState } from "react"
import EntryBtn from "../Button/EntryBtn";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import axios from "axios";
import Link from "next/link";
import { signupWithCreds } from "@/actions/auth";
import { toast } from "sonner";
import { redirect } from "next/navigation";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

export default function SignUpClient() {
    const defaultImages = ['https://cloud.appwrite.io/v1/storage/buckets/67aa0b3d001aeadacd8a/files/67aa0bcf002e60148154/view?project=67aa0803002c7db860ad&mode=admin', 'https://cloud.appwrite.io/v1/storage/buckets/67aa0b3d001aeadacd8a/files/67aa130a0027cba1a4ac/view?project=67aa0803002c7db860ad&mode=admin', 'https://cloud.appwrite.io/v1/storage/buckets/67aa0b3d001aeadacd8a/files/67aa131a003596256ea6/view?project=67aa0803002c7db860ad&mode=admin', 'https://cloud.appwrite.io/v1/storage/buckets/67aa0b3d001aeadacd8a/files/67aa132700151f0a8682/view?project=67aa0803002c7db860ad&mode=admin', 'https://cloud.appwrite.io/v1/storage/buckets/67aa0b3d001aeadacd8a/files/67aa1336000dac6ec818/view?project=67aa0803002c7db860ad&mode=admin'];
    const { executeRecaptcha } = useGoogleReCaptcha();

    const [email, setEmail] = useState("");
    const [fName, setFName] = useState("");
    const [lName, setLName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    // Add validation states
    const [usernameError, setUsernameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Email validation function
    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            setEmailError("");
        } else if (!emailRegex.test(email)) {
            setEmailError("Please enter a valid email address");
        } else {
            setEmailError("");
        }
    };

    // Password validation function
    const validatePassword = (password: string) => {
        if (!password) {
            setPasswordError("");
        } else if (password.length < 8) {
            setPasswordError("Password must be at least 8 characters long");
        } else {
            setPasswordError("");
        }
        // Also check confirm password when password changes
        validateConfirmPassword(confirmPassword, password);
    };

    // Confirm password validation function
    const validateConfirmPassword = (confirmPass: string, pass: string = password) => {
        if (!confirmPass) {
            setConfirmPasswordError("");
        } else if (confirmPass !== pass) {
            setConfirmPasswordError("Passwords don't match");
        } else if(confirmPass.length < 8) {
            setConfirmPasswordError("Password must be at least 8 characters long");
        } else {
            setConfirmPasswordError("");
        }
    };

    const validateUsername = async (username: string) => {
        const url = process.env.NEXT_PUBLIC_BACKEND_URL;
        // console.log(url);
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/`)
        const users = await response.json();
        const repeatedUser = users.some((user: { username: string }) => user.username === username);
        
        if(repeatedUser) {
            setUsernameError("Username Taken ")
        } else {
            setUsernameError("");
        }
    }

    const handleSubmit = async() => {
        // Validate all fields before submission
        validateEmail(email);
        validatePassword(password);
        validateConfirmPassword(confirmPassword);
        
        if(email == "" || password == "" || confirmPassword == "" || fName == "" || lName == "") {
            toast.error("Empty Fields");
            return;
        }
        if(emailError) {
            toast.error(emailError)
        } else if(passwordError) {
            toast.error(passwordError)
        } else if(confirmPasswordError) {
            toast.error(confirmPasswordError)
        } else if(usernameError) {
            toast.error(usernameError)
        }

        if (emailError || passwordError || confirmPasswordError || !email || !password || !confirmPassword) {
            // toast.error("Invalid input");
            return;
        }
        
        if (!executeRecaptcha) {
            toast.error("Recaptcha not available");
            return;
        }
        setSubmitting(true);

        const fullName = `${fName} ${lName}`.trim();
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
            const image = defaultImages[Math.floor(Math.random() * defaultImages.length)];
            const result = await signupWithCreds(email, password, fullName, image, username);
            
            if (result.error) {
                toast.error(result.error);
                setSubmitting(false);
            } else {
                toast.success("You're a Homie");
                setSubmitting(false);
                redirect("/login");
            }
        } else {
            toast.error("Captcha verification failed!");
        }
    }

    return (
        <div className="w-full flex flex-col justify-center items-center gap-8">
            <div className="typeBoxContainer w-full flex flex-col justify-center selection:bg-[#2d2d2d] items-center gap-8" >
                <div className="w-full flex justify-center items-center gap-4">
                    <div className="w-full">
                        <input 
                            onChange={(e) => setFName(e.target.value)} 
                            value={fName} 
                            className="w-full bg-[#666666] border-2 border-transparent focus:border-[#2a2a2a] focus:outline-none text-fontPrimary placeholder:text-[#fff] px-6 py-3 rounded-[6px]" 
                            placeholder="First Name" 
                        />
                    </div>
                    <div className="w-full">
                        <input 
                            onChange={(e) => setLName(e.target.value)} 
                            value={lName} 
                            className="w-full bg-[#666666] border-2 border-transparent focus:border-[#2a2a2a] focus:outline-none text-fontPrimary placeholder:text-[#fff] px-6 py-3 rounded-[6px]" 
                            placeholder="Last Name" 
                        />
                    </div>
                </div>
                <div className="w-full">
                    <input 
                        onChange={(e) => {
                            setUsername(e.target.value);
                            validateUsername(e.target.value);
                        }} 
                        value={username} 
                        className={`w-full bg-[#666666] border-2 focus:outline-none ${
                            usernameError 
                                ? 'border-red-500' 
                                : 'border-transparent focus:border-[#2a2a2a]'
                        } text-fontPrimary placeholder:text-[#fff] px-6 py-3 rounded-[6px]`}
                        type="text" 
                        placeholder="Username" 
                    />
                </div>
                <div className="w-full">
                    <input 
                        onChange={(e) => {
                            setEmail(e.target.value);
                            validateEmail(e.target.value);
                        }} 
                        value={email} 
                        className={`w-full bg-[#666666] border-2 focus:outline-none ${
                            emailError 
                                ? 'border-red-500' 
                                : 'border-transparent focus:border-[#2a2a2a]'
                        } text-fontPrimary placeholder:text-[#fff] px-6 py-3 rounded-[6px]`}
                        type="email" 
                        placeholder="Email" 
                    />
                    {/* {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>} */}
                </div>
                

                <div className="w-full relative">
                    <input 
                        onChange={(e) => {
                            setPassword(e.target.value);
                            validatePassword(e.target.value);
                        }} 
                        value={password} 
                        className={`w-full bg-[#666666] border-2 focus:outline-none ${
                            passwordError 
                                ? 'border-red-500' 
                                : 'border-transparent focus:border-[#2a2a2a]'
                        } text-[#fff] placeholder:text-[#fff] px-6 py-3 rounded-[6px]`}
                        type={showPassword ? "text" : "password"}
                        placeholder="Password" 
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
                    {/* {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>} */}
                </div>

                <div className="w-full relative">
                    <input 
                        onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            validateConfirmPassword(e.target.value);
                        }} 
                        value={confirmPassword} 
                        className={`w-full bg-[#666666] border-2 focus:outline-none ${
                            confirmPasswordError 
                                ? 'border-red-500' 
                                : 'border-transparent focus:border-[#2a2a2a]'
                        } text-[#fff] placeholder:text-[#fff] px-6 py-3 rounded-[6px]`}
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm password" 
                    />
                    
                    {/* {confirmPasswordError && <p className="text-red-500 text-sm mt-1">{confirmPasswordError}</p>} */}
                </div>
                
                <EntryBtn name={submitting ? "Signing Up" : "Sign Up"} click={handleSubmit} />
            </div>
            <div className="w-full flex justify-center items-center">
                <p className="text-xs">Already a Homie? <span className="text-lg font-bold hover:text-bgPrimary transition-all duration-100"><Link href={'/login'}>Log In</Link></span> dawg</p>
            </div>
        </div>
    )
}