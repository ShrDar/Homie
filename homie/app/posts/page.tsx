import { auth } from "@/auth";
import HomePage from "@/components/HomePage/Home";
import { redirect } from "next/navigation";

export default async function PostRoute() {

    const session = await auth();
    
  if(!session?.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-bgPrimary text-fontPrimary w-full">
      <HomePage/>
    </div>
  );
}