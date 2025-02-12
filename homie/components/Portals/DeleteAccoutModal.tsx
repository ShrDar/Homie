"use client"

import { toast } from "sonner";
import { logout } from "@/actions/auth";

export default function DeleteAccountModal( {openDeleteModal, setOpenDeleteModal, user} : {openDeleteModal : boolean, setOpenDeleteModal: any, user: any} ) {
    
    if(!openDeleteModal) {
        return null;
    }



    const handleDelete = async () => {
        logout();
        try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${user._id}`, {
            method: "DELETE",
        });

        if (response.ok) {
            toast.success("Account deleted successfully");
        } else {
            const errorMessage = await response.text();
            toast.error(`Error: ${errorMessage}`);
        }
        } catch (err) {
        toast.error("Error deleting account");
        console.error("Error deleting user:", err);
        }
    };

    return(
        <>
            <div onClick={() => setOpenDeleteModal(false)} className="fixed top-[50%] z-[90] left-[50%] translate-x-[-50%] translate-y-[-50%] h-screen w-full bg-[#00000052] ">

            </div>
            <div className="fixed p-10 w-[70%] md:w-[50%] lg:w-[30%] flex flex-col gap-8 justify-center items-center rounded-[15px] bg-bgSecondary top-[50%] z-[100] left-[50%] translate-x-[-50%] translate-y-[-50%] sulphur text-[#fff]">
                <p className="text-lg">Delete Account</p>
                <div className="bg-bgPrimary p-10 rounded-[15px] w-full flex justify-center items-center">
                    <p className="text-center">Are you leaving us ? 😢</p>
                    {/* <MdOutlineDelete color="#d45353" size={35} /> */}
                </div>
                <div className="flex justify-center items-center w-full gap-4">
                    <div onClick={() => setOpenDeleteModal(false)} className="w-full cursor-pointer hover:brightness-[1.2] rounded-[15px] p-2 bg-bgPrimary flex justify-center items-center">
                        <p>Stop</p>
                    </div>
                    <div onClick={() => handleDelete()} className="w-full cursor-pointer hover:brightness-[0.7] rounded-[15px] p-2 bg-bgPrimary text-[#d45353] flex justify-center items-center">
                        <p>Delete</p>
                    </div>
                </div>
            </div>
        </>
    );
}
