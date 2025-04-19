"use client"
import { Session } from "next-auth";
import { PiNotificationBold } from "react-icons/pi";
import { PiDevicesBold } from "react-icons/pi";
import { FaRegKeyboard } from "react-icons/fa";
import { useState } from "react"; // Add React state hook
import MoreNotification from "./MoreNotification";
import MoreAppearance from "./MoreAppearance";
import MoreShortcuts from "./MoreShortcuts";

export default function MoreMain( {session} : {session: Session}) {
    const [selectedOption, setSelectedOption] = useState<'notifications' | 'appearance' | 'shortcuts'>('notifications');

    return (
        <div className="w-[80%] lg:w-[40%] lg:h-[40%] border-[2px] border-[#fff] text-[#fff] flex justify-between items-center rounded-[15px] bg-bgSecondary overflow-hidden">
           
            <div className="flex flex-col border-r-[2px] border-[#fff] lg:w-[30%] lg:h-full">
                <div 
                    className={`sideBarItem cursor-pointer flex justify-start items-center gap-2 p-3 ${selectedOption === 'notifications' ? 'bg-bgPrimary' : ''}`}
                    onClick={() => setSelectedOption('notifications')}
                >
                    <PiNotificationBold size={20} />
                    <p>Notifications</p>
                </div>
                <div 
                    className={`sideBarItem cursor-pointer flex justify-start items-center gap-2 p-3 ${selectedOption === 'appearance' ? 'bg-bgPrimary' : ''}`}
                    onClick={() => setSelectedOption('appearance')}
                >
                    <PiDevicesBold size={20} />
                    <p>Appearance</p>
                </div>
                <div 
                    className={`sideBarItem cursor-pointer flex justify-start items-center gap-2 p-3 ${selectedOption === 'shortcuts' ? 'bg-bgPrimary' : ''}`}
                    onClick={() => setSelectedOption('shortcuts')}
                >
                    <FaRegKeyboard size={20} />
                    <p>Shortcuts</p>
                </div>
            </div>

            <div className="selectedContent lg:w-[70%] flex justify-center items-center">
                {selectedOption === 'notifications' && <MoreNotification session={session} />}
                {selectedOption === 'appearance' && <MoreAppearance />}
                {selectedOption === 'shortcuts' && <MoreShortcuts />}
            </div>

        </div>
    )
}