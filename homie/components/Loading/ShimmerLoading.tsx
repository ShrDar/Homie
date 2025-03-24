import { TextShimmerWave } from "@/components/ui/text-shimmer-wave";

export default function ShimmerLoading({displayText} : {displayText : string}) {
    return (
        <div className="h-screen w-screen flex items-center text-4xl justify-center bg-bgPrimary text-fontPrimary sulphur tracking-[4px]">
            <TextShimmerWave
                className="[--base-color:#bbb] [--base-gradient-color:#2a2a2a]"
                duration={1.3}
                spread={1}
                zDistance={1}
                scaleDistance={1.1}
                rotateYDistance={20}
            >{`${displayText} . . .`}</TextShimmerWave>
        </div>
    )
}