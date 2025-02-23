"use client"
import { Session } from "next-auth";
import { useParams } from "next/navigation";

export default function YapDuo({ session } : { session: Session }) {

    const params = useParams();
    const { yapId } = params;
    // const [user, setUser] = useState();
    console.log(yapId, session);


    return (
        <div className="w-full flex flex-col justify-center items-center">
            <div className="">

            </div>
            <div className="w-full bg-bgSecondary h-[75dvh] overflow-auto rounded-[15px] flex flex-col justify-start items-center">
                
            </div>
        </div>
    )
}