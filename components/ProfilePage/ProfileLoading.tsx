export default function ProfileLoading() {
    return (
        <div className="profileContainer bg-bgPrimary text-fontPrimary sulphur h-screen w-full flex items-center justify-center">
            <div className="w-[30%] animate-pulse">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-32 h-32 bg-bgSecondary rounded-full" />
                    <div className="w-40 h-4 bg-bgSecondary rounded" />
                </div>
            </div>
            <div className="w-[70%] animate-pulse">
                <div className="w-48 h-6 bg-bgSecondary rounded" />
            </div>
        </div>
    )
}