
"use client"

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { IoIosImages } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { storage, ID } from "@/config/AppWriteClient";
import { toast } from 'sonner';
import TextareaAutosize from 'react-textarea-autosize';
import { getProfileUrl } from '@/extra/helpers';
import { Post } from '@/homieTypes/homieTypes';
import { motion } from 'motion/react';

export default function AdminPostsEdit({ openPostEditModal, setOpenPostEditModal, user, setPosts, currentEditPost }: { openPostEditModal: boolean, setOpenPostEditModal: any, user: any, setPosts: any, currentEditPost: Post | null }) {
    const [content, setContent] = useState(currentEditPost?.content || "");
    const [currentImage, setCurrentImage] = useState(currentEditPost?.image || "");
    const [currentFile, setCurrentFile] = useState<File | null>(null);
    const [oldImage, setOldImage] = useState<string | null>(currentEditPost?.image || null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        setContent(currentEditPost?.content || "")
        setOldImage(currentEditPost?.image || null)
    }, [currentEditPost])
    
    if (!openPostEditModal) {
        return null;
    }

    // Reuse the same handleImageChange function
    const handleImageChange = (file: File | undefined) => {
        setOldImage(null);
        if (file && file.type.startsWith("image/")) {
            const maxSizeInMB = 2;
            const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

            if (file.size > maxSizeInBytes) {
                toast.info("Maximum image size is 1MB");
                return;
            }

            setCurrentFile(file);
            const Image = URL.createObjectURL(file);
            setCurrentImage(Image);
        }
    }

    // Reuse the same handleSubmit function
    const handleSubmit = async () => {
        if (!content.trim()) {
            toast.error("Content is required!");
            return;
        }

        // Check if there are any changes
        const isContentSame = content === currentEditPost?.content;
        const isImageSame = !currentFile && (oldImage === null || oldImage !== "");
        if (isContentSame && isImageSame) {
            toast.info("No changes detected!");
            return;
        }

        setIsEditing(true);
        let imageId = currentEditPost?.image || "";
        
        try {
            if(oldImage === "" && !isContentSame) {
                if (currentEditPost?.image && !currentEditPost.image.startsWith("http")) {
                    try {
                        await storage.deleteFile(
                            process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || "",
                            currentEditPost.image
                        );
                    } catch (err) {
                        console.error("Error deleting old image:", err);
                    }
                }

                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/posts/${currentEditPost?._id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        title: content.slice(0, 50),
                        content,
                        image: null,
                    }),
                });
    
                if (response.ok) {
                    toast.success("Post updated successfully!");
                    setContent('');
                    setCurrentImage("");
                    setCurrentFile(null);
                    fetchPosts();
                    setOpenPostEditModal(false);
                } else {
                    toast.error("Failed to update post");
                }
                return;
            }

            if(oldImage === "") {
                if (currentEditPost?.image && !currentEditPost.image.startsWith("http")) {
                    try {
                        await storage.deleteFile(
                            process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || "",
                            currentEditPost.image
                        );
                    } catch (err) {
                        console.error("Error deleting old image:", err);
                    }
                }

                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/posts/${currentEditPost?._id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        title: content.slice(0, 50),
                        content,
                        image: null,
                    }),
                });
    
                if (response.ok) {
                    toast.success("Post updated successfully!");
                    setContent('');
                    setCurrentImage("");
                    setCurrentFile(null);
                    fetchPosts();
                    setOpenPostEditModal(false);
                } else {
                    toast.error("Failed to update post");
                }
            }

            if (currentFile) {
                if (currentEditPost?.image && !currentEditPost.image.startsWith("http")) {
                    try {
                        await storage.deleteFile(
                            process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || "",
                            currentEditPost.image
                        );
                    } catch (err) {
                        console.error("Error deleting old image:", err);
                    }
                }

                try {
                    imageId = ID.unique();
                    await storage.createFile(
                        process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || "",
                        imageId,
                        currentFile
                    );
                } catch (err) {
                    console.error(err);
                    toast.error("Failed to upload image");
                    setIsEditing(false);
                    return;
                }
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/posts/${currentEditPost?._id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        title: content.slice(0, 50),
                        content,
                        image: imageId || null,
                    }),
                });
    
                if (response.ok) {
                    toast.success("Post updated successfully!");
                    setContent('');
                    setCurrentImage("");
                    setCurrentFile(null);
                    fetchPosts();
                    setOpenPostEditModal(false);
                } else {
                    toast.error("Failed to update post");
                }
            } 
            
            if(!isContentSame) {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/posts/${currentEditPost?._id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        title: content.slice(0, 50),
                        content,
                        image: imageId || null,
                    }),
                });
    
                if (response.ok) {
                    toast.success("Post updated successfully!");
                    setContent('');
                    setCurrentImage("");
                    setCurrentFile(null);
                    fetchPosts();
                    setOpenPostEditModal(false);
                } else {
                    toast.error("Failed to update post");
                }
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to update post");
        } finally {
            setIsEditing(false);
        }
    };

    const fetchPosts = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/posts`);
            const postsData = await response.json();
            setPosts(postsData);
        } catch (err) {
            console.error('Error fetching posts:', err);
        }
    };

    return (
        <>
            <div 
                onClick={() => {
                    setOpenPostEditModal(false)
                    fetchPosts();
                }} 
                className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm"
            />
            <div className="fixed w-[95%] md:w-[85%] lg:w-[75%] max-h-[90vh] overflow-y-auto p-6 rounded-lg bg-[#1a1a1a] top-[50%] z-[100] left-[50%] translate-x-[-50%] translate-y-[-50%] text-white shadow-2xl">
                <div className="w-full flex flex-col gap-6">
                    <div className="flex justify-between items-center border-b border-gray-700 pb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-blue-400">Admin Post Editor</h2>
                            <p className="text-gray-400 text-sm">ID: {currentEditPost?._id}</p>
                        </div>
                        <button 
                            onClick={() => {
                                setOpenPostEditModal(false);
                                setContent('');
                                setCurrentImage('');
                                setCurrentFile(null);
                                fetchPosts();
                            }}
                            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                            <RxCross2 size={24} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Edit Section */}
                        <div className="space-y-4">
                            <div className="bg-[#2a2a2a] rounded-lg p-4">
                                <h3 className="text-lg font-semibold mb-2 text-gray-300">Content</h3>
                                <TextareaAutosize
                                    placeholder="Edit post content here..."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="w-full min-h-[12rem] p-4 rounded-lg bg-[#333] outline-none resize-none focus:ring-2 focus:ring-blue-500"
                                    maxRows={10}
                                />
                            </div>

                            <div className="bg-[#2a2a2a] rounded-lg p-4">
                                <h3 className="text-lg font-semibold mb-2 text-gray-300">Media</h3>
                                <div className="flex gap-4 items-center">
                                    <label className="cursor-pointer flex items-center gap-2 bg-[#333] px-4 py-2 rounded-lg hover:bg-[#444] transition-colors">
                                        <IoIosImages size={20}/>
                                        <span>Upload Image</span>
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            onChange={(e) => handleImageChange(e.target.files?.[0])}
                                            className="hidden" 
                                        />
                                    </label>
                                    <button
                                        onClick={handleSubmit}
                                        className="ml-auto bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition-colors font-medium"
                                    >
                                        Update Post
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Preview Section */}
                        <div className="bg-[#2a2a2a] rounded-lg p-4">
                            <h3 className="text-lg font-semibold mb-4 text-gray-300">Preview</h3>
                            <div className="bg-[#333] rounded-lg p-4 space-y-4">
                                <div className='flex items-center gap-3'>
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-[#444]">
                                        {user?.image && (
                                            <Image
                                                src={getProfileUrl(user.image)}
                                                alt={user.name || 'User'}
                                                width={48}
                                                height={48}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-medium">{user?.name || 'Anonymous'}</h3>
                                        <p className="text-sm text-gray-400">Preview Mode</p>
                                    </div>
                                </div>

                                {content && (
                                    <p className="text-sm whitespace-pre-wrap">{content}</p>
                                )}

                                {currentFile && (
                                    <div className="relative w-full h-64">
                                        <Image
                                            src={currentImage}
                                            alt="Preview"
                                            fill
                                            className="object-cover rounded-lg"
                                        />
                                    </div>
                                )}

                                {oldImage && (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="relative w-full h-64"
                                    >
                                        <Image
                                            src={getProfileUrl(oldImage)}
                                            alt="Current"
                                            fill
                                            className="object-cover rounded-lg"
                                        />
                                        <button
                                            onClick={() => setOldImage("")}
                                            className="absolute top-2 right-2 p-2 bg-black/50 rounded-full hover:bg-red-500/50"
                                        >
                                            <RxCross2 className="w-5 h-5" />
                                        </button>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {isEditing && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200]">
                    <div className="bg-[#2a2a2a] p-6 rounded-lg flex items-center gap-3">
                        <div className="w-6 h-6 border-t-2 border-blue-500 rounded-full animate-spin"></div>
                        <span className="text-blue-400 font-medium">Updating Post...</span>
                    </div>
                </div>
            )}
        </>
    );
}