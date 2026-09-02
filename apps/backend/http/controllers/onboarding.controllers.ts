import type { Request, Response } from "express";
import { preInterviewSchema } from "../../zod/socials";
import { db } from "../../db/index";
import { socials, github_profiles } from "../../db/schema";
import { getGithubProfile } from "../../services/github.service";

export async function onBoardingController(
    req: Request,
    res: Response
) {
    const { github, linkedIn, candidateId } = req.body;

    const result = preInterviewSchema.safeParse({
        github,
        linkedIn,
        candidateId,
    });

    if (!result.success) {
        return res.status(400).json({
            message: "Incorrect Body",
            errors: result.error,
        });
    }

    try {
        await db.insert(socials).values(result.data);

        const profileData = await getGithubProfile(result.data.github);

        await db.insert(github_profiles).values({
            candidateId: result.data.candidateId,
            username: profileData.username,
            name: profileData.name,
            bio: profileData.bio,
            followers: profileData.followers,
            repositories: profileData.repositories,
        });

        return res.status(201).json({
            message: "User added and GitHub profile scraped successfully",
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to create candidate and scrape GitHub",
        });
    }
}