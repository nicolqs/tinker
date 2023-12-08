<div align="center">
  <h1 align="center"><a aria-label="NextJs Monorepo" href="https://github.com/belgattitude/nextjs-monorepo-example">Tinker Monorepo</a></h1>
  <p align="center"><strong>Fullstack dev projects and proof of concepts</strong></p>
</div>

## Getting Started

```bash
aws sso login --sso-session=<your-session>
yarn sst dev
yarn run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the frontend App.

## Technos

- Next.JS
- [SST](https://sst.dev/chapters/what-is-sst.html): define our infrastructure as code (IaC)

## Structure

```
.
├── apps
│   ├── nextjs-app  (SST, ssr, api, vitest)
└── packages
    ├── backend (used in AWS Lambas, Cron jobs...)
```
