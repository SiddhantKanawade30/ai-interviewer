import { Router } from "express";
import { onBoardingController } from "../controllers/onboarding.controllers";
import { uploadResume } from "../middleware/upload";
import { extractDetails } from "../controllers/resumeExtraction";
import { createSession } from "../controllers/interview";
import { createQuestions } from "../controllers/createQuestion";
import { submitAnswer } from "../controllers/answerQuestion";

const router = Router();

router.post("/socials", onBoardingController);
router.post("/extract-resume", uploadResume.single("resume"), extractDetails);
router.post("/session", createSession);
router.post("/question", createQuestions);
router.post("/answer", submitAnswer);
export default router;