# Development Setup Guide

## Overview

This guide walks you through setting up the development environment for the Beautivo booking application on a new computer. You'll need to follow these steps on each machine where you want to develop.

## Prerequisites

Before you begin, you need to install the following software on your computer.

### 1. Node.js (v20 or later)

Node.js is the JavaScript runtime that powers both the frontend and backend.

For Windows, download and run the installer from https://nodejs.org/ and choose the LTS version.

For macOS using Homebrew, run `brew install node`.

To verify installation, run `node --version` which should show v20.x.x or higher, and `npm --version` which should show 10.x.x or higher.

### 2. Git

Git is the version control system we use to manage code and sync between computers.

For Windows, download and install from https://git-scm.com/download/windows.

For macOS, Git comes with Xcode Command Line Tools which you can install with `xcode-select --install`, or using Homebrew with `brew install git`.

To verify installation, run `git --version` which should show git version 2.x.x.

To configure Git for the first time, run these commands replacing the values with your information:
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 3. Docker Desktop

Docker runs the PostgreSQL database in a container, so you don't need to install PostgreSQL directly.

For Windows and macOS, download and install from https://www.docker.com/products/docker-desktop/.

To verify installation, run `docker --version` which should show Docker version 24.x.x or higher, and `docker compose version` which should show Docker Compose version v2.x.x.

### 4. Code Editor (VS Code Recommended)

Visual Studio Code is the recommended editor for this project. Download it from https://code.visualstudio.com/.

The recommended VS Code extensions are ESLint for code linting, Prettier for code formatting, TypeORM Entity for entity highlighting and snippets, Tailwind CSS IntelliSense for Tailwind class suggestions, Thunder Client or REST Client for API testing, and GitLens for Git history visualization.

---

## Project Setup

### Step 1: Clone the Repository

If this is a new computer and you don't have the code yet, navigate to where you want the project, then run these commands replacing YOUR_USERNAME with your GitHub username:

```bash
cd ~/Projects
git clone https://github.com/YOUR_USERNAME/beautivo.git
cd beautivo
```

If you already have the project and want to get the latest changes:

```bash
cd beautivo
git pull origin main
```

### Step 2: Install Dependencies

The project has two main parts (frontend and backend), each with its own dependencies.

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install

# Return to root
cd ..
```

### Step 3: Environment Variables

Each part of the application needs environment variables to configure connections and secrets.

For the backend, create a file called `.env` in the `backend` folder with the following content:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=beautivo

# JWT Secrets (generate your own secure random strings)
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this"

# App Settings
PORT=3001
NODE_ENV=development

# Email (Resend) - Get your API key from https://resend.com
RESEND_API_KEY="re_your_api_key_here"
RESEND_FROM_EMAIL="noreply@yourdomain.com"

# Cloudinary - Get credentials from https://cloudinary.com (only needed when testing uploads)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Frontend URL (for CORS and email links)
FRONTEND_URL="http://localhost:3000"
```

For the frontend, create a file called `.env.local` in the `frontend` folder:

```env
# API URL
NEXT_PUBLIC_API_URL="http://localhost:3001/api/v1"

# Google Analytics (optional for development)
NEXT_PUBLIC_GA_ID=""

# Meta Pixel (optional for development)
NEXT_PUBLIC_META_PIXEL_ID=""
```

Important Security Note: Never commit `.env` files to Git. They are already in `.gitignore`, but be careful not to accidentally share your secrets.

### Step 4: Start the Database

Start the PostgreSQL database using Docker from the project root directory:

```bash
docker compose up -d
```

This command starts a PostgreSQL container in the background. The database will be available at `localhost:5432`.

To check if it's running, use `docker compose ps`.

To stop the database when you're done working, use `docker compose down`.

To stop and remove all data for a fresh start, use `docker compose down -v`.

### Step 5: Set Up the Database Schema

Run TypeORM migrations to create the database tables:

```bash
cd backend

# Run migrations
npm run migration:run

# If this is first setup and you need to generate initial migration:
# npm run migration:generate -- -n InitialSchema
```

### Step 6: Seed the Database (Optional but Recommended)

Populate the database with sample data for development:

```bash
cd backend
npm run seed
```

This creates a sample shop with working hours, service categories and sample services, a Shop Admin user (admin@example.com / password123), sample staff members with schedules, sample customers, and sample bookings.

### Step 7: Start the Development Servers

You need two terminal windows or tabs to run both servers.

In Terminal 1 for the backend:
```bash
cd backend
npm run start:dev
```
The API will be available at http://localhost:3001.

In Terminal 2 for the frontend:
```bash
cd frontend
npm run dev
```
The website will be available at http://localhost:3000.

---

## Working with Git (Multi-Device Workflow)

This section explains how to sync your work between multiple computers.

### Starting Work (When You Sit Down)

Always start by getting the latest changes:

```bash
cd beautivo
git pull origin main
```

If you have local changes that conflict, Git will tell you. In that case, you can save your local changes temporarily with `git stash`, get the latest code with `git pull origin main`, and then restore your local changes with `git stash pop`.

### Saving Your Work (When You're Done)

When you've made progress and want to save:

