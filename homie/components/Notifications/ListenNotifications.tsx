'use client';

import { Session } from "next-auth";
import { useEffect } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore"; // Import updateDoc and getDoc
import { db } from "@/config/firebase";
import { toast } from "sonner";

interface Notification {
  message: string;
  timestamp: any; // This will handle Firestore Timestamp
  type: string;
  read: boolean;
  shownOnToast: boolean;
}

export default function ListenNotifications({ session }: { session: Session | null | undefined }) {
  const userId = session?.user?.id;
  // Remove lastNotificationTime state
  // const [lastNotificationTime, setLastNotificationTime] = useState<Date | null>(null);

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
    const userDocRef = doc(db, "Notifications", userId); // Define userDocRef
    const unsubscribe = onSnapshot(userDocRef, async (docSnapshot) => { // Make callback async
      const data = docSnapshot.data();
      if (!data || !data.notifications || !Array.isArray(data.notifications)) return;

      const notifications = data.notifications as Notification[];

      // Find the index of the latest notification that hasn't been read or shown on toast
      const latestUnshownIndex = notifications.findIndex(
        (notification) => !notification.read && !notification.shownOnToast
      );

      if (latestUnshownIndex === -1) return; // No new unshown notifications

      const latestNotification = notifications[latestUnshownIndex];

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
          // You might want to add an onclick handler here to mark as read or navigate
        } catch (error) {
          console.error("Error showing browser notification:", error);
        }
      }

      // --- Update the shownOnToast flag in Firestore ---
      try {
        // Create a deep copy of the notifications array to modify
        const updatedNotifications = notifications.map((notification, index) => {
          if (index === latestUnshownIndex) {
            return { ...notification, shownOnToast: true };
          }
          return notification;
        });

        // Update the document in Firestore
        await updateDoc(userDocRef, {
          notifications: updatedNotifications,
        });
      } catch (error) {
        console.error("Error updating notification shownOnToast status:", error);
        // Handle potential errors during the update
      }
      // --- End of update ---

    }, (error) => {
      console.error("Error listening to notifications:", error);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [userId]); // Remove lastNotificationTime from dependencies

  // This component doesn't render anything visible
  return null;
}