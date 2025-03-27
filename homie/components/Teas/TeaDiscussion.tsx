"use client"
import { Tea } from "@/homieTypes/homieTypes"
import { motion } from "motion/react"

export default function TeaDiscussion( {setShowTeaDiscussion, tea} : {setShowTeaDiscussion: any, tea: Tea | null} ) {
    console.log(tea);
    return (
        <>
            <motion.div 
                    onClick={() => setShowTeaDiscussion(false)} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed top-[50%] z-[90] left-[50%] translate-x-[-50%] translate-y-[-50%] h-screen w-full bg-[#000] bg-opacity-50 backdrop-blur-sm"
            />
        </>
    )
}