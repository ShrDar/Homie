'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { toast } from 'sonner';
import { FiUser, FiCoffee, FiFileText, FiFlag, FiX, FiEye, FiRefreshCw } from 'react-icons/fi';
import ReportDetailModal from '@/components/AdminReport/ReportDetailModal';
import IndividualReport from '@/components/AdminReport/IndividualReport';

// Updated interface to match your Firestore document structure
interface Report {
  id: string;
  reportedContentId: string;
  reportType: 'user' | 'post' | 'tea';
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
  reporterId: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIndividualReportOpen, setIsIndividualReportOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'pending' | 'resolved' | 'all'>('all');
  const [activeTypeFilter, setActiveTypeFilter] = useState<'user' | 'post' | 'tea' | 'all'>('all');
  const [currentIndividualReportId, setCurrentIndividualReportId] = useState<string | null>(null);
  
  const applyFilters = (reportsList: Report[]) => {
    let filtered = [...reportsList];
    
    // Apply status filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(report => report.status === activeFilter);
    }
    
    // Apply type filter
    if (activeTypeFilter !== 'all') {
      filtered = filtered.filter(report => report.reportType === activeTypeFilter);
    }
    
    setFilteredReports(filtered);
  };
  
  useEffect(() => {
    const reportsRef = collection(db, 'Reports');
    const q = query(reportsRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reportsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Report));

      setReports(reportsList);
      applyFilters(reportsList);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching reports:', error);
      setLoading(false);
      toast.error('Failed to load reports');
    });

    return () => unsubscribe();
  }, [activeFilter, activeTypeFilter]);


  const handleFilterChange = (filter: 'pending' | 'resolved' | 'all') => {
    setActiveFilter(filter);
    applyFilters(reports);
  };

  const handleTypeFilterChange = (filter: 'user' | 'post' | 'tea' | 'all') => {
    setActiveTypeFilter(filter);
    applyFilters(reports);
  };

 

  const handleStatusToggle = async (reportId: string, currentStatus: string) => {
    try {
      const reportRef = doc(db, 'Reports', reportId);
      const newStatus = currentStatus === 'pending' ? 'resolved' : 'pending';
      
      await updateDoc(reportRef, {
        status: newStatus
      });
      toast.success(`Report status changed to ${newStatus}`);
    } catch (error) {
      console.error('Error updating report status:', error);
      toast.error('Failed to update report status');
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      const reportRef = doc(db, 'Reports', reportId);
      await deleteDoc(reportRef);
      toast.success('Report deleted successfully');
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Failed to delete report');
    }
  };

  const openReportModal = (report: Report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const closeReportModal = () => {
    setIsModalOpen(false);
    setSelectedReport(null);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'resolved':
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <FiUser className="text-[#6FB4FF]" />;
      case 'post':
        return <FiFileText className="text-[#6FFF8D]" />;
      case 'tea':
        return <FiCoffee className="text-[#FF9F6F]" />;
      default:
        return <FiFlag />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
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
              <FiFlag className="text-red-400" />
              Reports Dashboard
            </h1>
            <p className="mt-2 text-gray-400">
              Monitor and manage reported content across the platform
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-bgSecondary rounded-lg px-4 py-2">
              <p className="text-sm text-gray-400">Total Reports</p>
              <p className="text-2xl font-bold text-fontPrimary">{reports.length}</p>
            </div>
            <div className="bg-bgSecondary rounded-lg px-4 py-2">
              <p className="text-sm text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-yellow-400">
                {reports.filter(r => r.status === 'pending').length}
              </p>
            </div>
            <div className="bg-bgSecondary rounded-lg px-4 py-2">
              <p className="text-sm text-gray-400">Resolved</p>
              <p className="text-2xl font-bold text-green-400">
                {reports.filter(r => r.status === 'resolved').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex justify-between gap-6 mb-8">
        {/* Status Filter */}
        <div className="bg-bgSecondary rounded-xl p-6 w-full">
          <h3 className="text-lg font-semibold text-fontPrimary mb-4">Filter by Status</h3>
          <div className="flex gap-3">
            {['all', 'pending', 'resolved'].map((status) => (
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

        {/* Content Type Filter */}
        <div className="bg-bgSecondary rounded-xl p-6 w-full">
          <h3 className="text-lg font-semibold text-fontPrimary mb-4">Filter by Type</h3>
          <div className="flex gap-3">
            {[
              { id: 'all', icon: FiFlag, label: 'All' },
              { id: 'user', icon: FiUser, label: 'Users' },
              { id: 'post', icon: FiFileText, label: 'Posts' },
              { id: 'tea', icon: FiCoffee, label: 'Teas' }
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => handleTypeFilterChange(id as any)}
                className={`
                  flex-1 px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2
                  ${activeTypeFilter === id 
                    ? 'bg-primary text-fontPrimary' 
                    : 'bg-bgPrimary text-gray-300 hover:bg-bgPrimary/80'}
                `}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-bgSecondary rounded-xl shadow-xl">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          </div>
        ) : filteredReports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#585858]">
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Type</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Reported On</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Status</th>
                  <th className="text-right py-4 px-6 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                    // Group reports by reportedContentId
                    const groupedReports = filteredReports.reduce((acc, report) => {
                        const key = report.reportedContentId;
                        if (!acc[key]) {
                            acc[key] = {
                                ...report,
                                reportCount: 1,
                                reasons: [report.reason]
                            };
                        } else {
                            acc[key].reportCount++;
                            if (!acc[key].reasons.includes(report.reason)) {
                                acc[key].reasons.push(report.reason);
                            }
                        }
                        return acc;
                    }, {} as Record<string, any>);

                    // Convert grouped reports back to array and sort by reportCount in descending order
                    return Object.values(groupedReports)
                        .sort((a: any, b: any) => b.reportCount - a.reportCount)
                        .map((report: any) => (
                            <tr key={report.id} className="border-b border-[#585858]/50 hover:bg-bgPrimary/30 transition-colors">
                                <td onClick={() => {
                                    setCurrentIndividualReportId(report?.id);
                                    setIsIndividualReportOpen(true);
                                }} className="py-4 cursor-pointer px-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-bgPrimary">
                                            {getContentTypeIcon(report.reportType)}
                                        </div>
                                        <div>
                                            <span className="text-fontPrimary capitalize">{report.reportType}</span>
                                            <span className="ml-2 px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">
                                                {report.reportCount} reports
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                
                                <td className="py-4 px-6 text-gray-400">
                                    {formatDate(report.createdAt)}
                                </td>
                                <td className="py-4 px-6">
                                    <span className={`
                                        px-3 py-1 rounded-full text-xs font-medium
                                        ${getStatusBadgeClass(report.status)}
                                    `}>
                                        {report.status}
                                    </span>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => openReportModal(report)}
                                            className="p-2 bg-bgPrimary text-blue-400 rounded-lg hover:bg-bgPrimary/80 transition-colors"
                                        >
                                            <FiEye size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleStatusToggle(report.id, report.status)}
                                            className="p-2 bg-bgPrimary text-purple-400 rounded-lg hover:bg-bgPrimary/80 transition-colors"
                                        >
                                            <FiRefreshCw size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteReport(report.id)}
                                            className="p-2 bg-bgPrimary text-red-400 rounded-lg hover:bg-bgPrimary/80 transition-colors"
                                        >
                                            <FiX size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ));
                })()}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <FiFlag className="mx-auto text-gray-500 mb-4" size={40} />
            <p className="text-gray-400 text-lg">
              {activeFilter === 'all' 
                ? 'No reports found' 
                : `No ${activeFilter} reports found`}
            </p>
          </div>
        )}
      </div>

      {/* Keep the modal component */}
      {selectedReport && (
        <ReportDetailModal
          isOpen={isModalOpen}
          onClose={closeReportModal}
          reportType={selectedReport.reportType}
          contentId={selectedReport.reportedContentId}
        />
      )}
      {
        isIndividualReportOpen &&
        <IndividualReport 
            reportId={currentIndividualReportId}
            setIsIndividualReportOpen={setIsIndividualReportOpen}
        />
      }
    </div>
  );}
