'use client';

import { Session } from "next-auth"
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from '@/config/firebase';
import { motion } from 'framer-motion';
import { createPortal } from "react-dom";
import { RxCross2 } from "react-icons/rx";

interface NotificationData {
  notifications: {
    message: string;
    timestamp: Date;
    type: string;
    read: boolean;
  }[];
  allowNoti: boolean;
}

export default function ViewNotifications({ session, setOpenNotifications }: { session: Session | null | undefined, setOpenNotifications: any }) {
  const userId = session?.user?.id;
  const [notifications, setNotifications] = useState<NotificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!userId) return;

    // Set up real-time listener
    const notificationRef = doc(db, "Notifications", userId);
    const unsubscribe = onSnapshot(notificationRef, (doc) => {
      if (doc.exists()) {
        setNotifications(doc.data() as NotificationData);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching notifications:", error);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [userId]);

  if (!mounted) return null;

  if (loading) {
    return createPortal(
      <div className="fixed top-0 left-0 z-[999] h-screen w-full bg-black bg-opacity-60 backdrop-blur-md flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-400"></div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <>
      <motion.div
        onClick={() => setOpenNotifications(false)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed top-0 left-0 z-[999] h-screen w-full bg-black bg-opacity-60 backdrop-blur-md flex items-center justify-center"
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="fixed w-[90vw] md:w-[60vw] lg:w-[40vw] max-h-[80vh] overflow-y-auto top-[50%] left-[50%] z-[1000] translate-x-[-50%] translate-y-[-50%] bg-bgPrimary rounded-[15px] p-4"
      >
        {!notifications?.notifications?.length ? (
          <div className="text-center py-8 text-[#aaaaaa]">
            No notifications yet
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.notifications.map((notification, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg ${
                  notification.read ? 'bg-bgSecondary/50' : 'bg-bgSecondary'
                }`}
              >
                <p className="text-fontPrimary">{notification.message}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-[#aaaaaa]">
                    {new Date(notification.timestamp).toLocaleDateString()}
                  </span>
                  <span className={`text-sm ${notification.read ? 'text-[#aaaaaa]' : 'text-blue-400'}`}>
                    {notification.read ? 'Read' : 'New'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        <motion.div 
          whileHover={{scale: 1.2}}
          whileTap={{scale: 0.9}}
          className="absolute cross rounded-full bg-bgSecondary border-[2px] border-red-500 right-2 top-2 cursor-pointer drop-shadow-[1px_10px_10px_#000]"
          onClick={() => setOpenNotifications(false)}
        >
          <RxCross2 size={20} className="text-red-500 p-1" />
        </motion.div>
      </motion.div>
    </>,
    document.body
  );
}