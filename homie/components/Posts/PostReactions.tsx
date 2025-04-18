"use client"
import { useState } from "react";
import { AnimatePresence, motion } from 'motion/react'
import { Post } from "@/homieTypes/homieTypes";
import { reactionButtons } from "@/extra/helpers";

interface Props {
  post: Post;
  setPosts:any;
  setShowPostReaction: (show: boolean) => void;
  userId: string;  // Add userId prop
  showPostReaction: boolean
  postFrom: string;
}

export default function PostReactions({ post, setPosts, setShowPostReaction, userId, showPostReaction, postFrom }: Props) {

    
    const hasUserReacted = (reactionType: string) => {
        // console.log(post)
        return post.reactions.some(
            reaction => reaction.reactUserId === userId && reaction.reactionType === reactionType
        );
    };

    const fetchPosts = async () => {
        try {
            let response;
            if(postFrom === "PostsOfUser") {
                response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/posts/user/${userId}`);
            }
            else {
                response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/posts`);
            }
            const postsData = await response.json();
            setPosts(postsData);
        } catch (err) {
            console.error('Error fetching posts:', err);
        }
      };

    
    const [hoveredReaction, setHoveredReaction] = useState<number | null>(null);

    const handleReaction = async (reactionType: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/posts/${post._id}/reactions`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    reactionType,
                    userId
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update reaction');
            }

            // const data = await response.json();
            

            // setShowPostReaction(false);
        } catch (error) {
            console.error('Error updating reaction:', error);
            
        } finally {
            fetchPosts();
        }
    };

    return (
        <>  
            <div onClick={() => {
                setShowPostReaction(false)
                fetchPosts();
            }} className={`h-full w-full bg-transparent absolute top-0 left-0 ${showPostReaction ? "flex" : "hidden"}`} />
            <motion.div 
                initial={{ opacity: 0, scale: 0.8, x: window.innerWidth >= 768 ? -60 : 0, y: -60 }}
                animate={{ y: -60, opacity: 1, scale: 1, x: window.innerWidth >= 768 ? -60 : 0 }}
                
                transition={{ 
                    duration: 0.3,
                    ease: "easeOut",
                    scale: {
                        type: "spring",
                        damping: 15,
                        stiffness: 200
                    }
                }}
                className="postReactions z-100 absolute rounded-[15px]"
            >
                <div className='flex gap-3'>
                    {reactionButtons.map((button, index) => {
                        const isReacted = hasUserReacted(button.type);
                        return (
                            <motion.div
                                key={index}
                                initial={{ scale: 0, opacity: 0, filter: "blur(10px)" }}
                                animate={{ 
                                    scale: 1, 
                                    opacity: 1,
                                    filter: "blur(0px)",
                                    transition: {
                                        delay: index * 0.08,
                                        duration: 0.2,
                                        ease: "easeOut"
                                    }
                                }}
                                exit={{
                                    scale: 0,
                                    opacity: 0,
                                    x: window.innerWidth >= 768 ? -30 : 0,
                                    filter: "blur(10px)",
                                    transition: {
                                        delay: index * 0.08,
                                        duration: 0.2,
                                        ease: "easeOut",
                                    }
                                }}
                                whileHover={{ 
                                    scale: 1.2,
                                    transition: { 
                                        type: "spring",
                                        stiffness: 400,
                                        damping: 10,
                                    }
                                    
                                }}
                                whileTap={{ scale: 0.95 }}
                                onHoverStart={() => setHoveredReaction(index)}
                                onHoverEnd={() => setHoveredReaction(null)}
                                onClick={() => handleReaction(button.type)}
                                className={`relative cursor-pointer flex justify-center items-center p-2.5 rounded-full bg-opacity-20 ${
                                    isReacted ? `` : ''
                                }`}
                                style={{
                                    background: isReacted || hoveredReaction === index 
                                        ? button.gradient 
                                        : 'rgba(255, 255, 255, 0.1)',
                                    backdropFilter: 'blur(8px)'
                                }}
                            >
                                <motion.div
                                    animate={{
                                        color: isReacted || hoveredReaction === index 
                                            ? '#fff' 
                                            : 'rgba(255, 255, 255, 0.7)'
                                    }}
                                    transition={{ duration: 0.2 }}
                                    className="text-xl"
                                >
                                    {button.icon}
                                </motion.div>
                                
                                <AnimatePresence>
                                    {hoveredReaction === index && (
                                        <motion.span
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: -35 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg"
                                            style={{ 
                                                background: button.gradient,
                                                color: '#fff'
                                            }}
                                        >
                                            {isReacted ? `${button.label}` : button.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>
        </>
    );
}