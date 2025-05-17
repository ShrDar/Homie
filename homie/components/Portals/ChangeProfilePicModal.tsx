"use client"

import Image from "next/image";
import { useEffect, useState } from "react";
import { IoIosImages } from "react-icons/io";
import { FaCheck } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import { getProfileUrl } from "@/extra/helpers";
import { toast } from "sonner";
import { ID, storage } from "@/config/AppWriteClient";
import { motion } from "motion/react";

export default function ChangeProfilePicModal( {openChangeProfileModal, setOpenChangeProfileModal, user, setUser} : {openChangeProfileModal : boolean, setOpenChangeProfileModal: any, user: any, setUser: any} ) {
    
    const [currentImage, setCurrentImage] = useState(user.image || "");
    const [currentFile, setCurrentFile] = useState(user.image);
    const [isDefaultMode, setIsDefaultMode] = useState(true);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        setIsDefaultMode(savedTheme ? savedTheme === 'default' : true);
    }, []);
    
    useEffect(() => {
        setCurrentImage(user.image || "");
    }, [user]);
    
    if(!openChangeProfileModal) {
        return null;
    }
    const handlePicChange = (file: File | undefined) => {
        if (file && file.type.startsWith("image/")) {
            setCurrentFile(file);
            const imageUrl = URL.createObjectURL(file);
            setCurrentImage(imageUrl);
        }
    }

    const handleImageAccept = async() => {
        if(user.image === currentImage) {
            toast.info("Old Image 📷");
            return;
        }

        //validations
        const maxSizeInMB = 1;
        const maxSizeInBytes = maxSizeInMB * 1024 * 1024; 

        if (currentFile.size > maxSizeInBytes) {
            toast.info("Maximum Pic Size 2MB");
            return;
        }


        if(!user.image.startsWith("htt")) { //delete file
            console.log('delete');
            try {
                const result = await storage.deleteFile(process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || "", user.image);
                console.log(result);
            } catch (err) {
                console.error(err);
            }
        }
        //create file
        try {
            const id = ID.unique();
            const result = await storage.createFile(process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || "", id, currentFile)
            console.log(result);

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${user._id}/image`, {
                method: 'PATCH',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image: id }),
            });
        
            if (response.ok) {
                // const result = await response.json();
                // console.log(result);
                const refetchedResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${user._id}`);
                const updatedUser = await refetchedResponse.json();
                setUser(updatedUser);
            } else {
                toast.error('Pic Change Failed');
                return;
            }

            toast.success("Homie's Pic Changed 📸");
            setOpenChangeProfileModal(false);
        } catch(err) {
            toast.error('Pic Change Failed')
            console.error(err);
        }

    }

    return(
        <>
            <div onClick={() => {
                setOpenChangeProfileModal(false)
                setCurrentImage(user.image || "")
            }} className="fixed top-[50%] z-[90] left-[50%] translate-x-[-50%] translate-y-[-50%] h-screen w-full bg-[#000] bg-opacity-50 backdrop-blur-sm">

            </div>
            <div className={`fixed px-10 w-[70%] md:w-auto lg:px-16 py-8 flex justify-center lg:scale-[1.2] items-center rounded-[15px] ${isDefaultMode ? 'bg-bgSecondary text-fontPrimary' : 'bg-white text-gray-800'} top-[50%] z-[100] left-[50%] translate-x-[-50%] translate-y-[-50%] sulphur`}>
                <motion.form onSubmit={(e) => e.preventDefault()} className="w-full h-full flex justify-center items-center gap-5 lg:gap-10"> 
                    <motion.div initial={{scale: 0.5}} animate={{scale: 1}} className="w-full">
                        <Image 
                            src={getProfileUrl(currentImage)}
                            alt="userProfileImage"
                            width={200}
                            height={200}
                            className={`w-[150px] h-[150px] ${isDefaultMode ? 'bg-bgPrimary' : 'bg-gray-100'} rounded-full p-5 aspect-square object-cover`}
                        />
                    </motion.div>
                    <div className="flex flex-col justify-center items-center gap-4">
                        <motion.label initial={{scale: 0}} animate={{scale: 1}} transition={{duration: 0.2, ease: "linear"}} htmlFor="file" className={`cursor-pointer hover:brightness-[8] transition-all duration-100 flex justify-center items-center gap-2 border-[2px] ${isDefaultMode ? 'border-[#c9c9c9]' : 'border-gray-400'} p-2 rounded-full`}>
                            <IoIosImages color={isDefaultMode ? "#c9c9c9" : "#666"} size={20}/>
                        </motion.label>
                        <input className="hidden" type="file" accept="image/*" name="file" id="file" onChange={(e) => handlePicChange(e.target.files?.[0])} />
                        <motion.div initial={{scale: 0}} animate={{scale: 1}} transition={{duration: 0.2, ease: "linear"}} onClick={() => handleImageAccept()} className="border-[2px] hover:brightness-[1.5] transition-all duration-150 cursor-pointer p-2 rounded-full border-[#5FB972]">
                            <FaCheck size={20} color="5FB972"/>
                        </motion.div>
                    </div>
                </motion.form>
                <div onClick={() => {
                    setOpenChangeProfileModal(false)
                    setCurrentImage(user.image || "")
                }} className={`absolute hover:brightness-[3] transition-all duration-100 cursor-pointer top-2 right-2 flex justify-center items-center p-1 rounded-full border-[2px] ${isDefaultMode ? 'border-bgPrimary' : 'border-gray-300'}`}>
                    <RxCross2 size={12} color={isDefaultMode ? "2a2a2a" : "666666"}/>
                </div>
            </div>
        </>
    );
}
