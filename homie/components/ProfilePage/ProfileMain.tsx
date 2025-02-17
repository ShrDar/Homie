"use client"

import { Session } from "next-auth"
import { Suspense, useEffect, useState } from "react"
import ProfileLoading from "./ProfileLoading";
import ProfileLeft from "./ProfileLeft";
import ProfileRight from "./ProfileRight";

export default function ProfileMain({ session }: { session: Session }) {
    const [user, setUser] = useState({username: "", bio: ""});

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
            </Suspense>
        </>
    )
}