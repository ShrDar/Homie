"use client"

import { TextShimmerWave } from "@/components/ui/text-shimmer-wave";
import { useEffect, useState } from "react";

export default function Loading() {
    const [isDefaultMode, setIsDefaultMode] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isMounted && typeof window !== 'undefined' && window.localStorage) {
            const savedTheme = localStorage.getItem('theme');
            setIsDefaultMode(savedTheme ? savedTheme === 'default' : true);
        }
    }, [isMounted]);

    if (!isMounted) return null;

    return (
        <div className={`h-screen w-screen flex items-center text-4xl justify-center ${isDefaultMode ? 'bg-bgPrimary text-fontPrimary' : 'bg-gray-100 text-gray-800'} sulphur tracking-[4px]`}>
            <TextShimmerWave
                className={`${isDefaultMode ? '[--base-color:#bbb] [--base-gradient-color:#2a2a2a]' : '[--base-color:#666] [--base-gradient-color:#999]'}`}
                duration={1.3}
                spread={1}
                zDistance={1}
                scaleDistance={1.1}
                rotateYDistance={20}
            >Hang On . . .</TextShimmerWave>
        </div>
    )
}
