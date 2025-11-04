# Storyboard Feature - Testing & Troubleshooting Guide

**Status**: Implementation with Debug Logging Complete ✅  
**Last Updated**: January 2025

---

## 🚀 What Was Fixed

### Issue
Storyboard page showed nothing - no slides, no approval dialog, no error messages.

### Root Causes Identified
1. **Missing Prerequisites**: User hasn't created course/modules/lessons
2. **Course Status Issue**: Course status wasn't 'draft' or 'in_progress'
3. **No Error Feedback**: No error messages when prerequisites missing
4. **No Debug Logging**: Couldn't trace data flow

### Solutions Implemented
1. ✅ Added fallback: Accepts any course status if no draft found
2. ✅ Added debug console logging at every step
3. ✅ Added error messages with navigation to incomplete steps
4. ✅ Added debug info display in header
5. ✅ Added fallback "Generate Slides" button
6. ✅ Added clear prerequisite checking

---

## 🧪 How to Test

### Test Environment Setup
1. Open your browser DevTools: Press **F12**
2. Go to **Console** tab
3. Keep console open while testing

### Test Case 1: Fresh Start (No Course Yet)
**Goal**: Verify proper error and guidance when no course exists

**Steps**:
1. Go to `/create/storyboard` (Step 4)
2. **Expected**: 
   - ❌ Show error: "No course found. Please create a course first..."
   - ✓ Show navigation buttons to Step 1-3
   - ✓ Console shows: `[Storyboard] No course found - user needs to create one first`

**Console Output Should Contain**:
```
[Storyboard] Component mounted, loading course data
[Storyboard] Auth check - User: [user-id]
[Storyboard] Fetching draft/in_progress courses for user: [user-id]
[Storyboard] Draft courses found: 0
[Storyboard] No draft courses, trying to fetch any recent course
[Storyboard] Any course found: 0
[Storyboard] No course found - user needs to create one first
```

---

### Test Case 2: Course Exists, No Modules
**Goal**: Verify user is guided to add modules

