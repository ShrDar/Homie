"use client"
import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import ChangeProfilePic from "../Portals/ChangeProfilePicModal";
import { getProfileUrl } from "@/extra/helpers";
import { useRouter } from "next/navigation";

export default function ProfileLeft({ user, setUser }: { user: any, setUser: any}) {
    const router = useRouter();
    const [openChangeProfileModal, setOpenChangeProfileModal] = useState(false);

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.6, staggerChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.4 }
        }
    };

    if (!user) {
        return (
            <div className="profileLeftContainer w-[90%] lg:w-[35%] flex flex-col justify-center items-center gap-6">
                <div>Loading...</div>
            </div>
        );
    }
    return (
        <>
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="profileLeftContainer w-[90%] lg:w-[35%] lg:min-h-full z-[11] flex flex-col justify-center items-center gap-6"
            >
                <motion.div variants={itemVariants} className="upperBlockContainer w-full flex flex-col justify-center items-center gap-2">
                    <motion.div onClick={() => setOpenChangeProfileModal(true)} whileHover={{filter: 'brightness(1.2)'}} whileTap={{scale: 0.9}} className="profileImageContainer cursor-pointer w-[40%] lg:w-[50%] bg-bgSecondary flex justify-center items-center rounded-full p-6">
                        <div className="w-full rounded-full overflow-hidden">
                            <Image src={getProfileUrl(user?.image || "")}
                            alt="profile" 
                            width={100} 
                            height={100}
                            className="w-[100%] h-[100%] rounded-full aspect-square object-cover"
                            />
                        </div>
                        {/* <div className="absolute">
                            <p>Change</p>
                        </div> */}
                    </motion.div>
                    <p className="tracking-[1px]">@{user.username}</p>
                </motion.div>
                <motion.div 
                    variants={itemVariants}
                    className="bioContainer text-center w-full"
                >
                    <p className="tracking-[1px] text-xl w-full jim">{user.bio}</p>
                </motion.div>
                <motion.div 
                    variants={itemVariants}
                    className="lowerBlockContainer w-full bg-bgSecondary rounded-[15px] px-8 py-10 flex flex-col justify-center items-center gap-6"
                >
                    <div className="profileStatsContainer w-full flex lg:flex-col justify-center items-center gap-4">
                        <motion.div whileHover={{scale: 1.1}} whileTap={{scale: 0.9}} onClick={() => router.push("/homies")} className="profileStat cursor-pointer w-full flex justify-center lg:justify-between items-center text-center bg-bgPrimary rounded-[15px] px-2 lg:px-6 py-4 gap-2 lg:gap-0">
                            <p>HOMIES</p>
                            <div className="justify-center items-center hidden lg:flex">
                                <Image src="/figmaIcons/squiggly.svg" className="w-[100%]" alt="squiggly" width={100} height={100} />
                            </div>
                            <p className="lg:hidden"> - </p>
                            <p>{user?.homies?.length || 0}</p>
                        </motion.div>
                        <div className="profileStat w-full flex justify-center lg:justify-between items-center text-center bg-bgPrimary rounded-[15px] px-2 lg:px-6 py-4 gap-2 lg:gap-0">
                            <p>POSTS</p>
                            <div className="justify-center items-center hidden lg:flex">
                                <Image src="/figmaIcons/squiggly.svg" className="w-[100%]" alt="squiggly" width={100} height={100} />
                            </div>
                            <p className="lg:hidden"> - </p>
                            <p>{0}</p>
                        </div>
                        <div className="profileStat w-full flex justify-center lg:justify-between items-center text-center bg-bgPrimary rounded-[15px] px-2 lg:px-6 py-4 gap-2 lg:gap-0">
                            <p>TEAS</p>
                            <div className="justify-center items-center hidden lg:flex">
                                <Image src="/figmaIcons/squiggly.svg" className="w-[100%]" alt="squiggly" width={100} height={100} />
                            </div>
                            <p className="lg:hidden"> - </p>
                            <p>{0}</p>
                        </div>
        
                        
                    </div>
                </motion.div>
            </motion.div>
            <ChangeProfilePic openChangeProfileModal={openChangeProfileModal} setOpenChangeProfileModal={setOpenChangeProfileModal} user={user} setUser={setUser} />
        </>
    )
}