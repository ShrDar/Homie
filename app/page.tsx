import { logout } from "@/actions/auth";
import { auth } from "@/auth";
import EntryBtn from "@/components/Button/EntryBtn";
import Image from "next/image";
import { redirect } from "next/navigation";

export default async function Home() {

  const session = await auth();
  if(!session?.user) {
    redirect('/login');
  }
  return (
    <div className="h-screen bg-bgPrimary text-fontPrimary">
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
  );
}
