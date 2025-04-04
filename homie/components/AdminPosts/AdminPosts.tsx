"use client"
import { useEffect, useState } from 'react'
import { toast } from 'sonner' 
import { storage } from '@/config/AppWriteClient' 
import { FiEdit2, FiFileText, FiTrash2 } from 'react-icons/fi'
import Image from 'next/image'
import { getProfileUrl, getRelativeTime } from '@/extra/helpers' 
import { HomieUser, Post } from '@/homieTypes/homieTypes'
import AdminPostsEdit from './AdminPostsEdit'



export default function AdminPosts() {
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedPost, setSelectedPost] = useState<Post | null>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [currentUser, setCurrentUser] = useState<HomieUser | null>(null);
    // const [openImageViewer,setOpenImageViewer] = useState<boolean>(false);

    useEffect(() => {
        fetchPosts()
    }, [])

    const fetchUser = async(userId: string) => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${userId}`);
        const userData = await response.json();
        setCurrentUser(userData)
      } catch(err) {
        console.error(err);
      }
    }

    const fetchPosts = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/posts`)
            const postsData = await response.json()
            setPosts(postsData)
        } catch (err) {
            console.error('Error fetching posts:', err)
            toast.error('Failed to fetch posts')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (postId: string, imageId: string | null) => {

        try {
            // Delete image from storage if exists
            if (imageId && !imageId.startsWith('http')) {
                try {
                    await storage.deleteFile(
                        process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || '',
                        imageId
                    )
                } catch (err) {
                    console.error('Error deleting image:', err)
                }
            }

            // Delete post
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/posts/${postId}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                toast.success('Post deleted successfully')
                fetchPosts()
            } else {
                toast.error('Failed to delete post')
            }
        } catch (err) {
            console.error('Error deleting post:', err)
            toast.error('Failed to delete post')
        }
    }

    useEffect(() => {
        fetchPosts()
    }, [])

    return (
        <div className="min-h-screen bg-bgPrimary p-8">
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-fontPrimary flex items-center gap-3">
                            <FiFileText className="text-fontPrimary" />
                            Posts Dashboard
                        </h1>
                        <p className="mt-2 text-gray-400">
                            Monitor and manage all user posts across the platform
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-bgSecondary rounded-lg px-4 py-2">
                            <p className="text-sm text-gray-400">Total Posts</p>
                            <p className="text-2xl font-bold text-fontPrimary">{posts.length}</p>
                        </div>
                        <div className="bg-bgSecondary rounded-lg px-4 py-2">
                            <p className="text-sm text-gray-400">With Images</p>
                            <p className="text-2xl font-bold text-blue-400">
                                {posts.filter(post => post.image).length}
                            </p>
                        </div>
                        <div className="bg-bgSecondary rounded-lg px-4 py-2">
                            <p className="text-sm text-gray-400">Total Reactions</p>
                            <p className="text-2xl font-bold text-green-400">
                                {posts.reduce((acc, post) => acc + (post.reactions?.length || 0), 0)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            {loading ? (
                <div className="flex items-center justify-center p-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                </div>
            ) : (
                <div className="bg-bgSecondary rounded-xl shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[#585858]">
                                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Content</th>
                                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Image</th>
                                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Created</th>
                                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Reactions</th>
                                    <th className="text-right py-4 px-6 text-gray-400 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {posts.map((post) => (
                                    <tr 
                                        key={post._id} 
                                        className="border-b border-[#585858] hover:bg-bgPrimary/30 transition-colors"
                                    >
                                        <td className="py-4 px-6">
                                            <div className="text-sm text-fontPrimary">{post.content.slice(0, 100)}...</div>
                                        </td>
                                        <td className="py-4 px-6">
                                            {post.image && (
                                                <div className="h-24 w-24 relative rounded-lg overflow-hidden">
                                                    <Image
                                                        src={getProfileUrl(post.image)}
                                                        alt="Post image"
                                                        fill
                                                        className="object-cover hover:scale-110 transition duration-200"
                                                    />
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="text-sm text-gray-400">
                                                {getRelativeTime(post.createdAt)}
                                                {post.isEdited && post.updatedAt !== post.createdAt && 
                                                    <span className="ml-2 text-fontPrimary">🖊</span>
                                                }
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                                                {post.reactions?.length || 0} reactions
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedPost(post)
                                                        setIsEditModalOpen(true)
                                                        fetchUser(post?.userId)
                                                    }}
                                                    className="p-2 bg-bgPrimary text-blue-400 rounded-lg hover:bg-bgPrimary/80 transition-colors"
                                                    title="Edit post"
                                                >
                                                    <FiEdit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(post._id, post.image || "")}
                                                    className="p-2 bg-bgPrimary text-red-400 rounded-lg hover:bg-bgPrimary/80 transition-colors"
                                                    title="Delete post"
                                                >
                                                    <FiTrash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            {isEditModalOpen && (
                <AdminPostsEdit
                    openPostEditModal={isEditModalOpen}
                    setOpenPostEditModal={setIsEditModalOpen}
                    user={currentUser}
                    setPosts={setPosts}
                    currentEditPost={selectedPost}
                />
            )}
        </div>
    )
}