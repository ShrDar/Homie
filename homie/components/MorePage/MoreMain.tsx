"use client"
import { Session } from "next-auth";
import { PiNotificationBold } from "react-icons/pi";
import { PiDevicesBold } from "react-icons/pi";
import { FaRegKeyboard } from "react-icons/fa";
import { RiSideBarFill } from "react-icons/ri";
import { useState } from "react"; // Add React state hook
import MoreNotification from "./MoreNotification";
import MoreAppearance from "./MoreAppearance";
import MoreShortcuts from "./MoreShortcuts";
import MoreSlideBar from "./MoreSlideBar";

export default function MoreMain( {session} : {session: Session}) {
    const [selectedOption, setSelectedOption] = useState<'notifications' | 'appearance' | 'shortcuts' | 'slidebar'>('notifications');

    return (
        <div className="w-[80%] lg:w-[60%] lg:h-[70%] border-[2px] border-[#666] text-[#fff] flex justify-between items-center rounded-[15px] bg-bgSecondary overflow-hidden">
           
            <div className="flex flex-col border-r-[2px] border-[#666] lg:w-[30%] lg:h-full">
                <div 
                    className={`sideBarItem cursor-pointer flex justify-start items-center gap-2 p-3 py-5 ${selectedOption === 'notifications' ? 'bg-bgPrimary' : ''}`}
                    onClick={() => setSelectedOption('notifications')}
                >
                    <PiNotificationBold size={20} />
                    <p>Notifications</p>
                </div>
                <div 
                    className={`sideBarItem cursor-pointer flex justify-start items-center gap-2 p-3 py-5 ${selectedOption === 'appearance' ? 'bg-bgPrimary' : ''}`}
                    onClick={() => setSelectedOption('appearance')}
                >
                    <PiDevicesBold size={20} />
                    <p>Appearance</p>
                </div>
                <div 
                    className={`sideBarItem cursor-pointer flex justify-start items-center gap-2 p-3 py-5 ${selectedOption === 'slidebar' ? 'bg-bgPrimary' : ''}`}
                    onClick={() => setSelectedOption('slidebar')}
                >
                    <RiSideBarFill size={20} />
                    <p>Slidebar</p>
                </div>
                <div 
                    className={`sideBarItem cursor-pointer flex justify-start items-center gap-2 p-3 py-5 ${selectedOption === 'shortcuts' ? 'bg-bgPrimary' : ''}`}
                    onClick={() => setSelectedOption('shortcuts')}
                >
                    <FaRegKeyboard size={20} />
                    <p>Shortcuts</p>
                </div>
            </div>

            <div className="selectedContent lg:w-[70%] h-full p-6 flex justify-center items-center">
                {selectedOption === 'notifications' && <MoreNotification session={session} />}
                {selectedOption === 'appearance' && <MoreAppearance />}
                {selectedOption === 'shortcuts' && <MoreShortcuts />}
                {selectedOption === 'slidebar' && <MoreSlideBar session={session} />}
            </div>

        </div>
    )
}