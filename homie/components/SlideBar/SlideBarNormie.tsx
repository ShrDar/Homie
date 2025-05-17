"use client"

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LuEarth, LuSettings2 } from "react-icons/lu";
import { FaUserAstronaut, FaRegHandshake } from "react-icons/fa6";
import { RiMessage3Line } from "react-icons/ri";
import { TbCoffee } from "react-icons/tb";
import { motion } from "framer-motion";
import { Session } from "next-auth";
import { useEffect, useState } from "react";
import { HomieUser } from "@/homieTypes/homieTypes";
import Image from "next/image";
import { getProfileUrl } from "@/extra/helpers";

export default function SlideBarNormie( {session} : {session: Session | null | undefined}) {
    
    const pathname = usePathname();
    const [user, setUser] = useState<HomieUser>();
    const [isDefaultMode, setIsDefaultMode] = useState(true);
    
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        setIsDefaultMode(savedTheme ? savedTheme === 'default' : true);
    }, []);

    useEffect(() => {
        const fetchUserData = async() => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${session?.user?.id}`);
            const user = await response.json();
            setUser(user);
        }
    
        fetchUserData();
    }, [session?.user?.id, pathname])

    if(pathname.includes("admin")) {
        return null;
    }

    return (
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`fixed hidden md:flex left-0 top-0 h-full ${isDefaultMode ? 'bg-gradient-to-b from-bgSecondary/30 to-bgSecondary/10' : 'bg-gradient-to-b from-gray-200/30 to-gray-200/10'} backdrop-blur-md w-14 z-[50] shadow-[1px_0_10px_rgba(0,0,0,0.2)]`}
        >
            <div className="flex flex-col w-full py-6 items-center justify-between">
                <Link href="/profile" className="relative p-3 transition-transform group flex items-center">
                    <Image 
                        src={getProfileUrl(user?.image || "")}
                        width={50}
                        height={50}
                        alt="Profile Picture"
                        className="rounded-full aspect-square object-cover"
                    />
                    <span className={`absolute sulphur left-12 top-1/2 -translate-y-1/2 px-2 py-1 ${isDefaultMode ? 'bg-bgPrimary border-bgSecondary text-white' : 'bg-white border-gray-300 text-gray-800'} border-[1px] shadow-[1px_3px_5px_#1f1f1f] rounded text-sm opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-[-10px] group-hover:translate-x-0 whitespace-nowrap pointer-events-none`}>
                        {user?.username}
                    </span>
                </Link>

                <div className="flex flex-col gap-6">
                    {[
                        { href: "/", icon: <LuEarth size={18} />, label: "Home" },
                        { href: "/profile", icon: <FaUserAstronaut size={18} />, label: "Profile" },
                        { href: "/homies", icon: <FaRegHandshake size={18} />, label: "Homies" },
                        { href: "/yap", icon: <RiMessage3Line size={18} />, label: "Yap" },
                        { href: "/teas", icon: <TbCoffee size={18} />, label: "Teas" },
                    ].map(({ href, icon, label }) => (
                        <Link 
                            key={href}
                            href={href} 
                            className={`relative p-3 rounded-lg transition-all ${isDefaultMode ? 'hover:bg-white/5' : 'hover:bg-gray-200/20'} group flex items-center`}
                        >
                            <div className={`${pathname === href || (href === "/yap" && pathname.includes("/yap")) 
                                ? (isDefaultMode ? "text-fontPrimary" : "text-gray-800") 
                                : (isDefaultMode ? "text-[#666666]" : "text-gray-500")}`}
                            >
                                {icon}
                            </div>
                            <span className={`absolute sulphur left-12 top-1/2 -translate-y-1/2 px-2 py-1 ${isDefaultMode ? 'bg-bgPrimary border-bgSecondary text-white' : 'bg-white border-gray-300 text-gray-800'} border-[1px] shadow-[1px_3px_5px_#1f1f1f] rounded text-sm opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-[-10px] group-hover:translate-x-0 whitespace-nowrap pointer-events-none`}>
                                {label}
                            </span>
                        </Link>
                    ))}
                </div>

                <Link 
                    href="/more" 
                    className={`relative p-3 rounded-lg transition-all ${isDefaultMode ? 'hover:bg-white/5' : 'hover:bg-gray-200/20'} group flex items-center`}
                >
                    <div className={`${pathname === "/more" 
                        ? (isDefaultMode ? "text-fontPrimary" : "text-gray-800") 
                        : (isDefaultMode ? "text-[#666666]" : "text-gray-500")}`}
                    >
                        <LuSettings2 size={18} />
                    </div>
                    <span className={`absolute sulphur left-12 top-1/2 -translate-y-1/2 px-2 py-1 ${isDefaultMode ? 'bg-bgPrimary border-bgSecondary text-white' : 'bg-white border-gray-300 text-gray-800'} border-[1px] shadow-[1px_3px_5px_#1f1f1f] rounded text-sm opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-[-10px] group-hover:translate-x-0 whitespace-nowrap pointer-events-none`}>
                        More
                    </span>
                </Link>
            </div>
        </motion.div>
    );
}