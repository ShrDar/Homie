"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
        <div className="min-h-screen bg-bgPrimary text-fontPrimary sulphur">
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
                </nav>
            </div>

            {/* Main Content */}
            <div className="ml-64">
                {children}
            </div>
        </div>
    );
} 