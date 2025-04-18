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
                        <div className="absolute top-5 left-5 md:left-auto md:right-5 border-[2px] border-[#666] text-[#666] hover:border-[#fff] hover:text-[#fff] transition-all duration-100 p-2 rounded-full cursor-pointer">
                            <MdAdminPanelSettings size={20} />
                        </div>
                    </Link>
                }
            </Suspense>
        </>
    )
}