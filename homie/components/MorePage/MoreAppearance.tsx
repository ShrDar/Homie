import { FiSun } from "react-icons/fi";
import { FiMoon } from "react-icons/fi";
import { useState } from "react";

export default function MoreAppearance() {
    const [isDefaultMode, setIsDefaultMode] = useState(true);

    return (
        <div className="flex gap-4 p-4">
            <div 
                className={`flex-1 p-4 rounded-lg cursor-pointer flex flex-col items-center justify-center gap-2 transition-all ${
                    isDefaultMode ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100 hover:bg-gray-200'
                }`}
                onClick={() => setIsDefaultMode(true)}
            >
                <FiMoon className="text-2xl" />
                <span className="font-medium">Default Mode</span>
            </div>
            
            <div 
                className={`flex-1 p-4 rounded-lg cursor-pointer flex flex-col items-center justify-center gap-2 transition-all ${
                    !isDefaultMode ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100 hover:bg-gray-200'
                }`}
                onClick={() => setIsDefaultMode(false)}
            >
                <FiSun className="text-2xl" />
                <span className="font-medium">Light Mode</span>
            </div>
        </div>
    )
}