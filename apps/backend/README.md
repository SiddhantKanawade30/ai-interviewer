apps/backend/
│
├── src/
│   ├── server.ts                 # Start the server
│   ├── app.ts                    # Express app + middleware
│   │
│   ├── config/
│   │   └── env.ts                # Environment variables
│   │
│   ├── db/
│   │   ├── index.ts              # Drizzle connection
│   │   └── schema/
│   │       ├── candidate.ts
│   │       ├── interview.ts
│   │       ├── question.ts
│   │       └── index.ts
│   │
│   ├── routes/
│   │   ├── preInterview.routes.ts
│   │   └── interview.routes.ts
│   │
│   ├── controllers/
│   │   ├── preInterview.controller.ts
│   │   └── interview.controller.ts
│   │
│   ├── services/
│   │   ├── llm.service.ts
│   │   ├── github.service.ts
│   │   └── linkedin.service.ts
│   │
│   ├── validators/
│   │   └── interview.validator.ts
│   │
│   └── types/
│       └── index.ts
│
├── drizzle/
│   └── migrations/
│
├── drizzle.config.ts
├── package.json
├── tsconfig.json
└── .env