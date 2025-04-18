import { Tea } from "@/homieTypes/homieTypes";
import { motion } from "framer-motion";
import Image from "next/image";
import { getProfileUrl } from "@/extra/helpers";
import { useRouter } from "next/navigation";

export default function HomieIndividualTeaPreview({ teas, userId }: { teas: Tea[], userId: string | string[] | undefined }) {
    const router = useRouter();
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
                {teas.length > 0 ? (
                    teas.map((tea, index) => (
                        <motion.div 
                            key={tea._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => router.push(`/teas/${userId}`)}
                            className="flex flex-col gap-2 bg-bgPrimary p-3 rounded-lg cursor-pointer"
                        >
                            
                            <div className="flex flex-wrap gap-2 mt-2">
                                {tea.tags.map((tag, idx) => (
                                    <span key={idx} className="text-xs text-[#aaa] bg-bgSecondary px-2 py-1 rounded-full">
                                        #{tag}
                                    </span>
                                ))}
                            </div>

                            <h3 className="text-lg font-semibold text-white">{tea.title}</h3>
                            <p className="text-sm text-[#aaa] line-clamp-2">{tea.content}</p>
                            
                            {tea.image && (
                                <div className="relative w-full h-40 mt-2">
                                    <Image 
                                        src={getProfileUrl(tea.image)}
                                        alt={tea.title}
                                        fill
                                        className="object-cover rounded-lg"
                                    />
                                </div>
                            )}

                            <div className="flex items-center justify-between gap-2 mt-2">
                                <span className="flex items-center gap-2 text-sm text-[#aaa]">
                                    <span className={`w-2 h-2 rounded-full ${tea.isOpen ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                    {tea.isOpen ? 'Open' : 'Closed'}
                                </span>
                                <span className="text-xs text-[#aaa]">
                                    {new Date(tea.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-[#aaa] text-lg">No teas yet</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}