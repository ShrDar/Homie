"use client"
import { useState } from 'react';
import Image from 'next/image';
import { CiMenuKebab } from "react-icons/ci";

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
      authorImage: '/venom.jpg',
      content: "I'm Eddie Brock, a journalist who got tangled up with an alien symbiote called Venom. Now, we're a powerful, unpredictable duo—superhuman strength, agility, and a dark, complicated moral compass.",
      imageUrl: '/venom.jpg',
      timestamp: '1hr ago'
    },
    {
      id: '2',
      author: 'John Doe',
      content: 'This is a post without an image to demonstrate the flexible layout.',
      timestamp: '2hr ago'
    },
  ]);

  return (
    <div className="min-h-screen w-full flex flex-col justify-start items-center overflow-y-scroll snap-y snap-mandatory">
      {posts.map((post) => (
        <div
          key={post.id}
          className="min-h-screen w-[90%] py-5 md:w-[80%] lg:w-[70%] flex flex-col snap-start bg-bgPrimary"
        >
          <div className="bg-bgSecondary rounded-[15px] p-4 flex flex-col flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-bgPrimary">
                {post.authorImage ? (
                  <Image
                    src={post.authorImage}
                    alt={post.author}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-bgPrimary" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-fontPrimary">{post.author}</h3>
                <p className="text-sm opacity-60">{post.timestamp}</p>
              </div>
              <button className="ml-auto p-2 rotate-[90deg] border-[2px] border-[#888] rounded-full hover:bg-bgPrimary transition-colors">
                <CiMenuKebab className="w-6 h-6" />
              </button>
            </div>

            <p className="text-fontPrimary mb-4">{post.content}</p>

            {post.imageUrl && (
              <div className="flex-1 relative min-h-0 mb-4">
                <Image
                  src={post.imageUrl}
                  alt={`${post.author}'s post`}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            )}

            <div className="mt-auto flex gap-4">
              <button className="text-fontPrimary px-4 py-2 rounded-full bg-bgPrimary hover:brightness-110 transition-all">
                Dap
              </button>
              <button className="text-fontPrimary px-4 py-2 rounded-full bg-bgPrimary hover:brightness-110 transition-all">
                Comment
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}