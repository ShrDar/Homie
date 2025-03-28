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

export default function PostEdit({ openPostEditModal, setOpenPostEditModal, user, setPosts, currentEditPost }: { openPostEditModal: boolean, setOpenPostEditModal: any, user: any, setPosts: any, currentEditPost: Post | null }) {
    const [content, setContent] = useState(currentEditPost?.content || "");
    const [currentImage, setCurrentImage] = useState(currentEditPost?.image || "");
    const [currentFile, setCurrentFile] = useState<File | null>(null);
    const [oldImage, setOldImage] = useState<string | null>(currentEditPost?.image || null);
    const [isPosting, setIsPosting] = useState(false);

    useEffect(() => {
        setContent(currentEditPost?.content || "")
        setOldImage(currentEditPost?.image || null)
    }, [currentEditPost])
    
    if (!openPostEditModal) {
        return null;
    }


    const handleImageChange = (file: File | undefined) => {
        setOldImage(null);
        if (file && file.type.startsWith("image/")) {
            // Add size validation
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

        setIsPosting(true);
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
                // Delete old image if exists
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

                // Upload new image
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
                    setIsPosting(false);
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

            // Update post
        } catch (err) {
            console.error(err);
            toast.error("Failed to update post");
        } finally {
            setIsPosting(false);
        }
    }
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
            <div onClick={() => {
                setOpenPostEditModal(false)
                fetchPosts();
            }} 
                className="fixed top-[50%] z-[90] left-[50%] translate-x-[-50%] translate-y-[-50%] h-screen w-full bg-[#000] bg-opacity-50 backdrop-blur-sm">
            </div>
            <div className="fixed w-[90%] md:w-[80%] lg:w-[70%] max-h-[90vh] overflow-y-auto py-8 flex justify-center items-start rounded-[15px] bg-bgSecondary top-[50%] z-[100] left-[50%] translate-x-[-50%] translate-y-[-50%] text-fontPrimary">
                <div className="w-full px-8 flex flex-col gap-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-semibold">Edit Post</h2>
                        <button onClick={() => {
                            setOpenPostEditModal(false);
                            setContent('');
                            setCurrentImage('');
                            setCurrentFile(null);
                            fetchPosts();
                        }} 
                            className="p-2 hover:bg-bgPrimary rounded-full transition-colors">
                            <RxCross2 size={24} />
                        </button>
                    </div>

                    <div className="flex flex-row gap-4 h-full">
                        <div className='w-[50%] flex flex-col min-h-full justify-center items-stretch gap-4'>
                            <TextareaAutosize
                                placeholder="What's on your mind?"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full min-h-[8rem] p-3 rounded-lg h-full bg-bgPrimary outline-none resize-none selection:bg-bgSecondary whitespace-pre-wrap"
                                maxRows={10}
                            />
                            
                            <div className="flex gap-4 items-center">
                                <label className="cursor-pointer hover:brightness-[1.2] transition-all duration-100 flex items-center gap-2 border-2 border-[#c9c9c9] p-2 rounded-full">
                                    <IoIosImages color="#c9c9c9" size={20}/>
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={(e) => handleImageChange(e.target.files?.[0])}
                                        className="hidden" 
                                    />
                                </label>
                                <button
                                    onClick={handleSubmit}
                                    className="ml-auto bg-bgPrimary hover:bg-[#242424] px-6 py-2 rounded-full transition-colors"
                                >
                                    Edit
                                </button>
                            </div>
                        </div>

                        {/* Preview Section */}
                        
                            <div className="w-[50%] h-full border-bgPrimary border-l-[3px] border-[#888] pl-4 p-2">
                                <div className="bg-bgPrimary  rounded-[15px] p-4 flex flex-col gap-2">
                                    <div className='flex justify-start items-center gap-2'>
                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-bgPrimary">
                                            {user?.image ? (
                                            <Image
                                                key={`user-image-${user._id}`}
                                                src={getProfileUrl(user.image)}
                                                alt={user.name || 'User'}
                                                width={40}
                                                height={40}
                                                className="w-full h-full aspect-auto object-cover"
                                            />
                                            ) : (
                                            <div className="w-full h-full bg-bgPrimary" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-fontPrimary text-md">{user?.name || 'Anonymous'}</h3>
                                            <p className="text-sm opacity-60">
                                                Just Now
                                            </p>
                                        </div>
                                    </div>

                                    {content &&
                                        (
                                            <p className="text-sm whitespace-pre-wrap max-h-[10rem] break-words overflow-y-auto">{content}</p>
                                        )
                                    }
                                    {currentFile && (
                                        <div className="relative w-full h-48">
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
                                            transition={{ duration: 0.2 }}
                                            className="relative w-full h-[200px] mt-4"
                                        >
                                            <Image
                                                src={getProfileUrl(oldImage || "")}
                                                alt="Preview"
                                                fill
                                                className="object-cover rounded-lg"
                                            />
                                            <button
                                                onClick={() => setOldImage("")}
                                                className="absolute top-2 right-2 p-1 bg-bgSecondary rounded-full hover:bg-red-500/20 transition-colors"
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
            
            {isPosting && 
            (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200]">
                    <div className="bg-bgSecondary p-4 rounded-lg flex items-center gap-2">
                        <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                        <span className="text-white tracking-[4px]">Updating...</span>
                    </div>
                </div>
            )}
        </>
    );
}