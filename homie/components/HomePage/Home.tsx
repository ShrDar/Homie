import { auth } from "@/auth";
import { prisma } from "@/prisma"; 
import Posts from "../Posts/Posts";
import { redirect } from "next/navigation";

const generateUsername = (name: string) => {
  const timestamp = Date.now();
  return `${name.replace(/\s+/g, '').toLowerCase()}-${timestamp}`;
};

export default async function HomePage() {
  const session = await auth();

  if(!session) {
    redirect('/');
  }

  
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }, 
      });
  
      if (user && !user.username) {
        const username = generateUsername(user.name || "");
  
        await prisma.user.update({
          where: { email: session.user.email },
          data: {
            username: username,
          },
        });
      }

      if(user && !user.bio) {
        const bio = "Hello this is bio";

        await prisma.user.update({
          where: { email: session.user.email },
          data: {
            bio: bio,
          },
        });
      }
    }

  return (
    <div className="homeContainer text-fontPrimary z-[5] sulphur h-screen w-screen flex flex-col items-center justify-center">
      <Posts session={session} />
    </div>
  );
}
