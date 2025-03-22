"use client"
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { CiMenuKebab } from "react-icons/ci";
import { BiCommentDetail } from "react-icons/bi";
import { MdOutlinePostAdd } from "react-icons/md";
import { motion } from 'motion/react';
import { Session } from "next-auth"
import PostsAdd from './PostsAdd';
import { getProfileUrl } from "@/extra/helpers";
import { HomieUser } from '@/homieTypes/homieTypes';


interface Post {
  _id: string;
  title: string;
  content: string;
  userId: string;
  image?: string;
  commentId?: string;
  reactions: {
    dap: number;
    love: number;
    laugh: number;
    angry: number;
    cheeky: number;
  };
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

// Add this utility function before the Posts component
function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

export default function Posts({session} : {session: Session}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<HomieUser[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [openPostAddModal, setOpenPostAddModal] = useState(false);
  const [isButtonVisible, setIsButtonVisible] = useState(true);
  // const { scrollY } = useScroll({ container: containerRef });
  // const mouseX = useMotionValue(0);
  // const mouseY = useMotionValue(0);
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());

  // Add user fetch effect
  useEffect(() => {
    const fetchUserData = async() => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${session?.user?.id}`);
        const userData = await response.json();
        setUser(userData);
      } catch(err) {
        console.error(err);
      }
    }
    const fetchUsersData = async() => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users`);
        const usersData = await response.json();
        setUsers(usersData);
      } catch(err) {
        console.error(err);
      }
    }
    
    if (session?.user?.id) {
      fetchUserData();
      fetchUsersData();
    }
  }, [session?.user?.id]);

  const handleMovementForAddPost = () => {
    if(!isButtonVisible) {
      setIsButtonVisible(true);
      setLastActivityTime(Date.now());
    }
  }

  console.log(isButtonVisible)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleMouseMove = () => {
      if(!isButtonVisible) {
        setIsButtonVisible(true);
        setLastActivityTime(Date.now());
      }
    };

    const checkInactivity = () => {
      if (Date.now() - lastActivityTime > 5000) {
        setIsButtonVisible(false);
      }
      timeoutId = setTimeout(checkInactivity, 1000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    timeoutId = setTimeout(checkInactivity, 1000);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeoutId);
    };
  }, [lastActivityTime]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/posts`);
        const postsData = await response.json();
        setPosts(postsData);
      } catch (err) {
        console.error('Error fetching posts:', err);
      }
    };

    fetchPosts();
  }, []);

  return (
    <motion.div 
      ref={containerRef}
      onMouseMove={(e) => {
        handleMovementForAddPost();
      }}
      onScroll={() => handleMovementForAddPost()}
      className="min-h-screen w-full flex flex-col justify-start items-center overflow-y-scroll snap-y snap-mandatory"
    >
      {posts.map((post) => {
        const user = users?.find((homie : HomieUser) => homie._id === post.userId)
        return (
          <div
            key={`post-${post._id}`}
            className={`min-h-screen w-[90%] py-5 md:w-[80%] lg:w-[70%] flex flex-col snap-start`}
          >
              <div className={`w-full h-full flex rounded-[15px] ${post.image ? "bg-bgPrimary" : "bg-[#43434364] px-8"}`}>
                  <div className={`bg-bgSecondary rounded-[15px] p-4 flex flex-col gap-4 ${!post.image ? 'my-auto h-fit' : 'h-full'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-bgPrimary">
                            {user?.image ? (
                            <Image
                                key={`user-image-${user._id}`}
                                src={getProfileUrl(user.image)}
                                alt={user.name || 'User'}
                                width={40}
                                height={40}
                                className="w-full h-full aspect-auto object-cover"
                            />
                            ) : (
                            <div className="w-full h-full bg-bgPrimary" />
                            )}
                        </div>
                        <div>
                            <h3 className="text-fontPrimary text-xl">{user?.name || 'Anonymous'}</h3>
                            <p className="text-sm opacity-60">
                              {getRelativeTime(post.createdAt)}
                            </p>
                        </div>
                        <button className="ml-auto p-2 rotate-[90deg] border-[2px] border-[#888] rounded-full hover:bg-bgPrimary transition-colors">
                            <CiMenuKebab className="w-6 h-6" />
                        </button>
                      </div>
  
                      <p className={`text-fontPrimary leading-[30px] text-justify whitespace-pre-wrap ${post.image ? "lg:h-[20vh]" : "max-h-[60vh]"} p-2 overflow-y-auto`}>
                        {post.content}
                      </p>
  
                      {post.image && (
                      <div className="w-full h-full relative">
                          <Image
                              key={`post-image-${post._id}`}
                              src={getProfileUrl(post.image)}
                              alt={post.title}
                              fill
                              className="object-cover w-full rounded-lg"
                          />
                      </div>
                      )}
  
                      <div className="w-full flex justify-between gap-0">
                      <div className={`postReactions`}>
                          <div>
                              <button className="text-fontPrimary px-4 py-2 rounded-full bg-bgPrimary hover:brightness-110 transition-all">
                                  Dap ({post.reactions.dap})
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
        )
      } 
      )}
      
      <motion.button 
        initial={{ scale: 0 }}
        animate={{ 
          scale: isButtonVisible ? 1 : 0,
        }}
        whileHover={{scale: 1.1}}
        whileTap={{scale: 0.9}}
        transition={{ duration: 0.1 , ease: 'linear'}}
        className={`fixed bottom-10 right-12 p-4 bg-bgSecondary text-white rounded-full shadow-lg hover:bg-[#] transition-all duration-300 z-50 ${
          !isButtonVisible && 'pointer-events-none'
        }`}
        onClick={() => setOpenPostAddModal(true)}
      >
        <MdOutlinePostAdd className="w-6 h-6" />
      </motion.button>

      <PostsAdd 
        openPostAddModal={openPostAddModal} 
        setOpenPostAddModal={setOpenPostAddModal} 
        setPosts={setPosts}
        user={user} 
      />
    </motion.div>
  );
}