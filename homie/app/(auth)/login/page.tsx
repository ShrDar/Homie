import { auth } from "@/auth";
import LoginLeft from "@/components/LoginPage/LoginLeft";
import LoginRight from "@/components/LoginPage/LoginRight";
import { redirect } from "next/navigation";

export default async function Login() {
    const session = await auth();
    if(session) {
        redirect('/');
    }
    return (
        <div className="loginPage w-full sulphur min-h-screen h-screen bg-bgPrimary flex justify-center items-center text-fontPrimary">
            <div className="loginContainer border-[3px] border-borderPrimary bg-bgSecondary lg:w-[60%] md:w-[85%] md:h-[85%] rounded-[15px] flex gap-10 p-12 md:p-4">
               <LoginLeft />
                <div className="loginRightContainer w-full md:w-[55%] md:pr-6 h-full text-center flex flex-col justify-center items-center">
                    <p className="text-4xl w-full text-center font-thin py-8 tracking-[3px]">Homie</p>
                    <LoginRight />
                </div>
            </div>
        </div>
    )
}