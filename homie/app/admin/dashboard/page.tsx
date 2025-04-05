"use client";

import { useEffect, useState } from 'react';
import { FiFileText, FiAlertCircle, FiCoffee, FiUsers, FiActivity } from 'react-icons/fi';
import { motion } from 'motion/react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { formatDistanceToNow } from 'date-fns';
import ShimmerLoading from '@/components/Loading/ShimmerLoading';
import { useRouter } from 'next/navigation';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalPosts: number;
  totalReports: number;
  totalTeas: number;
}

interface RecentItem {
  id: string;
  title: string;
  timestamp: Date;
  type: 'user' | 'post' | 'tea' | 'report';
  description?: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalPosts: 0,
    totalReports: 0,
    totalTeas: 0
  });
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch users
        const usersResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users`);
        const users = await usersResponse.json();

        // Fetch posts
        const postsResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/posts`);
        const posts = await postsResponse.json();

        // Fetch reports from Firebase
        const reportsRef = collection(db, "Reports");
        const reportsSnapshot = await getDocs(reportsRef);
        const reportsCount = reportsSnapshot.size;

        // Fetch teas from Firebase
        const teasRef = collection(db, "Tea");
        const teasSnapshot = await getDocs(teasRef);
        const teasCount = teasSnapshot.size;
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const activeUsers = posts.filter((post: any) => 
          new Date(post.createdAt) > twentyFourHoursAgo
        ).length;
        // Get recent teas with their data
        const recentTeas = teasSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).slice(-5).map((tea: any) => ({
          id: tea.id,
          title: tea.title || 'Tea',
          timestamp: tea.createdAt?.toDate() || new Date(),
          type: 'tea',
          description: 'New tea added'
        }));

        setStats({
          totalUsers: users.length,
          activeUsers,
          totalPosts: posts.length,
          totalReports: reportsCount,
          totalTeas: teasCount
        });

        // Fetch recent items
        const recentUsers = users.slice(-5).map((user: any) => ({
          id: user.id,
          title: user.username || user.email,
          timestamp: new Date(user.createdAt),
          type: 'user',
          description: 'New user joined'
        }));

        const recentPosts = posts.slice(-5).map((post: any) => ({
          id: post._id,
          title: post.title + "..." || 'New Post',
          timestamp: new Date(post.createdAt),
          type: 'post',
          description: post.content?.substring(0, 50) + '...'
        }));

        // Combine and sort recent items
        const allRecentItems = [...recentUsers, ...recentPosts, ...recentTeas]
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, 10);

        setRecentItems(allRecentItems);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, route }: { 
    title: string; 
    value: number; 
    icon: any; 
    color: string;
    route: string;
  }) => (
    <motion.div
      onClick={() => router.push(route)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ 
        duration: 0.2,
        type: "spring",
        stiffness: 400,
        damping: 20
      }}
      className="bg-bgSecondary p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-100 border border-[#585858]/20 cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <h3 className="text-3xl font-bold text-fontPrimary mt-2">{value}</h3>
        </div>
        <div className={`p-4 rounded-full ${color} bg-opacity-20`}>
          <Icon className={`text-2xl ${color}`} />
        </div>
      </div>
    </motion.div>
  );

  const getIconForType = (type: string) => {
    switch (type) {
      case 'user': return <FiUsers className="text-blue-500" />;
      case 'post': return <FiFileText className="text-green-500" />;
      case 'tea': return <FiCoffee className="text-yellow-500" />;
      case 'report': return <FiAlertCircle className="text-red-500" />;
      default: return null;
    }
  };

  if (loading) {
    return (
        <div className='flex w-full h-full overflow-hidden justify-items-center'>
            <ShimmerLoading displayText='Wait a sec...' />
        </div>
    );
  }

  return (
    <div className="max-h-screen overflow-hidden bg-bgPrimary text-fontPrimary sulphur">
      <div className="p-8 flex flex-col gap-6">
        {/* <div className="">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">Overview</h1>
              <p className="mt-2 text-gray-400">Monitor your platform's key metrics and statistics</p>
            </div>
          </div>
        </div> */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={FiUsers}
            color="text-blue-500"
            route="/admin/dashboard/users"
          />
          <StatCard
            title="Total Posts"
            value={stats.totalPosts}
            icon={FiFileText}
            color="text-green-500"
            route="/admin/dashboard/posts"
          />
          <StatCard
            title="Active Reports"
            value={stats.totalReports}
            icon={FiAlertCircle}
            color="text-red-500"
            route="/admin/dashboard/reports"
          />
          <StatCard
            title="Tea Reviews"
            value={stats.totalTeas}
            icon={FiCoffee}
            color="text-yellow-500"
            route="/admin/dashboard/teas"
          />
        </div>
        <div className="">
          <div className="bg-bgSecondary rounded-xl shadow-lg border border-[#585858]/20 max-h-[75vh] overflow-y-auto">
            {recentItems.map((item, keyNum) => (
              <motion.div
                key={keyNum}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 border-b border-[#585858]/20 last:border-b-0 flex items-center gap-4"
              >
                <div className="p-2 rounded-full bg-opacity-20">
                  {getIconForType(item.type)}
                </div>
                <div className="flex-1">
                  <h3 className="text-fontPrimary font-semibold">{item.title}</h3>
                  {item.description && (
                    <p className="text-gray-400 text-sm mt-1">{item.description}</p>
                  )}
                </div>
                <div className="text-sm text-gray-400">
                  {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}