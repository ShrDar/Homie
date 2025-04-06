import { Post } from "@/homieTypes/homieTypes";
import { motion } from "framer-motion";
import Image from "next/image";
// import { useRouter } from "next/navigation";
import { formatDistanceToNow } from 'date-fns';
import { getProfileUrl } from "@/extra/helpers";

export default function HomieIndividualPostPreview({ posts }: { posts: Post[] }) {
    // const router = useRouter();

    return (
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
            layout="position"
            className="hidden lg:flex w-[400px] h-[600px] bg-[#434343ae] backdrop-blur-sm border-[2px] border-[#888] rounded-[15px] p-4 flex-col gap-4"
        >
            <div className="flex flex-col gap-3 h-full overflow-y-auto">
                {posts.length > 0 ? (
                    posts.map((post, index) => (
                        <motion.div 
                            key={post._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex flex-col gap-2 bg-bgPrimary p-3 rounded-lg cursor-pointer"
                        >
                            <p className="text-sm text-[#aaa] line-clamp-2">{post.content}</p>
                            
                            {post.image && (
                                <div className="relative w-full h-40 mt-2">
                                    <Image 
                                        src={getProfileUrl(post.image)}
                                        alt={post.title}
                                        fill
                                        className="object-cover rounded-lg"
                                    />
                                </div>
                            )}

                            <div className="flex items-center justify-between gap-2 mt-2">
                                <span className="text-sm text-[#aaa]">
                                    {post.reactions.length} reactions
                                </span>
                                <span className="text-xs text-[#aaa]">
                                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                                </span>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-[#aaa] text-lg">No posts yet</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}