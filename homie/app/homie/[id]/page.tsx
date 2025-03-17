'use client';

import { getProfileUrl } from "@/extra/helpers";
import { HomieUser } from "@/homieTypes/homieTypes";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function HomieIndividual() {
    const params = useParams();
    const router = useRouter();
    const [user, setUser] = useState<HomieUser | null>(null);
    const [error, setError] = useState(false);
    const [showHomies, setShowHomies] = useState(false);
    const [homiesData, setHomiesData] = useState<any[]>([]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${params.id}`);
                if (!response.ok) {
                    throw new Error("User not found");
                }
                const userData = await response.json();
                setUser(userData);

                // Fetch homies data if user has homies
                if (userData.homies && userData.homies.length > 0) {
                    const homiesPromises = userData.homies.map((homieId: string) =>
                        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${homieId}`)
                            .then(res => res.json())
                    );
                    const homiesResults = await Promise.all(homiesPromises);
                    setHomiesData(homiesResults);
                }
            } catch (error) {
                console.log(error);
                setError(true);
            }
        };

        fetchUser();
    }, [params.id]);

    if (error || !user) {
        return (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col sulphur items-center justify-center min-h-screen text-fontPrimary text-3xl"
            >
                {error ? "No Such Homie" : "Loading..."}
            </motion.div>
        );
    }

    return (
        <div className="sulphur bg-bgSecondary-100 w-full min-h-[100dvh] flex justify-center items-center gap-6 text-fontPrimary p-4">
            <motion.div 
                layout="position"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                    layout: { duration: 0.6, type: "spring", bounce: 0.2 },
                    opacity: { duration: 0.3 }
                }}
                className="w-[80%] md:w-[50%] lg:w-[30%] flex flex-col bg-[#434343ae] backdrop-blur-sm border-[2px] border-[#888] justify-start md:justify-center items-center gap-3 py-5 px-2 rounded-[15px]"
            >
                <div className="flex flex-col justify-center items-center gap-2 w-full">
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="capitalize text-4xl tracking-[2px] px-5 font-bold"
                    >
                        {user?.name}
                    </motion.p>
                    <motion.div 
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="rounded-full overflow-hidden bg-bgSecondary border-[3px] border-[#888]"
                    >
                        <Image 
                            width={400}
                            height={400}
                            alt="profilePic"
                            src={getProfileUrl(user?.image || "")}
                            className="w-[30vw] md:w-[20vw] lg:w-[150px] rounded-full aspect-square object-cover"
                        />
                    </motion.div>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-sm tracking-[3px] text-[#aaa]"
                    >
                        @{user?.username}
                    </motion.p>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-2xl jim tracking-[2px] text-center px-4"
                    >
                        {user?.bio}
                    </motion.p>
                </div>

                <div className="w-[85%] bg-bgSecondary border-[2px] border-[#888] rounded-[15px] p-5 flex flex-col justify-center items-center gap-6">
                    <div className="profileStatsContainer w-full flex flex-col justify-center items-center gap-4">
                        <motion.div 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowHomies(!showHomies)}
                            className="profileStat w-full flex justify-center lg:justify-between items-center border-[2px] border-[#888] text-center bg-bgPrimary rounded-[15px] px-2 lg:px-6 py-4 gap-4 cursor-pointer"
                        >
                            <p className="font-bold">HOMIES</p>
                            <div className="justify-center items-center hidden lg:flex">
                                <Image src="/figmaIcons/squiggly.svg" className="w-[90%]" alt="squiggly" width={100} height={100} />
                            </div>
                            <p className="lg:hidden"> - </p>
                            <p>{user?.homies?.length || 0}</p>
                        </motion.div>
                        <div className="profileStat w-full flex justify-center lg:justify-between items-center border-[2px] border-[#888] text-center bg-bgPrimary rounded-[15px] px-2 lg:px-6 py-4 gap-4">
                            <p>POSTS</p>
                            <div className="justify-center items-center hidden lg:flex">
                                <Image src="/figmaIcons/squiggly.svg" className="w-[90%]" alt="squiggly" width={100} height={100} />
                            </div>
                            <p className="lg:hidden"> - </p>
                            <p>{0}</p>
                        </div>
                        <div className="profileStat w-full flex justify-center lg:justify-between items-center border-[2px] border-[#888] text-center bg-bgPrimary rounded-[15px] px-2 lg:px-6 py-4 gap-4">
                            <p>TEAS</p>
                            <div className="justify-center items-center hidden lg:flex">
                                <Image src="/figmaIcons/squiggly.svg" className="w-[90%]" alt="squiggly" width={100} height={100} />
                            </div>
                            <p className="lg:hidden"> - </p>
                            <p>{0}</p>
                        </div>
                    </div>
                </div>
            </motion.div>
            <AnimatePresence mode="popLayout">
                {showHomies && (
                    <motion.div 
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        transition={{ 
                            type: "spring", 
                            stiffness: 200, 
                            damping: 20,
                            duration: 0.6
                        }}
                        className="hidden lg:flex w-[400px] h-[600px] bg-[#434343ae] backdrop-blur-sm border-[2px] border-[#888] rounded-[15px] p-4 flex-col gap-4"
                    >
                        <h2 className="text-2xl font-bold text-center border-b-2 border-[#888] pb-2">
                            Homies - {homiesData.length}
                        </h2>
                        <div className="flex flex-col gap-3">
                            {homiesData.map((homie, index) => (
                                <motion.div 
                                    onClick={() => router.push(`/homie/${homie._id}`)}
                                    key={homie._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ scale: 1.02 }}
                                    className="flex items-center gap-3 bg-bgPrimary p-3 rounded-lg cursor-pointer"
                                >
                                    <Image 
                                        src={getProfileUrl(homie.image || "")}
                                        alt={homie.name}
                                        width={50}
                                        height={50}
                                        className="rounded-full w-[50px] h-[50px] object-cover"
                                    />
                                    <div>
                                        <p className="font-bold">{homie.name}</p>
                                        <p className="text-sm text-[#aaa]">@{homie.username}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
