export async function getGithubProfile(githubUrl: string) {
    const username = githubUrl.split("/").filter(Boolean).pop();

    if (!username) {
        throw new Error("Invalid GitHub URL");
    }

    const response = await fetch(
        `https://api.github.com/users/${username}`
    );

    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();

    return data;
}