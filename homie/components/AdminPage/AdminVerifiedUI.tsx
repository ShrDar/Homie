"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { TextShimmerWave } from "@/components/ui/text-shimmer-wave";

export default function AdminVerifiedUI() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/admin/dashboard");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="h-screen w-screen flex items-center text-4xl justify-center bg-bgPrimary text-fontPrimary sulphur tracking-[4px]">
      <TextShimmerWave
        className="[--base-color:#fff] [--base-gradient-color:#2a2a2a]"
        duration={1.3}
        spread={1}
        zDistance={1}
        scaleDistance={1.1}
        rotateYDistance={20}
      >
        Welcome Back Admin
      </TextShimmerWave>
    </div>
  );
}
