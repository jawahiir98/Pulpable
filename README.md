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
- **E2B Sandboxes** - Open-source, secure environment with real-world tools for enterprise-grade agents
- **Docker** - Containerize your projects in an environment.

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

## 🧱 E2B Sandboxes

**E2B** allows you to run full-featured cloud sandboxes that behave like real machines — ideal for AI agents, automation, or secure runtime environments.

Each sandbox can run real-world dev tools like Node.js, Docker, or Bash inside isolated containers, controlled programmatically.

---

### ⚙️ Prerequisites

Before you begin:

- ✅ Ensure [Docker](https://www.docker.com/) is installed and running locally.
- ✅ Create an account at [E2B](https://e2b.dev).
- ✅ Install the E2B CLI:
```bash
  npm install -g e2b
```
## 🧪 Setting Up Your Sandbox Template

### e2b.Dockerfile Explanation

This Dockerfile builds a complete Next.js + ShadCN app in a Debian-based container, ready for execution:

```dockerfile
# You can use most Debian-based base images
FROM node:21-slim

# Install curl
RUN apt-get update && apt-get install -y curl && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy shell script and make it executable
COPY compile_page.sh /compile_page.sh
RUN chmod +x /compile_page.sh

# Set up working directory
WORKDIR /home/user/nextjs-app

# Create a Next.js app and install Shadcn UI
RUN npx --yes create-next-app@15.3.3 . --yes
RUN npx --yes shadcn@2.6.3 init --yes -b neutral --force
RUN npx --yes shadcn@2.6.3 add --all --yes

# Flatten structure
RUN mv /home/user/nextjs-app/* /home/user/ && rm -rf /home/user/nextjs-app
```
compile_page.sh Explanation

This script boots up the Next.js dev server (with Turbopack) and pings the server until it responds successfully (status code 200):
```shell
#!/bin/bash

# This script runs during sandbox template build
# It waits until the Next.js app compiles and is live

function ping_server() {
  counter=0
  response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000")
  while [[ ${response} -ne 200 ]]; do
    let counter++
    if (( counter % 20 == 0 )); then
      echo "Waiting for server to start..."
      sleep 0.1
    fi
    response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000")
  done
}

ping_server &

cd /home/user && npx next dev --turbopack
```
## 🧪 Build & Publish the Template

1. Navigate to the sandbox directory where you will generate the builds.
```bash
cd sandbox-templates/nextjs
```
2. Build the template with your desired name:
```bash
e2b template build --name YOUR_TEMPLATE_NAME --cmd "/compile_page.sh"
```
3. Verify Success
   If the build completes successfully, you should see confirmation in the terminal and the new template listed on your E2B dashboard.
   [img.png](img.png)
Optionally, verify by checking the dashboard UI under “Templates.”

## 🔓 Make the Template Public

1. By default, your template is private. Go to the E2B dashboard, locate your template, and scroll right — you'll see a privacy toggle.

2. Go to Team Settings and copy your TEAM_ID.

3. Publish the template:
```bash
e2b template publish -t YOUR_TEAM_ID
```
4. Now your template is public and ready to be used in sandboxed environments!


# 🧠 Learn More

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [tRPC Docs](https://trpc.io/docs)
- [Inngest Docs](https://www.inngest.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Shadcn UI Docs](https://ui.shadcn.com)
- [E2B Sandboxes](https://e2b.dev/docs)

---

Built with ❤️ by **Jawahiir Nabhan**