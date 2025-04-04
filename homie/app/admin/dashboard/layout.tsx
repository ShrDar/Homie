"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { IoExitOutline } from "react-icons/io5";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const isActive = (path: string) => {
        return pathname === path;
    };

    // const [user , setUser] = useState();

    // useEffect(() => {
    //     const fetchUserData = async() => {
    //         const session = await auth();
    //         const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${session?.user?.id}`);
    //         const fetchedUser = await response.json();
    //             setUser(fetchedUser);
    //     }
    //     try {
    //         fetchUserData();
    //     } catch(err) {
    //         console.error(err);
    //     }
    // }, [])

    // console.log(user);

    return (
        <motion.div initial={{filter: "brightness(0)"}} animate={{filter: "brightness(1)"}} transition={{duration: '0.5'}} className="min-h-screen w-full bg-bgPrimary text-fontPrimary sulphur">
            {/* Sidebar */}
            <div className="fixed left-0 top-0 h-full w-64 bg-bgSecondary p-6">
                <div className="mb-10 w-full flex justify-center items-center">
                    <h1 className="text-2xl font-thin">Dashboard</h1>
                </div>
                
                <nav className="flex flex-col gap-2">
                    <Link href="/admin/dashboard">
                        <div className={`p-3 text-left rounded-[6px] transition-all duration-150 ${
                            isActive('/admin/dashboard') ? 'bg-bgPrimary' : 'hover:bg-bgPrimary/50'
                        }`}>
                            Overview
                        </div>
                    </Link>
                    <Link href="/admin/dashboard/users">
                        <div className={`p-3 text-left rounded-[6px] transition-all duration-150 ${
                            isActive('/admin/dashboard/users') ? 'bg-bgPrimary' : 'hover:bg-bgPrimary/50'
                        }`}>
                            Users
                        </div>
                    </Link>
                    <Link href="/admin/dashboard/posts">
                        <div className={`p-3 text-left rounded-[6px] transition-all duration-150 ${
                            isActive('/admin/dashboard/posts') ? 'bg-bgPrimary' : 'hover:bg-bgPrimary/50'
                        }`}>
                            Posts
                        </div>
                    </Link>
                    <Link href="/admin/dashboard/reports">
                        <div className={`p-3 text-left rounded-[6px] transition-all duration-150 ${
                            isActive('/admin/dashboard/reports') ? 'bg-bgPrimary' : 'hover:bg-bgPrimary/50'
                        }`}>
                            Reports
                        </div>
                    </Link>
                    <Link href="/admin/dashboard/teas">
                        <div className={`p-3 text-left rounded-[6px] transition-all duration-150 ${
                            isActive('/admin/dashboard/teas') ? 'bg-bgPrimary' : 'hover:bg-bgPrimary/50'
                        }`}>
                            Teas
                        </div>
                    </Link>
                </nav>
                <Link href="/profile">
                    <div className={`p-4 text-left rounded-[20px] bg-bgSecondary transition-all duration-150 hover:bg-bgPrimary absolute bottom-6 left-6 right-6 flex items-center justify-center gap-2`}>
                        <IoExitOutline className="text-xl" />
                        <p>Exit Dashboard</p>
                    </div>
                </Link>
            </div>

            {/* Main Content */}
            <div className="ml-64">
                {children}
            </div>
        </motion.div>
    );
}