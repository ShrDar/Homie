import Image from "next/image";
import EntryBtn from "../Button/EntryBtn";
import { logout } from "@/actions/auth";
import { auth } from "@/auth";


export default async function HomePage() {
    
    const session = await auth();

    return (
        <div className="homeContainer bg-bgPrimary text-fontPrimary">
            Home Page
            <EntryBtn name="LogOut" click={logout} />
            {session?.user?.name}
            {session?.user?.image && (
                <Image
                    className="rounded-full"
                    width={30}
                    height={30}
                    alt="User Avatar"
                    src={session?.user?.image || ""}
                />
            )}
        </div>
    )
}