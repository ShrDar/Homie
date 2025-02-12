"use client"
import Image from "next/image";
import { Session } from "next-auth";
import { useEffect, useState } from "react";

export default function ProfileLeft({ session }: { session: Session }) {
    const [user, setUser] = useState<any>(null);

    const fetchUserData = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${session?.user?.id}`);
            if (response.ok) {
                const updatedUser = await response.json();
                setUser(updatedUser); 
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    useEffect(() => {
        fetchUserData(); 

        const interval = setInterval(fetchUserData, 5000); 

        return () => clearInterval(interval);
    }, [session?.user?.id]); 

    if (!user) {
        return (
            <div className="profileLeftContainer w-[90%] lg:w-[35%] flex flex-col justify-center items-center gap-6">
                <div>Loading...</div>
            </div>
        );
    }
    return (
        <div className="profileLeftContainer w-[90%] lg:w-[35%] flex flex-col justify-center items-center gap-6">
            <div className="upperBlockContainer w-full flex flex-col justify-center items-center gap-2">
                <div className="profileImageContainer w-[40%] lg:w-[50%] bg-bgSecondary flex justify-center items-center rounded-full p-6">
                    <div className="w-full rounded-full overflow-hidden p-3">
                        <Image src={session?.user?.image || "/logo/googlePlain.png"}
                        alt="profile" 
                        width={100} 
                        height={100}
                        className="w-[100%] h-[100%]"
                        />
                    </div>
                </div>
                <p>@{user.username}</p>
            </div>
            <div className="lowerBlockContainer w-full bg-bgSecondary rounded-[15px] px-8 py-10 flex flex-col justify-center items-center gap-6">
                <div className="bioContainer text-center">
                    <p>Hello this is bio</p>
                </div>
                <div className="profileStatsContainer w-full flex lg:flex-col justify-center items-center gap-4">
                    <div className="profileStat w-full flex justify-center lg:justify-between items-center text-center bg-bgPrimary rounded-[15px] px-2 lg:px-6 py-4 gap-2 lg:gap-0">
                        <p>HOMIES</p>
                        <div className="justify-center items-center hidden lg:flex">
                            <Image src="/figmaIcons/squiggly.svg" className="w-[100%]" alt="squiggly" width={100} height={100} />
                        </div>
                        <p className="lg:hidden"> - </p>
                        <p>{10}</p>
                    </div>
                    <div className="profileStat w-full flex justify-center lg:justify-between items-center text-center bg-bgPrimary rounded-[15px] px-2 lg:px-6 py-4 gap-2 lg:gap-0">
                        <p>POSTS</p>
                        <div className="justify-center items-center hidden lg:flex">
                            <Image src="/figmaIcons/squiggly.svg" className="w-[100%]" alt="squiggly" width={100} height={100} />
                        </div>
                        <p className="lg:hidden"> - </p>
                        <p>{5}</p>
                    </div>
                    <div className="profileStat w-full flex justify-center lg:justify-between items-center text-center bg-bgPrimary rounded-[15px] px-2 lg:px-6 py-4 gap-2 lg:gap-0">
                        <p>TEAS</p>
                        <div className="justify-center items-center hidden lg:flex">
                            <Image src="/figmaIcons/squiggly.svg" className="w-[100%]" alt="squiggly" width={100} height={100} />
                        </div>
                        <p className="lg:hidden"> - </p>
                        <p>{2}</p>
                    </div>
    
                    
                </div>
            </div>
        </div>
    )
}