import { auth } from "@/auth";
import YapMain from "@/components/YapPage/YapMain";
import { redirect } from "next/navigation";

export default async function Yap() {

    const session = await auth();

    if (!session) {
        return redirect("/login");
    }

    return (
        <div className="sulphur w-[90%] md:w-[80%] lg:w-[70%] z-[10] text-fontPrimary">
            <YapMain session={session} />
        </div>
    )
}