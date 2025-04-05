"use client"
import { Session } from "next-auth";
import Image from "next/image";
// import { useState } from "react";

export default function YapMain() {

    return (
        <div className="w-full bg-bgSecondary h-[75dvh] rounded-[15px] flex flex-col justify-center lg:justify-start lg:pt-[120px] items-center">
            <div>
                <Image 
                    src={`/figmaIcons/startYapping.svg`}
                    alt=""
                    height={150}
                    width={150}
                    className="w-[40vw] md:w-[25vw] lg:w-[16vw] opacity-[0.6]"
                />
            </div>
            <div>
                <p className="text-4xl text-[#a5a5a5] tracking-[6px]">
                    Start Yapping
                </p>
            </div>
        </div>
    )
}