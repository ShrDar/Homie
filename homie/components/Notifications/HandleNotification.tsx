"use client"

import { useState, useEffect } from "react";
import ViewNotifications from "./ViewNotifications";
import { Session } from "next-auth";
import { MdNotifications } from "react-icons/md";
import { usePathname } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore"; // Import Firestore functions
import { db } from "@/config/firebase"; // Import db instance

interface Notification {
  message: string;
  timestamp: any;
  type: string;
  read: boolean;
  shownOnToast: boolean;
}

const handleNotificationBellPositioning = (pathname: string): string => {
  const defaultPosition = "translate-y-[-80px]";
  
  if (pathname === "/") return "translate-y-[-80px]";
  if (pathname.includes("/yap")) return "translate-y-[-55px]";
  if (pathname.includes("/profile")) return "translate-y-[-90px]";
  if (pathname.includes("/homies")) return "translate-y-[-85px]";
  if (pathname.includes("/teas")) return "translate-y-[-65px]";
  if (pathname.includes("/more")) return "translate-y-[-65px]";
  
  return defaultPosition;
};

export default function HandleNotification({ session }: { session: Session }) {
  const pathname = usePathname();
  const [openNotifications, setOpenNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(false); // State for unread status
  const userId = session?.user?.id;

  // Effect to listen for notification changes

  useEffect(() => {
    if (!userId) return;

    const docRef = doc(db, "Notifications", userId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const notifications = data.notifications as Notification[] | undefined;
        // Check if there's any notification with read === false
        const unreadExists = notifications?.some(notification => !notification.read) ?? false;
        setHasUnread(unreadExists);
      } else {
        // Document doesn't exist, so no unread notifications
        setHasUnread(false);
      }
    }, (error) => {
      console.error("Error listening to notifications:", error);
      setHasUnread(false); // Assume no unread on error
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [userId]); 

  if(pathname.includes("admin")) {
    return null;
  }

  return (
    <>
      <div
        className={`hidden md:flex fixed right-7 cursor-pointer ${handleNotificationBellPositioning(pathname)} border-[2px] border-[#666] rounded-full text-[#666] hover:brightness-[2] p-2 transition-all duration-200`} 
        onClick={() => setOpenNotifications(true)}
      >
        <MdNotifications size={18} className="" />
        {hasUnread && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-[#666] ring-1 ring-[#666]" />
        )}
      </div>

      {openNotifications && (
        <ViewNotifications session={session} setOpenNotifications={setOpenNotifications} />
      )}
    </>
  );
}