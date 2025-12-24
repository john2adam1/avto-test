# Website Redesign - Complete Instructions

## Overview
The website has been completely redesigned to match your exact requirements:
- **One test per category** (test type)
- **Each test has ONE question** with image and 4 answers
- **Countdown timer** visible on main dashboard
- **Subscription system** with 1-day trial and purchase button when expired

## Database Schema Changes

### ⚠️ IMPORTANT: Run These SQL Scripts First

You MUST run these scripts in order in your Supabase SQL Editor:

1. **`scripts/012_redesign_schema.sql`** - Restructures database (drops old tables, creates new simplified structure)
2. **`scripts/013_update_rls_for_new_schema.sql`** - Updates RLS policies for new schema

**WARNING**: Running `012_redesign_schema.sql` will DELETE all existing test data. This is intentional for the redesign.

### New Database Structure

- **test_types** (categories) - unchanged
- **tests** - Now contains question data directly:
  - `question_text` - The question
  - `image_url` - Question image
  - `answer_0`, `answer_1`, `answer_2`, `answer_3` - The 4 answers
  - `correct_answer` - Which answer is correct (0-3)
  - **One test per category** (enforced by UNIQUE constraint on `test_type_id`)

- **user_test_attempts** - Simplified:
  - `selected_answer` - User's selected answer (0-3)
  - `is_correct` - Whether they got it right
  - `score` - 0 or 100 (pass/fail)
  - `passed` - Boolean

## What Changed

### ✅ Dashboard (`app/dashboard/page.tsx`)
- Shows **one test per category**
- Each category card has a single "Start Test" button
- Subscription countdown banner at top

### ✅ Test Interface (`components/test-interface.tsx`)
- **Completely rewritten** for single question
- Shows question text, image, and 4 answer buttons
- Countdown timer in header
- Submit button (no navigation between questions)

### ✅ Test Page (`app/test/[testId]/page.tsx`)
- Fetches test data with question embedded
- Passes all data to simplified test interface

### ✅ Results Page (`app/test/[testId]/results/[attemptId]/page.tsx`)
- Shows single question review
- Displays selected answer vs correct answer
- Shows pass/fail result

### ✅ Admin Panel
- **New form**: `components/admin/test-form-simple.tsx`
  - Create/edit test with question and 4 answers in one form
  - One test per category (category selection disabled when editing)
- **Updated pages**:
  - `app/admin/tests/page.tsx` - Lists tests by category
  - `app/admin/tests/create/page.tsx` - Uses new form
  - `app/admin/tests/[id]/edit/page.tsx` - Uses new form

### ✅ Subscription Banner (`components/subscription-banner.tsx`)
- Already correct - shows countdown when active
- Shows "Purchase Subscription" button when expired
- Links to Telegram admin

## Features

### 1. User Registration
- ✅ Email-based registration (already working)

### 2. Test Structure
- ✅ Categorized tests (test_types)
- ✅ **One test per category** (enforced)
- ✅ Each test: **One question** with image + 4 answers

### 3. Test Flow
- ✅ Countdown timer during test
- ✅ Statistics at end (score, time, pass/fail)

### 4. Subscription System
- ✅ 1-day free trial
- ✅ Countdown visible on dashboard
- ✅ "Purchase Subscription" message when expired
- ✅ Telegram contact button
- ✅ Admin grants 1-month subscription after payment

### 5. Admin Features
- ✅ Manage users
- ✅ Upload/edit tests (one per category)
- ✅ Grant subscriptions

## Setup Steps

1. **Backup your data** (if you have important test data)
2. **Run SQL scripts** in Supabase:
   - `scripts/012_redesign_schema.sql`
   - `scripts/013_update_rls_for_new_schema.sql`
3. **Create test categories** (test_types) in admin panel
4. **Create tests** - one per category with question and answers
5. **Set Telegram username** in admin settings
6. **Test the flow**:
   - Register new user
   - See countdown on dashboard
   - Take a test
   - View results

## Removed Features

- ❌ Multiple questions per test
- ❌ Multiple tests per category
- ❌ Question management pages (no longer needed)
- ❌ Navigation between questions (single question only)

## Files Created/Modified

### New Files:
- `scripts/012_redesign_schema.sql`
- `scripts/013_update_rls_for_new_schema.sql`
- `components/admin/test-form-simple.tsx`
- `REDESIGN_INSTRUCTIONS.md`

### Modified Files:
- `app/dashboard/page.tsx`
- `components/test-interface.tsx` (completely rewritten)
- `app/test/[testId]/page.tsx`
- `app/test/[testId]/results/[attemptId]/page.tsx`
- `app/dashboard/results/page.tsx`
- `app/admin/tests/page.tsx`
- `app/admin/tests/create/page.tsx`
- `app/admin/tests/[id]/edit/page.tsx`

### Files to Delete (no longer needed):
- `app/admin/tests/[id]/questions/` (entire directory)
- `components/admin/question-form.tsx`
- `components/admin/test-form.tsx` (replaced by test-form-simple.tsx)

## Testing Checklist

- [ ] Run SQL scripts successfully
- [ ] Create a test category
- [ ] Create a test for that category
- [ ] Try to create second test for same category (should fail or be prevented)
- [ ] Register new user
- [ ] See countdown on dashboard
- [ ] Start a test
- [ ] See question with image and 4 answers
- [ ] Select answer and submit
- [ ] View results
- [ ] Wait for trial to expire (or manually expire)
- [ ] See "Purchase Subscription" button
- [ ] Click Telegram button
- [ ] Admin grants subscription
- [ ] User can access tests again

## Notes

- The old question management system is completely removed
- Each test is now self-contained with its question and answers
- The database enforces one test per category
- All existing test data will be lost when running the schema script (by design)

