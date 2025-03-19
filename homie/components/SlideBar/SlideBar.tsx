"use client"
import { getProfileUrl } from "@/extra/helpers";
import { motion } from "motion/react"
import { Session } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FaBarsStaggered } from "react-icons/fa6";
import { FaUserAstronaut } from "react-icons/fa6";
import { RiMessage3Fill } from "react-icons/ri"
import { logout } from "@/actions/auth";
import { IoLogOutOutline } from "react-icons/io5";

export default function SlideBar( {session} : {session: Session} ) {

    const pathname = usePathname();

    const [hidden, setHidden] = useState(true);
    const [user, setUser] = useState({username: '', bio: '', image: "", name: ""});

    useEffect(() => {
        const fetchUserData = async() => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${session?.user?.id}`);
            const user = await response.json();
            setUser(user);
        }
    
        fetchUserData();
    }, [session?.user?.id, pathname])
    
    if(pathname.includes("admin")) {
        return (
            <></>
        )
    }

    return (
        <>
            <div className={`lg:hidden h-full absolute w-full bg-[#00000058] z-[50] ${hidden ? "hidden" : "flex"} `} onClick={() => setHidden(true)}></div>
            <div className={`w-[40%] h-full bg-transparent z-[10] absolute left-0 hidden ${hidden ? "md:hidden" : "md:flex"} `} onMouseEnter={() => setHidden(true)}></div>
            <div onClick={() => setHidden((prev) => !prev)} className="absolute flex md:hidden cursor-pointer top-5 right-5">
                <FaBarsStaggered color="#fff" />
            </div>
            <motion.div 
            variants={{
                visible: { x: 0 },
                hidden: { x: "-98%" }
            }}
            animate={hidden ? "hidden" : "visible"}
            transition={{ duration: 0.4 , ease: "easeInOut" }}
            onMouseEnter={() => setHidden(false)} className="slideBar z-[100] lg:z-10 bg-transparent text-fontPrimary fixed top-0 h-full left-[-5px] md:left-0 flex justify-center items-center w-[50%] md:w-[20%] lg:w-[14%] sulphur">
                <div className="bg-bgSecondary h-[95%] w-[90%] md:w-full flex flex-col justify-start pt-20 items-center gap-10 rounded-[15px] ml-2">
                    <div className="flex flex-col justify-center items-center gap-2 w-full">
                        <div className="w-full flex items-center justify-center lg:px-4">
                            <Link href={"/profile"} onClick={() => setHidden(true)} className="bg-[#8B8B8B] w-[40%] aspect-square md:w-[70%] lg:w-[45%] p-3 rounded-full overflow-hidden translate-x-[15px] flex justify-center items-center">
                                <Image 
                                    src={"/figmaIcons/bio.svg"}
                                    alt=""
                                    height={200}
                                    width={200}
                                    className="md:w-[80%] lg:w-[90%] h-full bg-[#888888] z-20 hover:opacity-0 transition-all duration-150"
                                />
                                <div className="absolute w-full flex flex-col justify-center items-center">
                                    <p className="text-md text-bgPrimary absolute w-[70%] text-center flex justify-center items-center tracking-[1px]">Shh......</p>
                                </div>
                            </Link>
                            <Link href={"/profile"} onClick={() => setHidden(true)} className="w-[40%] md:w-[70%] lg:w-[45%] translate-x-[-15px] aspect-square flex bg-bgPrimary rounded-full justify-center items-center p-2">
                                <Image 
                                    src={getProfileUrl(user?.image || "")}
                                    alt=""
                                    height={200}
                                    width={200}
                                    className="rounded-full aspect-square object-cover md:w-[80%] lg:w-[90%]"
                                />
                            </Link>
                        </div>
                        <Link href={'profile'} onClick={() => setHidden(true)} className="w-full cursor-pointer flex flex-col justify-center items-center gap-0 text-center">
                            <p className="text-lg max-w-full truncate">{user?.name}</p> {/* Apply max-w and truncate */}
                            <p className="text-sm tracking-[1px] max-w-full truncate">@{user.username}</p> {/* Apply max-w and truncate */}
                        </Link>

                    </div>

                    <div className="flex flex-col items-center justify-start w-full gap-10">
                        <div className={`w-[70%] text-lg font-thin ${pathname !== "/" ? "brightness-[0.5]" : ""} hover:brightness-[0.8] transition-all duration-100`} onClick={() => setHidden(true)}>
                            <Link href="/" className="w-full group flex justify-start items-center gap-4 transition-all duration-300 hover:gap-6">
                                <Image 
                                    src={"/slideBarIcons/home.svg"} 
                                    alt="" 
                                    height={200} 
                                    width={200} 
                                    className="h-[30px] w-[30px] group-hover:scale-1 transition-transform duration-300"
                                />
                                <p className="group-hover:translate-x-1 transition-transform duration-300">Home</p>
                            </Link>
                        </div>
                        <div className={`w-[70%] text-lg font-thin ${pathname !== "/profile" ? "brightness-[0.5]" : ""} hover:brightness-[0.8] transition-all duration-100`}>
                            <Link href="/profile" className="w-full group flex justify-start items-center gap-4 transition-all duration-300 hover:gap-6" onClick={() => setHidden(true)}>
                                <FaUserAstronaut size={28} className="group-hover:scale-1 transition-transform duration-300" />
                                <p className="group-hover:translate-x-1 transition-transform duration-300">Profile</p>
                            </Link>
                        </div>
                        <div className={`w-[70%] text-lg font-thin ${pathname !== "/homies" ? "brightness-[0.5]" : ""} hover:brightness-[0.8] transition-all duration-100`}>
                            <Link href="/homies" className="w-full group flex justify-start items-center gap-4 transition-all duration-300 hover:gap-6" onClick={() => setHidden(true)}>
                                <Image 
                                    src={"/slideBarIcons/homies.svg"} 
                                    alt="" 
                                    height={200} 
                                    width={200} 
                                    className="h-[30px] w-[30px] group-hover:scale-1 transition-transform duration-300"
                                />
                                <p className="group-hover:translate-x-1 transition-transform duration-300">Homies</p>
                            </Link>
                        </div>
                        <div className={`w-[70%] text-lg font-thin ${!pathname.includes("/yap") ? "brightness-[0.5]" : ""} hover:brightness-[0.8] transition-all duration-100`}>
                            <Link href="/yap" className="w-full group flex justify-start items-center gap-4 transition-all duration-300 hover:gap-6" onClick={() => setHidden(true)}>
                                <RiMessage3Fill size={28} className="group-hover:scale-1 transition-transform duration-300" />
                                <p className="group-hover:translate-x-1 transition-transform duration-300">Yap</p>
                            </Link>
                        </div>
                        <div className={`w-[70%] text-lg font-thin ${pathname !== "/teas" ? "brightness-[0.5]" : ""} hover:brightness-[0.8] transition-all duration-100`}>
                            <Link href="/teas" className="w-full group flex justify-start items-center gap-4 transition-all duration-300 hover:gap-6" onClick={() => setHidden(true)}>
                                <Image 
                                    src={"/slideBarIcons/tea.svg"} 
                                    alt="" 
                                    height={200} 
                                    width={200} 
                                    className="h-[30px] w-[30px] group-hover:scale-1 transition-transform duration-300"
                                />
                                <p className="group-hover:translate-x-1 transition-transform duration-300">Teas</p>
                            </Link>
                        </div>

                    </div>
                    
                </div>  
                <div className="absolute bottom-0 w-[80%] text-lg font-thin p-2 pl-5 mb-10 bg-bgPrimary flex justify-center items-center rounded-[15px]">
                    <button 
                        onClick={() => {
                            setHidden(true);
                            logout();
                        }} 
                        className="w-full group flex justify-center md:justify-start items-center gap-4 transition-all duration-300 hover:gap-6"
                    >
                        <IoLogOutOutline size={24} className="text-gray-400 group-hover:text-red-400 transition-colors duration-300" />
                        <p className="text-gray-400 hidden md:flex group-hover:text-red-400 transition-colors duration-300 text-base">Sign out</p>
                    </button>
                </div>
            </motion.div>
        </>
    )
}
