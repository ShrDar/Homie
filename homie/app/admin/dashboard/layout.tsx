"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const isActive = (path: string) => {
        return pathname === path;
    };

    return (
        <motion.div initial={{filter: "brightness(0)"}} animate={{filter: "brightness(1)"}} transition={{duration: '0.5'}} className="min-h-screen w-full bg-bgPrimary text-fontPrimary sulphur">
            {/* Sidebar */}
            <div className="fixed left-2 top-[50%] translate-y-[-50%] h-[95%] w-64 bg-bgSecondary p-6 shadow-md rounded-2xl border-r border-white/5">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-12 w-full flex justify-center items-center"
                >
                    <h1 className="text-2xl font-semibold tracking-wide">Dashboard</h1>
                </motion.div>
                
                <nav className="flex flex-col gap-2">
                    <Link href="/admin/dashboard">
                        <div className={`p-3 text-left rounded-[6px] transition-all duration-150 flex items-center gap-2 ${isActive('/admin/dashboard') ? 'bg-bgPrimary' : 'hover:bg-bgPrimary/50'}`}>
                            Overview
                        </div>
                    </Link>
                    <Link href="/admin/dashboard/users">
                        <div className={`p-3 text-left rounded-[6px] transition-all duration-150 flex items-center gap-2 ${isActive('/admin/dashboard/users') ? 'bg-bgPrimary' : 'hover:bg-bgPrimary/50'}`}>
                            Users
                        </div>
                    </Link>
                    <Link href="/admin/dashboard/posts">
                        <div className={`p-3 text-left rounded-[6px] transition-all duration-150 flex items-center gap-2 ${isActive('/admin/dashboard/posts') ? 'bg-bgPrimary' : 'hover:bg-bgPrimary/50'}`}>
                            Posts
                        </div>
                    </Link>
                    <Link href="/admin/dashboard/reports">
                        <div className={`p-3 text-left rounded-[6px] transition-all duration-150 flex items-center gap-2 ${isActive('/admin/dashboard/reports') ? 'bg-bgPrimary' : 'hover:bg-bgPrimary/50'}`}>
                            Reports
                        </div>
                    </Link>
                    <Link href="/admin/dashboard/teas">
                        <div className={`p-3 text-left rounded-[6px] transition-all duration-150 flex items-center gap-2 ${isActive('/admin/dashboard/teas') ? 'bg-bgPrimary' : 'hover:bg-bgPrimary/50'}`}>
                            Teas
                        </div>
                    </Link>
                </nav>
                <Link href="/profile">
                    <div className={`p-4 text-left rounded-[20px] bg-bgPrimary transition-all duration-150 hover:bg-[#232323] absolute bottom-6 left-6 right-6 flex items-center justify-center gap-2`}>
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