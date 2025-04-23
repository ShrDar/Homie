"use client"

import { useEffect, useState } from 'react';
import SlideBarHorizental from './SlideBarHorizental';
import SlideBarNormie from './SlideBarNormie';
import { Session } from 'next-auth';

export default function SidebarSelector({ session }: { session: Session | null | undefined }) {
    const [sidebarType, setSidebarType] = useState<'normie' | 'horizontal'>('normie');

    useEffect(() => {
        const savedPreference = localStorage.getItem('sidebarType');
        if (!savedPreference) {
            localStorage.setItem('sidebarType', 'normie'); // Set default value
        } else if (savedPreference === 'horizontal' || savedPreference === 'normie') {
            setSidebarType(savedPreference);
        }
    }, []);

    if (!session) return null;

    return sidebarType === 'normie' 
        ? <SlideBarNormie session={session} /> 
        : <SlideBarHorizental />;
}