"use client"

import { useState, useEffect, KeyboardEvent } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import GifPicker from "../YapPage/GifPicker";
import { toast } from "sonner";
import { db } from "@/config/firebase";
import { doc, updateDoc, arrayUnion, onSnapshot, arrayRemove } from "firebase/firestore";
import { getProfileUrl } from '@/extra/helpers';
import Image from 'next/image';
import { CiMenuKebab } from "react-icons/ci";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import PostView from './PostView';
import { motion } from 'motion/react';

export default function PostsComment({ openPostCommentModal, setOpenPostCommentModal, user, currentCommentPost }: { openPostCommentModal: boolean, setOpenPostCommentModal: any, user: any, currentCommentPost: any}) {
    const [newComment, setNewComment] = useState("");
    const [isMobile, setIsMobile] = useState(false);
    const [showGifPicker, setShowGifPicker] = useState(false);
    const [comments, setComments] = useState<any[]>([]);
    const router = useRouter();
    const [isDefaultMode, setIsDefaultMode] = useState(true);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        setIsDefaultMode(savedTheme ? savedTheme === 'default' : true);
    }, []);

    useEffect(() => {
        if (openPostCommentModal && currentCommentPost?.commentId) {
            const commentRef = doc(db, "Comments", currentCommentPost.commentId);
            
            const unsubscribe = onSnapshot(commentRef, (doc) => {
                if (doc.exists()) {
                    const data = doc.data();
                    setComments(data.comments || []);
                }
            });

            return () => unsubscribe();
        }
    }, [openPostCommentModal, currentCommentPost]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setIsMobile(/Mobi|Android/i.test(navigator.userAgent));
        }
    }, []);

    const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (!isMobile && e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleSubmit = async (e: React.FormEvent | KeyboardEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        setNewComment("");
        try {
            const commentRef = doc(db, "Comments", currentCommentPost.commentId);
            
            const newCommentObj = {
                id: Date.now().toString(), // Add unique ID for deletion
                content: newComment,
                userId: user._id,
                userName: user.name,
                userImage: user.image,
                createdAt: new Date().toISOString()
            };

            await updateDoc(commentRef, {
                comments: arrayUnion(newCommentObj)
            });

            
            // toast.success("Comment added successfully!");
        } catch (error) {
            console.error("Error adding comment:", error);
            toast.error("Failed to add comment");
        }
    };

    const deleteComment = async (commentToDelete: any) => {
        try {
            const commentRef = doc(db, "Comments", currentCommentPost.commentId);
            
            await updateDoc(commentRef, {
                comments: arrayRemove(commentToDelete)
            });

            // toast.success("Comment deleted successfully!");
        } catch (error) {
            console.error("Error deleting comment:", error);
            toast.error("Failed to delete comment");
        }
    };

    const sendGifMessage = async (gif: any) => {
        if (!gif) return;

        try {
            const commentRef = doc(db, "Comments", currentCommentPost.commentId);
            
            const newCommentObj = {
                id: Date.now().toString(),
                content: newComment.trim(), // Optional caption
                userId: user._id,
                userName: user.name,
                userImage: user.image,
                createdAt: new Date().toISOString(),
                type: 'gif',
                gifUrl: gif.images.original.url
            };

            await updateDoc(commentRef, {
                comments: arrayUnion(newCommentObj)
            });

            setNewComment("");
            setShowGifPicker(false);
            // toast.success("Comment added successfully!");
        } catch (error) {
            console.error("Error sending GIF:", error);
            toast.error("Failed to send GIF");
        }
    };

    if (!openPostCommentModal) {
        return null;
    }

    if(comments?.length === 0) {
        return (
            <>
                <motion.div 
                    onClick={() => setOpenPostCommentModal(false)} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed top-[50%] z-[90] left-[50%] translate-x-[-50%] translate-y-[-50%] h-screen w-full bg-[#000] bg-opacity-50 backdrop-blur-sm"
                />
                <div 
                    className='fixed w-[90%] md:w-[60%] top-[50%] left-[50%] z-[100] translate-x-[-50%] translate-y-[-50%] flex justify-center items-center gap-3'
                >
                    <PostView post={currentCommentPost} />
                    <div className={`w-full max-w-[500px] ${isDefaultMode ? 'bg-bgSecondary' : 'bg-white'} rounded-[15px] p-5`}>
                        <div className={`w-full h-[400px] ${isDefaultMode ? 'bg-bgPrimary' : 'bg-gray-100'} rounded-[15px] mb-4 p-4 flex flex-col items-center justify-center`}>
                            <div className={`text-[#666] text-center`}>
                                <p className="text-lg mb-1">No comments yet</p>
                                <p className="text-sm">Be the first homie to comment</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="w-full">
                            <div className="flex gap-2 items-center">
                                <div className="flex w-full items-center justify-center relative">
                                    <TextareaAutosize
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                        placeholder="Write a comment..."
                                        minRows={1}
                                        maxRows={4}
                                        className={`w-full ${isDefaultMode ? 'bg-bgPrimary text-fontPrimary' : 'bg-gray-100 text-gray-800'} selection:bg-bgSecondary overflow-hidden rounded-[15px] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#666] resize-none leading-[1.6rem]`}
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
                                    className={`${isDefaultMode ? 'bg-bgPrimary text-fontPrimary' : 'bg-gray-100 text-gray-800'} px-6 h-10 rounded-full hover:bg-[#1b1b1b] transition-colors flex items-center justify-center`}
                                >
                                    Drop
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </>
        )
    }

    return (
        <>
            <motion.div 
                onClick={() => setOpenPostCommentModal(false)} 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed top-[50%] z-[90] left-[50%] translate-x-[-50%] translate-y-[-50%] h-screen w-full bg-[#000] bg-opacity-50 backdrop-blur-sm"
            />
            <div 
                className='fixed w-[90%] md:w-[60%] top-[50%] left-[50%] z-[100] translate-x-[-50%] translate-y-[-50%] flex justify-center items-center gap-3'
            >
                <PostView post={currentCommentPost} />
                <div className={`w-full max-w-[500px] ${isDefaultMode ? 'bg-bgSecondary' : 'bg-white'} rounded-[15px] p-5`}>
                    <div className={`w-full h-[400px] ${isDefaultMode ? 'bg-bgPrimary' : 'bg-gray-100'} rounded-[15px] mb-4 p-4 overflow-y-auto`}>
                        <div className="flex flex-col gap-3">
                            {comments.map((comment) => (
                                <motion.div 
                                    key={comment.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ type: "spring", duration: 0.5 }}
                                    className="w-full flex flex-col"
                                >
                                    <div className={`w-full flex ${comment.userId === user._id ? 'justify-end' : 'justify-start'} items-end gap-2 mb-[2px]`}>
                                        {comment.userId !== user._id && (
                                            <div onClick={() => router.push(`/homie/${comment.userId}`)} 
                                                className="w-8 h-8 rounded-full cursor-pointer overflow-hidden flex-shrink-0">
                                                <Image 
                                                    src={getProfileUrl(comment.userImage)}
                                                    alt={comment.userName}
                                                    width={32}
                                                    height={32}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        
                                        <div className={`group relative max-w-[65%] ${comment.userId === user._id ? 'order-1' : 'order-2'}`}>
                                            <div className={`mb-1 ${comment.userId === user._id ? "text-right mr-2" : "text-left ml-2"}`}>
                                                <span className={`text-sm text-right font-semibold ${isDefaultMode ? 'text-fontPrimary' : 'text-gray-800'}`}>{comment.userName}</span>
                                            </div>
                                            <div className={`${comment.type === "gif" ? "px-2" : "px-4"} py-2 rounded-[20px] ${
                                                comment.userId === user._id 
                                                    ? isDefaultMode ? 'bg-bgSecondary text-fontPrimary' : 'bg-gray-200 text-gray-800'
                                                    : isDefaultMode ? 'bg-[#1b1b1b] text-fontPrimary' : 'bg-gray-300 text-gray-800'
                                            } relative`}>
                                                {comment.userId === user._id && (
                                                    <div className="absolute z-[150] left-0 top-1/2 -translate-y-1/2 -translate-x-[24px] opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger>
                                                                <div className="p-1 hover:bg-bgSecondary rounded-full transition-colors">
                                                                    <CiMenuKebab size={16} className="text-fontPrimary opacity-60" />
                                                                </div>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="start" side="left" sideOffset={8} className="z-[200] bg-bgPrimary text-fontPrimary text-sm border-[#666] p-1">
                                                                <div onClick={() => deleteComment(comment)} className="sulphur cursor-pointer">
                                                                    <p className="w-full text-center hover:bg-[#1B1B1B] p-1 rounded-[6px] text-[#FF6F6F]">
                                                                        Delete
                                                                    </p>
                                                                </div>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                )}
                                                {comment.type === 'gif' ? (
                                                    <div className="flex justify-center items-center flex-col gap-2">
                                                        <div className="relative">
                                                            <Image 
                                                                src={comment.gifUrl || ""}
                                                                alt="GIF"
                                                                width={200}
                                                                height={200}
                                                                className="rounded-[15px]"
                                                                unoptimized
                                                            />
                                                        </div>
                                                        {comment.content && (
                                                            <p className="text-[15px] leading-[1.6rem] whitespace-pre-wrap break-words px-2 text-justify">
                                                                {comment.content}
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p className="text-[15px] leading-[1.6rem] whitespace-pre-wrap text-left break-words">{comment.content}</p>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {comment.userId === user._id && (
                                            <div onClick={() => router.push(`/homie/${comment.userId}`)} className="w-8 h-8 rounded-full cursor-pointer overflow-hidden flex-shrink-0 order-3">
                                                <Image 
                                                    src={getProfileUrl(comment.userImage)}
                                                    alt={comment.userName}
                                                    width={32}
                                                    height={32}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="w-full">
                        <div className="flex gap-2 items-center">
                            <div className="flex w-full items-center justify-center relative">
                                <TextareaAutosize
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Write a comment..."
                                    minRows={1}
                                    maxRows={4}
                                    className={`w-full ${isDefaultMode ? 'bg-bgPrimary text-fontPrimary' : 'bg-gray-100 text-gray-800'} selection:bg-bgSecondary overflow-hidden rounded-[15px] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#666] resize-none leading-[1.6rem]`}
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
                                className={`${isDefaultMode ? 'bg-bgPrimary text-fontPrimary' : 'bg-gray-100 text-gray-800'} px-6 h-10 rounded-full hover:bg-[#1b1b1b] transition-colors flex items-center justify-center`}
                            >
                                Post
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}