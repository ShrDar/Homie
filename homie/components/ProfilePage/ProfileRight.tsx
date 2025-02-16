"use client";

import { Session } from "next-auth";
import { useEffect, useState } from "react";
import { MdDelete } from "react-icons/md"
import { toast } from "sonner";
import DeleteAccountModal from "../Portals/DeleteAccoutModal";
import { motion } from "motion/react";


export default function ProfileRight({ session }: {session: Session}) {
    // Split the full name into first and last name
    let [dbFirstName, dbLastName] = session.user?.name?.split(' ') || ['', ''];
    const [firstName, setFirstName] = useState(dbFirstName);
    const [lastName, setLastName] = useState(dbLastName);
    const [bio, setBio] = useState("");
    const [username, setUsername] = useState("");
    const [user, setUser] = useState({username: "", bio: ""});
    const [openDeleteModal, setOpenDeleteModal] = useState(false);

    const [usernameError, setUsernameError] = useState("")
    
    useEffect(() => {
     const fetchUserData = async() => {
         const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${session?.user?.id}`);
         const user = await response.json();
         setUser(user);
         setUsername(user.username);
         setBio(user.bio);
     }
 
     fetchUserData();
    }, [session?.user?.id])

    const validateUsername = async (username: string) => {
        const url = process.env.NEXT_PUBLIC_BACKEND_URL;
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/`)
        const users = await response.json();
        const repeatedUser = users.some((otherUser: { username: string }) => otherUser.username === username && otherUser.username !== user.username);
        
        if(repeatedUser) {
            setUsernameError("Username Taken ")
        } else {
            setUsernameError("");
        }
    }

    const handleTransform = async() => {
        const updatedData = {
            firstName,
            lastName,
            username,
            bio
        };
        
        if(firstName == "" || lastName == "" || username == "") {
            toast.error("Empty Fields ❌❌")
            return
        }

        if (firstName === dbFirstName && lastName === dbLastName && username === user.username && bio === user.bio) {
            toast.info("No changes detected 🙅‍♂️");
            return;  // No changes, so don't send the update request
        }

        if(usernameError) {
            toast.error(usernameError);
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${session?.user?.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedData),
            });
    
            if (response.ok) {
                // const result = await response.json();
                toast.success("Homie Updated 😉");
    
                const refetchedResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${session?.user?.id}`);
                const updatedUser = await refetchedResponse.json();
    
                setFirstName(updatedUser.name.split(' ')[0]);
                setLastName(updatedUser.name.split(' ')[1]);
                setUsername(updatedUser.username);
                setUser(updatedUser)
                dbFirstName = updatedUser.name.split(' ')[0];
                dbLastName = updatedUser.name.split(' ')[1];

            } else {
                const error = await response.text();
                console.error("Failed to update user:", error);
            }
        } catch (err) {
            console.error("Error updating user:", err);
        }
    }
    const handleDiscard = () => {
        setFirstName(dbFirstName)
        setLastName(dbLastName)
        setUsername(user.username)
        setBio(user.bio);
        setUsernameError("");
    }

    return (
        <div className="profileRightContainer relative bg-bgSecondary rounded-[15px] px-10 lg:px-16 py-16 z-10 w-[90%] lg:w-[65%] flex flex-col justify-center items-center gap-10">
            <p className="text-fontPrimary text-4xl lgtext-5xl font-thin">{firstName} {lastName}</p>
            <div className="relative flex gap-4 w-full items-center justify-center">
                <div className="w-1/2">
                    <input 
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full bg-bgPrimary border-2 border-transparent focus:border-[#2a2a2a] selection:bg-bgSecondary focus:outline-none text-fontPrimary px-6 py-3 rounded-[6px]"
                        placeholder="First Name"
                    />
                </div>
                <div className="w-1/2">
                    <input 
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full bg-bgPrimary border-2 border-transparent focus:border-[#2a2a2a] selection:bg-bgSecondary focus:outline-none text-fontPrimary px-6 py-3 rounded-[6px]"
                        placeholder="Last Name"
                    />
                </div>
            </div>
            <div className="relative w-full flex justify-center items-center gap-4">
                <input 
                    type="text" 
                    placeholder="username" 
                    value={username} 
                    onChange={(e) => {
                        setUsername(e.target.value)
                        validateUsername(e.target.value)
                    }} 
                    className={`w-full bg-bgPrimary border-2 selection:bg-bgSecondary focus:outline-none text-fontPrimary px-6 py-3 rounded-[6px] ${
                        usernameError 
                                ? 'border-red-500' 
                                : 'border-transparent focus:border-[#2a2a2a]'
                    }`} 
                />
            </div>
            <div className="relative w-full flex justify-center items-center gap-4">
                <input type="text" placeholder="bio" value={bio} onChange={(e) => setBio(e.target.value)} className="w-full bg-bgPrimary border-2 border-transparent focus:border-[#2a2a2a] selection:bg-bgSecondary focus:outline-none text-fontPrimary px-6 py-3 rounded-[6px]" />
            </div>
            <div className="relative w-full flex justify-center items-center gap-4">
                <div onClick={() => handleDiscard()} className="w-full hover:brightness-[0.8] transition-all duration-100 bg-bgPrimary px-6 py-3 rounded-[6px] flex justify-center items-center cursor-pointer">
                    <p className="text-[#FF6F6F] text-xl">Discard</p>
                </div>
                <div onClick={() => handleTransform()} className="w-full hover:brightness-[1.2] transition-all duration-100 bg-bgPrimary px-6 py-3 rounded-[6px] flex justify-center items-center cursor-pointer">
                    <p className="text-[#5FB972] text-xl">Transform</p>
                </div>


            </div>
            <motion.div whileHover={{scale: 1.2}} whileTap={{scale: 0.8}} onClick={() => setOpenDeleteModal(true)} className="bg-bgPrimary p-2 hover:brightness-[0.8] absolute top-4 right-4 rounded-full border-[2px] border-[#FF6F6F] scale-[0.8] cursor-pointer">
                    <MdDelete color="#FF6F6F" className="w-[15px] h-[15px]" />
            </motion.div>
            <DeleteAccountModal openDeleteModal={openDeleteModal} setOpenDeleteModal={setOpenDeleteModal} user={user} />
        </div>
    )
}
