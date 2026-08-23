import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { toast } from "sonner"
import axios from "axios"
import { BACKEND_URL } from "../lib/config"

export default function Form() {
    const [github, setGithub] = useState("")
    const [linkedIn, setLinkedIn] = useState("")
    const [resume, setResume] = useState<File | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    async function Submit() {
        if (!github || !linkedIn || !resume) {
            toast.warning("Please provide your LinkedIn, GitHub, and Resume", { position: "top-center" })
            return;
        }
        
        setIsLoading(true)
        try {
            // First submit socials
            await axios.post(`${BACKEND_URL}/api/v1/onboarding/socials`, {
                github,
                linkedIn
            })

            // Then upload the resume
            const formData = new FormData();
            formData.append("resume", resume);

            const resumeRes = await axios.post(`${BACKEND_URL}/api/v1/onboarding/extract-resume`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            })
            
            toast.success("Profile saved and resume parsed successfully!", { position: "top-center" })
            console.log(resumeRes.data);

        } catch (err) {
            console.log(err)
            toast.error("An error occurred during submission", { position: "top-center" })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="h-screen w-screen flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4 w-full max-w-sm px-4">
                <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                    AI Interviewer
                </h2>
                <div className="w-full space-y-2 text-left pb-4">
                    <Label htmlFor="resume">Upload Resume (PDF)</Label>
                    <Input id="resume" type="file" accept=".pdf" className="w-full" onChange={(e) => setResume(e.target.files?.[0] || null)} />
                </div>
                
                <div className="w-full space-y-4 pt-3">
                    <Input placeholder="Linkedin URL" className="w-full" onChange={(e) => setLinkedIn(e.target.value)} />
                    <Input placeholder="GitHub URL" className="w-full" onChange={(e) => setGithub(e.target.value)} />
                </div>

                <Button className="w-full mt-4" onClick={Submit} disabled={isLoading}>
                    {isLoading ? "Processing..." : "Start Interview"}
                </Button>
            </div>
        </div>
    )
}