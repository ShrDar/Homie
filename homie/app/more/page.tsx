import { auth } from "@/auth"
import MoreMain from "@/components/MorePage/MoreMain";
import { redirect } from "next/navigation";

export default async function More() {

    const session = await auth();

    if(!session?.user) {
        redirect('/')
    }

    return (
        <div className="sulphur min-h-screen h-screen flex justify-center items-center w-full">
            <MoreMain session={session} />
        </div>
    )
}