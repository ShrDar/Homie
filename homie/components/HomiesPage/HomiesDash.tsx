"use client"

import { Session } from "next-auth";
import { useEffect, useState } from "react"
import { motion } from "motion/react";
import Image from "next/image";
import { HomieUser } from "@/homieTypes/homieTypes";
import { getProfileUrl } from "@/extra/helpers";
import { toast } from "sonner";
import { FiWatch } from "react-icons/fi";

export default function HomiesDash({session} : {session: Session}) {

    const [user, setUser] = useState<HomieUser>();
    const [homies, setHomies] = useState<HomieUser[]>([]); //all users
    const [homieUsername, setHomieUsername] = useState("");
    const [backdrop, setBackdrop] = useState(false);
    const [userHomieRequests, setUserHomieRequests] = useState<string[]>();
    const [userHomies, setUserHomies] = useState<HomieUser[]>([]); //friends of user 

    useEffect(() => {
            const fetchUserData = async() => {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${session?.user?.id}`);
                const user = await response.json();
                setUser(user);
            }
            const fetchUsers = async() => {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users`);
                const users = await response.json();
                setHomies(users);
            }
            const fetchFriendRequests = async() => {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/homies/${session?.user?.id}/homies`);
                const friendRequests = await response.json();
                setUserHomieRequests(friendRequests)
            }
            const fetchFriends = async() => {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/homies/${session?.user?.id}/homie-requests`);
                const userFriends = await response.json();
                setUserHomies(userFriends)
            }
            
            try {
                fetchUserData();
                fetchUsers();
                fetchFriendRequests();
                fetchFriends()
            } catch(err) {
                console.error(err);
            }
    }, [session?.user?.id])


    const handleBackDrop = (username: string) => {
        if(username === "") {
            setBackdrop(false);
        } else {
            setBackdrop(true)
        }
    }

    const handleBefriend = async (homie: HomieUser) => {
        const homieId = homie._id;
        
        try {

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/homies/${session?.user?.id}/homie-request/${homieId}`, {
                method: "POST",
            });
            if(response.ok) {
                const refetchedResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${user?._id}`);
                const updatedUser = await refetchedResponse.json();
                setUser(updatedUser)
            }
            toast.success("Befriend Req Sent", {
                icon: '⌚',
                style: {
                    backgroundColor: "#666666",
                    color: "#fff"
                }
            });
        } catch(err) {
            console.error(err);
        }
    }
    console.log(user);
    console.log(userHomieRequests)
    console.log(userHomies)

    return (
        <>

            <div className="flex flex-col gap-6 justify-center items-start w-[80%] lg:w-[65%] py-10 ">
            {backdrop && 
            <div 
            onClick={() => {
                setBackdrop(false)
                setHomieUsername("")
                }} 
                className="fixed top-[50%] z-[11] left-[50%] translate-x-[-50%] translate-y-[-50%] h-screen w-full bg-[#00000068] " />}
                
                <div className="addFriends relative w-full flex flex-col justify-center z-[11] items-center gap-3">

                    <div className="w-full flex justify-center items-center">
                        <p className="uppercase font-bold tracking-[2px]">Add Homie</p>
                    </div>

                    <div className="w-full relative">
                        <input 
                            onChange={(e) => {
                                setHomieUsername(e.target.value);
                                handleBackDrop(e.target.value)
                            }} 
                            value={homieUsername} 
                            className={`w-full bg-bgSecondary border-2 focus:outline-none selection:bg-[#2a2a2a] border-transparent focus:border-[#6d6d6d] text-[#fff] placeholder:text-[#ffffff85] px-4 py-3 rounded-[6px]`}
                            type={"text"}
                            placeholder="Add homies with their username" 
                        />
                    </div>

                    {homieUsername && 
                        <div className="w-full absolute top-full left-0 mt-2 max-h-[50vh] overflow-y-auto z-[20] border-[2px] border-[#6d6d6d] bg-bgPrimary p-2 rounded-[15px] shadow-[0px_50px_50px_#292929] flex flex-col justify-start items-center gap-2">
                            {homies.filter(homie => {
                                if(homieUsername === "") {
                                    return homie
                                } else
                                return homie.username && homie.username.toLowerCase().includes(homieUsername.toLowerCase()) && homie._id !== user?._id
                            }).length === 0 ? (
                                <p className="w-full text-start px-3 tracking-[3px] font-bold text-[#b6b6b6]">No Homies</p>
                            ) : (
                                homies.filter(homie =>
                                    homie.username && 
                                    homie.username.toLowerCase().includes(homieUsername.toLowerCase()) && 
                                    homie._id !== user?._id
                                )
                            ).map((homie, index) => {

                                const isRequestSent = user?.homieSentRequests?.includes(homie._id);
                                
                                return (
                                    <motion.div key={homie._id} initial={{y: -50, opacity: 0, filter: "blur(10px)"}} transition={{delay: index*0.1}} whileInView={{y: 0, opacity: 1, filter: "blur(0px)"}} className="w-full bg-bgSecondary hover:bg-[#3f3f3f] cursor-default p-4 rounded-[15px] flex justify-center items-center">
                                        <div className="w-[90%] homie flex justify-start items-center gap-4">
                                            <div className="bg-bgPrimary p-2 rounded-full">
                                                <Image 
                                                    alt="homieProfileImage"
                                                    src={getProfileUrl(homie.image)}
                                                    width={200}
                                                    height={200}
                                                    className="w-[2vw] rounded-full aspect-square object-cover"
                                                />
                                            </div>
                                            <div className="flex flex-col justify-center items-start">
                                                <p>{homie.name}</p>
                                                <p className="text-xs text-[#ffffffad]">@{homie.username}</p>
                                            </div>
                                        </div>
                                        {!isRequestSent &&
                                            <div onClick={() => handleBefriend(homie)} className="bg-bgPrimary cursor-pointer hover:brightness-[1.2] transition-all duration-150 border-[2px] border-transparent z-[12] hover:border-[#666666] active:scale-[0.8] px-5 py-2 rounded-[15px] flex justify-center items-center gap-2 h-full">
                                                <p className="text-sm">Befriend</p>
                                                <div>
                                                    <Image 
                                                        src={`/figmaIcons/befriend.svg`}
                                                        alt="addHomieImage"
                                                        width={100}
                                                        height={100}
                                                        className="w-[25px]"
                                                    />
                                                </div>
                                            </div>
                                        }{
                                            isRequestSent &&
                                            <div className="bg-bgPrimary  cursor-none transition-all duration-150 border-[2px] border-transparent z-[12] px-5 py-2 rounded-[15px] flex justify-center items-center gap-2 h-full">
                                                <p className="text-sm flex">Pending</p>
                                                <div>
                                                    <FiWatch />
                                                </div>
                                            </div>
                                        }
                                    </motion.div>
                                )
                            })}
                        </div>
                    }

                </div>
                <div className="w-full z-[10] rounded-[10px] p-4 bg-[#43434395] overflow-y-auto h-[75dvh]">
                    {!user?.friends && 
                    <div className="w-full h-full flex flex-col justify-center items-center gap-4 opacity-[0.6]">
                        <div className="w-full flex justify-center items-center">
                            <Image 
                                src={"/figmaIcons/hifive.svg"}
                                alt="hi-five"
                                width={300}
                                height={300}
                                className={`w-[12vw]`}
                            />
                        </div>
                        <div>
                            <p className="text-3xl font-bold tracking-[3px]">Add Homies</p>
                        </div>
                    </div>
                    }
                    {
                        user?.friends &&
                        <div className="w-full h-full flex flex-col justify-center items-start">
                            There are friends
                        </div>
                    }
                    
                </div>

            </div>
        </>
    )
}