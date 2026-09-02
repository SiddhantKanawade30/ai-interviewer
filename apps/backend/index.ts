import express from "express";
import cors from "cors";

import onboardingRouter from "./http/routes/onboarding.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1/onboarding", onboardingRouter);

app.listen(8000, () => {
    console.log("backend server is running on port 8000")
})
