export default function UsersPage() {
    return (
        <div className="p-8">
            <div className="bg-bgSecondary rounded-[15px] p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl text-center">Users</h2>
                    <input 
                        type="text" 
                        placeholder="Search users..." 
                        className="bg-bgPrimary px-4 py-2 rounded-[6px] focus:outline-none"
                    />
                </div>
                <table className="w-full">
                    <thead className="border-b border-bgPrimary">
                        <tr>
                            <th className="text-left p-4">Name</th>
                            <th className="text-left p-4">Email</th>
                            <th className="text-left p-4">Role</th>
                            <th className="text-left p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-bgPrimary">
                            <td className="p-4">John Doe</td>
                            <td className="p-4">john@example.com</td>
                            <td className="p-4">User</td>
                            <td className="p-4">
                                <button className="text-[#FF6F6F] hover:underline">Ban</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
} 