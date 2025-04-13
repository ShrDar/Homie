import { auth } from "@/auth";
import TeaMainIndividual from "@/components/Teas/TeaMainIndividual";
import { redirect } from "next/navigation";

export default async function TeasIndividual() {

    const session = await auth();
    if(!session?.user) {
      redirect('/login');
    }

    return (
        <div className="flex justify-center items-center w-full min-h-screen text-center sulphur text-fontPrimary">
            <TeaMainIndividual session={session} />
        </div>
    )
}