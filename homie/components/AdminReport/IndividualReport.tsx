"use client"
import { motion } from "motion/react"
import { useEffect, useState } from "react"
import { db } from "@/config/firebase"
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore"
import { format } from "date-fns"
import { HomieUser } from "@/homieTypes/homieTypes"
import Image from "next/image"
import { getProfileUrl } from "@/extra/helpers"
import { toast } from "sonner"

interface ReportData {
    createdAt: string;
    reason: string;
    reportType: string;
    reportedContentId: string;
    reporterId: string;
    status: string;
    id?: string;
}

export default function IndividualReport({reportId, setIsIndividualReportOpen} : {reportId: string | null, setIsIndividualReportOpen: any}) {
    const [reports, setReports] = useState<ReportData[]>([])
    const [loading, setLoading] = useState(true)
    const [users, setUsers] = useState<HomieUser[]>([]);

    const fetchUsersData = async() => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users`);
        const fetchedUsers = await response.json();
        setUsers(fetchedUsers);
    }

    useEffect(() => {
        const fetchReports = async () => {
            if (!reportId) return
            try {
                const reportsRef = collection(db, "Reports")
                const querySnapshot = await getDocs(reportsRef)
                
                const fetchedReports: ReportData[] = []
                querySnapshot.forEach((doc) => {
                    fetchedReports.push({ ...doc.data() as ReportData, id: doc.id })
                })
                
                const matchingReport = fetchedReports.find((report) => report.id === reportId)
                const matchingReports = fetchedReports.filter((report) => report.reportedContentId === matchingReport?.reportedContentId)

                setReports(matchingReports)
            } catch (error) {
                console.error("Error fetching reports:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchUsersData();
        fetchReports()
    }, [reportId])

    const handleDeleteReport = async (reportId: string) => {
        
        try {
            await deleteDoc(doc(db, "Reports", reportId));
            setReports(prev => prev.filter(report => report.id !== reportId));
            toast.success("Report deleted successfully", {
                style: {
                    backgroundColor: "#2a2a2a",
                    color: "#fff"
                }
            });
        } catch (error) {
            console.error("Error deleting report:", error);
            toast.error("Failed to delete report", {
                style: {
                    backgroundColor: "#2a2a2a",
                    color: "#fff",
                    borderColor: "#FF6F6F"
                }
            });
        }
    };

    return (
        <>
            <motion.div 
                onClick={() => setIsIndividualReportOpen(false)}
                className="fixed top-[50%] z-[50] left-[50%] translate-x-[-50%] translate-y-[-50%] h-screen w-full bg-[#000] bg-opacity-50 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
            />
            <div className="fixed top-[50%] z-[100] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-bgSecondary p-8 rounded-xl shadow-2xl w-[90%] max-w-2xl max-h-[80vh] overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : reports.length > 0 ? (
                    <div className="space-y-8">
                        <h2 className="text-3xl font-bold mb-6 text-[#fff]">Report Details ({reports.length})</h2>
                        {reports.map((report) => {
                            const reporter = users?.find((user) => user._id === report.reporterId)
                            return (
                            <div key={report.id} className="bg-bgPrimary rounded-xl p-6 space-y-6 shadow-lg border border-border/50">
                                {/* Reporter Information */}
                                <div className="w-full flex justify-between items-start">
                                    <div className=" flex flex-col gap-2">
                                        <p>Reporter</p>
                                        <div className="flex items-center gap-2">
                                            <div className="relative h-12 w-12 rounded-full overflow-hidden">
                                                <Image 
                                                    src={getProfileUrl(reporter?.image || "")}
                                                    alt={reporter?.username || "Reporter"}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg">{reporter?.username || "Unknown User"}</h3>
                                                <p className="text-muted-foreground text-sm">{reporter?.email}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-start gap-2">
                                        <div className="flex justify-end pt-2">
                                        <button
                                            onClick={() => handleDeleteReport(report.id!)}
                                            className="px-4 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors duration-200 flex items-center gap-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            Delete Report
                                        </button>
                                    </div>
                                    </div>  
                                </div>

                                {/* Report Details */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Report ID</p>
                                        <p className="font-medium">{report.id}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Created At</p>
                                        <p className="font-medium">{format(new Date(report.createdAt), 'PPpp')}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Report Type</p>
                                        <p className="font-medium">{report.reportType}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Status</p>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                            report.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                                            report.status === 'resolved' ? 'bg-green-500/20 text-green-500' :
                                            'bg-red-500/20 text-red-500'
                                        }`}>
                                            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                        </span>
                                    </div>
                                </div>

                                {/* Reason */}
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Reason</p>
                                    <p className="font-medium bg-bgSecondary p-4 rounded-lg">{report.reason}</p>
                                </div>

                                
                            </div>
                        )})}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground">No reports found</div>
                )}
            </div>
        </>
    )
}