"use client";

import { TextShimmerWave } from "@/components/ui/text-shimmer-wave";

export default function Applying( {settingName} : {settingName: string} ) {
    return (
        <div className="fixed inset-0 min-h-screen w-full flex items-center text-4xl font-thin text-[#666] justify-center bg-bgPrimary text-fontPrimary sulphur tracking-[4px]">
            <TextShimmerWave
                className="[--base-color:#fff] [--base-gradient-color:#2a2a2a] text-center"
                duration={1.3}
                spread={1}
                zDistance={1}
                scaleDistance={1.1}
                rotateYDistance={20}
            >
                {`Applying ${settingName}...`}
            </TextShimmerWave>
        </div>
    );
}
