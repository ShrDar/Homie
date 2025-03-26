"use client"
import { Session } from "next-auth";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
// import TextareaAutosize from 'react-textarea-autosize';

interface Tea {
    _id: string;
    title: string;
    content: string;
    userId: string;
    createdAt: string;
    discussionId: string;  
    participants: number;
    tags: string[];
}

const dummyTeas: Tea[] = [
    {
        _id: "1",
        title: "What's your take on AI in everyday life?",
        content: "Let's discuss how AI is changing our daily routines and what it means for our future...",
        userId: "user1",
        createdAt: "2024-01-20T10:00:00Z",
        discussionId: "c1", 
        participants: 12,
        tags: ["technology", "discussion"]
    },
    {
        _id: "2",
        title: "Coffee vs Tea: The Ultimate Showdown",
        content: "Share your thoughts on which beverage reigns supreme and why...",
        userId: "user2",
        createdAt: "2024-01-19T15:30:00Z",
        discussionId: "c2",
        participants: 8,
        tags: ["lifestyle", "debate"]
    },
    {
        _id: "3",
        title: "Remote Work Culture in 2024",
        content: "How has remote work evolved? Let's share our experiences and challenges...",
        userId: "user3",
        createdAt: "2024-01-18T09:15:00Z",
        discussionId: "c3",
        participants: 15,
        tags: ["work", "culture"]
    }
];

export default function TeaMain({ session }: { session: Session }) {
    const [teas, setTeas] = useState<Tea[]>(dummyTeas);
    const [isLoadingTeas, setIsLoadingTeas] = useState(false);
    
    useEffect(() => {
        setTeas(dummyTeas);
        setIsLoadingTeas(false);
        console.log(session); //remove later
    }, [])

    return (
        <div className="relative w-full h-full">
            <div className="h-screen w-full overflow-y-auto snap-y snap-mandatory">
                {isLoadingTeas ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
                    </div>
                ) : (
                    <div>
                        {teas.map((tea) => (
                            <motion.div
                                key={tea._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="snap-start h-screen flex items-center justify-center p-4"
                            >
                                <div className="w-full max-w-3xl h-[50%] bg-bgSecondary p-8 rounded-xl border flex justify-center item-center transition-all relative">
                                    <div className="flex items-center gap-2 absolute top-4 left-4">
                                        {tea.tags.map((tag, index) => (
                                            <span key={index} className="px-3 py-1 rounded-full bg-primary/10 text-sm">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                    {/* Added creator name */}
                                    <div className="absolute top-4 right-4">
                                        <span className="text-sm text-gray-400">
                                            @{tea.userId}
                                        </span>
                                    </div>
                                    <div className="flex flex-col justify-center items-center gap-6">
                                        <h2 className="text-3xl font-bold">
                                            {tea.title}
                                        </h2>
                                        <p className="text-gray-400 text-lg">
                                            {tea.content}
                                        </p>
                                    </div>
                                    <div className="absolute bottom-4 left-4 text-sm text-gray-400">
                                        <span className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                            {tea.participants} participants
                                        </span>
                                    </div>
                                    <div className="absolute bottom-4 right-4 text-sm text-gray-400">
                                        <span>{new Date(tea.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="discussionInput">

                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}