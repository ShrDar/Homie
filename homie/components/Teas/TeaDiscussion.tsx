"use client"
import { HomieUser, Tea } from "@/homieTypes/homieTypes"
import { motion, AnimatePresence } from "framer-motion"
import { CiMenuKebab } from "react-icons/ci"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu"
import ReportModal from "@/components/Report/ReportModal"
import { useEffect, useState } from "react"
import { getProfileUrl } from "@/extra/helpers"
import { useRouter } from "next/navigation"
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { storage } from "@/config/AppWriteClient";
import { toast } from "sonner";
import Image from "next/image"
import TeaDiscussionReplyThread from "./TeaDiscussionReplyThread"

export default function TeaDiscussion({ setShowTeaDiscussion, tea, user, setShowTeaEdit }: { setShowTeaDiscussion: any, tea: Tea | null, user: HomieUser | null, setShowTeaEdit: any }) {
    const router = useRouter();
    const [showReportModal, setShowReportModal] = useState(false);
    const [selectedTeaId, setSelectedTeaId] = useState<string>("");
    const [author, setAuthor] = useState<HomieUser | null>(null);

    useEffect(() => {
        const fetchAuthor = async () => {
            if (tea?.userId) {
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${tea.userId}`);
                    const userData = await response.json();
                    setAuthor(userData);
                } catch (err) {
                    console.error("Error fetching author:", err);
                }
            }
        };
        fetchAuthor();
    }, [tea?.userId]);

    // Add this state
    const [isDeletingTea, setIsDeletingTea] = useState(false);

    // Add this function
    const handleDeleteTea = async () => {
        if (!tea?._id) return;
        
        setIsDeletingTea(true);
        try {
            // Delete discussion document if it exists
            if (tea.discussionId) {
                try {
                    const discussionRef = doc(db, "Discussions", tea.discussionId);
                    await deleteDoc(discussionRef);
                } catch (err) {
                    console.error("Error deleting discussion document:", err);
                }
            }

            // Delete image from AppWrite if exists
            if (tea.image && !tea.image.startsWith("http")) {
                try {
                    await storage.deleteFile(
                        process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || "",
                        tea.image
                    );
                } catch (err) {
                    console.error("Error deleting image:", err);
                }
            }

            // Delete tea document
            const teaRef = doc(db, "Tea", tea._id);
            await deleteDoc(teaRef);

            toast.success("Tea vanished into thin air! 👋🏻", {
                style: {
                    backgroundColor: "#2a2a2a",
                    color: "#fff",
                    border: "1px solid #888",
                },
                duration: 3000,
                position: "bottom-right",
            });

            setShowTeaDiscussion(false);

        } catch (err) {
            console.error("Error deleting tea:", err);
            toast.error("Oh Mann... We have a problem! 🚀", {
                style: {
                    backgroundColor: "#2a2a2a",
                    color: "#fff",
                    borderColor: "#FF6F6F",
                },
                duration: 3000,
                position: "bottom-right",
            });
        } finally {
            setIsDeletingTea(false);
        }
    };

    // Update the delete button in the dropdown menu
    return (
        <>
            <motion.div 
                onClick={() => setShowTeaDiscussion(false)} 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed top-0 left-0 z-[90] h-screen w-full bg-[#000] bg-opacity-50 backdrop-blur-sm"
            />
            <div className='fixed w-[90%] md:w-[80%] top-[50%] left-[50%] z-[100] translate-x-[-50%] translate-y-[-50%] flex justify-center items-center gap-3'>
                
                <div className="w-[40%] relative bg-bgSecondary rounded-[15px] p-6 flex flex-col shadow-lg">
                    <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            {tea?.tags.map((tag, index) => (
                                <span key={index} className="px-3 py-1.5 rounded-full bg-bgPrimary text-sm cursor-default selection:bg-bgSecondary hover:bg-opacity-80 transition-all">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger className="outline-none">
                                <div className="p-2 hover:bg-bgPrimary rounded-full transition-all">
                                    <CiMenuKebab className="w-5 h-5 rotate-90 hover:scale-110 transition-transform" />
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="bottom" align="end" className="bg-bgSecondary sulphur border-[1px] border-[#888] text-fontPrimary p-2 rounded-lg z-[200] shadow-xl">
                                {tea?.userId === user?._id && (
                                    <>
                                        <DropdownMenuItem onClick={() => {
                                            setShowTeaDiscussion(false);
                                            setShowTeaEdit(true);
                                        }} className="cursor-pointer px-4 py-2 hover:bg-bgPrimary rounded-lg transition-all duration-150 flex items-center gap-2">
                                            <span className="text-sm">Edit</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                            onClick={handleDeleteTea}
                                            disabled={isDeletingTea}
                                            className="cursor-pointer px-4 py-2 hover:bg-bgPrimary rounded-lg transition-all duration-150 flex items-center gap-2 text-red-500"
                                        >
                                            <span className="text-sm">{isDeletingTea ? "Deleting..." : "Delete"}</span>
                                        </DropdownMenuItem>
                                    </>
                                )}
                                <DropdownMenuItem 
                                    onClick={() => {
                                        setSelectedTeaId(tea?._id || "");
                                        setShowReportModal(true);
                                    }}
                                    className="cursor-pointer px-4 py-2 hover:bg-bgPrimary rounded-lg transition-all duration-150 flex items-center gap-2"
                                >
                                    <span className="text-sm">Report</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="flex flex-col gap-4 overflow-y-auto py-2">
                        <div className="flex flex-col justify-center items-start pl-2 gap-2 w-full text-start">
                            <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                {tea?.title}
                            </h1>
                            <span onClick={() => router.push(`homie/${author?._id}`)} className="text-sm text-gray-400 hover:text-gray-300 cursor-pointer">
                                by{" "}
                                <AnimatePresence mode="wait">
                                    {author && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3, ease: "easeOut" }}
                                            className="inline-block"
                                        >
                                            {author?.name}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </span>
                        </div>
                        {tea?.image && (
                            <div className="relative group">
                                <Image 
                                    src={getProfileUrl(tea.image)} 
                                    alt="teaImage"
                                    width={500}
                                    height={500} 
                                    className="w-full h-52 object-cover rounded-lg shadow-md transition-transform duration-300 "
                                />
                            </div>
                        )}

                        <div className="bg-bgPrimary rounded-lg p-5 h-[25vh] overflow-y-auto shadow-inner transition-shadow">
                            <p className="text-md whitespace-pre-wrap text-start">{tea?.content}</p>
                        </div>

                            <div className="bottom-3 text-gray-400 text-sm left-6 absolute flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                <span className="hover:text-gray-300 transition-colors">{0} participants</span>
                            </div>
                            <div>
                                <span className="bottom-3 text-gray-400 text-sm right-6 absolute hover:text-gray-300 transition-colors">
                                    {new Date(tea?.createdAt || "").toLocaleDateString()}
                                </span>
                            </div>
                    </div>
                </div>

                {/* Discussion Container - Add fixed height */}
                <TeaDiscussionReplyThread
                    setShowTeaDiscussion={setShowTeaDiscussion}
                    discussionId={tea?.discussionId || ""}
                    user={user}
                />
            </div>

            {showReportModal && (
                <ReportModal
                    isOpen={showReportModal}
                    onClose={() => setShowReportModal(false)}
                    reportedContentId={selectedTeaId}
                    currentUserId={user?._id || ""}
                    reportType="tea"
                />
            )}
        </>
    )
}