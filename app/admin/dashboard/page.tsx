"use client";

export default function AdminDashboardPage() {
    return (
        <div className="min-h-screen bg-bgPrimary text-fontPrimary sulphur">
            {/* Main Content */}
            <div className="ml-64 p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-bgSecondary p-6 rounded-[15px]">
                        <h3 className="text-lg mb-2">Total Users</h3>
                        <p className="text-3xl font-thin">1,234</p>
                    </div>
                    <div className="bg-bgSecondary p-6 rounded-[15px]">
                        <h3 className="text-lg mb-2">Active Today</h3>
                        <p className="text-3xl font-thin">256</p>
                    </div>
                    <div className="bg-bgSecondary p-6 rounded-[15px]">
                        <h3 className="text-lg mb-2">Total Posts</h3>
                        <p className="text-3xl font-thin">5,678</p>
                    </div>
                    <div className="bg-bgSecondary p-6 rounded-[15px]">
                        <h3 className="text-lg mb-2">Reports</h3>
                        <p className="text-3xl font-thin">23</p>
                    </div>
                </div>
            </div>
        </div>
    );
} 