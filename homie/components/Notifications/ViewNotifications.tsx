'use client';

import { Session } from "next-auth"
import { useEffect, useState } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from '@/config/firebase';
import { motion } from 'motion/react';
import { createPortal } from "react-dom";
import { Timestamp } from "firebase/firestore"; // Add this import at the top
import { IoRemoveCircleOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";

interface NotificationData {
  notifications: {
    message: string;
    timestamp: Timestamp; // Changed from Date to Timestamp
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
  const router = useRouter(); // Add this line
  const [isDefaultMode, setIsDefaultMode] = useState(true);

  // Add this useEffect near other useEffect hooks
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setIsDefaultMode(savedTheme ? savedTheme === 'default' : true);
  }, []);

  
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

  const markAllAsRead = async () => {
    if (!userId || !notifications) return;

    try {
      const updatedNotifications = notifications.notifications.map(notification => ({
        ...notification,
        read: true
      }));

      const notificationRef = doc(db, "Notifications", userId);
      await updateDoc(notificationRef, {
        notifications: updatedNotifications
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const markAsRead = async (index: number) => {
    if (!userId || !notifications) return;

    try {
      const updatedNotifications = [...notifications.notifications];
      updatedNotifications[index] = {
        ...updatedNotifications[index],
        read: true
      };

      const notificationRef = doc(db, "Notifications", userId);
      await updateDoc(notificationRef, {
        notifications: updatedNotifications
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleNotificationClick = (notification: any, index: any) => {
    if (!notification.read) {
      markAsRead(index);
    }
    
    switch (notification.type) {
      case 'message':
        router.push(`/yap/${notification.yapId}`);
        break;
      case 'post':
        router.push(`/posts/${notification.userId}`);
        break;
      case 'tea':
        router.push(`/teas/${notification.userId}`);
        break;
    }
    setOpenNotifications(false);
  };


  const deleteNotification = async (index: number) => {
    if (!userId || !notifications) return;
  
    try {
      const updatedNotifications = [...notifications.notifications];
      updatedNotifications.splice(index, 1);
  
      const notificationRef = doc(db, "Notifications", userId);
      await updateDoc(notificationRef, {
        notifications: updatedNotifications
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const deleteAllNotifications = async () => {
    if (!userId || !notifications) return;
  
    try {
      const notificationRef = doc(db, "Notifications", userId);
      await updateDoc(notificationRef, {
        notifications: []
      });
    } catch (error) {
      console.error("Error deleting all notifications:", error);
    }
  };

  // Update the notification rendering part
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
        className={`fixed w-[90vw] md:w-[60vw] sulphur lg:w-[40vw] max-h-[60vh] overflow-y-auto top-[50%] left-[50%] z-[1000] translate-x-[-50%] translate-y-[-50%] ${
          isDefaultMode ? 'bg-bgPrimary' : 'bg-white'
        } rounded-[15px] p-4 min-h-[60vh] flex flex-col`}
      >
        <div className="flex justify-between items-center my-3">
          <p className={`text-[#fff] text-lg ml-2 ${
            !isDefaultMode && 'text-gray-800'
          }`}>Notifications</p>
          {notifications?.notifications && notifications.notifications.length > 0 && (
            <div className="flex gap-2">
              {notifications.notifications.some(n => !n.read) && (
                <button
                  onClick={markAllAsRead}
                  className={`text-xs ${
                    isDefaultMode ? 'text-[#fff]' : 'text-gray-800'
                  } transition-colors p-2 rounded-md ${
                    isDefaultMode ? 'bg-bgSecondary' : 'bg-gray-100'
                  } hover:brightness-[0.8]`}
                >
                  Mark all Read
                </button>
              )}
              <button
                onClick={deleteAllNotifications}
                className="text-xs text-red-400 transition-colors p-2 rounded-md bg-bgSecondary hover:brightness-[0.8]"
              >
                Remove All
              </button>
            </div>
          )}
        </div>
        {!notifications?.notifications?.length ? (
          <div className="flex-1 flex items-center justify-center text-center text-[#aaaaaa]">
            No notifications yet 😅
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.notifications.map((notification, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.1 }}
                className={`p-4 rounded-lg cursor-pointer relative ${
                  notification.read ? 
                    (isDefaultMode ? 'bg-bgSecondary/50' : 'bg-gray-100/50') : 
                    (isDefaultMode ? 'bg-bgSecondary' : 'bg-gray-100')
                } ${
                  isDefaultMode ? 
                  'hover:bg-bgSecondary/80 border-bgSecondary' : 
                  'hover:bg-gray-100/80 border-gray-200'
                } transition-all duration-300 border`}
                onClick={() => handleNotificationClick(notification, index)}
              >
                <div className="flex flex-col gap-2">
                  <p className="text-fontPrimary text-base leading-relaxed">{notification.message}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-[#aaaaaa]">
                      {(() => {
                        const notificationDate = notification.timestamp.toDate();
                        const now = new Date();
                        const daysDiff = (now.getTime() - notificationDate.getTime()) / (1000 * 60 * 60 * 24);
                        
                        return daysDiff >= 7 
                          ? notificationDate.toLocaleDateString([], { 
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: 'numeric',
                              hour12: true
                            })
                          : notificationDate.toLocaleDateString([], { 
                              weekday: 'short',
                              hour: 'numeric',
                              minute: 'numeric',
                              hour12: true 
                            });
                      })()}
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(index);
                        }}
                        className="text-sm text-red-400 transition-all duration-100 rounded-full absolute top-[-5px] right-[-5px] hover:scale-[1.3]"
                      >
                        <IoRemoveCircleOutline size={16} />
                      </button>
                      <span className={`text-sm px-2 py-0.5 rounded-full ${
                        notification.read 
                          ? 'text-[#aaaaaa] bg-[#aaaaaa]/10' 
                          : 'text-[#fff] bg-bgPrimary'
                      }`}>
                        {notification.read ? 'Read' : 'New'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </>,
    document.body
  );
}