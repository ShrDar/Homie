"use client"

import { IoClose } from "react-icons/io5"
import { useState, KeyboardEvent, useEffect, useRef } from "react"
import TextareaAutosize from 'react-textarea-autosize';
import { IoIosImages } from "react-icons/io";
import { db } from "@/config/firebase";
import { addDoc, collection, doc, onSnapshot, orderBy, query, deleteDoc } from "firebase/firestore";
import Image from "next/image";
import { motion } from "motion/react";
import { getProfileUrl } from "@/extra/helpers";
import GifPicker from "../YapPage/GifPicker";
import { CiMenuKebab } from "react-icons/ci";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";


// Add interface for message type
// Update Message interface
interface Message {
    id: string;
    content: string;
    userId: string;
    userName: string;
    userImage: string;
    createdAt: Date;
    type?: 'text' | 'gif';
    gifUrl?: string;
    replyTo?: {
        id: string;
        content: string;
        userName: string;
    };
}

export default function TeaDiscussionReplyThread({ setShowTeaDiscussion, discussionId, user }: { setShowTeaDiscussion: any, discussionId: string, user: any }) {
    const [message, setMessage] = useState("")
    const [isMobile, setIsMobile] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showGifPicker, setShowGifPicker] = useState(false);
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Add this useEffect to scroll when messages update
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setIsMobile(/Mobi|Android/i.test(navigator.userAgent));
        }
    }, []);

    // Add useEffect for fetching messages
    useEffect(() => {
        if (!discussionId) return;

        setIsLoading(true);
        const discussionRef = doc(db, "Discussions", discussionId);
        const messagesRef = collection(discussionRef, "messages");
        const q = query(messagesRef, orderBy("createdAt", "asc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const messagesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date()
            })) as Message[];
            
            setMessages(messagesData);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching messages:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [discussionId]);

    const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (!isMobile && e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };

    const handleSendMessage = async (e: React.FormEvent<HTMLFormElement> | KeyboardEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
        if (!message.trim()) return;
        
        try {
            const discussionRef = doc(db, "Discussions", discussionId);
            const messagesRef = collection(discussionRef, "messages");
            
            const messageData: any = {
                content: message.trim(),
                userId: user._id,
                userName: user.name,
                userImage: user.image,
                createdAt: new Date(),
                type: 'text'
            };

            if (replyingTo) {
                messageData.replyTo = {
                    id: replyingTo.id,
                    content: replyingTo.content,
                    userName: replyingTo.userName
                };
            }

            await addDoc(messagesRef, messageData);
            setMessage("");
            setReplyingTo(null);
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    // Add similar reply functionality to GIF messages
    const sendGifMessage = async (gif: any) => {
        if (!gif) return;

        try {
            const discussionRef = doc(db, "Discussions", discussionId);
            const messagesRef = collection(discussionRef, "messages");
            
            const messageData: any = {
                content: message.trim(),
                userId: user._id,
                userName: user.name,
                userImage: user.image,
                createdAt: new Date(),
                type: 'gif',
                gifUrl: gif.images.original.url
            };

            if (replyingTo) {
                messageData.replyTo = {
                    id: replyingTo.id,
                    content: replyingTo.content,
                    userName: replyingTo.userName
                };
            }

            await addDoc(messagesRef, messageData);
            setMessage("");
            setShowGifPicker(false);
            setReplyingTo(null);
        } catch (error) {
            console.error("Error sending GIF:", error);
        }
    };

    const deleteMessage = async (messageId: string) => {
        try {
            const discussionRef = doc(db, "Discussions", discussionId);
            const messageRef = doc(collection(discussionRef, "messages"), messageId);
            await deleteDoc(messageRef);
        } catch (error) {
            console.error("Error deleting message:", error);
        }
    };

    return (
        <div className="w-[60%] bg-bgSecondary rounded-[15px] p-5 h-[85vh] flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold">Discussion</h2>
                    <span className="bg-bgPrimary px-2 py-1 rounded-full text-sm text-gray-400">
                        {messages.length} replies
                    </span>
                </div>
                <button 
                    onClick={() => setShowTeaDiscussion(false)}
                    className="p-2 hover:bg-bgPrimary rounded-full transition-all"
                >
                    <IoClose className="w-6 h-6" />
                </button>
            </div>

            <div className="flex flex-col justify-center h-full bg-bgPrimary rounded-[15px] p-4 overflow-y-auto">
                <div className="flex flex-col h-full gap-4">
                    {isLoading ? (
                        <div className="h-full flex items-center justify-center">
                            <p className="text-gray-400">Loading messages...</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <p className="text-gray-400 font-medium">
                                No Discussions yet
                            </p>
                            <p className="text-gray-500 text-sm">
                                Be the first one to join the discussion!
                            </p>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <motion.div 
                                key={msg.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ type: "spring", duration: 0.5 }}
                                className="w-full flex flex-col"
                            >
                                <div className={`w-full flex ${msg.userId === user._id ? 'justify-end' : 'justify-start'} items-end gap-2 mb-5`}>
                                    {msg.userId !== user._id && (
                                        <div className="w-8 h-8 rounded-full cursor-pointer overflow-hidden flex-shrink-0">
                                            <Image 
                                                src={getProfileUrl(msg.userImage)}
                                                alt={msg.userName}
                                                width={32}
                                                height={32}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                    
                                    <div className={`group relative max-w-[65%] ${msg.userId === user._id ? 'order-1' : 'order-2'}`}>
                                        {msg.replyTo && (
                                            <>
                                                <div className={`absolute ${msg.userId === user._id ? '-left-12' : '-right-12'} top-0 w-8 h-full`}>
                                                    <div className="w-[2px] h-full bg-[#666] opacity-50"></div>
                                                </div>
                                                <div className="mb-2 text-sm text-[#666]">
                                                    Replying to <span className="font-semibold">{msg.replyTo.userName}</span>
                                                    <p className="text-xs opacity-75 truncate">{msg.replyTo.content}</p>
                                                </div>
                                            </>
                                        )}
                                        <div className={`mb-1 ${msg.userId === user._id ? "text-right mr-2" : "text-left ml-2"}`}>
                                            <span className="text-sm text-right font-semibold">{msg.userName}</span>
                                        </div>
                                        <div className={`${msg.type === "gif" ? "px-2" : "px-4"} py-2 rounded-[20px] ${
                                            msg.userId === user._id 
                                                ? 'bg-bgSecondary text-fontPrimary' 
                                                : 'bg-[#1b1b1b] text-fontPrimary'
                                        } relative`}>
                                            <div className={`absolute z-[150] ${
                                                msg.userId === user._id 
                                                    ? 'left-0 -translate-x-[24px]' 
                                                    : 'right-0 translate-x-[24px]'
                                            } top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity`}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger>
                                                        <div className="p-1 hover:bg-bgSecondary rounded-full transition-colors">
                                                            <CiMenuKebab size={16} className="text-fontPrimary opacity-60" />
                                                        </div>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent 
                                                        align={msg.userId === user._id ? "start" : "end"} 
                                                        side={msg.userId === user._id ? "left" : "right"} 
                                                        sideOffset={8} 
                                                        className="z-[200] bg-bgPrimary text-fontPrimary text-sm border-[#666] p-1"
                                                    >
                                                        <DropdownMenuItem 
                                                            onClick={() => setReplyingTo(msg)}
                                                            className="sulphur cursor-pointer focus:bg-[#1B1B1B] focus:text-fontPrimary"
                                                        >
                                                            <p className="w-full text-center p-1 rounded-[6px]">
                                                                Reply
                                                            </p>
                                                        </DropdownMenuItem>
                                                        {msg.userId === user._id && (
                                                            <DropdownMenuItem 
                                                                onClick={() => deleteMessage(msg.id)}
                                                                className="sulphur cursor-pointer focus:bg-[#1B1B1B] focus:text-[#FF6F6F]"
                                                            >
                                                                <p className="w-full text-center p-1 rounded-[6px] text-[#FF6F6F]">
                                                                    Delete
                                                                </p>
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                            {msg.type === 'gif' ? (
                                                <div className="flex justify-center items-center flex-col gap-2">
                                                    <div className="relative">
                                                        <Image 
                                                            src={msg.gifUrl || ""}
                                                            alt="GIF"
                                                            width={200}
                                                            height={200}
                                                            className="rounded-[15px]"
                                                            unoptimized
                                                        />
                                                    </div>
                                                    {msg.content && (
                                                        <p className="text-[15px] leading-5 whitespace-pre-wrap break-words px-2 text-justify">
                                                            {msg.content}
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-[15px] leading-5 whitespace-pre-wrap text-left break-words">{msg.content}</p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {msg.userId === user._id && (
                                        <div className="w-8 h-8 rounded-full cursor-pointer overflow-hidden flex-shrink-0 order-3">
                                            <Image 
                                                src={getProfileUrl(msg.userImage)}
                                                alt={msg.userName}
                                                width={32}
                                                height={32}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
                <div ref={messagesEndRef} /> {/* Add this div at the end of messages */}
            </div>

            {/* Message Input */}
            <div className="yapTypeSection w-full">
                {replyingTo && (
                    <div className="flex items-center justify-between bg-bgPrimary rounded-[15px] p-3 mb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-6 bg-[#666] rounded-full"></div>
                            <div>
                                <p className="text-sm text-[#666]">
                                    Replying to <span className="font-semibold">{replyingTo.userName}</span>
                                </p>
                                <p className="text-xs opacity-75 truncate max-w-[200px]">{replyingTo.content}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setReplyingTo(null)}
                            className="p-1 hover:bg-bgSecondary rounded-full transition-all"
                        >
                            <IoClose className="w-4 h-4" />
                        </button>
                    </div>
                )}
                <form onSubmit={handleSendMessage} className="flex flex-col gap-2">
                    <div className="flex gap-2 items-center">
                        <div className="flex w-full items-center justify-center relative">
                            <TextareaAutosize
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Type your message..."
                                minRows={1}
                                maxRows={4}
                                className="w-full bg-bgPrimary text-fontPrimary selection:bg-bgSecondary overflow-hidden rounded-[15px] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#666] resize-none leading-5"
                            />
                        </div>
                        <div className="flex relative justify-center items-center gap-2">
                            <div 
                                onClick={() => setShowGifPicker(true)}
                                className="cursor-pointer hover:brightness-[8] transition-all duration-100 flex justify-center items-center gap-2 border-[2px] border-[#666] p-2 rounded-full"
                            >
                                <p className="text-[8px] text-[#666] tracking-[2px] aspect-square flex items-center justify-center">GIF</p>
                            </div>
                            <GifPicker
                                isOpen={showGifPicker}
                                onClose={() => setShowGifPicker(false)}
                                onGifSelect={sendGifMessage}
                                showGifPicker={showGifPicker}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!message.trim()}
                            className={`px-6 h-10 rounded-full transition-all flex bg-bgPrimary items-center justify-center ${
                                message.trim() 
                                    ? 'text-white hover:bg-[#1b1b1b]' 
                                    : 'brightness-[0.6] hover:cursor-none'
                            }`}
                        >
                            Send
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}