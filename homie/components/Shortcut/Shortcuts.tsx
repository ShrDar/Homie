"use client"
import LogOutModal from "../Portals/LogOutModal";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Shortcuts() {
    const pathname = usePathname();
    const [openLogOutModal, setOpenLogOutModal] = useState(false);

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.key.toLowerCase() === 'q') {
                event.preventDefault();
                setOpenLogOutModal(true);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, []);

    if(pathname.includes("admin")) {
        return null;
    }
    return (
        <>
            {openLogOutModal && <LogOutModal setOpenLogOutModal={setOpenLogOutModal} />}
        </>
    )
}
