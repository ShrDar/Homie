import { auth } from "@/auth";
import YapDuo from "@/components/YapPage/YapDuo";
import { redirect } from "next/navigation";

export default async function YapContent() {

    const session = await auth();

    if (!session) {
        return redirect("/login");
    }

    return (
        <div className="w-[90%] md:w-[80%] z-[0] lg:w-[70%]">
            <YapDuo session={session} />
        </div>
    )
}