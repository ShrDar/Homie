export default function ReportsPage() {
    return (
        <div className="p-8">
            <div className="bg-bgSecondary rounded-[15px] p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl">Reports</h2>
                    <select className="bg-bgPrimary px-4 py-2 rounded-[6px] focus:outline-none">
                        <option>All Reports</option>
                        <option>Pending</option>
                        <option>Resolved</option>
                    </select>
                </div>
                <table className="w-full">
                    <thead className="border-b border-bgPrimary">
                        <tr>
                            <th className="text-left p-4">Report Type</th>
                            <th className="text-left p-4">Reported By</th>
                            <th className="text-left p-4">Status</th>
                            <th className="text-left p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-bgPrimary">
                            <td className="p-4">Inappropriate Content</td>
                            <td className="p-4">Jane Smith</td>
                            <td className="p-4">
                                <span className="bg-[#FF6F6F] px-2 py-1 rounded-full text-sm">
                                    Pending
                                </span>
                            </td>
                            <td className="p-4">
                                <button className="text-[#6FB4FF] hover:underline mr-2">Review</button>
                                <button className="text-[#6FFF8D] hover:underline">Resolve</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
} 