"use client"
import { useEffect, useState } from 'react'
import { toast } from 'sonner' 
import { storage } from '@/config/AppWriteClient' 
import { FiEdit2, FiTrash2 } from 'react-icons/fi'
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
        <div className="container mx-auto px-4 py-8">
            <div className="bg-bgSecondary rounded-xl shadow-lg p-6 mb-8">
                <h1 className="text-3xl font-bold">Posts Management</h1>
                <p className="text-gray-500 mt-2">Manage all user posts from one place</p>
            </div>
            
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="bg-bgSecondary rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-bgPrimary">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Content</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Image</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Created</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Reactions</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {posts.map((post) => (
                                    <tr key={post._id} className="hover:bg-bgPrimary transition duration-150">
                                        <td className="px-6 py-4">
                                            <div className="text-sm">{post.content.slice(0, 100)}...</div>
                                        </td>
                                        <td className="px-6 py-4">
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
                                        <td className="px-6 py-4">
                                            <div className="text-sm opacity-80">
                                                {getRelativeTime(post.createdAt)}
                                                {post.isEdited && post.updatedAt !== post.createdAt && 
                                                    <span className="ml-2 text-primary">🖊</span>
                                                }
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                {post.reactions?.length || 0} reactions
                                            </div>
                                        </td>
                                        
                                        <td className="px-6 py-4">
                                            <div className="flex space-x-4">
                                                <button
                                                    onClick={() => {
                                                        setSelectedPost(post)
                                                        setIsEditModalOpen(true)
                                                        fetchUser(post?.userId)
                                                    }}
                                                    className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 transition duration-150"
                                                >
                                                    <FiEdit2 className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(post._id, post.image || "")}
                                                    className="p-2 rounded-lg bg-red-500 hover:bg-red-600 transition duration-150"
                                                >
                                                    <FiTrash2 className="w-5 h-5" />
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

            {/* Modal remains the same */}
            {/* Add the AdminPostsEdit component */}
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