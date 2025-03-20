"use client";

import { Session } from "next-auth";
import { useEffect, useState } from "react";
import { MdDelete } from "react-icons/md"
import { toast } from "sonner";
import DeleteAccountModal from "../Portals/DeleteAccoutModal";
import { motion } from "motion/react";
import Image from "next/image";
import ChangePassModal from "../Portals/ChangePassModal";


export default function ProfileRight({ session, user, setUser }: {session: Session, user: any, setUser: any}) {
    // Split the full name into first and last name
    const [tdbFirstName, tdbLastName] = session.user?.name?.split(' ') || ['', ''];
    const [dbFirstName, setDbFirstName] = useState(tdbFirstName);
    const [dbLastName, setDbLastName] = useState(tdbLastName);
    const [firstName, setFirstName] = useState(dbFirstName);
    const [lastName, setLastName] = useState(dbLastName);
    const [bio, setBio] = useState(user.bio);
    const [username, setUsername] = useState(user.username);
    const [usernameError, setUsernameError] = useState("")
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [openChangePassModal, setOpenChangePassModal] = useState(false);

    useEffect(() => {
        const [tdbFirstName, tdbLastName] = user?.name?.split(' ') || ['', ''];
        setBio(user.bio || "");
        setUsername(user.username || "");
        setFirstName(tdbFirstName);
        setLastName(tdbLastName)
    }, [user]);

    const validateUsername = async (username: string) => {
        // const url = process.env.NEXT_PUBLIC_BACKEND_URL;
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
            name: `${firstName} ${lastName}`,
            username,
            bio,
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
                setDbFirstName(updatedUser.name.split(' ')[0]);
                setDbLastName(updatedUser.name.split(' ')[1]);
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

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { 
                duration: 0.6,
                staggerChildren: 0.15
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: { 
            opacity: 1, 
            x: 0,
            transition: { duration: 0.4 }
        }
    };

    return (
        <>
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="profileRightContainer relative bg-bgSecondary rounded-[15px] px-10 lg:px-16 py-16 z-[11] w-[90%] lg:w-[65%] flex flex-col justify-center items-center gap-10"
            >
                <motion.p variants={itemVariants} className="text-fontPrimary text-4xl lgtext-5xl font-thin">
                    {firstName} {lastName}
                </motion.p>

                <motion.div variants={itemVariants} className="relative flex gap-4 w-full items-center justify-center">
                    <div className="w-1/2">
                        <input 
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            maxLength={20}
                            className="w-full bg-bgPrimary border-2 border-transparent focus:border-[#2a2a2a] selection:bg-bgSecondary focus:outline-none text-fontPrimary px-6 py-3 rounded-[6px]"
                            placeholder="First Name"
                        />
                    </div>
                    <div className="w-1/2">
                        <input 
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            maxLength={20}
                            className="w-full bg-bgPrimary border-2 border-transparent focus:border-[#2a2a2a] selection:bg-bgSecondary focus:outline-none text-fontPrimary px-6 py-3 rounded-[6px]"
                            placeholder="Last Name"
                        />
                    </div>
                </motion.div>
                <motion.div variants={itemVariants} className="relative w-full flex justify-center items-center gap-4">
                    <input 
                        type="text" 
                        placeholder="username" 
                        value={username} 
                        maxLength={20}
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
                </motion.div>
                <motion.div variants={itemVariants} className="relative w-full flex justify-center items-center gap-4">
                    <input type="text" placeholder="bio" value={bio} maxLength={30} onChange={(e) => setBio(e.target.value)} className="w-full bg-bgPrimary border-2 border-transparent focus:border-[#2a2a2a] selection:bg-bgSecondary focus:outline-none text-fontPrimary px-6 py-3 rounded-[6px]" />
                </motion.div>
                <motion.div variants={itemVariants} className="relative w-full flex justify-center items-center gap-4">
                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleDiscard()} 
                        className="w-full hover:brightness-[0.8] transition-all duration-100 bg-bgPrimary px-6 py-3 rounded-[6px] flex justify-center items-center cursor-pointer"
                    >
                        <p className="text-[#FF6F6F] text-xl">Discard</p>
                    </motion.div>
                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleTransform()} 
                        className="w-full hover:brightness-[1.2] transition-all duration-100 bg-bgPrimary px-6 py-3 rounded-[6px] flex justify-center items-center cursor-pointer"
                    >
                        <p className="text-[#5FB972] text-xl">Transform</p>
                    </motion.div>
                </motion.div>

                <motion.div whileHover={{scale: 1.2}} whileTap={{scale: 0.8}} onClick={() => setOpenDeleteModal(true)} className="bg-bgPrimary p-2 hover:brightness-[0.8] absolute top-4 right-4 rounded-full border-[2px] border-[#FF6F6F] scale-[0.8] cursor-pointer">
                        <MdDelete color="#FF6F6F" size={12} />
                </motion.div>
                {user.hashedPassword &&
                    <motion.div onClick={() => setOpenChangePassModal(true)} whileHover={{scale: 1.2}} whileTap={{scale: 0.8}} className="bg-bgPrimary p-2 hover:brightness-[0.8] absolute top-4 left-4 rounded-full border-[2px] border-bgPrimary scale-[0.8] cursor-pointer">
                        <Image 
                            src={`/figmaIcons/changePass.svg`}
                            alt="changePassword"
                            width={80}
                            height={100}
                            className="w-[20px] h-[20px]"
                        />
                    </motion.div>
                }
            </motion.div>
            <DeleteAccountModal openDeleteModal={openDeleteModal} setOpenDeleteModal={setOpenDeleteModal} user={user} />
            <ChangePassModal openChangePassModal={openChangePassModal} setOpenChangePassModal={setOpenChangePassModal} user={user} setUser={setUser} />
        </>
    )
}
