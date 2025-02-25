"use client"
import { db } from "@/config/firebase";
import { getProfileUrl } from "@/extra/helpers";
import { HomieUser } from "@/homieTypes/homieTypes";
import { collection, onSnapshot } from "firebase/firestore";
import { Session } from "next-auth";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function YapDuo({ session } : { session: Session }) {

    const params = useParams();
    const { yapId } = params;
    const [yapper1, setYapper1] = useState<HomieUser>(); //currentUser
    const [yapper2, setYapper2] = useState<HomieUser>(); //friendUser
    
    // console.log(yapId, session)
    
    const [yapData, setYapData] = useState<any>(null); // State to hold real-time yap data
    
    console.log(yapper1)
    console.log(yapData);

    useEffect(() => {
        const yapCollection = collection(db, 'Yap');
        
        const unsubscribe = onSnapshot(yapCollection, (querySnapshot) => {

          const yapsList = querySnapshot.docs.map(doc => doc.data());
          const filtered = yapsList.filter((yap) => yap.yapId === yapId);
          setYapData(filtered);

          filtered[0].participants.map(async(participantId : string) => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${participantId}`);
            const fetchedUser = await response.json();
            if(fetchedUser._id === session?.user?.id) {
              setYapper1(fetchedUser)
            } else {
              setYapper2(fetchedUser)
            }
          })

        });
        
        return () => unsubscribe();
      }, []); 
      

    return (
        <div className="w-full h-[80dvh] z-[20] flex bg-bgSecondary text-fontPrimary rounded-[15px] p-5 flex-col justify-center items-center gap-2">
            <div className="yapTopBar w-full flex justify-start items-center gap-2">
                <div className="rounded-full overflow-hidden bg-bgPrimary p-2">
                    <Image 
                        src={getProfileUrl(yapper2?.image || "")}
                        alt=""
                        width={100}
                        height={100}
                        className="w-[40px] rounded-full"
                    />
                </div>
                <div className="flex flex-col justify-center items-start">
                  <p className="text-lg tracking-[1px] let">{yapper2?.name}</p>
                  <p className="text-xs tracking-[3px]">@{yapper2?.username}</p>
                </div>
            </div>

            <div className="yapsContainer w-full bg-bgPrimary h-[70dvh] overflow-auto rounded-[15px] flex flex-col justify-start items-center">
                
            </div>

            <div className="yapTypeSection w-full">
           

            </div>
        </div>
    )
}

// setYapData(yapsList);  
          
         