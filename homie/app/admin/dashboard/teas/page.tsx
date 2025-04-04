
'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { toast } from 'sonner';
import { FiCoffee, FiX, FiEye, FiRefreshCw, FiEdit2 } from 'react-icons/fi';
import { Tea } from '@/homieTypes/homieTypes';
import AdminTeaEdit from '@/components/AdminTeas/AdminTeaEdit';

export default function AdminTeas() {
    const [teas, setTeas] = useState<Tea[]>([]);
    const [filteredTeas, setFilteredTeas] = useState<Tea[]>([]);
    const [loading, setLoading] = useState(true);
    const [openTeaEditModal, setOpenTeaEditModal] = useState(false);
    const [currentTea, setCurrentTea] = useState<Tea | null>(null);
    const [activeFilter, setActiveFilter] = useState<'open' | 'closed' | 'all'>('all');

    const applyFilters = (teaList: Tea[]) => {
        let filtered = [...teaList];
        
        if (activeFilter !== 'all') {
            filtered = filtered.filter(tea => 
                activeFilter === 'open' ? tea.isOpen : !tea.isOpen
            );
        }
        
        setFilteredTeas(filtered);
    };
    
    useEffect(() => {
        const teasRef = collection(db, 'Tea');
        const q = query(teasRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const teaList = snapshot.docs.map(doc => ({
                _id: doc.id,
                ...doc.data()
            } as Tea));

            setTeas(teaList);
            applyFilters(teaList);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching teas:', error);
            setLoading(false);
            toast.error('Failed to load teas');
        });

        return () => unsubscribe();
    }, [activeFilter]);

    const handleFilterChange = (filter: 'open' | 'closed' | 'all') => {
        setActiveFilter(filter);
        applyFilters(teas);
    };

    const handleStatusToggle = async (teaId: string, currentStatus: boolean) => {
        try {
            const teaRef = doc(db, 'Tea', teaId);
            await updateDoc(teaRef, {
                isOpen: !currentStatus
            });
            toast.success(`Tea status updated successfully`);
        } catch (error) {
            console.error('Error updating tea status:', error);
            toast.error('Failed to update tea status');
        }
    };

    const handleDeleteTea = async (teaId: string) => {
        try {
            const teaRef = doc(db, 'Tea', teaId);
            await deleteDoc(teaRef);
            toast.success('Tea deleted successfully');
        } catch (error) {
            console.error('Error deleting tea:', error);
            toast.error('Failed to delete tea');
        }
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'Unknown';
        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid date';
        }
    };

    return (
        <div className="min-h-screen bg-bgPrimary p-8">
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-fontPrimary flex items-center gap-3">
                            <FiCoffee className="text-[#FF9F6F]" />
                            Teas Dashboard
                        </h1>
                        <p className="mt-2 text-gray-400">
                            Monitor and manage tea discussions across the platform
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-bgSecondary rounded-lg px-4 py-2">
                            <p className="text-sm text-gray-400">Total Teas</p>
                            <p className="text-2xl font-bold text-fontPrimary">{teas.length}</p>
                        </div>
                        <div className="bg-bgSecondary rounded-lg px-4 py-2">
                            <p className="text-sm text-gray-400">Open</p>
                            <p className="text-2xl font-bold text-green-400">
                                {teas.filter(t => t.isOpen).length}
                            </p>
                        </div>
                        <div className="bg-bgSecondary rounded-lg px-4 py-2">
                            <p className="text-sm text-gray-400">Closed</p>
                            <p className="text-2xl font-bold text-red-400">
                                {teas.filter(t => !t.isOpen).length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-bgSecondary rounded-xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-fontPrimary mb-4">Filter by Status</h3>
                <div className="flex gap-3">
                    {['all', 'open', 'closed'].map((status) => (
                        <button
                            key={status}
                            onClick={() => handleFilterChange(status as any)}
                            className={`
                                flex-1 px-4 py-2 rounded-lg font-medium transition-all
                                ${activeFilter === status 
                                    ? 'bg-primary text-fontPrimary' 
                                    : 'bg-bgPrimary text-gray-300 hover:bg-bgPrimary/80'}
                            `}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Teas Table */}
            <div className="bg-bgSecondary rounded-xl shadow-xl">
                {loading ? (
                    <div className="flex items-center justify-center p-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                    </div>
                ) : filteredTeas.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[#585858]">
                                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Title</th>
                                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Created On</th>
                                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Status</th>
                                    <th className="text-right py-4 px-6 text-gray-400 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTeas.map((tea) => (
                                    <tr key={tea._id} className="border-b border-[#585858]/50 hover:bg-bgPrimary/30 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-bgPrimary">
                                                    <FiCoffee className="text-[#FF9F6F]" />
                                                </div>
                                                <span className="text-fontPrimary">{tea.title}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-gray-400">
                                            {formatDate(tea.createdAt)}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`
                                                px-3 py-1 rounded-full text-xs font-medium
                                                ${tea.isOpen 
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-red-500/20 text-red-400'}
                                            `}>
                                                {tea.isOpen ? 'Open' : 'Closed'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setCurrentTea(tea);
                                                        setOpenTeaEditModal(true);
                                                    }}
                                                    className="p-2 bg-bgPrimary text-blue-400 rounded-lg hover:bg-bgPrimary/80 transition-colors"
                                                    title="Edit tea"
                                                >
                                                    <FiEdit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleStatusToggle(tea._id, tea.isOpen)}
                                                    className="p-2 bg-bgPrimary text-purple-400 rounded-lg hover:bg-bgPrimary/80 transition-colors"
                                                >
                                                    <FiRefreshCw size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTea(tea._id)}
                                                    className="p-2 bg-bgPrimary text-red-400 rounded-lg hover:bg-bgPrimary/80 transition-colors"
                                                >
                                                    <FiX size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <FiCoffee className="mx-auto text-gray-500 mb-4" size={40} />
                        <p className="text-gray-400 text-lg">
                            {activeFilter === 'all' 
                                ? 'No teas found' 
                                : `No ${activeFilter} teas found`}
                        </p>
                    </div>
                )}
            </div>
            {
                openTeaEditModal && (
                   <AdminTeaEdit
                        setOpenTeaEditModal={setOpenTeaEditModal}
                        tea={currentTea}
                    /> 
                )
            }
        </div>
    );
}