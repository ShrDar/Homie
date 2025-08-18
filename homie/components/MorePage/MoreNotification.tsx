import { Session } from "next-auth";
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from '@/config/firebase';

export default function MoreNotification({ session }: { session: Session }) {
    const userId = session.user?.id;
    const [allowNotification, setAllowNotification] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isDefaultMode, setIsDefaultMode] = useState(true);
    const [preferences, setPreferences] = useState({
        allowPostNofi: false,
        allowTeasNoti: false,
        allowMessagesNoti: false
    });

    useEffect(() => {
        if (typeof window === 'undefined' || !window.localStorage) return;

        
        try {
            const savedTheme = window.localStorage.getItem('theme');
            setIsDefaultMode(savedTheme ? savedTheme === 'default' : true);
        } catch (error) {
            console.warn('Failed to access localStorage:', error);
            setIsDefaultMode(true);
        }
    }, []);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!userId) return; // Add null check
            
            const docRef = doc(db, "Notifications", userId!);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setAllowNotification(data.allowNoti);
                setPreferences(data.preferences);
            }
        };
        fetchNotifications();
    }, [userId]);

    const handleToggle = async (type?: keyof typeof preferences) => {
        if (isLoading) return; // Prevent multiple clicks while loading
        setIsLoading(true);
        try {
            if (!type) {
                // Main notification toggle
                if (!allowNotification) {
                    if (typeof window !== 'undefined' && 'Notification' in window) {
                        const permission = await Notification.requestPermission();
                        if (permission === 'granted') {
                            await updateFirestore({ allowNoti: true });
                            setAllowNotification(true);
                        }
                    } else {
                        console.log("This browser does not support notifications");
                    }
                } else {
                    await updateFirestore({ allowNoti: false });
                    setAllowNotification(false);
                }
            } else {
                // Preference toggle
                const newPreferences = { ...preferences, [type]: !preferences[type] };
                await updateFirestore({ preferences: newPreferences });
                setPreferences(newPreferences);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const updateFirestore = async (data: object) => {
        if (!userId) return; // Add null check
        try {
            await setDoc(doc(db, "Notifications", userId), {
                userId,
                ...data,
                updatedAt: new Date()
            }, { merge: true });
        } catch (error) {
            console.error("Error updating notifications:", error);
        }
    };

    return (
        <div className="w-full flex justify-center items-start h-full">
            <div className="flex flex-col gap-5 w-full"> 
                <p className={`text-2xl text-center tracking-[1px] ${!isDefaultMode ? 'text-gray-600' : 'text-fontPrimary'}`}>
                    Notifications
                </p>

                <div className="flex flex-col">
                    <div className={`flex items-center justify-between p-4 ${isDefaultMode ? 'bg-bgSecondary' : ''} rounded-lg`}>
                        <div>
                            <p className={`${!isDefaultMode ? 'text-gray-600' : 'text-fontPrimary'}`}>Enable Notifications</p>
                        </div>
                        <motion.div className="flex items-center cursor-pointer">
                            <button
                                onClick={() => handleToggle()}
                                className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                                    allowNotification 
                                        ? (isDefaultMode ? 'bg-bgPrimary' : 'bg-blue-500') 
                                        : (isDefaultMode ? 'bg-[#3a3a3a]' : 'bg-gray-300')
                                } ${isLoading ? 'opacity-50' : ''}`}
                                disabled={isLoading}
                            >
                                <motion.div
                                    className={`absolute top-1 w-5 h-5 rounded-full ${isDefaultMode ? 'bg-fontPrimary' : 'bg-white'}`}
                                    animate={{
                                        left: allowNotification ? '1.95rem' : '0.25rem'
                                    }}
                                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                />
                            </button>
                        </motion.div>
                    </div>

                    <div className={`flex items-center justify-between p-4 ${isDefaultMode ? 'bg-bgSecondary' : ''} rounded-lg`}>
                        <div>
                            <p className={`text-sm ${!allowNotification ? 'opacity-50' : ''} ${!isDefaultMode ? 'text-gray-600' : 'text-fontPrimary'}`}>Post Notifications</p>
                        </div>
                        <motion.div className="flex items-center cursor-pointer">
                            <button
                                onClick={() => allowNotification && handleToggle('allowPostNofi')}
                                className={`relative w-10 h-5 rounded-full transition-all duration-300 ${
                                    preferences.allowPostNofi 
                                        ? (isDefaultMode ? 'bg-bgPrimary' : 'bg-blue-500') 
                                        : (isDefaultMode ? 'bg-[#3a3a3a]' : 'bg-gray-300')
                                } ${isLoading ? 'opacity-50' : ''} ${!allowNotification ? 'opacity-50 cursor-none' : ''}`}
                                disabled={isLoading || !allowNotification}
                            >
                                <motion.div
                                    className={`absolute top-1 w-3 h-3 rounded-full ${isDefaultMode ? 'bg-fontPrimary' : 'bg-white'}`}
                                    animate={{
                                        left: preferences.allowPostNofi ? '1.5rem' : '0.25rem'
                                    }}
                                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                />
                            </button>
                        </motion.div>
                    </div>

                    <div className={`flex items-center justify-between p-4 ${isDefaultMode ? 'bg-bgSecondary' : ''} rounded-lg`}>
                        <div>
                            <p className={`text-sm ${!allowNotification ? 'opacity-50' : ''} ${!isDefaultMode ? 'text-gray-600' : 'text-fontPrimary'}`}>Tea Reminders</p>
                        </div>
                        <motion.div className="flex items-center cursor-pointer">
                            <button
                                onClick={() => allowNotification && handleToggle('allowTeasNoti')}
                                className={`relative w-10 h-5 rounded-full transition-all duration-300 ${
                                    preferences.allowTeasNoti 
                                        ? (isDefaultMode ? 'bg-bgPrimary' : 'bg-blue-500') 
                                        : (isDefaultMode ? 'bg-[#3a3a3a]' : 'bg-gray-300')
                                } ${isLoading ? 'opacity-50' : ''} ${!allowNotification ? 'opacity-50 cursor-none' : ''}`}
                                disabled={isLoading || !allowNotification}
                            >
                                <motion.div
                                    className={`absolute top-1 w-3 h-3 rounded-full ${isDefaultMode ? 'bg-fontPrimary' : 'bg-white'}`}
                                    animate={{
                                        left: preferences.allowTeasNoti ? '1.5rem' : '0.25rem'
                                    }}
                                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                />
                            </button>
                        </motion.div>
                    </div>

                    <div className={`flex items-center justify-between p-4 ${isDefaultMode ? 'bg-bgSecondary' : ''} rounded-lg`}>
                        <div>
                            <p className={`text-sm ${!allowNotification ? 'opacity-50' : ''} ${!isDefaultMode ? 'text-gray-600' : 'text-fontPrimary'}`}>Yap Notifications</p>
                        </div>
                        <motion.div className="flex items-center cursor-pointer">
                            <button
                                onClick={() => allowNotification && handleToggle('allowMessagesNoti')}
                                className={`relative w-10 h-5 rounded-full transition-all duration-300 ${
                                    preferences.allowMessagesNoti 
                                        ? (isDefaultMode ? 'bg-bgPrimary' : 'bg-blue-500') 
                                        : (isDefaultMode ? 'bg-[#3a3a3a]' : 'bg-gray-300')
                                } ${isLoading ? 'opacity-50' : ''} ${!allowNotification ? 'opacity-50 cursor-none' : ''}`}
                                disabled={isLoading || !allowNotification}
                            >
                                <motion.div
                                    className={`absolute top-1 w-3 h-3 rounded-full ${isDefaultMode ? 'bg-fontPrimary' : 'bg-white'}`}
                                    animate={{
                                        left: preferences.allowMessagesNoti ? '1.5rem' : '0.25rem'
                                    }}
                                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                />
                            </button>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}