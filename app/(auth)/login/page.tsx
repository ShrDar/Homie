import Image from "next/image";

export default function Login() {
    return (
        <div className="loginPage sulphur h-screen bg-bgPrimary flex justify-center items-center text-[#fff]">
            <div className="loginContainer bg-bgSecondary lg:w-[70%] md:w-[85%] h-[85%] rounded-[15px] flex gap-10 p-4">
                <div className="loginLeftContainer bg-bgPrimary w-[45%] p-6 h-full rounded-[15px] flex flex-col gap-10 justify-center items-center ">
                    <div className="flex w-full items-center justify-center">
                        <Image src={"/logo/Homie-2.svg"} alt="" width={1000} height={1000} className="object-contain w-[90%]" />
                    </div>
                    <div className="w-full flex justify-center items-center">
                        <p className="jim text-3xl">Hang out wit em brodies</p>
                    </div>
                </div>
                <div className="loginRightContainer w-[55%] h-full text-center flex flex-col justify-center items-center">
                    <p className="text-4xl font-thin">Homie</p>
                    
                </div>
            </div>
        </div>
    )
}