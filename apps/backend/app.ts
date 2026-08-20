import express from "express";
import cors from "cors";

import onboardingRouter from "./routes/onboarding.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1/onboarding", onboardingRouter);

export default app;