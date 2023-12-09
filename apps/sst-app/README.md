This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Technos

- Next.js
- SST

## Project Structure

```
my-sst-app
├─ package.json
├─ sst.config.ts
├─ packages
│  ├─ core
│  │  └─ migrations (SQL)
│  ├─ functions
│  ├─ graphql
└─ stacks
```

- `sst.config.ts` defines the project config and the stacks in the app.
- `stacks/` directory contains the app's Infrastructure as Code (IaC).

- `packages/` directory houses everything that powers the backend
- `packages/core` contains all of the business logic. Separate from API and Lambda functions.
- `packages/functions` all the code for Lambda functions. mostly be calling into `packages/core`
- `packages/graphql` GraphQL related code generation.
