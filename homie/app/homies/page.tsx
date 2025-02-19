import { auth } from "@/auth"
import HomiesDash from "@/components/HomiesPage/HomiesDash";
import { redirect } from "next/navigation";

export default async function Homies() {

    const session = await auth();
    if (!session) {
            return redirect("/login");
    }
    return (
        <div className="text-[#fff] sulphur w-full min-h-screen flex justify-center items-start">
            <HomiesDash session={session} />
        </div>
    )
}