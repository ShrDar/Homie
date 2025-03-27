export default function DefaultLoading( {displayText} : {displayText : string} ) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200]">
            <div className="bg-bgSecondary p-4 rounded-lg flex items-center gap-2">
                <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                <span className="text-white tracking-[4px]">{displayText}...</span>
            </div>
        </div>
    )
}