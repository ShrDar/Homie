"use client"

import { TextShimmerWave } from "../ui/text-shimmer-wave"

type EntryBtnProps = {
    name: string,
    click?: any
}

export default function EntryBtn({name,click = () => console.log('no action')} : EntryBtnProps) {
    return (
        <button onClick={click} className="entryBtn bg-bgPrimary hover:bg-[#2d2d2dbb] transition-all duration-150 text-2xl w-full text-center flex justify-center items-center sulphur text-fontPrimary rounded-[6px] py-2">
            {name == "Login" || name == "Sign Up" ? name : (
                <TextShimmerWave
                    className="[--base-color:#bbb] [--base-gradient-color:#2a2a2a]"
                    duration={1.3}
                    spread={1}
                    zDistance={1}
                    scaleDistance={1.1}
                    rotateYDistance={20}
                >
                    {name === "Logging In" ? `Logging In . . .` : `Signing Up . . .`}
                </TextShimmerWave>
            )}
        </button>
    )
}