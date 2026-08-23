import { Router } from "express";
import { onBoardingController } from "../controllers/onboarding.controllers";
import { uploadResume } from "../middleware/upload";
import { extractDetails } from "../controllers/resumeExtraction";

const router = Router();

router.post("/socials", onBoardingController);
router.post("/extract-resume", uploadResume.single("resume"), extractDetails);

export default router;