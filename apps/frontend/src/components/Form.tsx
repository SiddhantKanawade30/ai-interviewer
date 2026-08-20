import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { toast } from "sonner"
import axios from "axios"
import { BACKEND_URL } from "../lib/config"

export default function Form() {
    const [github, setGithub] = useState("")
    const [linkedIn, setLinkedIn] = useState("")

    async function Submit() {
        if (!github || !linkedIn) {
            toast.warning("Please enter your Linkedin and GitHub URL", { position: "top-center" })
            return;
        }
        try {
            const res = await axios.post(`${BACKEND_URL}/api/v1/onboarding/socials`, {
                github,
                linkedIn
            })
        } catch (err) {
            console.log(err)
        }

    }
    return (
        <div className="h-screen w-screen flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4 w-full max-w-sm px-4">
                <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                    AI Interviewer
                </h2>
                <Input placeholder="Linkedin URL" className="w-full" onChange={(e) => setLinkedIn(e.target.value)} />
                <Input placeholder="GitHub URL" className="w-full" onChange={(e) => setGithub(e.target.value)} />
                <Button className="w-full" onClick={Submit}>Start Interview</Button>
            </div>
        </div>
    )
}