# TestMaster - Local Development Setup Guide

This guide will help you set up and run the TestMaster project on your local machine.

## Prerequisites

Before you begin, make sure you have:
- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **pnpm** package manager (comes with Node.js)
- A **Supabase account** - [Sign up here](https://supabase.com/)

## Step 1: Install Dependencies

Open your terminal in the project folder and run:

```bash
npm install
```

or if you prefer pnpm:

```bash
pnpm install
```

This will install all required packages listed in package.json.

## Step 2: Set Up Supabase

### 2.1 Create a Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in the project details and wait for it to be created

### 2.2 Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

### 2.3 Create Environment Variables File

Create a file named `.env.local` in the root of your project:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
```

Replace `your_project_url_here` and `your_anon_key_here` with the values you copied.

**Example:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://rhhxnuapvrlqkamgjhzo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoaHhudWFwdnJscWthbWdqaHpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI2MTk1OTUsImV4cCI6MjA0ODE5NTU5NX0.abc123...
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
```

## Step 3: Set Up the Database

You need to run SQL scripts to create the database tables. There are two ways to do this:

### Option A: Using Supabase SQL Editor (Recommended)

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open each SQL file in the `scripts/` folder (in order) and copy its contents:
   - `001_create_tables.sql`
   - `002_enable_rls.sql`
   - `003_create_profile_trigger.sql`
   - `004_seed_sample_data.sql`
   - `005_add_admin_role.sql`
   - `006_admin_rls_policies.sql`
   - `007_create_admin_user.sql`
   - `008_add_subscription_fields.sql`
   - `009_add_settings_table.sql`
   - `010_backfill_existing_users.sql`
5. Paste each script's content and click **Run** (do this for each file in order)

### Option B: Using the Project Scripts Folder

The scripts folder contains all necessary SQL files numbered in order (001 through 010). Run them sequentially in the Supabase SQL Editor.

## Step 4: Configure Admin Settings

After running the SQL scripts:

1. Sign up for an account on your local site (once it's running)
2. Go to your Supabase dashboard → **Table Editor** → **profiles** table
3. Find your user and set `is_admin` to `true`
4. Log in to the site and go to `/admin/settings`
5. Set your Telegram username for subscription purchases

## Step 5: Run the Development Server

Now you're ready to start the development server:

```bash
npm run dev
```

The site will be available at: **http://localhost:3000**

## Project Structure

```
testmaster/
├── app/                      # Next.js app directory
│   ├── admin/               # Admin panel pages
│   ├── auth/                # Authentication pages
│   ├── dashboard/           # User dashboard
│   └── test/                # Test-taking interface
├── components/              # React components
│   ├── admin/              # Admin-specific components
│   └── ui/                 # UI components (shadcn)
├── lib/                    # Utility functions
│   └── supabase/          # Supabase client utilities
├── scripts/               # Database SQL scripts
└── public/               # Static assets
```

## Features

- **User Authentication**: Email/password authentication via Supabase
- **Test Management**: Create test types, tests, and questions with images
- **Timed Tests**: Countdown timer for each test
- **Results & Statistics**: Detailed results and test history
- **Admin Panel**: Full admin dashboard for managing tests and users
- **Subscription System**: 1-day free trial + manual subscription management
- **Telegram Integration**: Contact admin for paid subscriptions

## Troubleshooting

### Issue: "Column does not exist" errors

**Solution**: Make sure you ran all SQL scripts in order (001 through 010).

### Issue: "Cannot connect to Supabase"

**Solution**: 
- Check that your `.env.local` file has the correct credentials
- Verify your Supabase project is active
- Restart your development server after creating `.env.local`

### Issue: "Permission denied" or RLS errors

**Solution**: 
- Make sure you ran script 002 (enable_rls.sql) and 006 (admin_rls_policies.sql)
- Check that your user has `is_admin` set to `true` in the profiles table

### Issue: npm install fails

**Solution**:
- Make sure you have Node.js 18 or higher installed
- Try deleting `node_modules` and `package-lock.json`, then run `npm install` again
- Try using `npm install --legacy-peer-deps` if you get dependency conflicts

## Default Admin Credentials

After running script 007, you can create an admin account:
- The script creates a function to set admin privileges
- Sign up normally, then set `is_admin` to true in the Supabase profiles table

## Need Help?

If you encounter any issues:
1. Check the browser console for error messages
2. Check the terminal where `npm run dev` is running for server errors
3. Verify all SQL scripts ran successfully in Supabase
4. Make sure your `.env.local` file has correct values

## Building for Production

To create a production build:

```bash
npm run build
npm start
```

For deployment to Vercel, connect your GitHub repository in the Vercel dashboard and add the same environment variables.
