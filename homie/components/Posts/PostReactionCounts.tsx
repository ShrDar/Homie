"use client"
import { HomieUser, Post } from "@/homieTypes/homieTypes"
import { motion } from "framer-motion"
import { getProfileUrl, reactionButtons } from "@/extra/helpers"
import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"


export default function PostReactionCounts({ showPostReactionCount, setShowPostReactionCount, post }: { showPostReactionCount: boolean, setShowPostReactionCount: any, post: Post | null }) {
    const router = useRouter();
    
    const [users, setUsers] = useState<HomieUser[]>([]);
    const [currentSelectedReaction, setCurrentSelectedReaction] = useState("dap");
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users`);
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const getReactionUsers = (reactionType: string) => {
        const reactionUsers = post?.reactions
            .filter(reaction => reaction.reactionType === reactionType)
            .map(reaction => {
                const user = users.find(u => u._id === reaction.reactUserId);
                return user;
            })
            .filter(user => user !== undefined);
        return reactionUsers || [];
    };

    return (
        <>
            <motion.div 
                onClick={() => setShowPostReactionCount(false)} 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed top-[50%] z-[90] left-[50%] translate-x-[-50%] translate-y-[-50%] h-screen w-full bg-[#000] bg-opacity-50 backdrop-blur-sm"
            />
            <div className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-[100] bg-bgPrimary rounded-xl p-3 w-[90%] md:w-[400px] h-[60vh]">
                {/* <h2 className="text-xl font-semibold mb-4 text-white">Reactions</h2> */}
                <div className="flex flex-col items-center justify-center gap-2 h-[calc(100%-2rem)]">
                    <div className="flex justify-center items-start gap-4 min-h-[60px]">
                        {!isLoading && reactionButtons.map((button, index) => {
                            const reactionUsers = getReactionUsers(button.type);
                            
                            return (
                                <div key={index} className={`flex flex-col gap-3 cursor-pointer`} onClick={() => setCurrentSelectedReaction(button.type)}>
                                    <div 
                                        className={`flex items-center gap-2 p-2 rounded-lg ${currentSelectedReaction === button.type ? 'scale-110 bg-[#1f1f1f]' : ''}`}
                                        style={{
                                            background: `${button.gradient}${currentSelectedReaction === button.type ? '66' : '33'}`,
                                            border: `2px solid ${button.color}${currentSelectedReaction === button.type ? 'FF' : '66'}`,
                                            transition: 'all 0.2s ease-in-out'
                                        }}
                                    >
                                        <span className="text-xl">{button.icon}</span>
                                        <span className="text-white font-semibold">{reactionUsers.length}</span>
                                    </div>
                                    
                                    
                                </div>
                            );
                        })}
                        {isLoading && (
                            <div className="animate-pulse flex gap-4">
                                {[1, 2, 3].map((_, i) => (
                                    <div key={i} className="w-[80px] h-[40px] bg-[#ffffff22] rounded-lg"></div>
                                ))}
                            </div>
                        )}
                    </div>
                    <motion.div 
                        initial={{filter: "blur(5px)"}}
                        animate={{filter: "blur(0px)"}}
                        className="reacters w-full overflow-y-auto py-0 flex-1"
                    >
                        {!isLoading ? (
                            getReactionUsers(currentSelectedReaction).length > 0 ? (
                                users.map((user, index) => {
                                    const reactionUsers = getReactionUsers(currentSelectedReaction);
                                    if (!reactionUsers.includes(user)) return null;
                                    return (
                                        <div 
                                            onClick={() => router.push(`/homie/${user._id}`)}
                                            key={index} 
                                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#ffffff11] transition-all cursor-pointer"
                                        >
                                            <Image
                                                src={getProfileUrl(user.image)}
                                                alt="Profile Picture"
                                                width={40}
                                                height={40}
                                                className="rounded-full aspect-square object-cover"
                                            />
                                            <div className="flex flex-col">
                                                <p className="text-white font-semibold text-md">{user.name}</p>
                                                <p className="text-[#ffffff77] text-sm">@{user.username}</p>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-[#ffffff77] text-lg mb-8">No reactions yet</p>
                                </div>
                            )
                        ) : (
                            <div className="animate-pulse flex flex-col gap-3">
                                {[1, 2, 3, 4].map((_, i) => (
                                    <div key={i} className="flex items-center gap-2 p-2">
                                        <div className="w-[30px] h-[30px] bg-[#ffffff22] rounded-full"></div>
                                        <div className="flex flex-col gap-1">
                                            <div className="w-[100px] h-[12px] bg-[#ffffff22] rounded"></div>
                                            <div className="w-[60px] h-[10px] bg-[#ffffff22] rounded"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </>
    )
}