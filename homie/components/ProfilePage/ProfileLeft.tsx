"use client"
import Image from "next/image";
import { useState } from "react";
import { motion } from "motion/react";
import ChangeProfilePic from "../Portals/ChangeProfilePicModal";
import { getProfileUrl } from "@/extra/helpers";
import { HomieUser } from "@/homieTypes/homieTypes";

export default function ProfileLeft({ user, setUser }: { user: any, setUser: any}) {
    // const [user, setUser] = useState<any>(null);
    const [openChangeProfileModal, setOpenChangeProfileModal] = useState(false);

    if (!user) {
        return (
            <div className="profileLeftContainer w-[90%] lg:w-[35%] flex flex-col justify-center items-center gap-6">
                <div>Loading...</div>
            </div>
        );
    }
    return (
        <>
            <div className="profileLeftContainer w-[90%] lg:w-[35%] lg:min-h-full z-[11] flex flex-col justify-center items-center gap-6">
                <div className="upperBlockContainer w-full flex flex-col justify-center items-center gap-2">
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
                </div>
                <div className="bioContainer text-center w-full">
                    <p className="tracking-[1px] text-xl w-full jim">{user.bio}</p>
                </div>
                <div className="lowerBlockContainer w-full bg-bgSecondary rounded-[15px] px-8 py-10 flex flex-col justify-center items-center gap-6">
                    <div className="profileStatsContainer w-full flex lg:flex-col justify-center items-center gap-4">
                        <div className="profileStat w-full flex justify-center lg:justify-between items-center text-center bg-bgPrimary rounded-[15px] px-2 lg:px-6 py-4 gap-2 lg:gap-0">
                            <p>HOMIES</p>
                            <div className="justify-center items-center hidden lg:flex">
                                <Image src="/figmaIcons/squiggly.svg" className="w-[100%]" alt="squiggly" width={100} height={100} />
                            </div>
                            <p className="lg:hidden"> - </p>
                            <p>{user?.homies?.length || 0}</p>
                        </div>
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
                </div>
            </div>
            <ChangeProfilePic openChangeProfileModal={openChangeProfileModal} setOpenChangeProfileModal={setOpenChangeProfileModal} user={user} setUser={setUser} />
        </>
    )
}