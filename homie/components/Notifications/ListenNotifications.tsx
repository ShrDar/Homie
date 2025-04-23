'use client';

import { Session } from "next-auth";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/config/firebase";
import { toast } from "sonner";

interface Notification {
  message: string;
  timestamp: any; // This will handle Firestore Timestamp
  type: string;
  read: boolean;
}

export default function ListenNotifications({ session }: { session: Session | null | undefined }) {
  const userId = session?.user?.id;
  const [lastNotificationTime, setLastNotificationTime] = useState<Date | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Check if notifications are permitted
    const checkNotificationPermission = async () => {
      try {
        // Check if the browser supports notifications
        if (!("Notification" in window)) {
          console.log("This browser does not support notifications");
          return;
        }

        // Request permission if not granted
        if (Notification.permission !== "granted") {
          const permission = await Notification.requestPermission();
          if (permission !== "granted") {
            console.log("Notification permission denied");
            return;
          }
        }
      } catch (error) {
        console.error("Error requesting notification permission:", error);
      }
    };
    checkNotificationPermission();

    // Listen to real-time notifications
    const unsubscribe = onSnapshot(doc(db, "Notifications", userId), (doc) => {
      const data = doc.data();
      if (!data || !data.notifications) return;

      // Get the latest notification
      const latestNotification = data.notifications[0] as Notification;
      
      if (!latestNotification) return;

      // Convert Firestore timestamp to Date object
      const notificationTime = latestNotification.timestamp?.toDate();

      // Only show notification if it's newer than the last one we've seen
      if (!lastNotificationTime || notificationTime > lastNotificationTime) {
        // Show toast notification
        toast(latestNotification.message, {
          className: "bg-bgPrimary text-fontPrimary border-[1px] border-[#666]",
          duration: 3000,
        });

        // Show browser notification if permitted
        if (Notification.permission === "granted") {
          try {
            const notification = new Notification("Homie", {
              body: latestNotification.message,
              icon: "/logo/Homie-2.svg",
              tag: 'homie-notification', // Prevents duplicate notifications
            });

            // Auto close after 5 seconds
            setTimeout(() => notification.close(), 5000);
          } catch (error) {
            console.error("Error showing browser notification:", error);
          }
        }

        // Update the last notification time
        setLastNotificationTime(notificationTime);
      }
    }, (error) => {
      console.error("Error listening to notifications:", error);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [userId, lastNotificationTime]);

  // This component doesn't render anything visible
  return null;
}