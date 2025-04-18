import { getProfileUrl } from "@/extra/helpers"
import Image from "next/image"
import { motion } from "motion/react"
import { createPortal } from "react-dom"
import { useEffect, useState } from "react"
import { RxCross2 } from "react-icons/rx"

export default function GIFViewer({ image, setOpenImageViewer }: { image: string, setOpenImageViewer: any }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted) return null;

    return createPortal(
        <>
            <motion.div
                onClick={() => setOpenImageViewer(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed top-0 left-0 z-[999] h-screen w-full bg-black bg-opacity-60 backdrop-blur-md flex items-center justify-center"
            />

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="fixed w-[80vw] lg:w-[40vw] top-[50%] left-[50%] z-[1000] translate-x-[-50%] translate-y-[-50%] flex justify-center items-center"
            >   
                <Image
                    src={image}
                    alt="imageView"
                    width={1200}
                    height={1200}
                    className="object-contain rounded-[15px]"
                />
                <motion.div 
                    whileHover={{scale: 1.2}}
                    whileTap={{scale: 0.9}}
                    className="absolute cross rounded-full bg-bgSecondary border-[2px] border-red-500 right-2 top-2 cursor-pointer drop-shadow-[1px_10px_10px_#000]"
                    onClick={() => setOpenImageViewer(false)}
                >
                    <RxCross2 size={20} className="text-red-500 p-1" />
                </motion.div>
            </motion.div>
        </>,
        document.body
    );
}