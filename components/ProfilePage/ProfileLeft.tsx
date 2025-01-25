import Image from "next/image";
import { Session } from "next-auth";

export default function ProfileLeft({ session }: { session: Session }) {
    return (
        <div className="profileLeftContainer w-[35%] flex flex-col justify-center items-center gap-6">
            <div className="upperBlockContainer w-full flex flex-col justify-center items-center gap-2">
                <div className="profileImageContainer bg-bgSecondary flex justify-center items-center rounded-full p-6">
                    <Image src={session?.user?.image || "/logo/googlePlain.png"}
                     alt="profile" 
                     width={100} 
                     height={100}
                     className="rounded-full w-[100px] h-[100px]"
                     />
                </div>
                <p>@google</p>
            </div>
            <div className="lowerBlockContainer w-full bg-bgSecondary rounded-[15px] px-8 py-10 flex flex-col justify-center items-center gap-6">
                <div className="bioContainer text-center">
                    <p>Hello this is bio</p>
                </div>
                <div className="profileStatsContainer w-full flex flex-col justify-center items-center gap-4">
                    <div className="profileStat w-full flex justify-between items-center text-center bg-bgPrimary rounded-[15px] px-6 py-4 gap-[10px] lg:gap-0">
                        <p>HOMIES</p>
                        <div className="flex justify-center items-center">
                            <Image src="/figmaIcons/squiggly.svg" className="w-[100%]" alt="squiggly" width={100} height={100} />
                        </div>
                        <p>{10}</p>
                    </div>
                    <div className="profileStat w-full flex justify-between items-center text-center bg-bgPrimary rounded-[15px] px-6 py-4 gap-[10px] lg:gap-0">
                        <p>POSTS</p>
                        <div className="flex justify-center items-center">
                            <Image src="/figmaIcons/squiggly.svg" className="w-[100%]" alt="squiggly" width={100} height={100} />
                        </div>
                        <p>{5}</p>
                    </div>
                    <div className="profileStat w-full flex justify-between items-center text-center bg-bgPrimary rounded-[15px] px-6 py-4 gap-[10px] lg:gap-0">
                        <p>TEAS</p>
                        <div className="flex justify-center items-center">
                            <Image src="/figmaIcons/squiggly.svg" className="w-[100%]" alt="squiggly" width={100} height={100} />
                        </div>
                        <p>{2}</p>
                    </div>
    
                    
                </div>
            </div>
        </div>
    )
}