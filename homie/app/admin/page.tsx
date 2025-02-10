// import Image from "next/image";
import Link from "next/link";

export default function AdminLoginPage() {
    return (
        <div className="adminLoginPage w-full sulphur min-h-screen h-screen bg-bgPrimary flex justify-center items-center text-fontPrimary">
            <div className="loginContainer bg-bgSecondary lg:w-[30%] md:w-[45%] w-[85%] rounded-[15px] flex flex-col gap-10 p-12 md:p-10">
                <div className="flex flex-col items-center gap-4">
                    <h1 className="text-3xl font-thin text-center">Admin Portal</h1>
                </div>
                
                <form className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="email" className="text-sm">Email</label>
                        <input
                            type="email"
                            id="email"
                            className="bg-bgPrimary px-4 py-2 rounded-[6px] focus:outline-none"
                            placeholder="admin@example.com"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="password" className="text-sm">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="bg-bgPrimary px-4 py-2 rounded-[6px] focus:outline-none"
                            placeholder="••••••••"
                        />
                    </div>

                    <Link href="/admin/dashboard">
                        <button
                            type="button"
                            className="bg-bgPrimary hover:bg-[#2d2d2dbb] transition-all duration-150 text-xl w-full text-center flex justify-center items-center sulphur text-[#fff] rounded-[6px] py-3 mt-4"
                        >
                            Login
                        </button>
                    </Link>
                </form>
            </div>
        </div>
    );
}
