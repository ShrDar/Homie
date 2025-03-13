import { getProfileUrl } from "@/extra/helpers";
import { HomieUser } from "@/homieTypes/homieTypes";
import Image from "next/image";

export default async function HomieIndividual({params} : {params: Promise<{ id: string}>}) {
    const { id } = await params;
    try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${id}`);

    if (!response.ok) {
      throw new Error("User not found");
    }

    const user: HomieUser = await response.json();

    return (
      <div className="sulphur bg-bgSecondary-100 w-full lg:w-auto min-h-[100dvh] flex flex-col justify-center items-center gap-3 text-fontPrimary">
        <div className="w-[80%] md:w-[50%] lg:w-auto flex flex-col bg-[#434343ae] border-[2px] border-[#888] justify-start md:justify-center items-center gap-3 py-5 px-2 rounded-[15px]">
          <div className="flex flex-col justify-center items-center gap-2 w-full">
            <p className="capitalize text-4xl tracking-[2px] px-5">{user?.name}</p>
            <div className="rounded-full overflow-hidden bg-bgSecondary border-[3px] border-[#888]">
              <Image 
                width={400}
                height={400}
                alt="profilePic"
                src={getProfileUrl(user?.image)}
                className="w-[30vw] md:w-[20vw] lg:w-[10vw] rounded-full aspect-square object-cover"
              />
            </div>
            <p className="text-sm tracking-[3px]">@{user?.username}</p>
            <p className="text-2xl jim tracking-[2px]">{user?.bio}</p>
          </div>

          <div className="w-[85%] bg-bgSecondary border-[2px] border-[#888] rounded-[15px] p-5 flex flex-col justify-center items-center gap-6">
            <div className="profileStatsContainer w-full flex flex-col justify-center items-center gap-4">
              <div className="profileStat w-full flex justify-center lg:justify-between items-center border-[2px] border-[#888] text-center bg-bgPrimary rounded-[15px] px-2 lg:px-6 py-4 gap-4">
                <p>HOMIES</p>
                <div className="justify-center items-center hidden lg:flex">
                  <Image src="/figmaIcons/squiggly.svg" className="w-[100%]" alt="squiggly" width={100} height={100} />
                </div>
                <p className="lg:hidden"> - </p>
                <p>{user?.homies?.length || 0}</p>
              </div>
              <div className="profileStat w-full flex justify-center lg:justify-between items-center border-[2px] border-[#888] text-center bg-bgPrimary rounded-[15px] px-2 lg:px-6 py-4 gap-4">
                <p>POSTS</p>
                <div className="justify-center items-center hidden lg:flex">
                  <Image src="/figmaIcons/squiggly.svg" className="w-[100%]" alt="squiggly" width={100} height={100} />
                </div>
                <p className="lg:hidden"> - </p>
                <p>{0}</p>
              </div>
              <div className="profileStat w-full flex justify-center lg:justify-between items-center border-[2px] border-[#888] text-center bg-bgPrimary rounded-[15px] px-2 lg:px-6 py-4 gap-4">
                <p>TEAS</p>
                <div className="justify-center items-center hidden lg:flex">
                  <Image src="/figmaIcons/squiggly.svg" className="w-[100%]" alt="squiggly" width={100} height={100} />
                </div>
                <p className="lg:hidden"> - </p>
                <p>{0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.log(error);
    return (
      <div className="flex flex-col sulphur items-center justify-center min-h-screen text-fontPrimary text-3xl">
        No Such Homie
      </div>
    );
  }
}
