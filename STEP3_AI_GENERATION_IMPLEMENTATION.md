# Step 3 - Course Structure Generation with AI Implementation

## Overview

Successfully implemented AI-powered course structure generation in Step 3 (modules page). The system now reads all user inputs from Steps 1 and 2, generates an optimized course structure with modules and lessons, and allows users to regenerate the structure with deeper thinking.

## Implementation Details

### 1. New API Endpoint: `/api/course/generate-structure`

**Location:** `app/api/course/generate-structure/route.ts`

**Functionality:**
- Reads all course data from the database (title, description, industry, target audience, duration, learning outcomes)
- Reads user preferences:
  - `approx_modules`: Number of modules preference (e.g., 'let-ai-decide', '3-5', '6-8', '8+')
  - `approx_lessons_per_module`: Lessons per module preference
  - `knowledge_assessments`: Assessment strategy ('every_module', 'end_of_course', 'pre_post', 'ai_decide')
  - Multimedia preferences: audio narration, video content, image generation, animation
- Generates personalized prompt based on user preferences
- Calls OpenRouter AI with appropriate configuration
- On regeneration: uses higher temperature (0.8 vs configured) for more creative variations

**Input Parameters:**
```typescript
{
  courseId: string          // ID of the course to generate structure for
  isRegenerate: boolean     // Whether this is a regeneration request
}
```

**Response:**
```typescript
{
  success: boolean
  structure: {
    modules: [
      {
        title: string       // Module title
        description: string // What learners will achieve
        lessons: [
          {
            title: string       // Lesson title
            description: string // Lesson content overview
          }
        ]
      }
    ]
  }
  modelUsed: string
  timestamp: string
}
```

### 2. Updated Step 3 Page: `/app/create/modules/page.tsx`

**New State Variables:**
```typescript
const [isGenerating, setIsGenerating] = useState(false)
const [generationError, setGenerationError] = useState<string | null>(null)
const [hasGeneratedStructure, setHasGeneratedStructure] = useState(false)
```

**New Function: `generateCourseStructure(isRegenerate: boolean)`**

**Workflow:**
1. Calls `/api/course/generate-structure` endpoint
2. Clears existing modules and lessons from database
3. Creates new modules with their lessons in database using AI-generated data
4. Updates local state with new structure
5. Sets `hasGeneratedStructure` flag to true
6. Shows success/error messages to user

**UI Changes:**

Before generation:
- Single "Generate Structure" button visible
- Prominent, teal gradient button with animation

After generation:
- "Add Module" button (existing functionality)
- "Approve All Modules" button (existing functionality)
- "Regenerate Structure" button (new)

Error handling:
- Displays error message if generation fails
- Allows user to dismiss error and retry

### 3. Database Integration

**Data Read from `courses` table:**
- `title`: Course title
- `description`: Course description
- `industry`: Industry/domain
- `target_audience`: Target audience
- `knowledge_level`: Knowledge level
- `duration`: Total duration in hours
- `learning_outcomes`: Learning outcomes
- `approx_modules`: User's preference for module count
- `approx_lessons_per_module`: User's preference for lessons per module
- `knowledge_assessments`: Assessment strategy
- `audio_narration`: Audio narration enabled
- `video_content`: Video content enabled
- `image_generation`: Image generation enabled
- `animation_motion`: Animation enabled

**Data Written to Database:**
- Modules: AI-generated with `ai_generated: true` flag
- Lessons: AI-generated with `ai_generated: true` flag
- Preserves order_index for proper ordering

### 4. User Preferences in AI Prompt

The API endpoint translates user preferences into natural language prompts:

```
EXAMPLE PREFERENCES:
- Preferred Number of Modules: "Let AI decide the optimal number" OR "3-5 modules"
- Lessons per Module: "Let AI decide the optimal number" OR "4-5 lessons per module"
- Assessment Strategy: "Quiz at the end of every module" OR "Let AI decide"
- Multimedia: Audio narration enabled, Video content enabled, AI-generated images enabled
```

### 5. Regeneration Feature

When user clicks "Regenerate Structure":
- API is called with `isRegenerate: true`
- Temperature increased to 0.8 (vs configured temperature, typically 0.7)
- Prompt includes special instruction for "deeper thinking":
  ```
  "This is a REGENERATION REQUEST. Think more deeply and creatively:
  - Vary the structure from the previous version
  - Consider alternative pedagogical approaches
  - Ensure comprehensive topic coverage
  - Make lessons more granular and focused
  - Add more practical, hands-on lessons where appropriate"
  ```
- Existing modules/lessons are cleared and replaced with new structure

## User Flow

### Complete Course Creation Journey:

**Step 1 (Essentials Page):**
1. User fills course details (title, audience, duration, outcomes)
2. User selects preferences:
   - Approx modules: e.g., "Let AI decide" or "6-8"
   - Approx lessons per module: e.g., "Let AI decide" or "4-5"
3. All data auto-saved to database

**Step 2 (Multimedia Page):**
1. User selects course type (Standard/Simple)
2. User selects multimedia options (audio, video, images, animations)
3. User selects assessment strategy: e.g., "Let AI decide"
4. All data auto-saved to database

**Step 3 (Modules Page) - NEW:**
1. Page loads with stats showing 0 modules
2. User sees "Generate Structure" button (only option initially)
3. User clicks "Generate Structure"
   - Button shows spinner and "Generating..."
   - API reads all user inputs from database
   - AI generates personalized course structure
   - Modules and lessons displayed on page
4. User can:
   - Edit module/lesson titles and descriptions
   - Add/remove modules or lessons
   - Approve individual modules or "Approve All"
