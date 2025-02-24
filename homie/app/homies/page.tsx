import { auth } from "@/auth"
import HomiesDash from "@/components/HomiesPage/HomiesDash";
import { redirect } from "next/navigation";

export default async function Homies() {

    const session = await auth();
    if (!session) {
            return redirect("/login");
    }
    return (
        <div className="text-fontPrimary sulphur w-full min-h-screen flex justify-center items-center">
            <HomiesDash session={session} />
        </div>
    )
}