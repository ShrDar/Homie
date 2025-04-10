"use client"
import Image from "next/image";
import { motion } from "motion/react";

export default function LoginLeft() {
    return (
        <div className="loginLeftContainer hidden md:flex flex-col bg-bgPrimary border-[3px] border-borderPrimary md:w-[45%] p-6 h-full rounded-[15px] gap-10 justify-center items-center ">
            <motion.div 
                className="flex w-full items-center justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <Image src={"/logo/Homie-2.svg"} alt="" width={1000} height={1000} className="object-contain w-[90%]" />
            </motion.div>
            <motion.div 
                className="w-full flex justify-center items-center text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            >
                <p className="jim text-3xl">Hang out wit em brodies</p>
            </motion.div>
        </div>
    )

}