import { Session } from "next-auth";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from '@/config/firebase';

export default function MoreNotification({ session }: { session: Session }) {
    const userId = session.user?.id;
    const [allowNotification, setAllowNotification] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Add loading state
    const [preferences, setPreferences] = useState({
        allowPostNofi: false,
        allowTeasNoti: false,
        allowMessagesNoti: false
    });

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
                    const permission = await Notification.requestPermission();
                    if (permission === 'granted') {
                        await updateFirestore({ allowNoti: true });
                        setAllowNotification(true);
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
        <div className="p-6 w-full">
            <div className="text-center flex flex-col gap-5"> 
                <p className="text-2xl tracking-[1px]">Notifications</p>

                <div className="flex flex-col">
                    <div className="flex items-center justify-between p-4 bg-bgSecondary rounded-lg">
                        <div>
                            <p className="text-fontPrimary">Enable Notifications</p>
                        </div>
                        <motion.div className="flex items-center cursor-pointer">
                            <button
                                onClick={() => handleToggle()}
                                className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                                    allowNotification ? 'bg-green-600' : 'bg-[#1d1d1d]'
                                } ${isLoading ? 'opacity-50' : ''}`}
                                disabled={isLoading}
                            >
                                <motion.div
                                    className="absolute top-1 w-5 h-5 rounded-full bg-white"
                                    animate={{
                                        left: allowNotification ? '1.95rem' : '0.25rem'
                                    }}
                                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                />
                            </button>
                        </motion.div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-bgSecondary rounded-lg">
                        <div>
                            <p className={`text-fontPrimary text-sm ${!allowNotification ? 'opacity-50' : ''}`}>Post Notifications</p>
                        </div>
                        <motion.div className="flex items-center cursor-pointer">
                            <button
                                onClick={() => allowNotification && handleToggle('allowPostNofi')}
                                className={`relative w-10 h-5 rounded-full transition-all duration-300 ${
                                    preferences.allowPostNofi ? 'bg-green-600' : 'bg-[#1d1d1d]'
                                } ${isLoading ? 'opacity-50' : ''} ${!allowNotification ? 'opacity-50 cursor-none' : ''}`}
                                disabled={isLoading || !allowNotification}
                            >
                                <motion.div
                                    className="absolute top-1 w-3 h-3 rounded-full bg-white"
                                    animate={{
                                        left: preferences.allowPostNofi ? '1.5rem' : '0.25rem'
                                    }}
                                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                />
                            </button>
                        </motion.div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-bgSecondary rounded-lg">
                        <div>
                            <p className={`text-fontPrimary text-sm ${!allowNotification ? 'opacity-50' : ''}`}>Tea Reminders</p>
                        </div>
                        <motion.div className="flex items-center cursor-pointer">
                            <button
                                onClick={() => allowNotification && handleToggle('allowTeasNoti')}
                                className={`relative w-10 h-5 rounded-full transition-all duration-300 ${
                                    preferences.allowTeasNoti ? 'bg-green-600' : 'bg-[#1d1d1d]'
                                } ${isLoading ? 'opacity-50' : ''} ${!allowNotification ? 'opacity-50 cursor-none' : ''}`}
                                disabled={isLoading || !allowNotification}
                            >
                                <motion.div
                                    className="absolute top-1 w-3 h-3 rounded-full bg-white"
                                    animate={{
                                        left: preferences.allowTeasNoti ? '1.5rem' : '0.25rem'
                                    }}
                                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                />
                            </button>
                        </motion.div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-bgSecondary rounded-lg">
                        <div>
                            <p className={`text-fontPrimary text-sm ${!allowNotification ? 'opacity-50' : ''}`}>Message Alerts</p>
                        </div>
                        <motion.div className="flex items-center cursor-pointer">
                            <button
                                onClick={() => allowNotification && handleToggle('allowMessagesNoti')}
                                className={`relative w-10 h-5 rounded-full transition-all duration-300 ${
                                    preferences.allowMessagesNoti ? 'bg-green-600' : 'bg-[#1d1d1d]'
                                } ${isLoading ? 'opacity-50' : ''} ${!allowNotification ? 'opacity-50 cursor-none' : ''}`}
                                disabled={isLoading || !allowNotification}
                            >
                                <motion.div
                                    className="absolute top-1 w-3 h-3 rounded-full bg-white"
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