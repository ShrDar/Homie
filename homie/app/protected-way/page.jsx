import { auth } from "@/auth"
import { redirect } from "next/navigation";

export default async function Server() {

    const session = await auth();
    if(!session?.user) {
        redirect("/login");
    }
    return (
        <div className="bg-bgPrimary text-fontPrimary">
            <p className="text-4xl">{session?.user?.name}</p>
        </div>
    )
}