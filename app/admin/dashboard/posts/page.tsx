export default function PostsPage() {
    return (
        <div className="p-8">
            <div className="bg-bgSecondary rounded-[15px] p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl">Posts</h2>
                    <input 
                        type="text" 
                        placeholder="Search posts..." 
                        className="bg-bgPrimary px-4 py-2 rounded-[6px] focus:outline-none"
                    />
                </div>
                <table className="w-full">
                    <thead className="border-b border-bgPrimary">
                        <tr>
                            <th className="text-left p-4">Title</th>
                            <th className="text-left p-4">Author</th>
                            <th className="text-left p-4">Date</th>
                            <th className="text-left p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-bgPrimary">
                            <td className="p-4">First Post</td>
                            <td className="p-4">John Doe</td>
                            <td className="p-4">2024-03-20</td>
                            <td className="p-4">
                                <button className="text-[#FF6F6F] hover:underline mr-2">Delete</button>
                                <button className="text-[#6FB4FF] hover:underline">Edit</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
} 