'use client';

import { getProfileUrl } from "@/extra/helpers";
import { HomieUser } from "@/homieTypes/homieTypes";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { addDoc, collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from "@/config/firebase";
import { FiWatch } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import { RiMessage3Fill } from "react-icons/ri";
import { toast } from "sonner";
import { CiMenuKebab } from "react-icons/ci";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import ReportModal from "@/components/Report/ReportModal";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";

export default function HomieIndividual() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const [user, setUser] = useState<HomieUser | null>(null);
    const [currentUser, setCurrentUser] = useState<HomieUser | null>(null);
    const [error, setError] = useState(false);
    const [showHomies, setShowHomies] = useState(false);
    const [homiesData, setHomiesData] = useState<any[]>([]);
    const [isCreatingChat, setIsCreatingChat] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // Fetch viewed user
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${params.id}`);
                if (!response.ok) {
                    throw new Error("User not found");
                }
                const userData = await response.json();
                setUser(userData);

                // Fetch current user
                if (session?.user?.id) {
                    const currentUserResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${session.user.id}`);
                    const currentUserData = await currentUserResponse.json();
                    setCurrentUser(currentUserData);
                }

                // Fetch homies data if user has homies
                if (userData.homies && userData.homies.length > 0) {
                    const homiesPromises = userData.homies.map((homieId: string) =>
                        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${homieId}`)
                            .then(res => res.json())
                    );
                    const homiesResults = await Promise.all(homiesPromises);
                    setHomiesData(homiesResults);
                }
            } catch (error) {
                console.log(error);
                setError(true);
            }
        };

        fetchUsers();
    }, [params.id, session?.user?.id]);

    const createChat = async () => {
        if (!user?._id || !currentUser) return;
        
        setIsCreatingChat(true);
        try {
            const messagesRef = collection(db, "Yap");
            const q = query(messagesRef, where("participants", "array-contains", currentUser._id));
        
            const querySnapshot = await getDocs(q);
            let existingYapId = null;
            
            if (!querySnapshot.empty) {
                for (const doc of querySnapshot.docs) {
                    const data = doc.data();
                    if (data.participants.includes(user._id)) {
                        existingYapId = data.yapId;
                        break;
                    }
                }
            }

            if (existingYapId) {
                router.push(`/yap/${existingYapId}`);
            } else {
                const newMessageDoc = await addDoc(collection(db, "Yap"), {
                    yapId: "",
                    participants: [currentUser._id, user._id],
                    createdAt: new Date().toISOString(),
                    yapContent: "",
                    reaction: {
                        [currentUser._id]: "",
                        [user._id]: "",
                    },
                    status: "sent",
                    mediaUrl: "",
                });

                const messageId = newMessageDoc.id;
                
                await updateDoc(doc(db, "Yap", messageId), {
                    yapId: messageId,
                });

                await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/yaps/${currentUser._id}/add-yap`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ 
                        yapId: messageId, 
                        participants: [currentUser._id, user._id] 
                    }),
                });

                router.push(`/yap/${messageId}`);
            }
        } catch (error) {
            console.error("Error creating chat:", error);
        } finally {
            setIsCreatingChat(false);
        }
    };

    // Add this before the final return statement
    const isHomie = currentUser?.homies?.includes(user?._id || "");
    const hasSentRequest = currentUser?.homieSentRequests?.includes(user?._id || "");
    const hasReceivedRequest = currentUser?.homieRequests?.includes(user?._id || "");

    const sendHomieRequest = async () => {
        if (!currentUser?._id || !user?._id) return;
        try {
            await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/homies/${currentUser._id}/homie-request/${user._id}`, {
                method: 'POST'
            });
            // Refresh current user data to update UI
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${currentUser._id}`);
            const userData = await response.json();
            setCurrentUser(userData);
        } catch (error) {
            console.error("Error sending homie request:", error);
        }
    };

    const updateUser = async() => {
        if (!currentUser?._id) return;
        const refetchedResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${currentUser._id}`);
        const updatedUser = await refetchedResponse.json();
        setCurrentUser(updatedUser);
    };

    const handleRemoveFriend = async(homie?: HomieUser) => {
        if (!currentUser?._id || !homie?._id) return;
        
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/homies/${currentUser._id}/remove-homie/${homie._id}`, {
                method: "DELETE",
            });
            if(response.ok) {
                toast.success(`${homie?.username} is not your homie`, {
                    icon: '❎',
                    style: {
                        backgroundColor: "#2a2a2a",
                        color: "#fff"
                    }
                });
                await updateUser();
            }
        } catch(err) {
            console.error(err);
        }
    };

    const handleAcceptBefriend = async(homie: HomieUser) => {
        if (!currentUser?._id || !homie?._id) return;
        
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/homies/${currentUser._id}/accept-request/${homie._id}`, {
                method: "POST",
            });
            if(response.ok) {
                toast.success(`${homie.username} is your homie`, {
                    icon: '🤝🏻',
                    style: {
                        backgroundColor: "#2a2a2a",
                        color: "#fff"
                    }
                });
                await updateUser();
            }
        } catch(err) {
            console.error(err);
        }
    };

    const handleRequestReject = async(homie: HomieUser) => {
        if (!currentUser?._id || !homie?._id) return;
        
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/homies/${currentUser._id}/reject-request/${homie._id}`, {
                method: "POST",
            });
            if(response.ok) {
                toast.success(`Befriend request to ${homie?.username} Rejected`, {
                    icon: '✖',
                    style: {
                        backgroundColor: "#2a2a2a",
                        color: "#fff",
                        borderColor: "#FF6F6F"
                    }
                });
                await updateUser();
            }
        } catch(err) {
            console.error(err);
        }
    };

    const handlePendingRevoke = async(homie: HomieUser) => {
        if (!currentUser?._id || !homie?._id) return;
        
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/homies/${currentUser._id}/remove-homie-sent-request/${homie._id}`, {
                method: "DELETE",
            });
            if(response.ok) {
                toast.success(`Befriend request sent to ${homie?.username} Removed`, {
                    icon: '✖',
                    style: {
                        backgroundColor: "#2a2a2a",
                        color: "#fff",
                        borderColor: "#FF6F6F"
                    }
                });
                await updateUser();
            }
        } catch(err) {
            console.error(err);
        }
    };

    if (error || !user) {
        return (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col sulphur items-center justify-center min-h-screen text-fontPrimary text-3xl"
            >
                {error ? "No Such Homie" : "Loading..."}
            </motion.div>
        );
    }

    return (
        <div className="sulphur bg-bgSecondary-100 w-full min-h-[100dvh] flex justify-center items-center gap-6 text-fontPrimary p-4">
            {/* Add ReportModal at the top level of the return statement */}
            
            {showReportModal && (
                <ReportModal 
                    isOpen={showReportModal}
                    onClose={() => setShowReportModal(false)}
                    reportedUserId={user?._id || ""}
                    currentUserId={currentUser?._id || session?.user?.id || ""}
                    reportType="user"
                />
            )}

            <motion.div 
                layout="position"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                    layout: { duration: 0.6, type: "spring", bounce: 0.2 },
                    opacity: { duration: 0.3 }
                }}
                className="w-[80%] md:w-[50%] lg:w-[30%] flex flex-col bg-[#434343ae] backdrop-blur-sm border-[2px] border-[#888] justify-start md:justify-center items-center gap-4 py-5 px-2 rounded-[15px]"
            >
                {currentUser && currentUser._id !== user?._id && (
                    <div className="absolute top-4 right-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger className="outline-none">
                                <div className="p-2 hover:bg-[#ffffff20] rounded-full transition-all duration-150">
                                    <CiMenuKebab size={20} />
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-bgSecondary border-[1px] border-[#888] text-fontPrimary p-2 rounded-lg">
                                {isHomie && (
                                    <DropdownMenuItem
                                        onClick={() => handleRemoveFriend(user)}
                                        className="cursor-pointer px-4 py-2 hover:bg-bgPrimary rounded-lg transition-all duration-150 flex items-center gap-2"
                                    >
                                        <span className="text-sm sulphur">Remove</span>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                    onClick={() => {
                                        setShowReportModal(true);
                                    }}
                                    className="cursor-pointer px-4 py-2 hover:bg-bgPrimary rounded-lg transition-all duration-150 flex items-center gap-2"
                                >
                                    <span className="text-sm sulphur">Report</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}

                <div className="flex flex-col justify-center items-center gap-3 w-full">
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="capitalize text-4xl tracking-[2px] px-5 font-thin"
                    >
                        {user?.name}
                    </motion.p>
                    <motion.div 
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="rounded-full overflow-hidden bg-bgSecondary border-[3px] border-[#888]"
                    >
                        <Image 
                            width={400}
                            height={400}
                            alt="profilePic"
                            src={getProfileUrl(user?.image || "")}
                            className="w-[30vw] md:w-[20vw] lg:w-[150px] rounded-full aspect-square object-cover"
                        />
                    </motion.div>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-sm tracking-[3px] text-[#aaa]"
                    >
                        @{user?.username}
                    </motion.p>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-2xl jim tracking-[2px] text-center px-4"
                    >
                        {user?.bio}
                    </motion.p>
                </div>

     
                <div className="w-[85%] bg-bgSecondary border-[2px] border-[#888] rounded-[15px] p-5 flex flex-col justify-center items-center gap-6">
                    <div className="profileStatsContainer w-full flex flex-col justify-center items-center gap-4">
                        <motion.div 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowHomies(!showHomies)}
                            className="profileStat w-full flex justify-center lg:justify-between items-center border-[2px] border-[#888] text-center bg-bgPrimary rounded-[15px] px-2 lg:px-6 py-4 gap-4 cursor-pointer"
                        >
                            <p className="font-bold">HOMIES</p>
                            <div className="justify-center items-center hidden lg:flex">
                                <Image src="/figmaIcons/squiggly.svg" className="w-[90%]" alt="squiggly" width={100} height={100} />
                            </div>
                            <p className="lg:hidden"> - </p>
                            <p>{user?.homies?.length || 0}</p>
                        </motion.div>
                        <div className="profileStat w-full flex justify-center lg:justify-between items-center border-[2px] border-[#888] text-center bg-bgPrimary rounded-[15px] px-2 lg:px-6 py-4 gap-4">
                            <p>POSTS</p>
                            <div className="justify-center items-center hidden lg:flex">
                                <Image src="/figmaIcons/squiggly.svg" className="w-[90%]" alt="squiggly" width={100} height={100} />
                            </div>
                            <p className="lg:hidden"> - </p>
                            <p>{0}</p>
                        </div>
                        <div className="profileStat w-full flex justify-center lg:justify-between items-center border-[2px] border-[#888] text-center bg-bgPrimary rounded-[15px] px-2 lg:px-6 py-4 gap-4">
                            <p>TEAS</p>
                            <div className="justify-center items-center hidden lg:flex">
                                <Image src="/figmaIcons/squiggly.svg" className="w-[90%]" alt="squiggly" width={100} height={100} />
                            </div>
                            <p className="lg:hidden"> - </p>
                            <p>{0}</p>
                        </div>
                    </div>
                </div>

                {/* Add relationship status and actions */}
                {currentUser && currentUser._id !== user?._id && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="w-[85%] flex justify-between items-center gap-4 bg-transparent rounded-[15px]"
                    >
                        {isHomie ? (
                            <>
                                <div className="bg-bgPrimary w-full transition-all duration-150 md:min-w-[130px] border-[2px] border-[#888] z-[12] px-5 py-2 rounded-[15px] flex justify-center items-center text-center gap-2 h-full">
                                    {/* <Image src="/slideBarIcons/homies.svg" className="w-8" alt="" width={100} height={100} /> */}
                                    <p className="flex">Homies</p>
                                </div>
                                <div className="flex items-center gap-3 w-full">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={createChat}
                                        disabled={isCreatingChat}
                                        className="bg-bgPrimary w-full flex justify-center items-center gap-2 hover:bg-[#1b1b1b] transition-all duration-150 px-5 py-2 rounded-[15px] border-[2px] border-[#888]"
                                    >
                                        <RiMessage3Fill size={20} color="#aaa"/>
                                        <span>{isCreatingChat ? "Opening..." : "Yap"}</span>
                                    </motion.button>
                                </div>
                            </>
                        ) : hasSentRequest ? (
                            <div className="w-full flex justify-between items-center gap-2">
                                <div className="bg-bgPrimary w-full  cursor-none transition-all duration-150 md:min-w-[130px] border-[2px] border-[#888] z-[12] px-5 py-2 rounded-[15px] flex justify-center items-center gap-2 h-full">
                                    <p className="hidden md:flex">Pending</p>
                                    <div>
                                        <FiWatch size={25} className="animate-pulse " />
                                    </div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => user && handlePendingRevoke(user)}
                                    className="rejectRequest cursor-pointer bg-bgPrimary border-[2px] border-[#888] transition-all duration-150 hover:border-[#FF6F6F] p-2 rounded-full"
                                >
                                    <RxCross2 size={18} color="#FF6F6F" />
                                </motion.button>
                            </div>
                        ) : hasReceivedRequest ? (
                            <div className="w-full flex justify-between items-center">
                                <p className="text-blue-400 text-lg flex items-center gap-2">
                                    <FiWatch size={20} />
                                    Request Received
                                </p>
                                <div className="flex items-center gap-2">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => user && handleAcceptBefriend(user)}
                                        className="bg-bgPrimary md:min-w-[130px] cursor-pointer hover:brightness-[1.2] transition-all duration-150 border-[2px] border-transparent hover:border-[#666666] px-5 py-2 rounded-[15px] flex justify-center items-center gap-2"
                                    >
                                        <span>Accept</span>
                                        <Image 
                                            src="/slideBarIcons/homies.svg"
                                            alt="addHomieImage"
                                            width={25}
                                            height={25}
                                            className="w-[25px]"
                                        />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => user && handleRequestReject(user)}
                                        className="rejectRequest cursor-pointer bg-bgPrimary border-[1.5px] border-transparent transition-all duration-150 hover:border-[#FF6F6F] p-2 rounded-full"
                                    >
                                        <RxCross2 size={12} color="#FF6F6F" />
                                    </motion.button>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full flex justify-between items-center">
            
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={sendHomieRequest}
                                    className="bg-bgPrimary md:min-w-[130px] w-full cursor-pointer hover:brightness-[1.2] transition-all duration-150 border-[2px] border-[#888] hover:border-[#666666] px-5 py-2 rounded-[15px] flex justify-center items-center gap-2"
                                >
                                    <span className="text-sm hidden md:flex">Befriend</span>
                                    <Image 
                                        src="/figmaIcons/befriend.svg"
                                        alt="addHomieImage"
                                        width={25}
                                        height={25}
                                        className="w-[25px]"
                                    />
                                </motion.button>
                            </div>
                        )}
                    </motion.div>
                )}

              
            </motion.div>
            <AnimatePresence mode="popLayout">
                {showHomies && (
                    <motion.div 
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        transition={{ 
                            type: "spring", 
                            stiffness: 200, 
                            damping: 20,
                            duration: 0.6
                        }}
                        className="hidden lg:flex w-[400px] h-[600px] bg-[#434343ae] backdrop-blur-sm border-[2px] border-[#888] rounded-[15px] p-4 flex-col gap-4"
                    >
                        <div className="flex flex-col gap-3 h-full">
                            {homiesData.length > 0 ? (
                                homiesData.map((homie, index) => (
                                    <motion.div 
                                        onClick={() => router.push(`/homie/${homie._id}`)}
                                        key={homie._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        whileHover={{ scale: 1.02 }}
                                        className="flex items-center gap-3 bg-bgPrimary p-3 rounded-lg cursor-pointer"
                                    >
                                        <Image 
                                            src={getProfileUrl(homie.image || "")}
                                            alt={homie.name}
                                            width={50}
                                            height={50}
                                            className="rounded-full w-[50px] h-[50px] object-cover"
                                        />
                                        <div>
                                            <p className="font-bold">{homie.name}</p>
                                            <p className="text-sm text-[#aaa]">@{homie.username}</p>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-[#aaa] text-lg">No homies yet</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
