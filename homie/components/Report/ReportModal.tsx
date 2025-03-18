'use client';

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";  
import { toast } from "sonner";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/config/firebase";

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    reportedUserId: string;
    currentUserId: string;
}

export default function ReportModal({ isOpen, onClose, reportedUserId, currentUserId }: ReportModalProps) {
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const [canShowModal, setCanShowModal] = useState(false);

    useEffect(() => {
        let isActive = true; 

        const checkExistingReport = async () => {
            if (!isOpen) {
                setCanShowModal(false);
                return;
            }
            
            setIsChecking(true);
            try {
                const reportsRef = collection(db, "Reports");
                const querySnapshot = await getDocs(
                    query(reportsRef, 
                        where("reporterId", "==", currentUserId),
                        where("reportedUserId", "==", reportedUserId)
                    )
                );

                if (!querySnapshot.empty && isActive) { // Check if component is still mounted
                    toast.error("You have already reported this user", {
                        style: {
                            backgroundColor: "#2a2a2a",
                            color: "#fff",
                            borderColor: "#FF6F6F"
                        }
                    });
                    onClose();
                } else if (isActive) {
                    setCanShowModal(true);
                }
            } catch (error) {
                if (isActive) {
                    console.error("Error checking existing report:", error);
                    onClose();
                }
            } finally {
                if (isActive) {
                    setIsChecking(false);
                }
            }
        };

        checkExistingReport();

        // Cleanup function
        return () => {
            isActive = false;
        };
    }, [isOpen, currentUserId, reportedUserId, onClose]);

    const handleSubmit = async () => {
        if (!reason.trim()) {
            toast.error("Please provide a reason for the report", {
                style: {
                    backgroundColor: "#2a2a2a",
                    color: "#fff",
                    borderColor: "#FF6F6F"
                }
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, "Reports"), {
                reportType: "user",
                reporterId: currentUserId,
                reportedUserId: reportedUserId,
                reason: reason.trim(),
                createdAt: new Date().toISOString()
            });

            toast.success("Report submitted successfully", {
                style: {
                    backgroundColor: "#2a2a2a",
                    color: "#fff"
                }
            });
            onClose();
        } catch (error) {
            console.error("Error submitting report:", error);
            toast.error("Failed to submit report", {
                style: {
                    backgroundColor: "#2a2a2a",
                    color: "#fff",
                    borderColor: "#FF6F6F"
                }
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
            <AnimatePresence>
                {isOpen && isChecking && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-bgSecondary rounded-[15px] p-6"
                        >
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fontPrimary"></div>
                                <span className="ml-3 text-fontPrimary">Checking report status...</span>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
                {isOpen && canShowModal && !isChecking && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                        >
                        </motion.div>

                        <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="fixed z-[100] lg:w-[32%] translate-x-[-50%] translate-y-[-50%] bg-bgSecondary rounded-[15px] p-6"
                    >
                        <h2 className="text-2xl text-center font-bold text-fontPrimary mb-4">Report User</h2>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Please describe the reason for reporting..."
                            className="w-full h-32 p-3 rounded-lg bg-bgPrimary text-fontPrimary border-[2px] border-transparent selection:bg-bgSecondary focus:outline-none focus:border-[#888] resize-none"
                        />
                        <div className="flex justify-center items-center gap-3 mt-4">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 w-full rounded-lg bg-bgPrimary text-fontPrimary hover:brightness-90"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="px-4 py-2 w-full rounded-lg bg-bgPrimary text-red-400 hover:brightness-90 disabled:opacity-50"
                            >
                                {isSubmitting ? "Submitting..." : "Submit Report"}
                            </button>
                        </div>
                        </motion.div>
                    </>

                )}
                    
            </AnimatePresence>
    );
}