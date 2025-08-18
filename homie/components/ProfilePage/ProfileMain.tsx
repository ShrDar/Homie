"use client"

import { Session } from "next-auth"
import { Suspense, useEffect, useState } from "react"
import ProfileLoading from "./ProfileLoading";
import ProfileLeft from "./ProfileLeft";
import ProfileRight from "./ProfileRight";
import { MdAdminPanelSettings } from "react-icons/md";
import Link from "next/link";
import { HomieUser } from "@/homieTypes/homieTypes";

export default function ProfileMain({ session }: { session: Session }) {
    const [user, setUser] = useState<HomieUser | null>(null);
    const [isDefaultMode, setIsDefaultMode] = useState(true);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
            const savedTheme = localStorage.getItem('theme');
            setIsDefaultMode(savedTheme ? savedTheme === 'default' : true);
        }
    }, []);

    useEffect(() => {
        const fetchUserData = async() => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${session?.user?.id}`);
            const user = await response.json();
            setUser(user);
        }
        
        try {
            fetchUserData();
        } catch(err) {
            console.error(err);
        }

    }, [session?.user?.id])

    return (
        <>
            <Suspense fallback={<ProfileLoading />}>
                <ProfileLeft user={user} setUser={setUser} />
                <ProfileRight session={session} user={user} setUser={setUser} />
                {
                    user?.role === "ADMIN" &&
                    <Link href={'/admin'}>
                        <div className={`absolute top-5 left-5 md:left-auto md:right-5 border-[2px] ${isDefaultMode ? 'border-[#666] text-[#666] hover:border-[#fff] hover:text-[#fff]' : 'border-gray-400 text-gray-400 hover:border-gray-800 hover:text-gray-800'} transition-all duration-100 p-2 rounded-full cursor-pointer`}>
                            <MdAdminPanelSettings size={20} />
                        </div>
                    </Link>
                }
            </Suspense>
        </>
    )
}