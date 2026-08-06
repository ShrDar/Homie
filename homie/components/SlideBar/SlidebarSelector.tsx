"use client"

import { useEffect, useState } from 'react';
import SlideBarHorizental from './SlideBarHorizental';
import SlideBarNormie from './SlideBarNormie';
import { Session } from 'next-auth';

export default function SidebarSelector({ session }: { session: Session | null | undefined }) {
    const [sidebarType, setSidebarType] = useState<'normie' | 'horizontal'>('horizontal');
    const [isMounted, setIsMounted] = useState(false); 

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isMounted && typeof window !== 'undefined' && window.localStorage) {
            const savedPreference = localStorage.getItem('sidebarType');
            if (!savedPreference) {
                localStorage.setItem('sidebarType', 'normie'); 
            } else if (savedPreference === 'horizontal' || savedPreference === 'normie') {
                setSidebarType(savedPreference);
            }
        }
    }, [isMounted]);

    if (!session) return null;

    return sidebarType === 'normie' 
        ? <SlideBarNormie session={session} /> 
        : <SlideBarHorizental />;
}
