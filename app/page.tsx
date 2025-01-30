import { auth } from "@/auth";
import HomePage from "@/components/HomePage/Home";
import { redirect } from "next/navigation";

export default async function Home() {

  const session = await auth();
  if(!session?.user) {
    redirect('/login');
  }
  return (
    <div className="h-screen bg-bgPrimary text-fontPrimary w-full">
      <HomePage/>
    </div>
  );
}
