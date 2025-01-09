import Image from "next/image";
import { redirect } from "next/navigation";

export default function Home() {

  const loggedIn = false;
  if(!loggedIn) {
    redirect('/login');
  }

  return (
    <div>
       Home Page
    </div>
  );
}
