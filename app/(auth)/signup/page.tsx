import SignUpClient from "@/components/SignUpPage/SignUpClient";
import Image from "next/image";

export default function Signup() {

    return (
        <div className="signUpContainer relative bg-bgPrimary w-full h-screen text-fontPrimary flex justify-center items-center sulphur">
            <div className="loginContainer bg-bgSecondary z-[1] w-[75%] lg:w-[30%]  md:w-[55%] rounded-[15px] flex flex-col gap-10 p-12 md:p-10 text-center">
                <p className="text-3xl">Become a Homie</p>
                <SignUpClient />
            </div>
            <div className="">
                <Image src={`/logo/Homie-2.svg`} alt="signup" width={1400} height={1400}className="fixed z-[0] hover:scale-[1.2] transition-all duration-300 ease-in-out left-[50%] blur-lg translate-x-[-50%] translate-y-[-50%] w-[90%] md:w-[70%] lg:w-[40%]" />
            </div>
        </div>
    )
}