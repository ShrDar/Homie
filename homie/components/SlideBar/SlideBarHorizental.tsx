"use client"

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LuEarth } from "react-icons/lu";
import { FaUserAstronaut } from "react-icons/fa6";
import { FaRegHandshake } from "react-icons/fa6";
import { RiMessage3Line } from "react-icons/ri";
import { TbCoffee } from "react-icons/tb";
import { LuSettings2 } from "react-icons/lu";
import { motion } from "framer-motion";
// import { Session } from "next-auth";
// import { HomieUser } from "@/homieTypes/homieTypes";

export default function SlideBarHorizental() {
    const pathname = usePathname();

    // const [user, setUser] = useState<HomieUser>();
    
    // useEffect(() => {
    //     const fetchUserData = async() => {
    //         const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${session?.user?.id}`);
    //         const user = await response.json();
    //         setUser(user);
    //     }
    
    //     fetchUserData();
    // }, [session?.user?.id, pathname])

    if(pathname.includes("admin")) {
        return (
            <></>
        )
    }

    return (
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="fixed hidden left-0 top-0 h-full lg:flex flex-col  pl-2 z-[50]"
        >
            <div className="flex flex-col gap-14 h-full items-center justify-center">
                {/* <Link href="/profile" className={`flex flex-col items-center gap-2 translate-x-[14px] ${pathname === "/profile" ? "opacity-0" : ""}`}>
                    <Image 
                        
                        src={getProfileUrl(user?.image || "")}
                        width={50}
                        height={50} 
                        alt="Profile Picture" 
                        className="w-[50px] h-[50px] rounded-full object-cover bg-bgSecondary"
                    />
                </Link> */}
                {/* Home */}
                <Link href="/" 
                    className={`flex flex-row items-center gap-1 hover:text-fontPrimary transition-colors
                        ${pathname === "/" ? "text-fontPrimary" : "text-[#666666]"}`}
                >
                    <motion.div
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ 
                            x: pathname === "/" ? 0 : -10,
                            opacity: pathname === "/" ? 1 : 0,
                        }}
                        transition={{ duration: 0.1 }}
                    >
                        <LuEarth size={18} className="rotate-[-90deg]" />
                    </motion.div>
                    <p className="text-sm capitalize tracking-[2px] [writing-mode:vertical-lr] rotate-180">Home</p>
                </Link>

                {/* Profile */}
                <Link href="/profile" 
                    className={`flex flex-row items-center gap-1 hover:text-fontPrimary transition-colors
                        ${pathname === "/profile" ? "text-fontPrimary" : "text-[#666666]"}`}
                >
                    <motion.div
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ 
                            x: pathname === "/profile" ? 0 : -10,
                            opacity: pathname === "/profile" ? 1 : 0,
                        }}
                        transition={{ duration: 0.1 }}
                    >
                        <FaUserAstronaut size={18} className="rotate-[-90deg]" />
                    </motion.div>
                    <p className="text-sm capitalize tracking-[2px] [writing-mode:vertical-lr] rotate-180">Profile</p>
                </Link>

                {/* Homies */}
                <Link href="/homies" 
                    className={`flex flex-row items-center gap-1 hover:text-fontPrimary transition-colors
                        ${pathname === "/homies" ? "text-fontPrimary" : "text-[#666666]"}`}
                >
                    <motion.div
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ 
                            x: pathname === "/homies" ? 0 : -10,
                            opacity: pathname === "/homies" ? 1 : 0,
                        }}
                        transition={{ duration: 0.1 }}
                    >
                        <FaRegHandshake size={18} className="rotate-[-90deg]" />
                    </motion.div>
                    <p className="text-sm capitalize tracking-[2px] [writing-mode:vertical-lr] rotate-180">Homies</p>
                </Link>

                {/* Yap */}
                <Link href="/yap" 
                    className={`flex flex-row items-center gap-1 hover:text-fontPrimary transition-colors
                        ${pathname.includes("/yap") ? "text-fontPrimary" : "text-[#666666]"}`}
                >
                    <motion.div
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ 
                            x: pathname.includes("/yap") ? 0 : -10,
                            opacity: pathname.includes("/yap") ? 1 : 0,
                        }}
                        transition={{ duration: 0.1 }}
                    >
                        <RiMessage3Line size={18} className="rotate-[-90deg]" />
                    </motion.div>
                    <p className="text-sm capitalize tracking-[2px] [writing-mode:vertical-lr] rotate-180">Yap</p>
                </Link>

                {/* Teas */}
                <Link href="/teas" 
                    className={`flex flex-row items-center gap-1 hover:text-fontPrimary transition-colors
                        ${pathname === "/teas" ? "text-fontPrimary" : "text-[#666666]"}`}
                >
                    <motion.div
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ 
                            x: pathname === "/teas" ? 0 : -10,
                            opacity: pathname === "/teas" ? 1 : 0,
                        }}
                        transition={{ duration: 0.1 }}
                    >
                        <TbCoffee size={18} className="rotate-[-90deg]" />
                    </motion.div>
                    <p className="text-sm capitalize tracking-[2px] [writing-mode:vertical-lr] rotate-180">Teas</p>
                </Link>

                <Link href="/more" 
                    className={`flex flex-row items-center gap-1 hover:text-fontPrimary transition-colors
                        ${pathname === "/more" ? "text-fontPrimary" : "text-[#666666]"}`}
                >
                    <motion.div
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ 
                            x: pathname === "/more" ? 0 : -10,
                            opacity: pathname === "/more" ? 1 : 0,
                        }}
                        transition={{ duration: 0.1 }}
                    >
                        <LuSettings2 size={18} className="rotate-[-90deg]" />
                    </motion.div>
                    <p className="text-sm capitalize tracking-[2px] [writing-mode:vertical-lr] rotate-180">More</p>
                </Link>
            </div>
        </motion.div>
    );
}