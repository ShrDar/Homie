import Link from "next/link";

export default function NotFound() {
    return (
        <div className="h-screen w-full flex flex-col justify-center items-center gap-4 sulphur text-fontPrimary">
            <p className="text-5xl">Page Not Found</p>
            <p>Go Back to <Link href={"/"}>Home</Link></p>
        </div>
    )
}