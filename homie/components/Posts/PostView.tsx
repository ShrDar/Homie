import { Post } from "@/homieTypes/homieTypes";
import Image from "next/image";
import { getProfileUrl } from "@/extra/helpers";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function PostView({post} : {post: Post}) {
    const router = useRouter();
    const [postUser, setPostUser] = useState<any>(null);

    function getRelativeTime(dateString: string): string {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}hr ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'Just now';
    }

    useEffect(() => {
        const fetchPostUser = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${post.userId}`);
                const userData = await response.json();
                setPostUser(userData);
            } catch (err) {
                console.error("Error fetching post user:", err);
            }
        };

        if (post.userId) {
            fetchPostUser();
        }
    }, [post.userId]);

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="z-[100] h-full w-full md:flex hidden"
        >
            <motion.div 
                initial={{ scale: 0.98 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={`w-full h-full flex rounded-[15px] ${post.image ? "bg-bgPrimary" : "bg-[#43434364]"}`}
            >
                <div className={`bg-bgSecondary w-full rounded-[15px] p-4 flex flex-col gap-4 ${!post.image ? 'my-auto h-fit' : 'h-full'}`}>
                    <motion.div 
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center gap-3"
                    >
                        <motion.div 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => router.push(`/homie/${postUser?._id}`)} 
                            className="w-12 h-12 cursor-pointer rounded-full overflow-hidden bg-bgPrimary"
                        >
                            {postUser?.image ? (
                                <Image
                                    src={getProfileUrl(postUser.image)}
                                    alt={postUser.name || 'User'}
                                    width={30}
                                    height={30}
                                    className="w-full h-full aspect-auto object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-bgPrimary" />
                            )}
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h3 className="text-fontPrimary">{postUser?.name || 'Anonymous'}</h3>
                            <p className="text-sm opacity-60">
                                {getRelativeTime(post.createdAt)}
                                {post.isEdited && post.updatedAt !== post.createdAt && " 🖊"}
                            </p>
                        </motion.div>
                    </motion.div>

                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className={`text-fontPrimary leading-[30px] whitespace-pre-wrap ${post.image ? "lg:max-h-[20vh] min-h-[7vh]" : "max-h-[20vh]"} p-2 overflow-y-auto`}
                    >
                        {post.content}
                    </motion.p>

                    {post.image && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.4 }}
                            className="w-full h-full relative"
                        >
                            <Image
                                src={getProfileUrl(post.image)}
                                alt={post.title || "Post image"}
                                width={500}
                                height={500}
                                className="object-cover w-full rounded-lg"
                            />
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}