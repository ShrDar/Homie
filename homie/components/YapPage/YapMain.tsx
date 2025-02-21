"use client"
import { Session } from "next-auth";
import { useState } from "react";

export default function YapMain({ session } : { session: Session }) {

    const [user, setUser] = useState();

    return (
        <div>

        </div>
    )
}