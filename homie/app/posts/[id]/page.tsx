import { auth } from "@/auth";
import PostsOfUser from "@/components/Posts/PostsOfUser";
import { redirect } from "next/navigation";

export default async function PostRouteIndividual() {

    const session = await auth();
    
  if(!session?.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-bgPrimary text-fontPrimary w-full">
        <div className="homeContainer bg-bgPrimary text-fontPrimary z-[5] sulphur h-screen w-screen flex flex-col items-center justify-center">
            <PostsOfUser session={session} />
        </div>
    </div>
  );
}