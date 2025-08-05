"# ⚡ Next.js Project Boilerplate

This is a modern, full-stack web application built with a powerful tech stack for rapid development and scalability.

## 🧩 Tech Stack

This project uses a **type-safe, scalable full-stack setup**, including:

- **Next.js** – React framework for building web apps
- **Tailwind CSS** – Utility-first CSS framework
- **Shadcn UI** – Accessible UI components powered by Radix UI
- **tRPC** – End-to-end typesafe APIs without needing REST or GraphQL
- **Prisma ORM** – Next-gen TypeScript ORM for database access
- **NeonDB** – Serverless PostgreSQL database
- **Inngest** – Resilient background jobs & workflows
- **OpenAI** – AI-enhanced features via OpenAI’s API

---

## ⚙️ Getting Started

Install dependencies:

```bash
npm install
```

Run your project ( 2 steps )

1. Run your project 
```bash 
npm run dev
```
2. Run Inngest development server 
```bash 
npx inngest-cli@latest dev 
```


Open http://localhost:3000 to view it in your browser.

🧠 Prisma ORM Setup Guide
This project uses Prisma as the database toolkit, configured with NeonDB.

Here's a guide based on the current setup (see /prisma folder):🧠 Prisma ORM Setup Guide
This project uses Prisma as the database toolkit, configured with NeonDB.

Here's a guide based on the current setup (see /prisma folder):

### 1. Initialize Prisma

```base 
npx prisma init
```
This creates:

prisma/schema.prisma – your data models go here.

.env – set your DATABASE_URL (e.g., NeonDB).
Create your account from NeonDB official website. 

### 2. Define Your Schema
Edit prisma/schema.prisma and define your models.

### 3. Run Your First Migration
```base 
npx prisma migrate dev --name db_init
```
This:

Creates a migrations/ folder with timestamped folders (as seen in your project).

Applies changes to your local database.

### 4. Push Schema (Optional in Dev)
```base 
npx prisma db push
```
Use this to sync your schema with the database without creating a new migration.

### 5. Seed the Database
```base 
ts-node prisma/seed.ts
```
Make sure ts-node is installed (you can use pnpm dlx tsx as an alternative).

# 🧪 tRPC Setup
tRPC is already wired into the project. To add new routes:

Add procedures to your router files under /server/api

Use api/trpc/[trpc].ts to handle them in Next.js API routes

# ⚙️ Inngest Setup
Inngest is used for background jobs:

Handlers go in /inngest/ folder

Register functions and use them via inngest.send() in your code

Don’t forget to set your INNGEST_EVENT_KEY in .env.
Create an Account at - [Inngest Docs](https://www.inngest.com/docs).

# 🧠 Learn More

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [tRPC Docs](https://trpc.io/docs)
- [Inngest Docs](https://www.inngest.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Shadcn UI Docs](https://ui.shadcn.com)

---

Built with ❤️ by **Jawahiir Nabhan**