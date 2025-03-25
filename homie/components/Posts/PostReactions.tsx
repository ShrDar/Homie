"use client"
import { JSX, useState } from "react";
import { BsFillSuitHeartFill } from "react-icons/bs";
import { FaLaughSquint, FaSadCry } from "react-icons/fa";
import { FaFaceAngry, FaHandshake } from "react-icons/fa6";
import { AnimatePresence, motion } from 'motion/react'
import { Post } from "@/homieTypes/homieTypes";

export default function PostReactions( {post} : {post:Post}) {
    interface ReactionButton {
        icon: JSX.Element;
        label: string;
        color: string;
      }
      
      // Add this constant for reaction buttons
      const reactionButtons: ReactionButton[] = [
        { icon: <FaHandshake size={20} />, label: 'Dap', color: '#4CAF50' },
        { icon: <BsFillSuitHeartFill size={20} />, label: 'Love', color: '#E91E63' },
        { icon: <FaLaughSquint size={20} />, label: 'Haha', color: '#FFC107' },
        { icon: <FaFaceAngry size={20} />, label: 'Angry', color: '#FF5722' },
        { icon: <FaSadCry size={20} />, label: 'Huhu', color: '#2196F3' },
      ];
      const [hoveredReaction, setHoveredReaction] = useState<number | null>(null);
    return (
        <div className="postReactions">
            <div className='flex gap-2'>
                {reactionButtons.map((button, index) => (
                    <motion.div
                        key={index}
                        initial={{ scale: 1 }}
                        whileHover={{ 
                        scale: 1.15,
                        transition: { duration: 0.1 }
                        }}
                        whileTap={{ scale: 0.95 }}
                        onHoverStart={() => setHoveredReaction(index)}
                        onHoverEnd={() => setHoveredReaction(null)}
                        className="relative text-fontPrimary cursor-pointer flex justify-center items-center gap-2 px-4 py-2 rounded-[15px] bg-bgPrimary hover:brightness-110 transition-all"
                    >
                        <motion.div
                            animate={{
                                color: hoveredReaction === index ? button.color : '#fff'
                            }}
                            transition={{ duration: 0.2 }}
                            >
                            {button.icon}
                        </motion.div>
                        
                        <AnimatePresence>
                        {hoveredReaction === index && (
                            <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: -30 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute text-xs font-medium bg-bgSecondary px-2 py-1 rounded-md shadow-lg"
                            style={{ color: button.color }}
                            >
                            {button.label}
                            </motion.span>
                        )}
                        </AnimatePresence>
                    </motion.div>
                    ))}
            </div>
        </div>
    )
}