'use client';

import { Session } from "next-auth";
import { useEffect, useState } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Notification {
  message: string;
  timestamp: any;
  type: string;
  read: boolean;
  shownOnToast: boolean;
  postId?: string;
  userId?: string;
  yapId?: string;
  teaId?: string;
}

interface NotificationPreferences {
  allowMessagesNoti: boolean;
  allowPostNofi: boolean;
  allowTeasNoti: boolean;
}

export default function ListenNotifications({ session }: { session: Session | null | undefined }) {
  const userId = session?.user?.id;
  const router = useRouter();
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");

  // Handle notification permission separately
  useEffect(() => {
    const checkNotificationPermission = async () => {
      try {
        if (!("Notification" in window)) {
          console.log("This browser does not support notifications");
          return;
        }

        // Check current permission
        if (Notification.permission === "granted") {
          setNotificationPermission("granted");
        } else {
          const permission = await Notification.requestPermission();
          setNotificationPermission(permission);
        }
      } catch (error) {
        console.error("Error requesting notification permission:", error);
      }
    };

    checkNotificationPermission();
  }, []);

  // Handle Firestore notifications
  useEffect(() => {
    if (!userId) return;

    const userDocRef = doc(db, "Notifications", userId);
    const unsubscribe = onSnapshot(userDocRef, async (docSnapshot) => {
      const data = docSnapshot.data();
      if (!data || !data.notifications || !Array.isArray(data.notifications)) return;

      // Check if notifications are allowed globally
      const allowNoti = data.allowNoti ?? false;
      if (!allowNoti) return;

      // Get notification preferences
      const preferences: NotificationPreferences = data.preferences || {
        allowMessagesNoti: false,
        allowPostNofi: false,
        allowTeasNoti: false
      };

      const notifications = data.notifications as Notification[];
      const latestUnshownIndex = notifications.findIndex(
        (notification) => !notification.read && !notification.shownOnToast
      );

      if (latestUnshownIndex === -1) return;

      const latestNotification = notifications[latestUnshownIndex];

      // Check if this type of notification is allowed
      let isNotificationAllowed = false;
      switch (latestNotification.type) {
        case 'message':
          isNotificationAllowed = preferences.allowMessagesNoti;
          break;
        case 'post':
          isNotificationAllowed = preferences.allowPostNofi;
          break;
        case 'tea':
          isNotificationAllowed = preferences.allowTeasNoti;
          break;
        default:
          isNotificationAllowed = false;
      }

      if (!isNotificationAllowed) return;

      // Function to handle navigation based on notification type
      const handleNavigation = () => {
        switch (latestNotification.type) {
          case 'message':
            router.push(`/yap/${latestNotification.yapId}`);
            break;
          case 'post':
            router.push(`/posts/${latestNotification.userId}`);
            break;
          case 'tea':
            router.push(`/teas/${latestNotification.userId}`);
            break;
        }
      };

      // Show toast notification with click handler based on type
      toast(latestNotification.message, {
        className: "bg-bgPrimary text-fontPrimary border-[1px] border-[#666]",
        duration: 3000,
        action: {
          label: <span className="text-sm sulphur tracking-[2px]">View</span>,
          onClick: () => {
            handleNavigation();
          },
        }
      });

      // Show browser notification if permitted and notifications are allowed
      if (notificationPermission === "granted") {
        try {
          const notification = new Notification("Homie", {
            body: latestNotification.message,
            icon: "/logo/Homie-2.svg",
            tag: 'homie-notification',
          });
          notification.onclick = () => {
            window.focus();
            handleNavigation();
          }
        } catch (error) {
          console.error("Error showing browser notification:", error);
        }
      }

      // Update the shownOnToast flag in Firestore
      try {
        const updatedNotifications = notifications.map((notification, index) => {
          if (index === latestUnshownIndex) {
            return { ...notification, shownOnToast: true };
          }
          return notification;
        });

        await updateDoc(userDocRef, {
          notifications: updatedNotifications,
        });
      } catch (error) {
        console.error("Error updating notification shownOnToast status:", error);
      }
    }, (error) => {
      console.error("Error listening to notifications:", error);
    });

    return () => unsubscribe();
  }, [userId, notificationPermission, router]); // Add router to dependencies

  return null;
}