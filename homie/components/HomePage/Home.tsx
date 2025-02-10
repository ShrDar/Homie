import Image from "next/image";
import EntryBtn from "../Button/EntryBtn";
import { logout } from "@/actions/auth";
import { auth } from "@/auth";
import { collection, getDocs } from "firebase/firestore";
import { db } from '@/config/firebase.js'

export default async function HomePage() {
    
    const session = await auth();

    // const commentCollection = collection(db, "Comment");
    // try {
    //     const data = await getDocs(commentCollection);
    //     const comments = data.docs.map((doc) => (
    //         {
    //             ...doc.data(), 
    //             id: doc.id
    //         }
    //     ));
    //     console.log(comments);
    // } catch(err) {
    //     console.log(err);
    // }
    

    return (
        <div className="homeContainer bg-bgPrimary text-fontPrimary z-[5] sulphur h-screen w-screen flex flex-col items-center justify-center">
            <p>Home Page</p>
            <div className="flex flex-col items-center justify-between">
                <div>
                    <p className="text-4xl">{session?.user?.name}</p>
                </div>
                <div>
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
                <EntryBtn name="LogOut" click={logout} />
            </div>
        </div>
    )
}