
'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import Image from 'next/image';
import { Session } from 'next-auth';
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from '@/config/firebase';

export default function Onboarding({ session }: { session: Session | null }) {
    const userId = session?.user?.id;
    const [currentStep, setCurrentStep] = useState(0); 
    const [isClient, setIsClient] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [allowNotification, setAllowNotification] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const WelcomeStep = () => (
        <div className="text-center flex flex-col justify-center items-center gap-2">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-4"
            >
                <Image 
                    src="/logo/Homie-2.svg" 
                    alt="Homie Logo" 
                    className="w-24 h-24 mx-auto" 
                    width={200}
                    height={200}
                />
            </motion.div>
            <h2 className="text-2xl font-semibold text-fontPrimary">Welcome to Homie</h2>
            <p className="text-[#aaaaaa]">Shall we get Started?</p>
        </div>
    );
    
    const ShortcutsStep = () => (
        <div className="text-center flex flex-col justify-center items-center gap-3">
            <h2 className="text-2xl font-semibold text-fontPrimary">Quick Shortcuts</h2>
            <p className="text-[#AAAAAA] mb-4">
                Use <kbd className="px-2 py-1.5 text-xs font-semibold text-fontPrimary bg-bgSecondary border border-[#666666] rounded-lg">Ctrl</kbd> + <kbd className="px-2 py-1.5 text-xs font-semibold text-fontPrimary bg-bgSecondary border border-[#666666] rounded-lg">Q</kbd> to quickly sign out.
            </p>
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="p-3 bg-bgSecondary rounded-lg w-full"
            >
                <p className="text-sm text-[#AAAAAA]">Try it now!</p>
            </motion.div>
        </div>
    );
    
    useEffect(() => {
        if (isClient && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            setAllowNotification(true);
        }
    }, [isClient]);

    const NotificationsStep = () => {
        const handleToggle = async () => {
            if (!allowNotification) {
                if (typeof window !== 'undefined' && 'Notification' in window) {
                    const permission = await Notification.requestPermission();
                    if (permission === 'granted') {
                        setAllowNotification(true);
                    } else {
                        setAllowNotification(false);
                    }
                } else {
                    console.log("This browser does not support notifications");
                    setAllowNotification(false);
                }
            } else {
                setAllowNotification(false);
            }
        };

        return (
            <div className="text-center flex flex-col justify-center items-center gap-5">
                <h2 className="text-2xl font-semibold text-fontPrimary">Notifications</h2>
                <p className="text-[#aaa]">Stay updated with notifications</p>
                <div>
                    <motion.div 
                        className="flex items-center cursor-pointer"
                        // whileTap={{ scale: 0.95 }}
                        // transition={{ type: "spring", stiffness: 200}}
                    >
                        <button
                            onClick={handleToggle}
                            className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                                allowNotification ? 'bg-bgSecondary' : 'bg-[#1d1d1d]'
                            }`}
                        >
                            <motion.div
                                className="absolute top-1 w-5 h-5 rounded-full bg-fontPrimary"
                                animate={{
                                    left: allowNotification ? '1.95rem' : '0.25rem'
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                            />
                        </button>
                        <span className="ms-3 text-sm font-medium text-fontPrimary">{allowNotification ? 'Enabled ✔' : 'Disabled ❌'}</span>
                    </motion.div>
                </div>
            </div>
        );
    };
    
    const stepsContent = [
        {
            component: WelcomeStep
        },
        {
            component: ShortcutsStep
        },
        {
            component: NotificationsStep
        }
    ];

    const totalSteps = stepsContent.length;
    
    useEffect(() => {
        const checkOnboardingStatus = async () => {
            if (!userId) return;

            try {
                const userNotificationDoc = doc(db, "Notifications", userId);
                
                // Set up real-time listener
                const unsubscribe = onSnapshot(userNotificationDoc, (docSnap) => {
                    if (!docSnap.exists()) {
                        // Create initial document if it doesn't exist
                        setDoc(userNotificationDoc, {
                            userId,
                            allowNoti: false,
                            hasCompletedOnboarding: false,
                            preferences: {
                                allowPostNofi: false,
                                allowTeasNoti: false,
                                allowMessagesNoti: false
                            },
                            notifications: [],
                            createdAt: new Date(),
                            updatedAt: new Date()
                        });
                        setShowOnboarding(true);
                    } else {
                        const data = docSnap.data();
                        if (!data.hasCompletedOnboarding) {
                            setShowOnboarding(true);
                            setAllowNotification(data.allowNoti || false);
                        } else {
                            setShowOnboarding(false);
                        }
                    }
                }, (error) => {
                    console.error("Error listening to onboarding status:", error);
                    setShowOnboarding(false);
                });

                // Cleanup subscription on unmount
                return () => unsubscribe();
            } catch (error) {
                console.error("Error checking onboarding status:", error);
                setShowOnboarding(false);
            }
        };

        setIsClient(true);
        if (userId) {
            checkOnboardingStatus();
        }
    }, [userId]);

    const handleNext = async () => {
        if (currentStep < totalSteps - 1) { 
            setCurrentStep(currentStep + 1);
        } else if (currentStep === totalSteps - 1) { 
            setIsSubmitting(true);
            try {
                if (userId) {
                    await setDoc(doc(db, "Notifications", userId), {
                        userId,
                        allowNoti: allowNotification,
                        hasCompletedOnboarding: true,
                        preferences: {
                            allowPostNofi: allowNotification,
                            allowTeasNoti: allowNotification,
                            allowMessagesNoti: allowNotification
                        },
                        notifications: [],
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }, { merge: true });
                }
            } catch (error) {
                console.error("Error saving notification preferences:", error);
            } finally {
                setIsSubmitting(false);
            }
            
            setShowOnboarding(false);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const renderStepContent = () => {
        const step = stepsContent[currentStep];
        if (!step) return null;
        const StepComponent = step.component;
        return <StepComponent />;
    };

    // Render only on the client-side and when showOnboarding is true
    if (!isClient || !showOnboarding) return null;

    return createPortal(
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }} // Add exit animation
                transition={{ duration: 0.2 }}
                className="fixed top-0 left-0 z-[300] h-screen w-full bg-black bg-opacity-60 backdrop-blur-md flex items-center justify-center"
            />
            <div className="fixed top-0 left-0 z-[301] flex flex-col items-center justify-center min-h-screen w-full p-4 sulphur">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }} // Add exit animation
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-lg bg-bgPrimary rounded-xl shadow-xl p-8 text-fontPrimary"
                >
                    {/* Progress Bar */}
                    <div className="mb-6">
                        <div className="relative pt-1">
                            <div className="overflow-hidden h-2.5 mb-4 text-xs flex rounded-full bg-gray-700">
                                <div style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-gray-400 to-gray-500 rounded-full transition-all duration-500 ease-out"></div>
                            </div>
                            <p className="text-center text-sm text-[#aaaaaa] mt-2">{currentStep + 1} of {totalSteps}</p>
                        </div>
                    </div>

                    <div className="mb-8 min-h-[180px] flex items-center justify-center px-4">
                        {renderStepContent()}
                    </div>

                    <div className="flex justify-between items-center"> {/* Changed to justify-between */}
                        <button
                            onClick={handleBack}
                            disabled={currentStep === 0}
                            className={`px-6 py-2.5 rounded-lg font-medium text-[#aaaaaa] border border-[#666666] hover:bg-bgSecondary hover:text-fontPrimary transition-colors duration-200 ${currentStep === 0 ? 'opacity-50 cursor-none' : ''}`}
                        >
                            Back
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={isSubmitting}
                            className={`px-6 py-2.5 rounded-lg border-[2px] border-bgSecondary font-medium text-[#fff] transition-colors duration-200 ${
                                currentStep === totalSteps - 1 ? 'bg-bgSecondary hover:bg-bgPrimary' : 'bg-bgSecondary hover:bg-bgPrimary'
                            }`}
                        >
                            {isSubmitting ? 'Finishing...' : (currentStep === totalSteps - 1 ? 'Finish' : 'Next')}
                        </button>
                    </div>
                </motion.div>
            </div>
        </>,
        document.body
    );
}