import { auth } from "@/auth";
import LoginRight from "@/components/LoginPage/LoginRight";
import Image from "next/image";
import { redirect } from "next/navigation";

export default async function Login() {
    const session = await auth();
    if(session) {
        redirect('/');
    }
    return (
        <div className="loginPage w-full sulphur min-h-screen h-screen bg-bgPrimary flex justify-center items-center text-fontPrimary">
            <div className="loginContainer border-[3px] border-borderPrimary bg-bgSecondary lg:w-[60%] md:w-[85%] md:h-[85%] rounded-[15px] flex gap-10 p-12 md:p-4">
                <div className="loginLeftContainer hidden md:flex flex-col bg-bgPrimary border-[3px] border-borderPrimary md:w-[45%] p-6 h-full rounded-[15px] gap-10 justify-center items-center ">
                    <div className="flex w-full items-center justify-center">
                        <Image src={"/logo/Homie-2.svg"} alt="" width={1000} height={1000} className="object-contain w-[90%]" />
                    </div>
                    <div className="w-full flex justify-center items-center text-center">
                        <p className="jim text-3xl">Hang out wit em brodies</p>
                    </div>
                </div>
                <div className="loginRightContainer w-full md:w-[55%] md:pr-6 h-full text-center flex flex-col justify-center items-center">
                    <p className="text-4xl w-full text-center font-thin py-8">Homie</p>
                    <LoginRight />
                </div>
            </div>
        </div>
    )
}