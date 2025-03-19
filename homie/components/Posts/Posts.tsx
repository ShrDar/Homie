"use client"
import { useState } from 'react';
import Image from 'next/image';
import { CiMenuKebab } from "react-icons/ci";
import { BiCommentDetail } from "react-icons/bi";

interface Post {
  id: string;
  author: string;
  content: string;
  imageUrl?: string;
  timestamp: string;
  authorImage?: string;
}


export default function Posts() {
  const [posts] = useState<Post[]>([
    {
      id: '1',
      author: 'Eddie Brock',
      authorImage: '/template/templatePostImage.png',
      content: `I’m Eddie Brock, a journalist who always chased the truth, no matter the cost. But my relentless pursuit led me down a path I never expected—one that fused me with an alien symbiote called Venom. Now, we are something more than human. Together, we possess incredible strength, heightened agility, and an almost indestructible form. Venom gives me power beyond my wildest imagination, but with it comes an insatiable hunger and a voice that’s not entirely my own. We’re not heroes, but we’re not exactly villains either. We walk the thin line between justice and chaos, dealing with threats in our own way—on our own terms. While the world fears us, some also see us as a necessary evil. But one thing is certain: whether as Eddie Brock or Venom, we are unstoppable. And if anyone dares to stand in our way... they’d better be ready to run.`,
      imageUrl: 'https://media.vanityfair.com/photos/67193d906864cd1040e056ef/4:3/w_1708,h_1281,c_limit/MCDVETH_SP002.jpg',
      timestamp: '1hr ago'
    },
    {
      id: '2',
      author: 'John Doe',
      content: `New York City's friendly neighborhood Spider-Man was spotted in action last night, thwarting a high-speed robbery in Midtown. Witnesses report that the masked vigilante swung into action just as armed thieves attempted to flee a jewelry store. Within minutes, the web-slinger subdued the criminals, leaving them entangled in his signature webbing for NYPD to handle. While opinions on Spider-Man remain divided, many locals praise his heroics. "He saved lives tonight," said one relieved shop owner. The Daily Bugle, however, urges caution—who holds Spider-Man accountable? Is he truly a hero or just another masked menace? Stay tuned. New York City's friendly neighborhood Spider-Man was spotted in action last night, thwarting a high-speed robbery in Midtown. Witnesses report that the masked vigilante swung into action just as armed thieves attempted to flee a jewelry store. Within minutes, the web-slinger subdued the criminals, leaving them entangled in his signature webbing for NYPD to handle. While opinions on Spider-Man remain divided, many locals praise his heroics. "He saved lives tonight," said one relieved shop owner. The Daily Bugle, however, urges caution—who holds Spider-Man accountable? Is he truly a hero or just another masked menace? Stay tuned.`,
      timestamp: '2hr ago'
    },
  ]);


  return (
    <div className="min-h-screen w-full flex flex-col justify-start items-center overflow-y-scroll snap-y snap-mandatory">
      {posts.map((post) => (
        <div
          key={post.id}
          className={`min-h-screen w-[90%] py-5 md:w-[80%] lg:w-[70%] flex flex-col snap-start`}
        >
            <div className={`w-full h-full flex rounded-[15px] ${post.imageUrl ? "bg-bgPrimary" : "bg-[#43434364] px-8"}`}>
                <div className={`bg-bgSecondary rounded-[15px] p-4 flex flex-col gap-4 ${!post.imageUrl ? 'my-auto h-fit' : 'h-full'}`}>
                    <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-bgPrimary">
                        {post.authorImage ? (
                        <Image
                            src={post.authorImage}
                            alt={post.author}
                            width={40}
                            height={40}
                            className="w-full h-full aspect-auto object-cover"
                        />
                        ) : (
                        <div className="w-full h-full bg-bgPrimary" />
                        )}
                    </div>
                    <div>
                        <h3 className="text-fontPrimary text-xl">{post.author}</h3>
                        <p className="text-sm opacity-60">{post.timestamp}</p>
                    </div>
                    <button className="ml-auto p-2 rotate-[90deg] border-[2px] border-[#888] rounded-full hover:bg-bgPrimary transition-colors">
                        <CiMenuKebab className="w-6 h-6" />
                    </button>
                    </div>

                    <p className={`text-fontPrimary leading-[30px] text-justify ${post.imageUrl ? "lg:h-[20vh]" : "max-h-[60vh]"} p-2  overflow-y-auto`}>{post.content}</p>

                    {post.imageUrl && (
                    <div className="w-full h-full relative">
                        <Image
                        src={post.imageUrl}
                        alt={`${post.author}'s post`}
                        fill
                        className="object-cover w-full rounded-lg"
                        />
                    </div>
                    )}

                    <div className="w-full flex justify-between gap-0">
                    <div className={`postReactions`}>
                        <div>
                            <button className="text-fontPrimary px-4 py-2 rounded-full bg-bgPrimary hover:brightness-110 transition-all">
                                Dap
                            </button>
                        </div>
                    </div>
                    <button className="text-fontPrimary px-4 py-2 rounded-full bg-bgPrimary hover:brightness-110 transition-all flex justify-center items-center gap-2">
                        <BiCommentDetail className="w-5 h-5 text-fontPrimary" />
                        <p>Comment</p>
                    </button>
                    </div>
                </div>
            </div>
        </div>
      ))}
    </div>
  );
}