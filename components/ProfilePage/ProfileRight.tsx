"use client";

import { Session } from "next-auth";
import { useState } from "react";

type ProfileRightProps = {
    session: Session
}

export default function ProfileRight({ session }: ProfileRightProps) {
    // Split the full name into first and last name
    const [dbFirstName, dbLastName] = session.user?.name?.split(' ') || ['', ''];
    const [firstName, setFirstName] = useState(dbFirstName);
    const [lastName, setLastName] = useState(dbLastName);
    const [newPassword, setNewPassword] = useState("hello123");
    const [username, setUsername] = useState("google");

    return (
        <div className="profileRightContainer bg-bgSecondary rounded-[15px] px-16 py-16 z-10 w-[65%] flex flex-col justify-center items-center gap-10">
            <p className="text-fontPrimary text-5xl font-thin">{session?.user?.name}</p>
            <div className="flex gap-4 w-full">
                <div className="w-1/2">
                    <input 
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full bg-bgPrimary border-2 border-transparent focus:border-[#2a2a2a] focus:outline-none text-fontPrimary px-6 py-3 rounded-[6px]"
                        placeholder="First Name"
                    />
                </div>
                <div className="w-1/2">
                    <input 
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full bg-bgPrimary border-2 border-transparent focus:border-[#2a2a2a] focus:outline-none text-fontPrimary px-6 py-3 rounded-[6px]"
                        placeholder="Last Name"
                    />
                </div>
            </div>
            <div className="w-full">
                <input type="text" placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-bgPrimary border-2 border-transparent focus:border-[#2a2a2a] focus:outline-none text-fontPrimary px-6 py-3 rounded-[6px]" />
            </div>
            <div className="w-full">
                <input type="text" placeholder="new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-bgPrimary border-2 border-transparent focus:border-[#2a2a2a] focus:outline-none text-fontPrimary px-6 py-3 rounded-[6px]" />
            </div>
            <div className="w-full flex justify-center items-center gap-4">
                <div className="w-full bg-bgPrimary px-6 py-3 rounded-[6px] flex justify-center items-center cursor-pointer">
                    <p className="text-[#FF6F6F] text-xl">Discard</p>
                </div>
                <div className="w-full bg-bgPrimary px-6 py-3 rounded-[6px] flex justify-center items-center cursor-pointer">
                    <p className="text-[#5FB972] text-xl">Transform</p>
                </div>

            </div>
        </div>
    )
}
