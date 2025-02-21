"use client"

import { HomieUser } from "@/homieTypes/homieTypes";
import { Session } from "next-auth"
import { useEffect, useState } from "react"

export default function YapLayoutContent({ session } : {session: Session}) {

    const [user, setUser] = useState<HomieUser>();
    const [homies, setHomies] = useState<HomieUser[]>([]);
    const [homieUsername, setHomieUsername] = useState("");

    const isEqual = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

    useEffect(() => {
        const fetchUserData = async() => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${session?.user?.id}`);
            const fetchedUser = await response.json();
            if(!isEqual(fetchedUser, user)) {
                // console.log('changed user')
                setUser(fetchedUser);
            } else {
                // console.log("no change user");
            }
        }
        const fetchUsers = async() => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users`);
            const users = await response.json();
            if(!isEqual(users, homies)) {
                // console.log('changed homies');
                setHomies(users);
            } else {
                // console.log("no change in homies")
            }
        }
        
        try {
            fetchUserData();
            fetchUsers();
        } catch(err) {
            console.error(err);
        }
    }, [session?.user?.id, homieUsername, homies, user])

    const updateUser = async() => {
        const refetchedResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${user?._id}`);
        const updatedUser = await refetchedResponse.json();
        setUser(updatedUser)
    }

    return (
        <div className="w-[65%] z-[20] flex justify-center items-center gap-2 text-[#fff]">
            <div className="searchHomieYap w-[10%]">
                <input 
                    onChange={(e) => {
                        setHomieUsername(e.target.value)
                    }} 
                    value={homieUsername} 
                    maxLength={30}
                    className={`w-full bg-bgSecondary text-sm text-center p-2 border-2 focus:outline-none selection:bg-[#666] border-transparent focus:border-[#666666] text-[#fff] placeholder:text-[#bbb] rounded-[20px]`}
                    type={"text"}
                    placeholder="username" 
                />
            </div>
            <div className="homieYaps w-[90%] bg-bgSecondary p-2 rounded-[15px]">
                {user?.homies.map((homie) => {
                    const tempHomie = homies.find((newHomie) => newHomie._id === homie)
                    if(tempHomie?.username.includes(homieUsername)) {
                        return (
                            <p key={tempHomie?._id}>{tempHomie?.username}</p>
                        )
                    }
                })}
            </div>
        </div>
    )
}