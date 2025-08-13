"use client"
import { Session } from "next-auth";
import { PiNotificationBold } from "react-icons/pi";
import { PiDevicesBold } from "react-icons/pi";
import { FaRegKeyboard } from "react-icons/fa";
import { RiSideBarFill } from "react-icons/ri";
import { useState, useEffect } from "react"; // Added useEffect
import MoreNotification from "./MoreNotification";
import MoreAppearance from "./MoreAppearance";
import MoreShortcuts from "./MoreShortcuts";
import MoreSlideBar from "./MoreSlideBar";
import { TbDoorExit } from "react-icons/tb";
import MoreExit from "./MoreExit";

export default function MoreMain({ session }: { session: Session }) {
    const [selectedOption, setSelectedOption] = useState<'notifications' | 'appearance' | 'shortcuts' | 'slidebar' | 'exit'>('notifications');
    const [isDefaultMode, setIsDefaultMode] = useState(true);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        
        try {
            const savedTheme = window.localStorage.getItem('theme');
            setIsDefaultMode(savedTheme ? savedTheme === 'default' : true);
        } catch (error) {
            console.warn('Failed to access localStorage:', error);
            setIsDefaultMode(true);
        }
    }, []);

    return (
        <div className={`w-[95%] h-[60%] lg:w-[60%] lg:h-[70%] border-[2px] border-[#666] text-[#fff] flex lg:justify-between items-center rounded-[15px] ${isDefaultMode ? 'bg-bgSecondary' : 'bg-gray-100'} overflow-hidden`}>
           
            <div className={`flex flex-col border-r-[2px] border-[#666] lg:w-[30%] h-full`}>
                <div 
                    className={`sideBarItem cursor-pointer flex justify-start items-center gap-2 p-3 py-5 ${
                        selectedOption === 'notifications' 
                        ? (isDefaultMode ? 'bg-bgPrimary' : 'bg-gray-200') 
                        : ''
                    } ${!isDefaultMode ? 'text-gray-600' : ''}`}
                    onClick={() => setSelectedOption('notifications')}
                >
                    <PiNotificationBold size={20} />
                    <p>Notifications</p>
                </div>
                <div 
                    className={`sideBarItem cursor-pointer flex justify-start items-center gap-2 p-3 py-5 ${
                        selectedOption === 'appearance' 
                        ? (isDefaultMode ? 'bg-bgPrimary' : 'bg-gray-200') 
                        : ''
                    } ${!isDefaultMode ? 'text-gray-600' : ''}`}
                    onClick={() => setSelectedOption('appearance')}
                >
                    <PiDevicesBold size={20} />
                    <p>Appearance</p>
                </div>
                <div 
                    className={`sideBarItem cursor-pointer hidden lg:flex justify-start items-center gap-2 p-3 py-5 ${
                        selectedOption === 'slidebar' 
                        ? (isDefaultMode ? 'bg-bgPrimary' : 'bg-blue-100') 
                        : ''
                    } ${!isDefaultMode ? 'text-gray-600' : ''}`}
                    onClick={() => setSelectedOption('slidebar')}
                >
                    <RiSideBarFill size={20} />
                    <p>Slidebar</p>
                </div>
                <div 
                    className={`sideBarItem cursor-pointer hidden lg:flex justify-start items-center gap-2 p-3 py-5 ${
                        selectedOption === 'shortcuts' 
                        ? (isDefaultMode ? 'bg-bgPrimary' : 'bg-blue-100') 
                        : ''
                    } ${!isDefaultMode ? 'text-gray-600' : ''}`}
                    onClick={() => setSelectedOption('shortcuts')}
                >
                    <FaRegKeyboard size={20} />
                    <p>Shortcuts</p>
                </div>
                <div 
                    className={`sideBarItem cursor-pointer flex justify-start items-center gap-2 p-3 py-5 ${
                        selectedOption === 'exit' 
                        ? (isDefaultMode ? 'bg-bgPrimary' : 'bg-blue-100') 
                        : ''
                    } ${!isDefaultMode ? 'text-gray-600' : ''}`}
                    onClick={() => setSelectedOption('exit')}
                >
                    <TbDoorExit size={20} />
                    <p>Exit</p>
                </div>
            </div>

            <div className="selectedContent w-full lg:w-[70%] h-full p-6 flex justify-center items-center">
                {selectedOption === 'notifications' && <MoreNotification session={session} />}
                {selectedOption === 'appearance' && <MoreAppearance />}
                {selectedOption === 'shortcuts' && <MoreShortcuts />}
                {selectedOption === 'slidebar' && <MoreSlideBar session={session} />}
                {selectedOption === 'exit' && <MoreExit />}
            </div>
        </div>
    )
}