"use client"
import { motion } from "motion/react"
import { Session } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaBarsStaggered } from "react-icons/fa6";

export default function SlideBar( {session} : {session: Session} ) {

    const [hidden, setHidden] = useState(true);
    const [user, setUser] = useState({username: ''});

    useEffect(() => {
        const fetchUserData = async() => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${session?.user?.id}`);
            const user = await response.json();
            setUser(user);
        }
    
        fetchUserData();
    }, [session?.user?.id])

    return (
        <>
            <div className={`lg:hidden h-full absolute w-full bg-[#00000058] z-[50] ${hidden ? "hidden" : "flex"} `} onClick={() => setHidden(true)}></div>
            <div className="w-[40%] h-full bg-transparent z-0 absolute left-0 hidden md:flex " onMouseEnter={() => setHidden(true)}></div>
            <div onClick={() => setHidden((prev) => !prev)} className="absolute flex md:hidden cursor-pointer top-5 right-5">
                <FaBarsStaggered color="#fff" />
            </div>
            <motion.div 
            variants={{
                visible: { x: 0 },
                hidden: { x: "-98%" }
            }}
            animate={hidden ? "hidden" : "visible"}
            transition={{ duration: 0.4 , ease: "easeInOut" }}
            onMouseEnter={() => setHidden(false)} className="slideBar z-[100] lg:z-10 bg-transparent text-fontPrimary fixed top-0 h-full left-[-10px] md:left-0 flex justify-center items-center w-[40%] md:w-[20%] lg:w-[14%] sulphur">
                <div className="bg-bgSecondary h-[95%] w-[90%] md:w-full flex flex-col justify-center items-center gap-5 rounded-[15px] ml-2">
                    <div className="flex flex-col justify-center items-center gap-2">
                        <div className="w-full flex items-center justify-center lg:px-4">
                            <div className="bg-[#8B8B8B] w-[80%] aspect-square md:w-[70%] lg:w-[85%] p-3 rounded-full overflow-hidden translate-x-[15px] flex justify-center items-center">
                                <Image 
                                    src={"/figmaIcons/bio.svg"}
                                    alt=""
                                    height={200}
                                    width={200}
                                    className="md:w-[80%] lg:w-[90%]"
                                />
                            </div>
                            <div className="w-[80%] md:w-[70%] lg:w-[85%] translate-x-[-15px] aspect-square flex justify-center items-center">
                                <Image 
                                    src={session?.user?.image || "/Homie-2.svg"}
                                    alt=""
                                    height={200}
                                    width={200}
                                    className="rounded-full md:w-[80%] lg:w-[90%]"
                                />
                            </div>
                        </div>
                        <div className="w-full flex flex-col justify-center items-center gap-0 text-center">
                            <p className="text-lg">{session.user?.name}</p>
                            <p className="text-sm">@{user.username}</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-start w-full gap-4">
                        <div className={`w-[70%] text-lg font-thin`} onClick={() => setHidden(true)}>
                            <Link href="/">
                                <p>Home</p>
                            </Link>
                        </div>
                        <div className={`w-[70%] text-lg font-thin`}>
                            <Link href="/profile" onClick={() => setHidden(true)}>
                                <p>Profile</p>
                            </Link>
                        </div>
                        <div className={`w-[70%] text-lg font-thin`}>
                            <Link href="/texts" onClick={() => setHidden(true)}>
                                <p>Texts</p>
                            </Link>
                        </div>
                        <div className={`w-[70%] text-lg font-thin`}>
                            <Link href="/homies" onClick={() => setHidden(true)}>
                                <p>Homies</p>
                            </Link>
                        </div>
                        <div className={`w-[70%] text-lg font-thin`}>
                            <Link href="/texts" onClick={() => setHidden(true)}>
                                <p>Texts</p>
                            </Link>
                        </div>
                        <div className={`w-[70%] text-lg font-thin`}>
                            <Link href="/issues" onClick={() => setHidden(true)}>
                                <p>Issues</p>
                            </Link>
                        </div>

                    </div>
                </div>  
            </motion.div>
        </>
    )
}
