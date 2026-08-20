docker run --name ai-interviewer-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=ai_interviewer -p 5432:5432 -d postgres:16

bunx drizzle-kit studio