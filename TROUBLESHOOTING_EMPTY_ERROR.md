# Troubleshooting: Empty Error Object `{}` When Fetching Test Types

## What This Error Means

When you see `Error fetching test types: {}`, it means:
- Supabase returned an error object
- But the error has no enumerable properties (empty object)
- This usually indicates an RLS (Row Level Security) or permissions issue

## Improved Error Logging

The code has been updated to provide much more diagnostic information. When this error occurs, you should now see:
- All error properties (including non-enumerable ones)
- User authentication status
- User ID and email
- Diagnostic query results
- Error type information

## Common Causes & Solutions

### 1. RLS Policies Not Set Up
**Symptom**: Empty error object when querying `test_types`

**Solution**: Run these SQL scripts in order in Supabase SQL Editor:
1. `scripts/002_enable_rls.sql` - Enables RLS and creates basic policies
2. `scripts/006_admin_rls_policies.sql` - Updates policies for admin access

**Check**: Verify the policy exists:
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'test_types' 
AND policyname = 'Anyone can view test types';
```

### 2. User Not Authenticated
**Symptom**: User session expired or not logged in

**Solution**: 
- Check if user is logged in
- Try logging out and logging back in
- Check browser console for auth errors

**Check in code**: The improved error logging will show `userAuthenticated: false` if this is the issue

### 3. Table Doesn't Exist
**Symptom**: Error when querying non-existent table

**Solution**: Run `scripts/001_create_tables.sql` to create all tables

**Check**: 
```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'test_types'
);
```

### 4. `is_user_admin()` Function Missing
**Symptom**: RLS policies using `is_user_admin()` fail

**Solution**: Run `scripts/005_add_admin_role.sql` which creates the function

**Check**:
```sql
SELECT EXISTS (
  SELECT FROM pg_proc 
  WHERE proname = 'is_user_admin'
);
```

### 5. Conflicting RLS Policies
**Symptom**: Multiple policies conflict with each other

**Solution**: 
- Check for duplicate policies
- Drop old policies before creating new ones
- Script `006_admin_rls_policies.sql` should handle this with `DROP POLICY IF EXISTS`

**Check**:
```sql
SELECT * FROM pg_policies WHERE tablename = 'test_types';
```

## Diagnostic Steps

### Step 1: Check Error Details
Look at the console output. The improved logging should show:
```
Error fetching test types: {
  errorInfo: { ... },
  allPropertyNames: [ ... ],
  errorString: "...",
  errorType: "PostgrestError",
  userAuthenticated: true/false,
  userId: "...",
  userEmail: "...",
  timestamp: "..."
}
```

### Step 2: Verify RLS Policies
Run in Supabase SQL Editor:
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'test_types';

-- Check policies
SELECT * FROM pg_policies 
WHERE tablename = 'test_types';
```

### Step 3: Test Direct Query
Try querying directly in Supabase SQL Editor (while logged in as your user):
```sql
SELECT * FROM test_types ORDER BY name;
```

If this works, the issue is with the application code.
If this fails, the issue is with RLS policies or permissions.

### Step 4: Check User Authentication
In your application, check:
- Is the user logged in?
- Is the session valid?
- Check browser DevTools → Application → Cookies for Supabase session

### Step 5: Verify Table Has Data
```sql
SELECT COUNT(*) FROM test_types;
```

If the table is empty, that's fine - the query should still work, just return empty array.

## Quick Fix Checklist

- [ ] Run `scripts/001_create_tables.sql` (if tables don't exist)
- [ ] Run `scripts/002_enable_rls.sql` (enable RLS and basic policies)
- [ ] Run `scripts/005_add_admin_role.sql` (create is_user_admin function)
- [ ] Run `scripts/006_admin_rls_policies.sql` (update policies)
- [ ] Verify user is logged in
- [ ] Check browser console for detailed error information
- [ ] Check Supabase logs for server-side errors

## What the Improved Code Does

The updated `getTestTypes()` function now:
1. ✅ Extracts ALL error properties (including non-enumerable)
2. ✅ Logs user authentication status
3. ✅ Logs user ID and email for debugging
4. ✅ Runs a diagnostic query to isolate the issue
5. ✅ Provides comprehensive error information

## Still Having Issues?

If you're still seeing empty error objects after checking everything above:

1. **Check Supabase Dashboard → Logs** for server-side errors
2. **Check Network Tab** in browser DevTools for the actual API response
3. **Share the full console output** - the improved logging should show much more information now

The improved error handling should make it much easier to identify the root cause!

