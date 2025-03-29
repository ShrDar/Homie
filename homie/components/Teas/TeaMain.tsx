"use client"
import { Session } from "next-auth";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import TeaDiscussion from "./TeaDiscussion";
import { Tea, HomieUser } from "@/homieTypes/homieTypes";
import TeaAdd from "./TeaAdd";
// import TextareaAutosize from 'react-textarea-autosize';
import ShimmerLoading from '../Loading/ShimmerLoading';
import { TbCoffee } from "react-icons/tb";
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import Image from "next/image";
import { getProfileUrl } from "@/extra/helpers";
import TeaEdit from "./TeaEdit";

// Add users state near other state declarations
export default function TeaMain({ session }: { session: Session }) {
    const [teas, setTeas] = useState<Tea[]>([]);
    const [users, setUsers] = useState<HomieUser[]>([]);  // Add this line
    const [isLoadingTeas, setIsLoadingTeas] = useState(true);
    const [showTeaDiscussion, setShowTeaDiscussion] = useState(false);
    const [showTeaAdd, setShowTeaAdd] = useState(false);
    const [showTeaEdit, setShowTeaEdit] = useState(false);
    const [currentTea, setCurrentTea] = useState<Tea | null>(null);
    const [isButtonVisible, setIsButtonVisible] = useState(true);
    const [lastActivityTime, setLastActivityTime] = useState(Date.now());
    const [user, setUser] = useState<HomieUser | null>(null);

    // Add this useEffect for fetching user data
    useEffect(() => {
        const fetchUserData = async() => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${session?.user?.id}`);
                const userData = await response.json();
                setUser(userData);
            } catch(err) {
                console.error(err);
            }
        }
        
        const fetchUsersData = async() => {  // Add this function
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users`);
                const usersData = await response.json();
                setUsers(usersData);
            } catch(err) {
                console.error(err);
            }
        }
        
        if (session?.user?.id) {
            fetchUserData();
            fetchUsersData();  // Add this call
        }
    }, [session?.user?.id]);

    useEffect(() => {
        const fetchTeas = async () => {
            try {
                setIsLoadingTeas(true);
                const teasRef = collection(db, "Tea");
                const q = query(teasRef, orderBy("createdAt", "desc"));
                
                // Replace the old fetch with onSnapshot
                const unsubscribe = onSnapshot(q, (querySnapshot) => {
                    const teasData = querySnapshot.docs.map(doc => ({
                        _id: doc.id,
                        ...doc.data(),
                        createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString()
                    })) as Tea[];
                    
                    setTeas(teasData);
                    setIsLoadingTeas(false);
                }, (error) => {
                    console.error("Error fetching teas:", error);
                    setIsLoadingTeas(false);
                });

                // Cleanup subscription on unmount
                return () => unsubscribe();
            } catch (error) {
                console.error("Error fetching teas:", error);
            } finally {
                setIsLoadingTeas(false);
            }
        };

        fetchTeas();
    }, []);

    const handleMovementForAddTea = () => {
        if(!isButtonVisible) {
            setIsButtonVisible(true);
            setLastActivityTime(Date.now());
        }
    }

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const handleMouseMove = () => {
            if(!isButtonVisible) {
                setIsButtonVisible(true);
                setLastActivityTime(Date.now());
            }
        };

        const checkInactivity = () => {
            if (Date.now() - lastActivityTime > 5000) {
                setIsButtonVisible(false);
            }
            timeoutId = setTimeout(checkInactivity, 1000);
        };

        window.addEventListener('mousemove', handleMouseMove);
        timeoutId = setTimeout(checkInactivity, 1000);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            clearTimeout(timeoutId);
        };
    }, [lastActivityTime, isButtonVisible]);

    if(isLoadingTeas) {
        return (
            <ShimmerLoading displayText='Teas Incoming' />
        )
    }

    if(teas.length === 0) {
        return (
            <div className="min-h-screen w-full flex flex-col items-center justify-center gap-6 px-4">
                <div className="w-24 h-24 bg-bgPrimary rounded-full flex items-center justify-center">
                    <TbCoffee className="w-12 h-12 text-fontPrimary opacity-50" />
                </div>
                <div className="text-center">
                    <h2 className="text-fontPrimary text-2xl font-semibold mb-2">No Teas Yet</h2>
                    <p className="text-[#888] max-w-md">Be the first one to brew a conversation with your homies!</p>
                </div>
                <motion.button 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    onClick={() => setShowTeaAdd(true)}
                    className="px-6 py-3 bg-bgSecondary text-fontPrimary rounded-full shadow-lg hover:bg-[#242424] transition-all duration-300 flex items-center gap-2"
                >
                    <TbCoffee className="w-5 h-5" />
                    <span>Brew Tea</span>
                </motion.button>
                {showTeaAdd && <TeaAdd 
                    setShowTeaAdd={setShowTeaAdd} 
                    user={user}
                />}
            </div>
        )
    }

    return (
        <>
            <motion.div 
                className="relative w-full h-full"
                onMouseMove={() => handleMovementForAddTea()}
            >
                <div onScroll={() => handleMovementForAddTea()} className="h-screen w-full overflow-y-auto snap-y snap-mandatory">
                    {isLoadingTeas ? (
                        <div className="flex justify-center items-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
                        </div>
                    ) : (
                        <div>
                            {teas.map((tea) => 
                            {
                                const teaUser = users.find(user => user._id === tea.userId);
                                return (
                                    <motion.div
                                        key={tea._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="snap-start h-screen flex items-center justify-center p-4"
                                        >
                                        <div className="flex items-center justify-center w-[65%] h-full gap-2  rounded-[15px] px-5">
                                            {tea?.image && 
                                                <div onClick={() => {
                                                    setShowTeaDiscussion(true)
                                                    setCurrentTea(tea)
                                                }} className="teaImage h-1/2 p-3 bg-bgSecondary rounded-[15px] hover:brightness-[0.9] transition-all duration-150 cursor-pointer">
                                                    <Image
                                                        src={getProfileUrl(tea?.image || "")}
                                                        alt={tea.title}
                                                        width={300}
                                                        height={300}
                                                        className="h-full object-cover rounded-[15px]"
                                                    />
                                                </div>
                                            }
                                            <div onClick={() => {
                                                setShowTeaDiscussion(true)
                                                setCurrentTea(tea)  
                                            }} className="w-full max-w-3xl h-[50%] bg-bgSecondary cursor-pointer hover:bg-[#3a3a3a] p-8 rounded-xl flex justify-center item-center transition-all relative">
                                                <div className="flex items-center gap-2 absolute top-4 left-4">
                                                    {tea.tags.map((tag, index) => (
                                                        <span key={index} className="px-3 py-1 rounded-full bg-bgPrimary text-sm">
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                                {/* Added creator name */}
                                                <div className="absolute top-4 right-4">
                                                    <span className="text-sm text-gray-400">
                                                        @{teaUser?.username || tea.userId}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col justify-center items-center gap-6">
                                                    <h2 className="text-3xl font-bold">
                                                        {tea.title}
                                                    </h2>
                                                    <p className="text-gray-400 text-lg line-clamp-1">
                                                        {tea.content}
                                                    </p>
                                                </div>
                                                <div className="absolute bottom-4 left-4 text-sm text-gray-400">
                                                    <span className="flex items-center gap-2">
                                                        {
                                                            tea.isOpen ?
                                                            <span className="w-2 h-2 rounded-full bg-green-500"></span> :
                                                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                                        }
                                                        {tea.isOpen ? "Join Tea" : " Tea Closed"}
                                                    </span>
                                                </div>
                                                <div className="absolute bottom-4 right-4 text-sm text-gray-400">
                                                    <span>{new Date(tea.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>

                                        </div>
                                        
                                    </motion.div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </motion.div>

            {
                showTeaDiscussion &&
                <TeaDiscussion
                    setShowTeaDiscussion={setShowTeaDiscussion}
                    tea={currentTea}
                    user={user}
                    setShowTeaEdit={setShowTeaEdit}
                />
            }
            {
                showTeaAdd &&
                <TeaAdd
                    setShowTeaAdd={setShowTeaAdd}
                    user={user}
                />
            }
            {
                showTeaEdit &&
                <TeaEdit
                    setShowTeaEdit={setShowTeaEdit}
                    tea={currentTea}
                    user={user}
                    setShowTeaDiscussion={setShowTeaDiscussion}
                />
            }
            <motion.button 
                initial={{ scale: 0 }}
                animate={{ 
                    scale: isButtonVisible ? 1 : 0,
                }}
                whileHover={{scale: 1.1}}
                whileTap={{scale: 0.9}}
                transition={{ duration: 0.1 , ease: 'linear'}}
                className={`fixed bottom-10 right-12 p-4 bg-bgSecondary text-white rounded-full shadow-lg hover:bg-[#242424] transition-all duration-300 z-50 group ${
                    !isButtonVisible && 'pointer-events-none'
                }`}
                onClick={() => setShowTeaAdd(true)}
            >
                <div className="flex items-center">
                    <TbCoffee className="w-6 h-6" />
                    <span className="w-0 overflow-hidden group-hover:w-16 transition-all duration-300 ease-in-out">
                        Brew
                    </span>
                </div>
            </motion.button>
        </>
    );
}