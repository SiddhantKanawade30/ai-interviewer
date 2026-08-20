import { Router } from "express";
import { onBoardingController } from "../controllers/onboarding.controllers";

const router = Router();

router.post("/socials", onBoardingController);

export default router;