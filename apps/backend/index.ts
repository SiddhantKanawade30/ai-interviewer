import express from "express"
import { preInterviewSchema } from "./dataSchema"
const app = express()

app.use(express.json())

app.post("/api/v1/pre-interview", (req, res) => {
    const { github, linkedin } = req.body
    
    const result = preInterviewSchema.safeParse({ github, linkedin })
    
    if(!result.success) {
        return res.status(411).json({ 
            message : "Incorrect Body"
         })
    }

})

app.listen(8000)