import { getProfileUrl } from "@/extra/helpers"
import Image from "next/image"
import { motion } from "motion/react"

export default function ProfileImageViewer( {image, setOpenImageViewer} : {image: string | null, setOpenImageViewer: any} ) {
    return (
        <>
             <motion.div 
                onClick={() => setOpenImageViewer(false)} 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed top-0 left-0 z-[50] h-screen w-full bg-black bg-opacity-60 backdrop-blur-md flex items-center justify-center"
            />

            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="fixed max-w-[90vw] max-h-[90vh] top-[50%] left-[50%] z-[51] translate-x-[-50%] translate-y-[-50%] flex justify-center items-center rounded-full">
                <Image 
                    src={getProfileUrl(image || "")}
                    alt="profile"
                    width={1200}
                    height={1200}
                    className="max-w-full max-h-[90vh] min-w-[40vw] md:min lg:min-w-[25vw] w-auto h-auto object-cover rounded-full aspect-square"
                />
            </motion.div>
        </>
    )
}