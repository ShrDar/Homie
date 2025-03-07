"use client"

import { Session } from "next-auth";
import { useEffect, useState } from "react"
import { motion } from "motion/react";
import Image from "next/image";
import { HomieUser } from "@/homieTypes/homieTypes";
import { getProfileUrl } from "@/extra/helpers";
import { toast } from "sonner";
import { FiWatch } from "react-icons/fi";
import { PiHandWavingFill } from "react-icons/pi";
import { RxCross2 } from "react-icons/rx";
import { RiMessage3Fill } from "react-icons/ri";
import { CiMenuKebab } from "react-icons/ci";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { addDoc, collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from "@/config/firebase";
import { useRouter } from "next/navigation";
  

export default function HomiesDash({session} : {session: Session}) {

    const router = useRouter();

    const [user, setUser] = useState<HomieUser>();
    const [homies, setHomies] = useState<HomieUser[]>([]); //all users
    const [homieUsername, setHomieUsername] = useState("");
    const [backdrop, setBackdrop] = useState(false);
    const [currentDisplay, setCurrentDisplay] = useState<string>("homies");

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
    }, [session?.user?.id, homieUsername, currentDisplay, homies, user])


    const handleBackDrop = (username: string) => {
        if(username === "") {
            setBackdrop(false);
        } else {
            setBackdrop(true)
        }
    }

    const updateUser = async() => {
        const refetchedResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${user?._id}`);
        const updatedUser = await refetchedResponse.json();
        setUser(updatedUser)
    }

    const handleBefriend = async (homie: HomieUser) => {
        const homieId = homie._id;
        
        try {

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/homies/${session?.user?.id}/homie-request/${homieId}`, {
                method: "POST",
            });
            if(response.ok) {
            }
            toast.success("Befriend Req Sent", {
                icon: '⌚',
                style: {
                    backgroundColor: "#2a2a2a",
                    color: "#fff"
                }
            });
        } catch(err) {
            updateUser();
            console.error(err);
        }
        updateUser();
    }

    const handleAcceptBefriend = async(homie: HomieUser) => {
        const homieId = homie._id;
        
        try {

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/homies/${session?.user?.id}/accept-request/${homieId}`, {
                method: "POST",
            });
            if(response.ok) {
            }
            toast.success(`${homie.username} is your homie`, {
                icon: '🤝🏻',
                style: {
                    backgroundColor: "#2a2a2a",
                    color: "#fff"
                }
            });
        } catch(err) {
            console.error(err);
        }
        updateUser();
    }

    const handleRemoveFriend = async(homie?: HomieUser) => {
        const homieId = homie?._id
        try {

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/homies/${session?.user?.id}/remove-homie/${homieId}`, {
                method: "DELETE",
            });
            if(response.ok) {
            }
            toast.success(`${homie?.username} is not your homie`, {
                icon: '❎',
                style: {
                    backgroundColor: "#2a2a2a",
                    color: "#fff"
                }
            });
        } catch(err) {
            console.error(err);
        }
        updateUser();
    }

    const handleRequestReject = async(homie : HomieUser) => {
        const homieId = homie?._id
        try {

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/homies/${session?.user?.id}/reject-request/${homieId}`, {
                method: "POST",
            });
            if(response.ok) {
            }
            toast.success(`Befriend request to ${homie?.username} Rejected`, {
                icon: '✖',
                style: {
                    backgroundColor: "#2a2a2a",
                    color: "#fff",
                    borderColor: "#FF6F6F"
                }
            });
        } catch(err) {
            updateUser()
            console.error(err);
        }
        updateUser();
    }

    const handlePendingRevoke = async(homie : HomieUser) => {
        const homieId = homie?._id
        try {

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/homies/${session?.user?.id}/remove-homie-sent-request/${homieId}`, {
                method: "DELETE",
            });
            if(response.ok) {
            }
            toast.success(`Befriend request sent to ${homie?.username} Removed`, {
                icon: '✖',
                style: {
                    backgroundColor: "#2a2a2a",
                    color: "#fff",
                    borderColor: "#FF6F6F"
                }
            });
        } catch(err) {
            updateUser();
            console.error(err);
        }
        updateUser();
    }

    const checkExistingChat = async (senderId: string, receiverId: string) => {
        const messagesRef = collection(db, "Yap");
        const q = query(messagesRef, where("participants", "array-contains", senderId));
    
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            for (const doc of querySnapshot.docs) {
                const data = doc.data();
                if (data.participants.includes(receiverId)) {
                    return data.yapId;
                }
            }
        }
        return null;
    };

    const createChat = async (user: HomieUser, receiverId: string) => {
        const existingYapId = await checkExistingChat(user._id || "", receiverId);

        if (existingYapId) {
            router.push(`/yap/${existingYapId}`);
        } else {
            try {
                const newMessageDoc = await addDoc(collection(db, "Yap"), {
                    yapId: "",  
                    participants: [session?.user?.id, receiverId],
                    createdAt: new Date().toISOString(),
                    yapContent: "",
                    reaction: {
                        [user._id]: "",  // Sender's reaction
                        [receiverId]: "",  // Receiver's reaction
                    },
                    status: "sent",
                    mediaUrl: "",
                });

                const messageId = newMessageDoc.id;
                
                const messageRef = doc(db, "Yap", messageId);
                await updateDoc(messageRef, {
                    yapId: messageId,
                });

                await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/yaps/${user._id}/add-yap`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ yapId: messageId, participants: [session?.user?.id, receiverId] }),
                });

                router.push(`/yap/${messageId}`);
            } catch (error) {
                console.error("Error creating chat:", error);
            }
        }
    }

    return (
        <>

            <div className="flex flex-col gap-6 justify-center items-start w-[85%] lg:w-[65%] py-10 ">
            {backdrop && 
                <div 
                onClick={() => {
                    setBackdrop(false)
                    setHomieUsername("")
                    }} 
                    className="fixed top-[50%] z-[11] left-[50%] translate-x-[-50%] translate-y-[-50%] h-screen w-full bg-[#00000068] " 
                />
            }
                

                <div className="addFriends relative w-full flex flex-col justify-center z-[11] items-center gap-3">


                    <div className="w-full relative">
                        <input 
                            onChange={(e) => {
                                setHomieUsername(e.target.value);
                                handleBackDrop(e.target.value)
                            }} 
                            value={homieUsername} 
                            className={`w-full bg-bgSecondary border-2 focus:outline-none selection:bg-[#2a2a2a] border-transparent focus:border-[#6d6d6d] text-fontPrimary placeholder:text-[#ffffff85] px-4 py-3 rounded-[6px]`}
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
                                const isRequestReceived = user?.homieRequests?.includes(homie._id);
                                const isHomie = user?.homies.includes(homie._id);
                                
                                return (
                                    <motion.div key={homie._id} initial={{y: -50, opacity: 0, filter: "blur(10px)"}} transition={{delay: index*0.1}} whileInView={{y: 0, opacity: 1, filter: "blur(0px)"}} className="w-full bg-bgSecondary hover:bg-[#3f3f3f] cursor-default p-4 rounded-[15px] flex justify-center items-center">
                                        <div className="w-[90%] homie flex justify-start items-center gap-4">
                                            <div className="bg-bgPrimary p-2 rounded-full">
                                                <Image 
                                                    alt="homieProfileImage"
                                                    src={getProfileUrl(homie.image)}
                                                    width={200}
                                                    height={200}
                                                    className="w-[5vw] md:w-[3vw] lg:w-[2vw] rounded-full aspect-square object-cover"
                                                />
                                            </div>
                                            <div className="flex flex-col justify-center items-start">
                                                <p>{homie.name}</p>
                                                <p className="text-xs text-[#ffffffad]">@{homie.username}</p>
                                            </div>
                                        </div>
                                        {
                                            isHomie && 
                                            <div className="bg-bgPrimary transition-all duration-150 md:min-w-[130px] border-[2px] border-transparent z-[12] px-5 py-2 rounded-[15px] flex justify-center items-center text-center gap-2 h-full">
                                                <p className="text-sm flex">Homies</p>
                                            </div>
                                        }
                                        {(!isRequestSent && !isRequestReceived && !isHomie) &&
                                            <div onClick={() => handleBefriend(homie)} className="bg-bgPrimary md:min-w-[130px] cursor-pointer hover:brightness-[1.2] transition-all duration-150 border-[2px] border-transparent z-[12] hover:border-[#666666] active:scale-[0.8] px-5 py-2 rounded-[15px] flex justify-center items-center gap-2 h-full">
                                                <p className="text-sm hidden md:flex">Befriend</p>
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
                                            <div className="bg-bgPrimary cursor-none transition-all duration-150 md:min-w-[130px] border-[2px] border-transparent z-[12] px-5 py-2 rounded-[15px] flex justify-center items-center gap-2 h-full">
                                                <p className="text-sm hidden md:flex">Pending</p>
                                                <div>
                                                    <FiWatch size={25} className="animate-pulse " />
                                                </div>
                                            </div>
                                        }
                                        { 
                                            (isRequestReceived && !isHomie) &&
                                            <div className="flex justify-center items-center gap-2">
                                                <div onClick={() => handleAcceptBefriend(homie)} className="bg-bgPrimary md:min-w-[130px] cursor-pointer hover:brightness-[1.2] transition-all duration-150 border-[2px] border-transparent z-[12] hover:border-[#666666] active:scale-[0.8] px-5 py-2 rounded-[15px] flex justify-center items-center gap-2 h-full">
                                                    <p className="text-sm hidden md:flex">Accept</p>
                                                    <div className="w-[25px]">
                                                    <Image 
                                                        src={`/slideBarIcons/homies.svg`}
                                                        alt="addHomieImage"
                                                        width={100}
                                                        height={100}
                                                        className="w-[25px]"
                                                        />
                                                    </div>
                                                </div>
                                                <div onClick={() => homie && handleRequestReject(homie)} className="rejectRequest cursor-pointer bg-bgPrimary border-[1.5px] border-transparent transition-all duration-150 hover:border-[#FF6F6F] p-2 rounded-full">
                                                    <RxCross2 size={12} color="FF6F6F" />
                                                </div>
                                            </div>
                                        }
                                    </motion.div>
                                )
                            })}
                        </div>
                    }

                </div>
                <div className="w-full flex justify-center items-center">
                    <p className="uppercase font-bold tracking-[2px]">{currentDisplay}</p>
                </div>
                <div className="w-full relative z-[10] rounded-[10px] p-4 bg-[#43434395] overflow-y-auto h-[70dvh]">
                    {(user?.homies?.length === 0 && user?.homieRequests?.length === 0 && user?.homieSentRequests?.length === 0) && 
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
                    <div className="w-full mt-14 flex flex-col justify-center items-center gap-2">
                        {/* homies */}
                        {  
                            (user?.homies && currentDisplay === "homies") &&
                            <div className="w-full h-full flex flex-col justify-center items-start gap-3">
                                {user.homies.map((homieId) => {
                                    const homie = homies.find((user) => user._id === homieId)
                                    return (
                                        <div key={homieId} className="w-full flex justify-between items-center border-[5px] border-bgPrimary rounded-[15px]">
                                            <div className="homie flex justify-start items-center gap-4 px-2 py-4">
                                                <div className="bg-bgPrimary p-2 rounded-full">
                                                    <Image 
                                                        alt="homieProfileImage"
                                                        src={getProfileUrl(homie?.image || "") || "/figmaIcons/profilePicSkeleton"}
                                                        width={200}
                                                        height={200}
                                                        className="w-[5vw] md:w-[3vw] lg:w-[2vw] rounded-full aspect-square object-cover"
                                                    />
                                                </div>
                                                <div className="flex flex-col justify-center items-start">
                                                    <p>{homie?.name}</p>
                                                    <p className="text-xs text-[#ffffffad]">@{homie?.username}</p>
                                                </div>
                                            </div>
                                            <div className="flex justify-center items-center gap-2 px-4">
                                                <div onClick={() => createChat(user , homie?._id || "")} className="bg-bgPrimary flex justify-center items-center gap-2 hover:bg-[#1b1b1b] transition-all duration-150 cursor-pointer p-3 rounded-full">
                                                    {/* <p>Yap</p> */}
                                                    <RiMessage3Fill size={20} color="aaa"/>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger>
                                                        <div className="bg-transparent first-line:flex justify-center items-center gap-2 hover:bg-bgPrimary transition-all duration-150 cursor-pointer p-2 rounded-full">
                                                        <CiMenuKebab size={22} color="aaa" />
                                                        </div>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="start" className="bg-bgPrimary text-fontPrimary text-sm border-[#666] p-2">
                                                        <div className="sulphur cursor-pointer">
                                                            <p className="w-full text-start hover:bg-[#1B1B1B] p-2 px-6 rounded-[6px]">Yap</p>
                                                        </div>
                                                        <div onClick={() => handleRemoveFriend(homie)} className="sulphur cursor-pointer">
                                                            <p className="w-full text-start hover:bg-[#1B1B1B] p-2 px-6 rounded-[6px] text-[#FF6F6F] font-black">Remove</p>
                                                        </div>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>

                                                
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        }
                        {/* pending */}
                        {  
                            (user?.homieSentRequests && currentDisplay === "pending") &&
                            <div className="w-full h-full flex flex-col justify-center items-start gap-3">
                                {user.homieSentRequests.map((homieId) => {
                                    const homie = homies.find((user) => user._id === homieId)
                                    return (
                                        <div key={homieId} className="w-full flex justify-between items-center border-[5px] border-bgPrimary rounded-[15px]">
                                            <div className="homie flex justify-start items-center gap-4 px-2 py-4">
                                                <div className="bg-bgPrimary p-2 rounded-full">
                                                    <Image 
                                                        alt="homieProfileImage"
                                                        src={getProfileUrl(homie?.image || "/figmaIcons/profilePicSkeleton")}
                                                        width={200}
                                                        height={200}
                                                        className="w-[5vw] md:w-[3vw] lg:w-[2vw] rounded-full aspect-square object-cover"
                                                    />
                                                </div>
                                                <div className="flex flex-col justify-center items-start">
                                                    <p>{homie?.name}</p>
                                                    <p className="text-xs text-[#ffffffad]">@{homie?.username}</p>
                                                </div>
                                            </div>
                                            <div className="flex justify-center items-center gap-2 px-2">
                                                <div className="bg-bgPrimary cursor-none transition-all duration-150 md:min-w-[130px] border-[2px] border-transparent z-[12] px-5 py-2 rounded-[15px] flex justify-center items-center gap-2 h-full">
                                                    <p className="text-sm hidden md:flex">Pending</p>
                                                    <div>
                                                        <FiWatch size={25} className="animate-pulse " />
                                                    </div>
                                                </div>
                                                <div onClick={() => homie && handlePendingRevoke(homie)} className="rejectRequest cursor-pointer bg-bgPrimary border-[1.5px] border-transparent transition-all duration-150 hover:border-[#FF6F6F] p-2 rounded-full">
                                                    <RxCross2 size={12} color="FF6F6F" />
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        }
                        {/* requests */}
                        {  
                            (user?.homieRequests && currentDisplay === "requests") &&
                            <div className="w-full h-full flex flex-col justify-center items-start gap-3">
                                {user.homieRequests.map((homieId) => {
                                    const homie = homies.find((user) => user._id === homieId)
                                    return (
                                        <div key={homieId} className="w-full flex justify-between items-center border-[5px] border-bgPrimary rounded-[15px]">
                                            <div className="homie flex justify-start items-center gap-4 px-2 py-4">
                                                <div className="bg-bgPrimary p-2 rounded-full">
                                                    <Image 
                                                        alt="homieProfileImage"
                                                        src={getProfileUrl(homie?.image || "/figmaIcons/profilePicSkeleton")}
                                                        width={200}
                                                        height={200}
                                                        className="w-[5vw] md:w-[3vw] lg:w-[2vw] rounded-full aspect-square object-cover"
                                                    />
                                                </div>
                                                <div className="flex flex-col justify-center items-start">
                                                    <p>{homie?.name}</p>
                                                    <p className="text-xs text-[#ffffffad]">@{homie?.username}</p>
                                                </div>
                                            </div>
                                            <div className="flex justify-center items-center gap-2 px-2">
                                                <div onClick={() => homie && handleAcceptBefriend(homie)} className="bg-bgPrimary md:min-w-[130px] cursor-pointer hover:brightness-[1.2] transition-all duration-150 border-[2px] border-transparent z-[12] hover:border-[#666666] active:scale-[0.8] px-5 py-2 rounded-[15px] flex justify-center items-center gap-2 h-full">
                                                    <p className="text-sm hidden md:flex">Accept</p>
                                                    <div>
                                                    <Image 
                                                        src={`/slideBarIcons/homies.svg`}
                                                        alt="addHomieImage"
                                                        width={100}
                                                        height={100}
                                                        className="w-[25px]"
                                                        />
                                                    </div>
                                                </div>

                                                <div onClick={() => homie && handleRequestReject(homie)} className="rejectRequest cursor-pointer bg-bgPrimary border-[1.5px] border-transparent transition-all duration-150 hover:border-[#FF6F6F] p-2 rounded-full">
                                                    <RxCross2 size={12} color="FF6F6F" />
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        }
                    </div>
                
                        <div className="absolute top-4 right-4 opacity-[0.5] hover:opacity-[1] cursor-pointer transition-all duration-150">
                            <div className="flex justify-center min-w-[150px] items-center border-[2px] border-[#666] rounded-[15px] overflow-hidden">
                                <div onClick={() => setCurrentDisplay("homies")} className={`w-full ${currentDisplay === "homies" ? "bg-[#1b1b1b]" : "bg-[#2a2a2a]"} hover:bg-[#222222] border-r-[1px] px-6 py-2 text-center transition-all duration-150`}>
                                    <p className="text-sm">Homies</p>
                                </div>
                                <div onClick={() => setCurrentDisplay("pending")} className={`w-full ${currentDisplay === "pending" ? "bg-[#1b1b1b]" : "bg-[#2a2a2a]"} hover:bg-[#222222] px-6 py-2 text-center transition-all duration-150`}>
                                    <p className="text-sm flex">Pending</p>
                                </div>
                            </div>
                        </div>
                        <div onClick={() => setCurrentDisplay("requests")} className={`absolute top-4 left-5 overflow-hidden rounded-full ${currentDisplay === "requests" ? "bg-[#1b1b1b]" : "bg-[#2a2a2a]"} hover:brightness-[0.8] cursor-pointer transition-all duration-150`}>
                            <div className={`flex justify-center items-center rounded-full overflow-hidden`}>
                                <div className="p-2 border-[#666] border-2 rounded-full">
                                    <PiHandWavingFill size={18} color="bbb" />
                                </div>
                            </div>
                        </div>
                </div>
                
            </div>
        </>
    )
}