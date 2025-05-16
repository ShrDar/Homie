"use client"
import { motion } from "motion/react"
import { useState, useRef } from "react"
import { IoIosImages } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import Image from "next/image"
import TextareaAutosize from 'react-textarea-autosize'
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { storage } from "@/config/AppWriteClient";
import { ID } from 'appwrite';
import { toast } from "sonner";
import { HomieUser, Tea } from "@/homieTypes/homieTypes";
import DefaultLoading from '../Loading/DefaultLoading';
import { getProfileUrl } from "@/extra/helpers";
import { IoChevronBack } from "react-icons/io5";

export default function TeaEdit({ setShowTeaEdit, user, tea, setShowTeaDiscussion }: { setShowTeaEdit: any, user: HomieUser | null, tea: Tea | null, setShowTeaDiscussion: any}) {
    const [title, setTitle] = useState(tea?.title || "")
    const [content, setContent] = useState(tea?.content || "")
    const [tags, setTags] = useState<string[]>(tea?.tags || [])
    const [isTeaOpen, setIsTeaOpen] = useState<boolean>(tea?.isOpen ?? true);
    const [currentTag, setCurrentTag] = useState("")
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [oldImage, setOldImage] = useState<string | null>(tea?.image ?? null);

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

    // Add ref for file input
    const fileInputRef = useRef<HTMLInputElement>(null);

    const removeImage = () => {
        setImage(null);
        setImagePreview("");
        // Reset file input value
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && currentTag.trim() !== '') {
            e.preventDefault()
            if (tags.length < 3) {
                setTags([...tags, currentTag.trim().toLowerCase()])
                setCurrentTag('')
            }
        }
    }

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove))
    }

    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!title.trim()) {
            toast.info("Please add a title for your tea");
            return;
        }

        if (!content.trim()) {
            toast.info("Please add some content to brew your tea");
            return;
        }

        if (tea) {
            const isContentSame = content === tea.content;
            const isTitleSame = title === tea.title;
            const areTagsSame = JSON.stringify(tags) === JSON.stringify(tea.tags);
            const isImageSame = !image && oldImage === tea.image; 
            const isOpenSame = isTeaOpen === tea.isOpen;

            console.log(`isContentSame: ${isContentSame}, isTitleSame: ${isTitleSame}, areTagsSame: ${areTagsSame}, isImageSame: ${isImageSame}, isOpenSame: ${isOpenSame}`)

            if (isContentSame && isTitleSame && areTagsSame && isImageSame && isOpenSame) {
                toast.info("No changes detected!");
                return;
            }
        }

        setIsLoading(true);
        try {
            let imageId = tea?.image || '';
            
            // Handle image deletion and upload
            if (tea?.image && !oldImage) {
                // User wants to delete the old image
                try {
                    await storage.deleteFile(
                        process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || "",
                        tea.image
                    );
                    imageId = ''; // Clear the image ID
                } catch (err) {
                    console.error("Error deleting old image:", err);
                }
            }

            // Handle new image upload if exists
            if (image) {
                // Delete old image if exists
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

                // Upload new image
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
                // Update existing tea
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

                toast.success("Tea updated successfully! 🙌🏻");
            } else {
                // Create new tea
                const discussionRef = collection(db, "Discussions");
                const discussionDoc = await addDoc(discussionRef, {
                    messages: [],
                    createdAt: new Date()
                });

                const teaData = {
                    title,
                    content,
                    userId: user?._id,
                    image: imageId,
                    tags,
                    reactions: [],
                    createdAt: new Date(),
                    discussionId: discussionDoc.id,
                    isEdited: false
                };

                const teasRef = collection(db, "Tea");
                await addDoc(teasRef, teaData);

                toast.success("Tea brewed successfully! 🙌🏻");
            }

            // Reset form and close modal
            setTitle('');
            setContent('');
            setTags([]);
            setImage(null);
            setImagePreview('');
            setShowTeaEdit(false);
        
        } catch (error) {
            console.error("Error with tea:", error);
            toast.error(tea ? "Failed to update tea" : "Failed to brew tea");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {isLoading && <DefaultLoading displayText="Rebrewing Tea" />}
            <motion.div 
                onClick={() => {
                    setShowTeaEdit(false)
                }} 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                className="fixed top-[50%] z-[90] left-[50%] translate-x-[-50%] translate-y-[-50%] h-screen w-full bg-[#000] bg-opacity-50 backdrop-blur-sm"
            />
            <div className="fixed w-[90%] md:w-[80%] lg:w-[70%] max-h-[90vh] overflow-y-auto py-8 flex justify-center items-start rounded-[15px] bg-bgSecondary top-[50%] z-[100] left-[50%] translate-x-[-50%] translate-y-[-50%] text-fontPrimary overflow-hidden">
                <div className="w-full px-8 flex flex-col gap-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-semibold">Edit Tea</h2>
                            <button
                                onClick={() => setIsTeaOpen(prev => !prev)}
                                className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                                    isTeaOpen ? 'bg-bgPrimary' : 'bg-[#3a3a3a]'
                                }`}
                            >
                                <div
                                    className={`absolute top-1 w-5 h-5 rounded-full bg-fontPrimary transition-all duration-300 ease-in-out ${
                                        isTeaOpen ? 'left-8' : 'left-1'
                                    }`}
                                />
                                {/* <span className="sr-only">Toggle Tea Status</span> */}
                            </button>
                            <span className="text-sm text-gray-400">
                                {isTeaOpen ? 'Open' : 'Closed'}
                            </span>
                        </div>
                        <button 
                            onClick={() => {
                                setShowTeaEdit(false)
                                setShowTeaDiscussion(true)
                            }}
                            className="p-2 hover:bg-bgPrimary rounded-full transition-colors"
                        >
                            <IoChevronBack size={24} />
                        </button>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-4 h-full">
                        <div className="w-full lg:w-[50%] flex flex-col min-h-full justify-center items-stretch gap-4">
                            <div className="flex gap-2 items-center">
                                <input
                                    type="text"
                                    placeholder="tags"
                                    value={currentTag}
                                    onChange={(e) => setCurrentTag(e.target.value)}
                                    onKeyDown={handleAddTag}
                                    className="w-[80px] min-w-[80px] bg-bgPrimary text-fontPrimary px-3 py-2 rounded-lg outline-none text-sm transition-all"
                                    disabled={tags.length >= 3}
                                />
                                {tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {tags.map((tag, index) => (
                                            <motion.span 
                                                initial={{x: -10, filter: 'blur(5px)'}}
                                                animate={{x: 0, filter: 'blur(0px)'}}
                                                transition={{ 
                                                    type: "spring",
                                                    stiffness: 500,
                                                    damping: 25,
                                                    delay: index * 0.1 
                                                }}
                                                key={index} 
                                                className="px-2 py-2 rounded-full bg-bgPrimary text-xs flex items-center gap-1.5"
                                            >
                                                #{tag}
                                                <button 
                                                    onClick={() => removeTag(tag)}
                                                    className="text-xs hover:text-red-500 transition-colors"
                                                >
                                                    ✕
                                                </button>
                                            </motion.span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <motion.input
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.2 }}
                                type="text"
                                placeholder="Tea Title..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-bgPrimary text-fontPrimary p-4 rounded-lg outline-none"
                            />
                            
                            <motion.div
                                initial={{x: -10, filter: 'blur(5px)'}}
                                animate={{x: 0, filter: 'blur(0px)'}}
                            >
                                <TextareaAutosize
                                    placeholder="What's on your mind?"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="w-full min-h-[8rem] p-4 rounded-lg bg-bgPrimary outline-none resize-none selection:bg-bgSecondary whitespace-pre-wrap"
                                    maxRows={10}
                                />
                            </motion.div>

                            <div className="flex gap-4 items-center">
                                <motion.label 
                                    initial={{x: -10, filter: 'blur(5px)'}}
                                    animate={{x: 0, filter: 'blur(0px)'}}
                                    className="cursor-pointer bg-bgPrimary hover:bg-[#242424] p-3 rounded-full transition-colors flex items-center gap-2"
                                >
                                    <IoIosImages className="w-5 h-5" />
                                    
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </motion.label>
                                <motion.button 
                                    initial={{x: 20, filter: 'blur(5px)'}}
                                    animate={{x: 0, filter: 'blur(0px)'}}
                                    className="ml-auto bg-bgPrimary hover:bg-[#242424] px-6 py-2 rounded-full transition-colors"
                                    onClick={handleSubmit}
                                >
                                    Rebrew ☕
                                </motion.button>
                            </div>

                            {/* Removed image preview from here */}
                        </div>

                        {/* Preview Section */}
                        <motion.div 
                            initial={{x: 40, filter: 'blur(5px)'}}
                            animate={{x: 0, filter: 'blur(0px)'}}
                            transition={{duration: 0.2}}
                            className="w-full lg:w-[50%] lg:min-h-[50vh] overflow-y-auto border-bgPrimary lg:border-l-[3px] border-[#888] lg:pl-4 lg:p-2 flex flex-col justify-center items-center"
                        >
                            <div className="bg-bgPrimary rounded-[15px] p-8 w-full h-auto lg:h-[70%] relative transition-all cursor-default">
                                <div className="flex items-center gap-2 absolute top-4 left-4">
                                    {tags.map((tag, index) => (
                                        <motion.span 
                                            initial={{x: -10, filter: 'blur(5px)'}}
                                            animate={{x: 0, filter: 'blur(0px)'}}
                                            transition={{ 
                                                type: "spring",
                                                stiffness: 500,
                                                damping: 25,
                                                delay: index * 0.1,
                                                duration: 0.5
                                            }}
                                            key={index} 
                                            className="px-3 py-1 rounded-full bg-bgSecondary text-sm"
                                        >
                                            #{tag}
                                        </motion.span>
                                    ))}
                                </div>

                                <div className="absolute top-4 right-4">
                                    <span className="text-sm text-gray-400">
                                        @{user?.username || 'anonymous'}
                                    </span>
                                </div>

                                <div className="flex flex-col justify-center items-center gap-6 h-full py-20 lg:py-0">
                                    <h2 className="text-3xl font-bold text-center">
                                        {title || "Tea Title..."}
                                    </h2>
                                    <p className="text-gray-400 text-lg line-clamp-2 text-center max-w-[80%]">
                                        {content || "What's on your mind?"}
                                    </p>
                                </div>

                                <div className="absolute bottom-4 left-4 text-sm text-gray-400">
                                    <span className="flex items-center gap-2">
                                        {
                                            isTeaOpen ?
                                            <span className="w-2 h-2 rounded-full bg-green-500"></span> :
                                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                        }
                                        {isTeaOpen ? "Join Tea" : " Tea Closed"}
                                    </span>
                                </div>

                                <div className="absolute bottom-4 right-4 text-sm text-gray-400">
                                    <span>{new Date().toLocaleDateString()}</span>
                                </div>
                            </div>

                            {imagePreview && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.2 }}
                                    className="relative w-full h-[30%] mt-4"
                                >
                                    <Image
                                        src={imagePreview}
                                        alt="Preview"
                                        fill
                                        className="object-cover rounded-lg"
                                    />
                                    <button
                                        onClick={(removeImage)}
                                        className="absolute top-2 right-2 p-1 bg-bgSecondary rounded-full hover:bg-red-500/20 transition-colors"
                                    >
                                        <RxCross2 className="w-5 h-5" />
                                    </button>
                                </motion.div>
                            )}
                            {oldImage && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.2 }}
                                    className="relative w-full h-[30%] mt-4"
                                >
                                    <Image
                                        src={getProfileUrl(oldImage || "")}
                                        alt="Preview"
                                        fill
                                        className="object-cover rounded-lg"
                                    />
                                    <button
                                        onClick={() => setOldImage(null)}
                                        className="absolute top-2 right-2 p-1 bg-bgSecondary rounded-full hover:bg-red-500/20 transition-colors"
                                    >
                                        <RxCross2 className="w-5 h-5" />
                                    </button>
                                </motion.div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </>
    )
}