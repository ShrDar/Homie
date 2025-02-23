import { auth } from "@/auth";
import YapLayoutContent from "@/components/YapPage/YapLayoutContent";
import { redirect } from "next/navigation";

export default async function YapLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    return redirect("/login");
  }

  return (
    <div className="w-full flex flex-col items-center justify-center gap-5 sulphur">
      <YapLayoutContent session={session} />
      {children}
    </div>
  );
  }
  