import { Suspense } from "react";
import { auth } from "@/auth";
import ProfileLeft from "@/components/ProfilePage/ProfileLeft";
import ProfileRight from "@/components/ProfilePage/ProfileRight";
import { redirect } from "next/navigation";
import ProfileLoading from "@/components/ProfilePage/ProfileLoading";


export default async function Profile() {
    const session = await auth();
    
    if (!session) {
        return redirect("/login");
    }
    
    return (
        <div className="profileContainer z-5 bg-bgPrimary text-fontPrimary sulphur h-screen lg:w-[65%] flex items-center justify-center gap-10">
            <Suspense fallback={<ProfileLoading />}>
                <ProfileLeft session={session} />
                <ProfileRight session={session} />
            </Suspense>
        </div>
    )
}