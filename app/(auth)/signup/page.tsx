import EntryBtn from "@/components/Button/EntryBtn";
import SignUpClient from "@/components/SignUpPage/SignUpClient";

export default function Signup() {


    const handleSubmit = () => {
        
    }

    return (
        <div className="signUpContainer bg-bgPrimary w-full h-screen text-fontPrimary flex justify-center items-center sulphur">
            <div className="loginContainer bg-bgSecondary lg:w-[30%] md:w-[55%] rounded-[15px] flex flex-col gap-10 p-12 md:p-10 text-center">
                <p className="text-3xl">Become a Homie</p>
                <SignUpClient />
            </div>
        </div>
    )
}