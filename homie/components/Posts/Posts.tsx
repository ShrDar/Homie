"use client"
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { CiMenuKebab } from "react-icons/ci";
import { BiCommentDetail } from "react-icons/bi";
import { MdOutlinePostAdd } from "react-icons/md";
import { ImCool } from "react-icons/im";
import { AnimatePresence, motion } from 'motion/react';
import { Session } from "next-auth"
import PostsAdd from './PostsAdd';
import { getProfileUrl, getRelativeTime, reactionButtons } from "@/extra/helpers";
import { HomieUser, Post } from '@/homieTypes/homieTypes';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import ReportModal from "@/components/Report/ReportModal";
import PostEdit from './PostsEdit';
import { toast } from 'sonner';
import { storage } from '@/config/AppWriteClient';
import { useRouter } from 'next/navigation';
import DefaultLoading from '../Loading/DefaultLoading';
import PostsComment from './PostsComment';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import ShimmerLoading from '../Loading/ShimmerLoading';
import PostReactions from './PostReactions';
import PostReactionCounts from './PostReactionCounts';


export default function Posts({session} : {session: Session}) {

  const router = useRouter();

  const containerRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<HomieUser[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);  // Add this line
  const [openPostAddModal, setOpenPostAddModal] = useState(false);
  const [openPostEditModal, setOpenPostEditModal] = useState(false);
  const [openPostCommentModal, setOpenPostCommentModal] = useState(false);
  const [isButtonVisible, setIsButtonVisible] = useState(true);
  // const { scrollY } = useScroll({ container: containerRef });
  // const mouseX = useMotionValue(0);
  // const mouseY = useMotionValue(0);
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string>("");
  const [currentEditPost, setCurrentEditPost] = useState<Post | null>(null);
  const [currentCommentPost, setCurrentCommentPost] = useState<Post | null>(null);
  const [currentReactionShowPost, setCurrentReactionShowPost] = useState<Post | null>(null);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [showPostReaction, setShowPostReactions] = useState(false);
  const [showPostReactionCount, setShowPostReactionCount] = useState(false);


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

  // console.log(isButtonVisible)

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
  }, [lastActivityTime, isButtonVisible]);

  useEffect(() => {
    
    fetchPosts();
  }, []);
  
  const fetchPosts = async () => {
    setIsLoadingPosts(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/posts`);
      const postsData = await response.json();
      setPosts(postsData);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const handleDeletePost = async (postId: string, imageId: string | undefined) => {
    setIsDeletingPost(true);
    try {
        // Get the post data to access the commentId
        const postResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/posts/${postId}`);
        const postData = await postResponse.json();

        if (postData.commentId) {
            try {
                const commentRef = doc(db, "Comments", postData.commentId);
                await deleteDoc(commentRef);
            } catch (err) {
                console.error("Error deleting comment document:", err);
            }
        }

        // Delete image from AppWrite if exists
        if (imageId && !imageId.startsWith("http")) {
            try {
                await storage.deleteFile(
                    process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || "",
                    imageId
                );
            } catch (err) {
                console.error("Error deleting image:", err);
            }
        }

        // Delete post from backend
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/posts/${postId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            toast.success("Post vanished into thin air! 👋🏻", {
                style: {
                    backgroundColor: "#2a2a2a",
                    color: "#fff",
                    border: "1px solid #888",
                },
                duration: 3000,
                position: "bottom-right",
            });
            fetchPosts();
        } else {
            toast.error("Oops! Post is being stubborn 🙈", {
                style: {
                    backgroundColor: "#2a2a2a",
                    color: "#fff",
                    borderColor: "#FF6F6F",
                },
                duration: 3000,
                position: "bottom-right",
            });
        }
    } catch (err) {
        console.error("Error deleting post:", err);
        toast.error("Oh Mann... We have a problem! 🚀", {
            style: {
                backgroundColor: "#2a2a2a",
                color: "#fff",
                borderColor: "#FF6F6F",
            },
            duration: 3000,
            position: "bottom-right",
        });
    } finally {
        setIsDeletingPost(false);
    }
};



  if(isLoadingPosts) {
    return (
      <ShimmerLoading displayText='Posts Incoming' />
    )
  }

  if(posts.length === 0) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-24 h-24 bg-bgPrimary rounded-full flex items-center justify-center">
          <MdOutlinePostAdd className="w-12 h-12 text-fontPrimary opacity-50" />
        </div>
        <div className="text-center">
          <h2 className="text-fontPrimary text-2xl font-semibold mb-2">No Posts Yet</h2>
          <p className="text-[#888] max-w-md">Be the first one to share something amazing with your homies!</p>
        </div>
        <motion.button 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={() => setOpenPostAddModal(true)}
          className="px-6 py-3 bg-bgSecondary text-fontPrimary rounded-full shadow-lg hover:bg-[#242424] transition-all duration-300 flex items-center gap-2"
        >
          <MdOutlinePostAdd className="w-5 h-5" />
          <span>Create Post</span>
        </motion.button>
        <PostsAdd 
          openPostAddModal={openPostAddModal} 
          setOpenPostAddModal={setOpenPostAddModal} 
          setPosts={setPosts}
          user={user} 
        />
      </div>
    )
  }
  return (
    <>
      <motion.div 
        ref={containerRef}
        onMouseMove={() => {
          handleMovementForAddPost();
        }}
        onScroll={() => handleMovementForAddPost()}
        className="min-h-screen relative w-full flex flex-col justify-start items-center overflow-y-scroll snap-y snap-mandatory"
      >

        {posts.map((post) => {
          const postUser = users?.find((homie : HomieUser) => homie._id === post.userId);
          const currentUserId = session?.user?.id;
          const hasUserReacted = post.reactions?.some(reaction => reaction.reactUserId === currentUserId);
          let currentColor = "";
          let currentReactionName = "";
          let currentReactionClass = `bg-bgPrimary`
          let currentEmoji = <ImCool size={20} className='hover:text-[#fff]' />;
          let isMoreThanOne = false;

          if(hasUserReacted && post.reactions?.length >= 1) {
            const currentReaction = post.reactions?.find(reaction => reaction.reactUserId === currentUserId);
            const currentReactionHelp = reactionButtons.find(button => button.type === currentReaction?.reactionType);
            
            currentEmoji = currentReactionHelp?.icon;
            currentColor = currentReactionHelp?.color || "";
            currentReactionClass = `bg-bgPrimary`;
            currentReactionName = currentReactionHelp?.label || "";

            // If there are other reactions besides the user's
            if(post.reactions.length > 1) {
              const otherReactionsCount = post.reactions.length - 1;
              currentReactionName = `${currentReactionHelp?.label} ${otherReactionsCount > 0 ? `(+${otherReactionsCount})` : ''}`;
            }
          }
          if(hasUserReacted && post.reactions?.length > 1) {
            isMoreThanOne = true;
            currentEmoji = <div className="flex -space-x-2">
              {post.reactions.slice(0, 2).map((reaction, index) => {
                const reactionButton = reactionButtons.find(button => button.type === reaction.reactionType);
                return (
                  <div key={index} className="w-5 h-5 ">
                    {reactionButton?.icon}
                  </div>
                );
              })}
            </div>;
            currentColor = "#888";
            currentReactionClass = `bg-bgPrimary`;
            currentReactionName = `Reactions`;
          }
          

          
          return (
            <div
              key={`post-${post._id}`}
              className={`min-h-screen w-[90%] py-5 md:w-[80%] lg:w-[70%] flex flex-col snap-start`}
            >
                <div className={`w-full h-full flex rounded-[15px] relative ${post.image ? "bg-bgPrimary" : "bg-[#43434364] px-8"}`}>
                    <div className={`bg-bgSecondary w-full rounded-[15px] p-4 flex flex-col gap-4 ${!post.image ? 'my-auto h-fit' : 'h-full'}`}>
                        <div className="flex justify-between items-center gap-3">
                          <div className='flex items-center gap-3'>
                            <div onClick={() => router.push(`homie/${user?._id}`)} className="w-12 h-12 cursor-pointer rounded-full overflow-hidden bg-bgPrimary">
                                {postUser?.image ? (
                                <Image
                                    key={`user-image-${postUser._id}`}
                                    src={getProfileUrl(postUser.image)}
                                    alt={postUser.name || 'User'}
                                    width={40}
                                    height={40}
                                    className="w-full h-full aspect-auto object-cover"
                                />
                                ) : (
                                <div className="w-full h-full bg-bgPrimary" />
                                )}
                            </div>
                            <div>
                                <h3 className="text-fontPrimary text-xl">{postUser?.name || 'Anonymous'}</h3>
                                <p className="text-sm opacity-60">
                                  {getRelativeTime(post.createdAt)}
                                  {post.isEdited && post.updatedAt !== post.createdAt && 
                                  (
                                      <> 
                                      {" 🖊"} 
                                      </>
                                  )}
                                </p>
                            </div>
                          </div>
                          <DropdownMenu>
                              <DropdownMenuTrigger className="outline-none">
                                  <div className="ml-auto p-2 rotate-[90deg] border-[2px] border-[#888] rounded-full hover:bg-bgPrimary transition-colors">
                                      <CiMenuKebab className="w-6 h-6" />
                                  </div>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="bg-bgSecondary border-[1px] border-[#888] text-fontPrimary p-2 rounded-lg">
                                  {post.userId === user?._id && (
                                      <>
                                          <DropdownMenuItem
                                              onClick={() => {
                                                  setCurrentEditPost(post);
                                                  setOpenPostEditModal(true);
                                              }}
                                              className="cursor-pointer px-4 py-2 hover:bg-bgPrimary rounded-lg transition-all duration-150 flex items-center gap-2"
                                          >
                                              <span className="text-sm sulphur">Edit</span>
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                              onClick={() => {
                                                  handleDeletePost(post._id, post.image);
                                              }}
                                              className="cursor-pointer px-4 py-2 hover:bg-bgPrimary rounded-lg transition-all duration-150 flex items-center gap-2"
                                          >
                                              <span className="text-sm sulphur">Delete</span>
                                          </DropdownMenuItem>
                                      </>
                                  )}
                                  <DropdownMenuItem
                                      onClick={() => {
                                          setSelectedPostId(post._id);
                                          setShowReportModal(true);
                                      }}
                                      className="cursor-pointer px-4 py-2 hover:bg-bgPrimary rounded-lg transition-all duration-150 flex items-center gap-2"
                                  >
                                      <span className="text-sm sulphur">Report</span>
                                  </DropdownMenuItem>
                              </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
    
                        <p className={`text-fontPrimary leading-[30px] whitespace-pre-wrap ${post.image ? "lg:max-h-[20vh] min-h-[7vh]" : "max-h-[60vh]"} p-2 overflow-y-auto`}>
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
                          <div className='flex items-center justify-center gap-2 '>
                            <div onClick={() => { 
                              setShowPostReactionCount(true)
                              setCurrentReactionShowPost(post)
                            }} className='totalReactionCount bg-bgPrimary text-[#888] aspect-square hover:text-[#fff] border-transparent cursor-pointer min-h-[30px] px-4 py-2 rounded-full flex justify-center items-center border-[2px] gap-2 transition-all duration-300'>
                                <motion.p 
                                    key={post.reactions?.length} // Add this line to trigger animation on count change
                                    initial={{y: 20, filter: "blur(10px)"}} 
                                    animate={{y: 0, filter: "blur(0px)"}} 
                                    className='tiny text-xl'
                                >
                                    {post.reactions?.length}
                                </motion.p>
                            </div>
                            <div className='showPostReactionsContainer'>
                              <AnimatePresence>
                                {showPostReaction && (
                                  <PostReactions 
                                      post={post} 
                                      setPosts={setPosts}
                                      setShowPostReaction={setShowPostReactions} 
                                      userId={user?._id || session?.user?.id || ""} 
                                      showPostReaction={showPostReaction}
                                  />
                                )}
                              </AnimatePresence>
                              <motion.div 
                                onClick={() => setShowPostReactions(prev => !prev)} 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                style={{ 
                                  borderColor: currentColor,
                                  color: currentColor
                              }}
                                className={`cursor-pointer min-h-[50px] px-4 py-2 rounded-full flex justify-center items-center border-[2px] gap-2 transition-all duration-300 ${
                                  hasUserReacted 
                                    ? currentReactionClass 
                                    : 'bg-bgPrimary text-[#888] hover:text-[#fff] border-transparent '
                                }`}
                              >
                                <div className={`${isMoreThanOne ? "text-sm" : "text-xl"}`}>
                                  {currentEmoji}
                                </div>
                                <span className={`${
                                  hasUserReacted ? '' : ''
                                }`}>
                                  {hasUserReacted ? currentReactionName : 'Reactions'}
                                </span>
                              </motion.div>
                            </div>
                          </div>
                        
                        <button onClick={() => {
                          setOpenPostCommentModal(true)
                          setCurrentCommentPost(post)
                        }} className="text-[#888] px-4 py-2 rounded-full bg-bgPrimary hover:brightness-110 hover:text-[#fff] transition-all flex justify-center items-center gap-2">
                            <BiCommentDetail className="w-5 h-5" />
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
          className={`fixed bottom-10 right-12 p-4 bg-bgSecondary text-white rounded-full shadow-lg hover:bg-[#242424] transition-all duration-300 z-50 group ${
            !isButtonVisible && 'pointer-events-none'
          }`}
          onClick={() => setOpenPostAddModal(true)}
        >
          <div className="flex items-center">
            <MdOutlinePostAdd className="w-6 h-6" />
            <span className="w-0 overflow-hidden group-hover:w-16 transition-all duration-300 ease-in-out">
              Post
            </span>
          </div>
        </motion.button>

        <PostsAdd 
          openPostAddModal={openPostAddModal} 
          setOpenPostAddModal={setOpenPostAddModal} 
          setPosts={setPosts}
          user={user} 
        />
        <PostEdit
          openPostEditModal={openPostEditModal}
          setOpenPostEditModal={setOpenPostEditModal}
          setPosts={setPosts}
          user={user}
          currentEditPost={currentEditPost}
          />
      </motion.div>
      {showReportModal && (
        <ReportModal 
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          reportedContentId={selectedPostId}
          currentUserId={user?._id || session?.user?.id || ""}
          reportType="post"
        />
      )}
      {
        setOpenPostCommentModal && (
          <PostsComment
            openPostCommentModal={openPostCommentModal}
            setOpenPostCommentModal={setOpenPostCommentModal}
            user={user}
            currentCommentPost={currentCommentPost}
          />
        )
      }
      {
        showPostReactionCount && (
          <PostReactionCounts 
            showPostReactionCount={showPostReactionCount}
            setShowPostReactionCount={setShowPostReactionCount}
            post={currentReactionShowPost}
          />
        )
      }
      
      {isDeletingPost && <DefaultLoading displayText="Deleting Post" />}
    </>
  );
}
