import { useFormStatus } from "react-dom"

export default function AuthButton() {

    const { pending } = useFormStatus();

    return (
        <button disabled={pending} type="submit" className="entryBtn bg-bgPrimary hover:bg-[#2d2d2dbb] transition-all duration-150 text-2xl w-full text-center flex justify-center items-center sulphur text-[#fff] rounded-[6px] py-2">
            {pending ? "Logging In...": "Log In"}
        </button>
    )
}