import { auth } from "@/auth";
import TeaMain from "@/components/Teas/TeaMain";
import { redirect } from "next/navigation";

export default async function Teas() {

    const session = await auth();
    if(!session?.user) {
      redirect('/login');
    }

    return (
        <div className="flex justify-center items-center w-full min-h-screen text-center sulphur text-fontPrimary">
            <TeaMain session={session} />
        </div>
    )
}