"use client"
import Image from "next/image";
import { useState, useEffect } from 'react';

export default function YapMain() {
    const [isDefaultMode, setIsDefaultMode] = useState(true);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
            const savedTheme = localStorage.getItem('theme');
            setIsDefaultMode(savedTheme ? savedTheme === 'default' : true);
        }
    }, []);

    return (
        <div className={`w-full ${isDefaultMode ? 'bg-bgSecondary' : 'bg-gray-200 border border-gray-300 rounded-[20px] '} h-[75dvh] rounded-[15px] flex flex-col justify-center lg:justify-start lg:pt-[120px] items-center`}>
            <div className={`${isDefaultMode? "" : "invert-[1]"}`}>
                <Image 
                    src={`/figmaIcons/startYapping.svg`}
                    alt=""
                    height={150}
                    width={150}
                    className="w-[40vw] md:w-[25vw] lg:w-[16vw] opacity-[0.6]"
                />
            </div>
            <div>
                <p className={`text-4xl ${isDefaultMode ? 'text-[#a5a5a5]' : 'text-gray-600'} tracking-[6px]`}>
                    Start Yapping
                </p>
            </div>
        </div>
    )
}