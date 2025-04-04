"use client"
import { HomieUser, Tea } from "@/homieTypes/homieTypes"
import { useState, useRef } from "react";
import { IoIosImages } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import Image from "next/image";
import TextareaAutosize from 'react-textarea-autosize';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { storage } from "@/config/AppWriteClient";
import { ID } from 'appwrite';
import { toast } from "sonner";
import DefaultLoading from '../Loading/DefaultLoading';
import { getProfileUrl } from "@/extra/helpers";

export default function AdminTeaEdit({setOpenTeaEditModal, tea} : {setOpenTeaEditModal : any, tea: Tea | null}) {
    const [title, setTitle] = useState(tea?.title || "");
    const [content, setContent] = useState(tea?.content || "");
    const [tags, setTags] = useState<string[]>(tea?.tags || []);
    const [isTeaOpen, setIsTeaOpen] = useState<boolean>(tea?.isOpen ?? true);
    const [currentTag, setCurrentTag] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [oldImage, setOldImage] = useState<string | null>(tea?.image ?? null);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOldImage(null);
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImage(null);
        setImagePreview("");
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && currentTag.trim() !== '') {
            e.preventDefault();
            if (tags.length < 3) {
                setTags([...tags, currentTag.trim().toLowerCase()]);
                setCurrentTag('');
            }
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            toast.info("Please add a title for the tea");
            return;
        }

        if (!content.trim()) {
            toast.info("Please add content for the tea");
            return;
        }

        if (tea) {
            const isContentSame = content === tea.content;
            const isTitleSame = title === tea.title;
            const areTagsSame = JSON.stringify(tags) === JSON.stringify(tea.tags);
            const isImageSame = !image && oldImage === tea.image;
            const isOpenSame = isTeaOpen === tea.isOpen;

            if (isContentSame && isTitleSame && areTagsSame && isImageSame && isOpenSame) {
                toast.info("No changes detected!");
                return;
            }
        }

        setIsLoading(true);
        try {
            let imageId = tea?.image || '';
            
            if (tea?.image && !oldImage) {
                try {
                    await storage.deleteFile(
                        process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || "",
                        tea.image
                    );
                    imageId = '';
                } catch (err) {
                    console.error("Error deleting old image:", err);
                }
            }

            if (image) {
                if (tea?.image) {
                    try {
                        await storage.deleteFile(
                            process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || "",
                            tea.image
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
                        image
                    );
                } catch (err) {
                    console.error("Error uploading image:", err);
                    toast.error("Failed to upload image");
                    return;
                }
            }

            if (tea) {
                const teaRef = doc(db, "Tea", tea._id);
                await updateDoc(teaRef, {
                    title,
                    content,
                    tags,
                    image: imageId,
                    updatedAt: new Date(),
                    isEdited: true,
                    isOpen: isTeaOpen
                });

                toast.success("Tea updated");
                setOpenTeaEditModal(false);
            }
        } catch (error) {
            console.error("Error updating tea:", error);
            toast.error("Failed to update tea");
        } finally {
            setIsLoading(false);
        }
    };

    const [currentUser, setCurrentUser] = useState<HomieUser | null>(null)
    
    const fetchUser = async(userId: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${userId}`);
            const userData = await response.json();
            setCurrentUser(userData)
        } catch(err) {
            console.error(err);
        }
    }
    
    return (
        <>
            {isLoading && <DefaultLoading displayText="Updating Tea" />}
            <div onClick={() => setOpenTeaEditModal(false)} 
                className="fixed top-[50%] z-[90] left-[50%] translate-x-[-50%] translate-y-[-50%] h-screen w-full bg-[#000] bg-opacity-50 backdrop-blur-sm">
            </div>
            <div className="fixed w-[90%] md:w-[80%] lg:w-[70%] max-h-[90vh] overflow-y-auto py-8 flex justify-center items-start rounded-[15px] bg-bgSecondary top-[50%] z-[100] left-[50%] translate-x-[-50%] translate-y-[-50%] text-fontPrimary">
                <div className="w-full px-8 flex flex-col gap-6">
                    <div className="flex justify-between items-center border-b border-bgPrimary pb-4">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-semibold">Tea Management</h2>
                            <div className="flex items-center gap-2  px-4 py-2 rounded-lg">
                                <span className="text-sm font-medium">Status:</span>
                                <button
                                    onClick={() => setIsTeaOpen(prev => !prev)}
                                    className={`relative w-14 h-7 rounded-full transition-all duration-300 ${isTeaOpen ? 'bg-bgPrimary' : 'bg-[#3a3a3a]'}`}
                                >
                                    <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all duration-300 ease-in-out ${isTeaOpen ? 'left-8' : 'left-1'}`} />
                                </button>
                                <span className={`text-sm font-medium ${isTeaOpen ? 'text-gray-400' : 'text-gray-400'}`}>
                                    {isTeaOpen ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                        <button 
                            onClick={() => setOpenTeaEditModal(false)}
                            className="p-2 hover:bg-bgPrimary rounded-full transition-colors"
                        >
                            <RxCross2 size={24} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-4">
                            <div className="bg-bgPrimary p-4 rounded-lg space-y-2">
                                <label className="text-sm font-medium text-gray-400">Title</label>
                                <input
                                    type="text"
                                    placeholder="Enter tea title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-bgSecondary text-fontPrimary p-3 rounded-lg outline-none border border-gray-700 focus:border-blue-500 transition-colors"
                                />
                            </div>

                            <div className="bg-bgPrimary p-4 rounded-lg space-y-2">
                                <label className="text-sm font-medium text-gray-400">Content</label>
                                <TextareaAutosize
                                    placeholder="Enter tea content"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="w-full min-h-[8rem] bg-bgSecondary p-3 rounded-lg outline-none border border-gray-700 focus:border-blue-500 transition-colors resize-none"
                                    maxRows={10}
                                />
                            </div>

                            <div className="bg-bgPrimary p-4 rounded-lg space-y-2">
                                <label className="text-sm font-medium text-gray-400">Tags (Max 3)</label>
                                <div className="flex flex-wrap gap-2 items-center">
                                    <input
                                        type="text"
                                        placeholder="Add tag"
                                        value={currentTag}
                                        onChange={(e) => setCurrentTag(e.target.value)}
                                        onKeyDown={handleAddTag}
                                        className="w-32 bg-bgSecondary text-fontPrimary px-3 py-2 rounded-lg outline-none border border-gray-700 focus:border-blue-500 transition-colors text-sm"
                                        disabled={tags.length >= 3}
                                    />
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map((tag, index) => (
                                            <span 
                                                key={index} 
                                                className="px-3 py-1.5 rounded-lg bg-bgSecondary text-sm flex items-center gap-2"
                                            >
                                                #{tag}
                                                <button 
                                                    onClick={() => removeTag(tag)}
                                                    className="hover:text-red-500 transition-colors"
                                                >
                                                    <RxCross2 size={16} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-bgPrimary p-4 rounded-lg space-y-2">
                                <label className="text-sm font-medium text-gray-400">Image</label>
                                <div className="flex items-center gap-4">
                                    <label className="cursor-pointer bg-bgSecondary hover:bg-[#242424] px-4 py-2 rounded-lg transition-colors flex items-center gap-2 border border-gray-700">
                                        <IoIosImages className="w-5 h-5" />
                                        <span className="text-sm">Upload Image</span>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                    {(imagePreview || oldImage) && (
                                        <div className="relative w-32 h-32">
                                            <Image
                                                src={imagePreview || getProfileUrl(oldImage || '')}
                                                alt="Preview"
                                                width={128}
                                                height={128}
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                            <button
                                                onClick={removeImage}
                                                className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                                            >
                                                <RxCross2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-bgPrimary">
                            <button 
                                className="bg-bgPrimary hover:bg-[#232323] px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
                                onClick={handleSubmit}
                            >
                                <span>Update Tea</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}