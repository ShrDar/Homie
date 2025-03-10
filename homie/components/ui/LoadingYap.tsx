export default function LoadingYap() {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-bgSecondary p-4 rounded-lg flex items-center gap-2">
                <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                <span className="text-white tracking-[4px]">Loading Yap...</span>
            </div>
        </div>
    )
}