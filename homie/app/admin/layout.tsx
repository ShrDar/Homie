import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  
  const session = await auth();
  if(!session) {
    redirect("/");
  }

  // const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${session?.user?.id}`);
  // const user = await response.json();

  // if(user?.role !== "admin"){
  //   redirect("/");
  // }

  return (
    <div className="adminLayout w-full min-h-screen h-screen bg-bgPrimary flex justify-center items-center text-fontPrimary">
      {children}
    </div>
  );
}
