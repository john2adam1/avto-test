# Quick Fix: "Could not find the table 'public.test_types'" Error

## Problem
You're getting this error because the `test_types` table doesn't exist in your database.

## Solution

### Option 1: Run the Complete Setup Script (RECOMMENDED - EASIEST)

Run this **ONE script** in Supabase SQL Editor:

**`scripts/015_complete_setup_with_rls.sql`** ⭐

This single script does EVERYTHING:
- ✅ Creates `test_types` table
- ✅ Creates `profiles` table with all required fields
- ✅ Creates `settings` table
- ✅ Creates the new simplified `tests` table
- ✅ Creates `user_test_attempts` table
- ✅ Creates all necessary indexes
- ✅ Enables Row Level Security (RLS)
- ✅ Creates `is_user_admin()` function
- ✅ Sets up ALL RLS policies
- ✅ Sets up admin permissions

**This is the easiest solution - just run this one script!**

### Option 2: Run Basic Setup (Without RLS)

If you prefer a simpler script without RLS setup:

**`scripts/014_complete_setup.sql`**

Then run RLS scripts separately:
- `scripts/002_enable_rls.sql`
- `scripts/005_add_admin_role.sql`
- `scripts/013_update_rls_for_new_schema.sql`
- `scripts/011_admin_update_profiles_policy.sql`

### Option 2: Run Scripts in Order

If you prefer to run scripts individually:

1. **`scripts/001_create_tables.sql`** - Creates `test_types` and other base tables
2. **`scripts/012_redesign_schema.sql`** - Redesigns the schema
3. **`scripts/013_update_rls_for_new_schema.sql`** - Updates RLS policies
4. **`scripts/002_enable_rls.sql`** - Enables RLS (if not already done)
5. **`scripts/005_add_admin_role.sql`** - Creates admin function
6. **`scripts/006_admin_rls_policies.sql`** - Admin RLS policies
7. **`scripts/011_admin_update_profiles_policy.sql`** - Admin update profiles policy

## After Running the Script

1. **Refresh your browser** - The error should be gone
2. **Create test categories** - Go to Admin → Test Types → Create
3. **Create tests** - Go to Admin → Tests → Create (one per category)

## Verify Tables Exist

Run this in Supabase SQL Editor to check:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('test_types', 'tests', 'profiles', 'user_test_attempts', 'settings')
ORDER BY table_name;
```

You should see all 5 tables listed.

## Still Having Issues?

If the error persists after running the script:

1. Check Supabase dashboard → Table Editor - do you see the tables?
2. Check for any error messages when running the SQL script
3. Make sure you're running the script in the correct Supabase project
4. Try refreshing the Supabase schema cache (sometimes needed after creating tables)

