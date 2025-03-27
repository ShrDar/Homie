"use client"
import { Session } from "next-auth";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import TeaDiscussion from "./TeaDiscussion";
import { Tea, HomieUser } from "@/homieTypes/homieTypes";
import TeaAdd from "./TeaAdd";
// import TextareaAutosize from 'react-textarea-autosize';
import { TbCoffee } from "react-icons/tb";
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';

// Add users state near other state declarations
export default function TeaMain({ session }: { session: Session }) {
    const [teas, setTeas] = useState<Tea[]>([]);
    const [users, setUsers] = useState<HomieUser[]>([]);  // Add this line
    const [isLoadingTeas, setIsLoadingTeas] = useState(true);
    const [showTeaDiscussion, setShowTeaDiscussion] = useState(false);
    const [showTeaAdd, setShowTeaAdd] = useState(false);
    const [currentTea, setCurrentTea] = useState<Tea | null>(null);
    const [isButtonVisible, setIsButtonVisible] = useState(true);
    const [lastActivityTime, setLastActivityTime] = useState(Date.now());
    // Add this new state
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
                const querySnapshot = await getDocs(q);
                
                const teasData = querySnapshot.docs.map(doc => ({
                    _id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString()
                })) as Tea[];

                setTeas(teasData);
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
                                        <div onClick={() => {
                                            setShowTeaDiscussion(true)
                                            setCurrentTea(tea)  
                                        }} className="w-full max-w-3xl h-[50%] bg-bgSecondary cursor-pointer hover:bg-[#3a3a3a] p-8 rounded-xl border flex justify-center item-center transition-all relative">
                                            <div className="flex items-center gap-2 absolute top-4 left-4">
                                                {tea.tags.map((tag, index) => (
                                                    <span key={index} className="px-3 py-1 rounded-full bg-primary/10 text-sm">
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
                                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                    {2} participants
                                                </span>
                                            </div>
                                            <div className="absolute bottom-4 right-4 text-sm text-gray-400">
                                                <span>{new Date(tea.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="discussionInput">

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
                    tea = {currentTea}
                />
            }
            {
                showTeaAdd &&
                <TeaAdd
                    setShowTeaAdd={setShowTeaAdd}
                    user={user}
                    setTeas={setTeas}
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