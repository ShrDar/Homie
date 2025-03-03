"use client"

import { getProfileUrl } from "@/extra/helpers";
import { HomieUser } from "@/homieTypes/homieTypes";
import { Session } from "next-auth"
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react"
import { collection, getDocs, addDoc, query, where, doc, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebase"
import { motion } from "motion/react";

export default function YapLayoutContent({ session } : {session: Session}) {

    const params = useParams();
    const router = useRouter();
    const { yapId } = params;

    // console.log(yapId)//for build error temp fix

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

    // const updateUser = async() => {
    //     const refetchedResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${user?._id}`);
    //     const updatedUser = await refetchedResponse.json();
    //     setUser(updatedUser)
    // }

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
        <div className="w-[90%] md:w-[80%] lg:w-[70%] z-[20] flex justify-center items-center gap-3 text-fontPrimary">
            <div className="searchHomieYap w-[30%] md:w-[20%] lg:w-[15%]">
                <input 
                    onChange={(e) => {
                        setHomieUsername(e.target.value)
                    }} 
                    value={homieUsername} 
                    maxLength={30}
                    className={`w-full bg-bgSecondary placeholder:tracking-[3px] text-sm text-center p-2 border-2 focus:outline-none selection:bg-[#666] border-transparent focus:border-[#666666] text-fontPrimary placeholder:text-[#bbb] rounded-[20px]`}
                    type={"text"}
                    placeholder="search" 
                />
            </div>
            <div className="homieYaps w-[70%] md:w-[80%] lg:w-[85%] min-h-[60px] bg-bgSecondary overflow-auto flex justify-start items-center gap-2 p-2 rounded-[30px]">
                {user?.homies.map((homieId, index) => {
                    const homie = homies?.find((newHomie) => newHomie._id === homieId)
                    if(homie?.username.includes(homieUsername)) {
                        const isCurrentYap = homie?.yaps?.find((yap) => yap.yapId === yapId);
                        // console.log(isCurrentYap);
                        return (
                            <motion.div initial={{x: 50, filter: "blur(10px)"}} whileInView={{x: 0, filter: 'blur(0px)'}} transition={{duration: 0.1 * index}} key={homie._id} onClick={() => createChat(user, homie._id)} className={`flex justify-center items-center hover:bg-[#666666] transition-all duration-150 cursor-pointer gap-2  ${isCurrentYap ? "bg-[#666666]" : "bg-bgPrimary"} px-4 py-2 rounded-[30px]`}>
                                <div className="rounded-full overflow-hidden bg-bgSecondary">
                                    <Image 
                                        src={getProfileUrl(homie.image)}
                                        alt=""
                                        width={100}
                                        height={100}
                                        className="w-[20px] rounded-full"
                                    />
                                </div>
                                <div>
                                    <p>{homie.username}</p>
                                </div>
                            </motion.div>
                        )
                    }
                })}
            </div>
        </div>
    )
}