import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Yap() {

    const session = await auth();

    if (!session) {
        return redirect("/login");
    }

    return (
        <div className="sulphur w-[70%] text-[#fff] text-5xl">
            Yap
        </div>
    )
}