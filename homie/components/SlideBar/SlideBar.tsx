"use client"
import { motion } from "motion/react"
import Link from "next/link";
import { useState } from "react";
import { FaBarsStaggered } from "react-icons/fa6";

export default function SlideBar() {

    const [hidden, setHidden] = useState(true);

    return (
        <>
            <div className="w-[40%] h-full bg-transparent z-0 absolute left-0 hidden md:flex " onMouseEnter={() => setHidden(true)}></div>
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
            onMouseEnter={() => setHidden(false)} className="slideBar z-10 bg-transparent text-fontPrimary absolute h-full left-[-10px] md:left-0 flex justify-center items-center w-[40%] md:w-[20%] lg:w-[14%] sulphur">
                <div className="bg-bgSecondary h-[90%] w-[90%] md:w-full flex flex-col justify-center items-center rounded-[15px] ml-2">
                    <div className="text-center">
                        <Link href="/profile">
                            <p>Profile</p>
                        </Link>
                    </div>
                    <div className="text-center">
                        <Link href="/">
                            <p>Home</p>
                        </Link>
                    </div>
                </div>  
            </motion.div>
        </>
    )
}
