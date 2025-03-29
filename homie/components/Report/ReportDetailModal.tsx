'use client';

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import { FiUser, FiCoffee, FiFileText, FiX, FiFlag, FiAlertTriangle, FiCalendar, FiClock, FiMessageCircle } from "react-icons/fi";
import { getProfileUrl } from "@/extra/helpers";
import { Tea } from "@/homieTypes/homieTypes";

interface ReportDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    reportType: string;
    contentId: string;
}

export default function ReportDetailModal({ isOpen, onClose, reportType, contentId }: ReportDetailModalProps) {
    const [content, setContent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [postOwner, setPostOwner] = useState<any>(null);
    const [teaOwner, setTeaOwner] = useState<any>(null);

    useEffect(() => {
        if (isOpen && contentId) {
            fetchContent();
        }
    }, [isOpen, contentId]);

    // New function to fetch post owner
    const fetchPostOwner = async (userId: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${userId}`);
            if (!response.ok) throw new Error('Failed to fetch user');
            const userData = await response.json();
            setPostOwner(userData);
        } catch (error) {
            console.error('Error fetching post owner:', error);
            setPostOwner(null);
        }
    };

    const fetchContent = async () => {
        setLoading(true);
        try {
            let contentData;
            
            if (reportType === 'user') {
                // Fetch user from API
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${contentId}`);
                if (!response.ok) throw new Error('Failed to fetch user');
                contentData = await response.json();
                
                // Process image URL if exists
                if (contentData.image) {
                    contentData.image = getProfileUrl(contentData.image);
                }
            } 
            else if (reportType === 'post') {
                // Fetch post from API
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/posts/${contentId}`);
                if (!response.ok) throw new Error('Failed to fetch post');
                contentData = await response.json();
                
                // Fetch the post owner if userId exists
                if (contentData.userId) {
                    await fetchPostOwner(contentData.userId);
                }
            } 
            else {
                // Fetch tea from Firestore
                const teaRef = doc(db, "Tea", contentId);
                const teaSnap = await getDoc(teaRef);
                if (!teaSnap.exists()) throw new Error('Tea not found');
                contentData = {
                    _id: teaSnap.id,
                    ...teaSnap.data()
                } as Tea;
                
                // Fetch the tea owner if userId exists
                if (contentData.userId) {
                    try {
                        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${contentData.userId}`);
                        if (response.ok) {
                            const userData = await response.json();
                            setTeaOwner(userData);
                        }
                    } catch (error) {
                        console.error('Error fetching tea owner:', error);
                        setTeaOwner(null);
                    }
                }
            }
            
            setContent(contentData);
        } catch (error) {
            console.error('Error fetching content:', error);
            setContent(null);
        }
        setLoading(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => onClose()}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4"
                    />
                        <div
                            className="bg-bgSecondary p-6 z-[100] fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] rounded-[15px] w-full max-w-2xl shadow-xl border border-gray-700"
                        >
                            <div className="flex justify-between items-center pb-4 border-b border-gray-700">
                                <h3 className="text-xl font-semibold flex items-center">
                                    {reportType === 'user' && <FiUser className="mr-2 text-[#6FB4FF]" />}
                                    {reportType === 'tea' && <FiCoffee className="mr-2 text-[#FF9F6F]" />}
                                    {reportType === 'post' && <FiFileText className="mr-2 text-[#6FFF8D]" />}
                                    <span>Reported {reportType.charAt(0).toUpperCase() + reportType.slice(1)}</span>
                                    <span className="ml-2 bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-full flex items-center">
                                        <FiFlag className="mr-1" /> Reported
                                    </span>
                                </h3>
                                <button 
                                    onClick={onClose} 
                                    className="text-gray-500 hover:text-white bg-bgPrimary hover:bg-gray-700 rounded-full p-2 transition-colors"
                                    aria-label="Close modal"
                                >
                                    <FiX />
                                </button>
                            </div>
                            
                            {loading ? (
                                <div className="flex justify-center p-12">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-fontPrimary"></div>
                                </div>
                            ) : content ? (
                                <div className="space-y-6">
                                    {reportType === 'user' && (
                                        <div className="bg-bgPrimary rounded-lg overflow-hidden">
                                            <div className="p-4 flex flex-col sm:flex-row items-center sm:items-start gap-4">
                                                <div className="relative">
                                                    <Image
                                                        src={getProfileUrl(content?.image || "")}
                                                        alt={"userProfile"}
                                                        width={80}
                                                        height={80}
                                                        className="rounded-full border-2 border-bgSecondary object-cover"
                                                    />
                                                    <div className="absolute -bottom-1 -right-1 bg-bgSecondary rounded-full p-1">
                                                        <FiUser size={12} />
                                                    </div>
                                                </div>
                                                <div className="text-center sm:text-left">
                                                    <h4 className="text-lg font-medium">{content.name}</h4>
                                                    <p className="text-gray-400">{content.email}</p>
                                                    <div className="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                                                        <span className="bg-bgSecondary text-xs px-2 py-1 rounded-full">ID: {contentId.substring(0, 8)}...</span>
                                                        {content.createdAt && (
                                                            <span className="bg-bgSecondary text-xs px-2 py-1 rounded-full flex items-center">
                                                                <FiCalendar className="mr-1" size={10} />
                                                                {new Date(content.createdAt).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-bgPrimary border-t-2 border-[#fff] p-3 flex items-center justify-between">
                                                <div className="text-sm text-gray-400">
                                                    <FiAlertTriangle className="inline mr-1 text-yellow-500" />
                                                    Reported user account
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {reportType === 'post' && (
                                        <div className="bg-bgPrimary rounded-lg overflow-hidden">
                                            <div className="p-4">
                                                <div className="flex items-center mb-3">
                                                    {postOwner ? (
                                                        <div className="flex items-center">
                                                            <Image
                                                                src={getProfileUrl(postOwner.image || "")}
                                                                alt="User"
                                                                width={40}
                                                                height={40}
                                                                className="rounded-full mr-3 border border-gray-700"
                                                            />
                                                            <div>
                                                                <p className="font-medium">{postOwner.name}</p>
                                                                <p className="text-xs text-gray-400">
                                                                    {content.createdAt && (
                                                                        <span className="flex items-center">
                                                                            <FiClock className="mr-1" size={10} />
                                                                            {new Date(content.createdAt).toLocaleDateString()}
                                                                        </span>
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center">
                                                            <div className="w-10 h-10 rounded-full bg-gray-700 mr-3 flex items-center justify-center">
                                                                <FiUser className="text-gray-400" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-400">Unknown User</p>
                                                                <p className="text-xs text-gray-500">User ID: {content.userId?.substring(0, 8) || "N/A"}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="mb-3 pb-3 max-h-[20vh] overflow-y-auto">
                                                    <p className="text-sm whitespace-pre-wrap">{content.content}</p>
                                                </div>
                                                {content.image && (
                                                    <div className="rounded-lg overflow-hidden">
                                                        <Image
                                                            src={getProfileUrl(content.image || "")}
                                                            alt="Post image"
                                                            width={500}
                                                            height={300}
                                                            className="w-full object-cover"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="bg-gray-800/50 p-3 flex items-center justify-between">
                                                <div className="text-sm text-gray-400">
                                                    <FiAlertTriangle className="inline mr-1 text-yellow-500" />
                                                    Reported post
                                                </div>
                                                <span className="text-xs text-gray-500">ID: {contentId.substring(0, 8)}...</span>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {reportType === 'tea' && (
                                        <div className="bg-bgPrimary rounded-lg overflow-hidden">
                                            <div className="p-4">
                                                <div className="flex items-center mb-4">
                                                    {teaOwner ? (
                                                        <div className="flex items-center mb-3">
                                                            <Image
                                                                src={getProfileUrl(teaOwner.image || "")}
                                                                alt="User"
                                                                width={40}
                                                                height={40}
                                                                className="rounded-full mr-3 border border-gray-700"
                                                            />
                                                            <div>
                                                                <p className="font-medium">{teaOwner.name}</p>
                                                                <p className="text-xs text-gray-400">
                                                                    {content.createdAt && (
                                                                        <span className="flex items-center">
                                                                            <FiClock className="mr-1" size={10} />
                                                                            {content.createdAt.toDate ? 
                                                                                new Date(content.createdAt.toDate()).toLocaleDateString() : 
                                                                                new Date(content.createdAt).toLocaleDateString()}
                                                                        </span>
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center mb-3">
                                                            <div className="w-10 h-10 rounded-full bg-gray-700 mr-3 flex items-center justify-center">
                                                                <FiUser className="text-gray-400" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-400">Unknown User</p>
                                                                <p className="text-xs text-gray-500">User ID: {content.userId?.substring(0, 8) || "N/A"}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center">
                                                        <div className="p-2 rounded-full bg-[#FF9F6F]/20 mr-3">
                                                            <FiCoffee className="text-[#FF9F6F]" size={18} />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-lg font-medium">{content.name || content.title}</h4>
                                                            <div className="flex items-center text-xs text-gray-400 mt-1">
                                                                {content.participants && (
                                                                    <span className="flex items-center">
                                                                        <FiUser className="mr-1" size={12} />
                                                                        {content.participants.length} participants
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className="bg-[#FF9F6F]/10 text-[#FF9F6F] text-xs px-2 py-1 rounded-full">
                                                        {content.isOpen !== undefined ? (content.isOpen ? 'Open' : 'Closed') : 'Tea'}
                                                    </span>
                                                </div>
                                                
                                                <div className="mb-4 pb-3 border-b border-gray-700 max-h-[20vh] overflow-y-auto">
                                                    <p className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
                                                        {content?.content}
                                                    </p>
                                                </div>
                                                
                                                {content.image && (
                                                    <div className="rounded-lg overflow-hidden mb-4">
                                                        <Image
                                                            src={getProfileUrl(content.image || "")}
                                                            alt="Tea image"
                                                            width={500}
                                                            height={300}
                                                            className="w-full max-h-[30vh] object-cover"
                                                        />
                                                    </div>
                                                )}
                                                
                                                {content.tags && content.tags.length > 0 && (
                                                    <div className="mb-3">
                                                        <div className="flex flex-wrap gap-2">
                                                            {content.tags.map((tag: string, index: number) => (
                                                                <span key={index} className="bg-[#FF9F6F]/20 text-[#FF9F6F] text-xs px-2 py-1 rounded-full">
                                                                    #{tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {content.comments && content.comments.length > 0 && (
                                                    <div className="mt-3 text-xs text-gray-400 flex items-center">
                                                        <FiMessageCircle className="mr-1" size={12} />
                                                        {content.comments.length} comments
                                                    </div>
                                                )}
                                            </div>
                                            <div className="bg-gray-800/50 p-3 flex items-center justify-between">
                                                <div className="text-sm text-gray-400">
                                                    <FiAlertTriangle className="inline mr-1 text-yellow-500" />
                                                    Reported tea content
                                                </div>
                                                <span className="text-xs text-gray-500">ID: {contentId.substring(0, 8)}...</span>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                                        <h4 className="text-red-400 font-medium flex items-center mb-2">
                                            <FiFlag className="mr-2" />
                                            Report Information
                                        </h4>
                                        <p className="text-gray-300 text-sm">
                                            This {reportType} has been reported by users for potentially violating community guidelines.
                                            Please review the content and take appropriate action.
                                        </p>
                                    </div> */}
                                </div>
                            ) : (
                                <div className="p-8 text-center">
                                    <FiAlertTriangle className="mx-auto text-yellow-500 mb-3" size={30} />
                                    <p className="text-gray-400">Content not found or has been removed.</p>
                                </div>
                            )}
                        </div>
                </>
            )}
        </AnimatePresence>
    );
}