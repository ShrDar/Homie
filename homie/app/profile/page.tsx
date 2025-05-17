import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ProfileMain from "@/components/ProfilePage/ProfileMain";


export default async function Profile() {
    const session = await auth();
    
    if (!session) {
        return redirect("/login");
    }
    // console.log(session)
    return (
        <div className="profileContainer z-5 sulphur py-20 lg:py-0 lg:w-[65%] flex flex-col lg:flex-row items-center justify-center lg:items-center lg:justify-center gap-10">
            {/* <Suspense fallback={<ProfileLoading />}>
                <ProfileLeft session={session} />
                <ProfileRight session={session} />
            </Suspense> */}
            <ProfileMain session={session} />
        </div>
    )
}