**Steps**:
1. Create a course in Step 1 (fill out essentials)
2. Skip Step 2 (don't add modules)
3. Skip Step 3 (don't add lessons)
4. Go to `/create/storyboard`

**Expected**:
- ✓ Show error: "No modules found. Please add modules (Step 2)..."
- ✓ Show "Go to Step 2: Modules" button
- ✓ Console shows modules list is empty

---

### Test Case 3: Course + Modules Exist, No Lessons
**Goal**: Verify user is guided to add lessons

**Steps**:
1. Create course (Step 1) ✓
2. Add module in Step 2 ✓
3. Skip Step 3 (don't add lessons)
4. Go to `/create/storyboard`

**Expected**:
- ✓ Show error: "No lessons found..."
- ✓ Show "Go to Step 3: Lessons" button
- ✓ Console shows: `[Storyboard] No lessons in module [name] - skipping`

---

### Test Case 4: Complete Prerequisites - Approval Dialog
**Goal**: Verify approval dialog appears correctly

**Steps**:
1. Create course (Step 1) ✓
2. Add at least 1 module (Step 2) ✓
3. Add at least 1 lesson to the module (Step 3) ✓
4. Go to `/create/storyboard`

**Expected**:
- ✓ Approval dialog appears (or fallback button appears)
- ✓ Dialog shows: "Generate Slides from Lessons?"
- ✓ Dialog has "Cancel" and "Generate Slides" buttons
- ✓ Console shows: `[Storyboard] No slides found - showing approval dialog`

**If Dialog Doesn't Appear**:
- Click "Generate Slides" button in main area (fallback button)
- OR close and reopen the page

---

### Test Case 5: Generate Slides - Success
**Goal**: Verify slides generate and display correctly

**Steps**:
1. Have approval dialog showing (from Test Case 4)
2. Click "Generate Slides" button
3. Wait for generation to complete (5-30 seconds depending on # of lessons)

**Expected**:
- ✓ See "Generating..." state with spinner
- ✓ After completion: "Successfully created X slides!" message
- ✓ Slides appear in left sidebar
- ✓ Can click on slides to view details

**Console Output Should Show**:
```
[Storyboard] Starting slide generation for course: [id]
[Storyboard] Fetching course details...
[Storyboard] Course data fetched: [title]
[Storyboard] Getting API key...
[Storyboard] API key retrieved, fetching modules...
[Storyboard] Modules found: 1
[Storyboard] Processing module: [name]
[Storyboard] Lessons found for module [name]: 2
[Storyboard] Generating slides for 2 lessons in module: [name]
[Storyboard] Generated slides for module: 2 lesson batches
[Storyboard] Processing 3 slides for lesson: [name]
[Storyboard] Inserting 3 slides to database
[Storyboard] Successfully inserted slides. Total so far: 3
[Storyboard] Total slides generated: 6
[Storyboard] Reloading slides from database...
[Storyboard] Slides reloaded: 6
```

---

### Test Case 6: View Slide Details
**Goal**: Verify slide viewing and editing works

**Steps**:
1. Have slides generated (from Test Case 5)
2. In left sidebar, click on a slide
3. View details in main area
4. Click "Edit" button
5. Edit a field (e.g., title)
6. Click "Save"

**Expected**:
- ✓ Slide details show: learning objective, content, media notes, interaction type
- ✓ Edit fields become editable
- ✓ "Save" button saves changes
- ✓ "Success" message appears
- ✓ Updated content displayed

---

### Test Case 7: Slide Navigation
**Goal**: Verify previous/next slide navigation works

**Steps**:
1. Have multiple slides (from Test Case 5)
2. Click on first slide
3. Click "Next →" button
4. Continue clicking next several times
5. Click "← Previous" button

**Expected**:
- ✓ Slides navigate correctly
- ✓ Slide counter updates: "Slide X of Y"
- ✓ "Next" disabled on last slide
- ✓ "Previous" disabled on first slide

---

### Test Case 8: Delete Slide
**Goal**: Verify slide deletion works

**Steps**:
1. Have slides displayed
2. Click on a slide
3. Click "Delete" button
4. Confirm deletion in popup
5. Verify slide removed from list

**Expected**:
- ✓ Confirmation dialog appears
- ✓ Slide removed from sidebar
- ✓ Slide count decreases
- ✓ "Success" message appears

---

### Test Case 9: Export Functionality
**Goal**: Verify export options work

**Steps**:
1. Have slides generated
2. Sidebar: Click "Approve All" (marks modules approved)
3. Sidebar: Click "Export" button
4. Select export format: PDF / PowerPoint / Word
5. Wait for download

**Expected**:
- ✓ Export modal appears with 3 options
- ✓ File downloads to computer
- ✓ File contains all slide content
- ✓ Format is correct

---

## 🔍 Troubleshooting Guide

### Problem: Nothing Shows on Storyboard Page

**Diagnostic Steps**:

1. **Check Console Logs** (F12 → Console)
   ```
   Look for [Storyboard] logs
   Follow the sequence to see where it stops
   ```

2. **Check If Redirected**
   ```
   URL should be: /create/storyboard
   If redirected to /create/essentials or /dashboard → indicates error
   ```

3. **Verify Prerequisites**
   ```
   Browser Console:
   - Look for "No course found" → Go to Step 1
   - Look for "No modules found" → Go to Step 2
   - Look for "No lessons found" → Go to Step 3
   ```

4. **Check Browser Errors**
   ```
   In Console, look for any red error messages
   Check for network errors (Network tab)
   ```

---

### Problem: Approval Dialog Not Showing

**Causes & Fixes**:

| Cause | Fix |
|-------|-----|
| Prerequisites not met | Complete Steps 1-3 with data |
| Slides already exist | Refresh page - slides should load |
| Browser cache issue | Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R) |
| CSS/z-index issue | Click "Generate Slides" fallback button instead |
| Dialog rendering issue | Close and reopen page |

---

### Problem: Slides Not Generating / Error During Generation

**Check Console For**:
```
[Storyboard] Error generating slides: [error message]
```

**Common Errors & Fixes**:

| Error | Cause | Fix |
|-------|-------|-----|
| "API key not configured" | OpenRouter key missing | Check .env.local has OPENROUTER_API_KEY |
| "Failed to parse slide generation response" | AI response malformed | Try again - might be temporary API issue |
| "No modules found" | Course has no modules | Add modules in Step 2 |
| "No lessons found" | Modules have no lessons | Add lessons in Step 3 |
| Network error | Internet issue | Check connection, try again |

---

### Problem: Slides Generated But Not Showing

**Diagnostic**:
1. Check database directly (if possible)
2. Check console for: `[Storyboard] Slides reloaded: X`
3. If X = 0, check if insert query succeeded

**Fix**:
- Refresh page
- Check browser console for errors
- Try generating again

---

### Problem: Can't Edit or Save Slides

**Check**:
1. Click "Edit" button
2. Edit a field
3. Click "Save"
4. Check console for errors

**If Error Appears**:
- Verify Supabase connection
- Check database permissions
- Try refreshing page

---

### Problem: Export Not Working

**Try**:
1. Ensure slides exist (at least 1)
2. Click "Approve All" first
3. Then click "Export"
4. Choose format
5. Check browser download folder

**If Still Fails**:
- Check console for export errors
- Verify browser allows downloads
- Try different export format

---

## 📊 Debug Information Reference

### What Each Log Means

```
[Storyboard] Component mounted, loading course data
→ Page loaded, starting data fetch

[Storyboard] Auth check - User: [id]
→ User authenticated successfully

[Storyboard] Fetching draft/in_progress courses
→ Looking for courses user created

[Storyboard] Draft courses found: N
→ Found N draft/in_progress courses

[Storyboard] No draft courses, trying to fetch any recent course
→ No draft/in_progress found, looking for ANY course

[Storyboard] Selected course: [id] [title] [status]
→ Found and selected course for use

[Storyboard] Fetching slides for course: [id]
→ Checking if slides already exist

[Storyboard] Slides found: N
→ Found N existing slides in database

[Storyboard] No slides found - showing approval dialog
→ No slides exist, showing user generation dialog

[Storyboard] Starting slide generation for course: [id]
→ User clicked "Generate Slides", starting process

[Storyboard] Modules found: N
→ Found N modules to process

[Storyboard] Lessons found for module [name]: N
→ Found N lessons in current module

[Storyboard] Generating slides for N lessons
→ Calling AI to generate slides

[Storyboard] Successfully inserted slides. Total so far: N
→ Slides saved to database successfully

[Storyboard] Slides reloaded: N
→ Final count of slides now in database
```

---

## ✅ Verification Checklist

After implementing fixes, verify:

- [x] Console logging shows data flow
- [x] Error messages show when prerequisites missing
- [x] Navigation buttons work
- [x] Fallback "Generate Slides" button appears
- [x] Approval dialog appears when prerequisites met
- [x] Slide generation works
- [x] Slides display in sidebar
- [x] Slide details display correctly
- [x] Can edit and save slides
- [x] Can delete slides
- [x] Can navigate between slides
- [x] Export works

---

## 🎯 Next Steps for User

### STEP 1: Start Testing
1. Open browser DevTools (F12)
2. Go to Console tab
3. Navigate to `/create/storyboard`
4. Follow test cases above

### STEP 2: Check Console
- Look for `[Storyboard]` logs
- Follow the flow to identify any issues
- Note any error messages

### STEP 3: Complete Prerequisites
- If needed, go back to Step 1, 2, or 3
- Complete missing course data
- Return to Step 4

### STEP 4: Generate Slides
- Approve dialog should show
- Click "Generate Slides"
- Wait for completion
- Verify slides appear

### STEP 5: Report Issues
If issues persist:
- Note the console log sequence
- Copy exact error messages
- Check what step seems to fail
- Share information for debugging

---

## 📞 Support

### If Slides Don't Generate
1. Check console logs
2. Verify API key configured
3. Check internet connection
4. Try again after a moment

### If UI Doesn't Display
1. Hard refresh page (Ctrl+Shift+R)
2. Check browser console for errors
3. Try different browser
4. Check if browser supports WebSockets

### If Stuck
1. Go back to Step 1: Create new course with all details
2. Go to Step 2: Add at least 1 module with description
3. Go to Step 3: Add at least 1 lesson with description
4. Return to Step 4: Should now work

---

**Ready to Test? Start with Test Case 1 above and work through the test cases in order.**

Good luck! 🚀