```bash
# See what files have changed
git status

# Add all changed files
git add .

# Or add specific files
git add frontend/src/components/NewComponent.tsx

# Commit with a descriptive message
git commit -m "Add booking calendar component"

# Push to GitHub
git push origin main
```

### Best Practices

Commit often by making small, focused commits rather than one giant commit at the end of the day.

Write good commit messages that describe what you changed and why. For example, "Fix availability calculation for overlapping time blocks" is better than "bug fix".

Pull before you push by always getting the latest changes before pushing to avoid conflicts.

Don't commit .env files since these contain secrets and should stay local to each machine.

---

## Database Management

### TypeORM CLI Commands

TypeORM provides CLI commands for database management. These are configured in the backend package.json:

```bash
cd backend

# Run all pending migrations
npm run migration:run

# Generate a new migration based on entity changes
npm run migration:generate -- -n DescriptiveName

# Revert the last migration
npm run migration:revert

# Show all migrations and their status
npm run migration:show
```

### Creating a New Migration

When you modify an entity (add a field, change a type, etc.):

1. Make your changes to the entity file (e.g., `booking.entity.ts`)
2. Generate a migration:
   ```bash
   npm run migration:generate -- -n AddBookingNotesField
   ```
3. Review the generated migration in `src/database/migrations/`
4. Run the migration:
   ```bash
   npm run migration:run
   ```

### Viewing Database Data

You can use any PostgreSQL client to view the database:

**Using psql (command line):**
```bash
docker exec -it beautivo-db psql -U postgres -d beautivo
```

**Using pgAdmin or DBeaver:**
Connect with these settings:
- Host: localhost
- Port: 5432
- Database: beautivo
- Username: postgres
- Password: postgres

### Resetting the Database

If you need a completely fresh database:

```bash
# Stop the database and remove all data
docker compose down -v

# Start fresh
docker compose up -d

# Run migrations
cd backend
npm run migration:run

# Seed with sample data
npm run seed
```

---

## Testing Your Setup

### Verify Everything is Working

For the database, connect with a PostgreSQL client and verify you can see the tables.

For the backend API, open http://localhost:3001/api/v1/health in your browser. You should see a success response.

For the frontend, open http://localhost:3000 in your browser. You should see the homepage.

For the admin panel, open http://localhost:3000/admin/login and log in with the seed credentials (admin@example.com / password123).

### Test the Booking Flow

Go to http://localhost:3000, click "Book Now", select some services, choose a date and time, enter your email for OTP verification, check the backend console for the OTP (in development emails are logged to console), and complete the booking.

---

## Common Issues and Solutions

### "Port 3000 already in use"

Another application is using port 3000. Either close that application or change the port with `PORT=3002 npm run dev` for the frontend.

### "Cannot connect to database"

Ensure Docker is running and the database container is up with `docker compose ps` and `docker compose up -d`.

### "Migration failed"

Check that the database is running and the connection settings in `.env` are correct. If you're having issues, try resetting the database completely.

### "Module not found" errors

Dependencies might be out of sync. Reinstall them with `cd frontend && npm install` and `cd ../backend && npm install`.

### Git conflicts when pulling

If you have uncommitted changes that conflict with remote changes, you can use Option 1 to stash your changes with `git stash`, pull with `git pull origin main`, and then restore with `git stash pop`. Or use Option 2 to commit your changes first with `git add .` and `git commit -m "WIP: my current work"`, then `git pull origin main`, resolve any conflicts, and then `git add .` and `git commit -m "Merge remote changes"`.

### TypeORM entity changes not reflected

Make sure you:
1. Generated a new migration after changing entities
2. Ran the migration with `npm run migration:run`
3. Restarted the backend server

---

## Development Tools and Tips

### Useful Commands Cheat Sheet

For Git commands: `git status` shows what files have changed, `git diff` shows the actual changes in files, `git log --oneline -10` shows the last 10 commits, `git checkout -- filename` discards changes to a file, `git branch` lists branches, and `git checkout -b feature-name` creates and switches to a new branch.

For NPM commands: `npm run dev` starts the development server, `npm run build` builds for production, `npm run lint` checks for code issues, and `npm run test` runs tests.

For Docker commands: `docker compose up -d` starts containers in background, `docker compose down` stops containers, `docker compose logs -f` views container logs, and `docker compose ps` lists running containers.

For TypeORM commands: `npm run migration:run` runs pending migrations, `npm run migration:generate -- -n Name` generates a migration, `npm run migration:revert` reverts last migration, and `npm run migration:show` shows migration status.

### VS Code Shortcuts

Ctrl/Cmd + P provides quick file open. Ctrl/Cmd + Shift + P opens the command palette. Ctrl/Cmd + ` toggles the terminal. Ctrl/Cmd + B toggles the sidebar. F12 goes to definition. Shift + F12 finds all references.

### Browser DevTools

F12 or Ctrl/Cmd + Shift + I opens DevTools. The Network tab shows API requests. The Console tab shows errors and logs. The React DevTools extension lets you inspect React components.

---

## Next Steps

Once your environment is set up, read the PROJECT_OVERVIEW.md to understand the application structure, review ARCHITECTURE.md for technical details, check FEATURES.md when implementing specific features, and use CLAUDE_CODE_PROMPTS.md to guide Claude Code through implementation.

Happy coding!
