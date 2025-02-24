"use client"
import { db } from "@/config/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { Session } from "next-auth";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function YapDuo({ session } : { session: Session }) {

    const params = useParams();
    const { yapId } = params;
    
    console.log(yapId, session)

    const [yapData, setYapData] = useState<any>(null); // State to hold real-time yap data

    useEffect(() => {
        const yapCollection = collection(db, 'Yap');
        
        const unsubscribe = onSnapshot(yapCollection, (querySnapshot) => {
          const yapsList = querySnapshot.docs.map(doc => doc.data());
          setYapData(yapsList);  // Update state with the new list of yaps
        });
    
        return () => unsubscribe();
      }, []); 

      console.log(yapData)

    return (
        <div className="w-full flex flex-col justify-center items-center">
            <div className="yapTopBar">
                
            </div>

            <div className="yapsContainer w-full bg-bgSecondary h-[75dvh] overflow-auto rounded-[15px] flex flex-col justify-start items-center">
                
            </div>

            <div className="yapTypeSection">

            </div>
        </div>
    )
}