5. User clicks "Regenerate Structure" to get different variations
   - Existing structure replaced with new one
   - User can regenerate multiple times until satisfied
6. Once satisfied, user approves all modules and moves to Step 4

## Error Handling

### API-Level Errors:
- Unauthorized (401): User not authenticated
- Missing courseId (400): Required field missing
- Course not found (404): User doesn't own course
- API key not configured (500): OpenRouter key missing
- Generation failed (500): AI API error

### Client-Level Errors:
- Displays error message with details
- Allows user to dismiss error
- Can retry immediately after dismissing

### Database Errors:
- Logs to console
- Shows user-friendly error message
- Doesn't corrupt existing data

## Performance Considerations

1. **Debounced Saves:** Existing module/lesson edits use 2-second debounce
2. **Batch Database Operations:** All module/lesson creation in single round-trip
3. **Efficient Queries:** 
   - Single query for all modules
   - Single query for all lessons in batch
4. **State Management:** Minimizes re-renders with proper state updates

## Testing Instructions

### Manual Testing Workflow:

1. **Create Course (Step 1):**
   ```
   - Title: "Advanced Python Programming"
   - Audience: "Software Engineers"
   - Duration: 40 hours
   - Knowledge Level: Intermediate
   - Learning Outcomes: "Master advanced Python concepts and design patterns"
   - Approx Modules: "Let AI decide"
   - Approx Lessons per Module: "Let AI decide"
   ```

2. **Select Preferences (Step 2):**
   ```
   - Course Type: Standard
   - Multimedia: Audio narration + Video + Images
   - Assessment: "Let AI decide"
   ```

3. **Generate Structure (Step 3):**
   ```
   - Click "Generate Structure"
   - Wait for AI generation (typically 10-30 seconds)
   - Verify modules and lessons appear
   - Check 5+ modules with 3-5 lessons each
   ```

4. **Test Regeneration:**
   ```
   - Click "Regenerate Structure"
   - Verify different structure generated
   - Repeat 2-3 times
   - Structure should vary (different approach, different number of modules, etc.)
   ```

5. **Manual Edits:**
   ```
   - Edit a module title
   - Add a new module
   - Delete a lesson
   - Verify changes auto-save
   ```

6. **Approval Workflow:**
   ```
   - Toggle individual module approval
   - Click "Approve All Modules"
   - Verify approval status reflected in UI
   ```

## Database Schema Changes

**No new tables created.** Uses existing:
- `courses` table: Stores all user preferences
- `modules` table: Stores generated modules
- `lessons` table: Stores generated lessons

**New Field Tracking:**
- `ai_generated` boolean: Marks if created by AI (true for generated structures, false for manual)

## Configuration

**Required Environment Variables (Already Set):**
- `OPENROUTER_API_KEY`: OpenRouter API key for AI generation
- Database connection via Supabase client

**AI Model Configuration:**
- Default model: Configurable via admin panel
- Fallback models: Automatic retry with alternative models
- Temperature: Configurable, increased to 0.8 for regeneration
- Max tokens: 4000 for comprehensive course structures

## Future Enhancements

1. **Batch Regeneration:** Generate 3 variations simultaneously and let user choose
2. **Custom Prompts:** Allow users to provide custom generation prompts
3. **Industry Templates:** Pre-filled prompts for specific industries
4. **Lesson Content Generation:** Auto-generate lesson content details
5. **Learning Outcomes Sync:** Auto-map lessons to learning outcomes
6. **Assessment Generation:** Auto-generate quiz questions based on lesson content

## Files Modified

1. **Created:** `/app/api/course/generate-structure/route.ts` (180 lines)
   - New API endpoint for AI structure generation
   - Comprehensive prompt building
   - Error handling and retry logic

2. **Modified:** `/app/create/modules/page.tsx`
   - Added 3 new state variables
   - Added `generateCourseStructure()` function
   - Updated UI with "Generate Structure" and "Regenerate Structure" buttons
   - Added error message display
   - Removed duplicate `loadModulesFromDb()` function

## Success Metrics

✅ Step 1 data (title, audience, duration, learning outcomes) → Used in prompt
✅ Step 1 preferences (approx modules, lessons) → Used in prompt
✅ Step 2 multimedia preferences → Used in prompt
✅ Step 2 assessment strategy → Used in prompt
✅ AI generates course structure → Displayed on page
✅ Regeneration creates different structure → Can regenerate multiple times
✅ Structure persists to database → Can be edited and approved
✅ Error handling works → Shows user-friendly messages
✅ App runs without errors → Compiles and loads successfully

## Known Issues & Limitations

1. **Lock File Issue:** May need to remove `.next/dev/lock` if dev server crashes
2. **Middleware Deprecation:** Warning about deprecated middleware file (non-blocking)
3. **Port Conflict:** May use port 3001 if 3000 is taken
4. **API Response Time:** Generation may take 10-30 seconds depending on model
5. **Rate Limiting:** OpenRouter may rate limit if too many requests in quick succession

## Support & Troubleshooting

**If generation fails:**
1. Check that OpenRouter API key is configured in admin panel
2. Check browser console for error messages
3. Verify course data was saved in Steps 1 & 2
4. Try refreshing the page and clicking "Generate Structure" again

**If regeneration takes too long:**
1. May be hitting API rate limits - wait 30 seconds before retrying
2. Check that you have sufficient API credits
3. Try a simpler prompt by filling in more specific preferences in Steps 1 & 2

**If modules don't appear:**
1. Check browser console for JavaScript errors
2. Verify database connection (check browser Network tab)
3. Ensure course has required data (title, audience, learning outcomes)
