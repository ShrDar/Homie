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
    // console.log(session)
    return (
        <div className="profileContainer z-5 bg-bgPrimary text-fontPrimary sulphur py-20 lg:py-0 lg:h-screen lg:w-[65%] flex flex-col lg:flex-row items-center justify-center lg:items-center lg:justify-center gap-10">
            <Suspense fallback={<ProfileLoading />}>
                <ProfileLeft session={session} />
                <ProfileRight session={session} />
            </Suspense>
        </div>
    )
}