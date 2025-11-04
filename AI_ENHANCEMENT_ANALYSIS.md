# AI Enhancement Feature - Analysis & Implementation Plan

**Date:** November 3, 2025  
**Status:** Analysis Phase  
**Objective:** Enable AI-powered enhancement of individual modules and lessons in Step 3

---

## 🔍 Current State Analysis

### Existing Implementation
- ✅ Buttons exist: "AI Enhance" for modules and lessons
- ✅ Handler functions exist but are stubs: `handleEnhanceWithAI()` and `handleLessonAIEnhance()`
- ✅ Currently show alert boxes only (no actual AI enhancement)
- ✅ AI integration already exists for course structure generation

### Code Locations
- **Modules Page:** `app/create/modules/page.tsx`
  - Module AI button: Line 1013
  - Lesson AI button: Line 956
  - Handlers: Lines 611-620 (stubs only)
  
- **AI API:** `app/api/course/generate-structure/route.ts`
  - Uses OpenRouter with Claude 3.5 Sonnet
  - Has fallback models and retry logic
  - Error recovery implemented
  - Temperature: 0.7 (default) or 0.8 (for regeneration)

### Data Available
✅ Course data in database:
- `title` - Course name
- `description` - Course overview
- `industry` - Industry/domain
- `target_audience` - Who course is for
- `knowledge_level` - Baseline knowledge required
- `learning_outcomes` - Goals students should achieve
- `duration` - Total course hours
- `methodology` - Teaching approach
- All multimedia preferences (audio, video, images, animation)

✅ Module data:
- Module ID, title, description
- Order and approval status
- All lessons within module

✅ Lesson data:
- Lesson ID, title, description
- Order within module
- Duration

---

## 🎯 Enhancement Scenarios

### Module Enhancement
**Current:** Module has basic title/description  
**Goal:** AI improves description to be more engaging, detailed, learning-focused

**Input:**
- Current module title and description
- Other modules in course (for context)
- All lessons in this module
- Course metadata and user preferences

**Output:**
- Enhanced module description (more compelling, clearer objectives)
- Description should include: what learners will achieve, key concepts, relevance

### Lesson Enhancement
**Current:** Lesson has title and description  
**Goal:** AI improves title and description to be more specific, engaging, clear

**Input:**
- Current lesson title and description
- Module it belongs to
- Other lessons in same module (for progression)
- Course metadata and user preferences

**Output:**
- Enhanced lesson title (more specific, descriptive)
- Enhanced lesson description (clearer learning objectives, specific topics)

---

## 📋 Implementation Plan

### Phase 1: API Endpoint
**Goal:** Create new API endpoint for AI enhancement (specific to module/lesson)

**Endpoint:** `POST /api/course/enhance-content`

**Request Body:**
```json
{
  "courseId": "string",
  "type": "module" | "lesson",
  "moduleId": "string",
  "lessonIndex": "number (if lesson)",
  "currentTitle": "string",
  "currentDescription": "string"
}
```

**Response:**
```json
{
  "success": true,
  "type": "module" | "lesson",
  "enhancement": {
    "title": "string (only for lessons)",
    "description": "string"
  },
  "modelUsed": "string"
}
```

### Phase 2: Frontend Handlers
**Goal:** Implement handlers in modules/page.tsx

**`handleEnhanceWithAI(moduleId)`:**
1. Find module by ID
2. Show loading state (disable button, show spinner)
3. Call `/api/course/enhance-content` with module data
4. If successful: update module description, show "Enhanced!" toast, save
5. If error: show error toast, keep original description

**`handleLessonAIEnhance(moduleId, lessonIdx)`:**
1. Find module and lesson
2. Show loading state
3. Call `/api/course/enhance-content` with lesson data
4. If successful: update lesson title and description, show toast, save
5. If error: show error toast, keep original content

### Phase 3: Loading & Feedback
**Goal:** User sees clear feedback during enhancement

- Show loading spinner on button
- Disable button during processing
- Toast notification: "Enhancing..." → "Enhanced!" or "Enhancement failed"
- Display which model was used (optional)

### Phase 4: Database Integration
**Goal:** Enhancements saved to database

- After AI enhancement, call `saveModulesAndLessons()`
- All data persists correctly
- Relationships maintained

---

## 🔌 AI Prompts Strategy

### Module Enhancement Prompt
```
You are an expert instructional designer. Enhance this course module based on the course context and other modules.

**Course Information:**
- Title: {course.title}
- Industry: {course.industry}
- Target Audience: {course.target_audience}
- Knowledge Level: {course.knowledge_level}
- Learning Outcomes: {course.learning_outcomes}

**Course Structure Context:**
- Module Position: {position} of {totalModules}
- Other Modules: [list of other module titles]
- Lessons in this Module: [list of lesson titles]

**Current Module:**
- Title: {module.title}
- Description: {module.description}

**Task:** Enhance the module description to be:
1. More engaging and compelling
2. Clearer about learning outcomes
3. Better positioned in the course progression
4. Aligned with course goals
5. Appropriate for the target audience

Provide ONLY the enhanced description (2-3 sentences, no JSON, no formatting).
```

### Lesson Enhancement Prompt
```
You are an expert course designer. Enhance this lesson based on course and module context.

**Course Information:**
- Title: {course.title}
- Industry: {course.industry}
- Knowledge Level: {course.knowledge_level}

**Module Context:**
- Module Title: {module.title}
- Module Position: {modulePosition} of {totalModules}
- Lessons in Module: {lessonCount}
- Lesson Position: {lessonPosition} of {lessonCount}

**Current Lesson:**
- Title: {lesson.title}
- Description: {lesson.description}

**Surrounding Lessons:**
- Previous: {previousLesson?.title || 'N/A'}
- Next: {nextLesson?.title || 'N/A'}

**Task:** Enhance the lesson to be:
1. More specific and clear about learning objectives
2. Better titles for search and navigation
3. Properly sequenced with adjacent lessons
4. Aligned with module progression
5. Engaging for the target audience

Respond with JSON in format:
{
  "title": "enhanced lesson title (10-15 words)",
  "description": "enhanced lesson description (2-3 sentences)"
}
```

---

## 🏗️ Architecture

### Frontend Flow
```
User clicks AI button
    ↓
Handler triggered (handleEnhanceWithAI or handleLessonAIEnhance)
    ↓
Show loading state
    ↓
Call /api/course/enhance-content
    ↓
Receive enhanced content
    ↓
Update local state (modules array)
    ↓
Call saveModulesAndLessons()
    ↓
Show success toast
    ↓
Hide loading state
```

### Backend Flow
```
POST /api/course/enhance-content
    ↓
Validate user & course
    ↓
Fetch full course data
    ↓
Build AI prompt with context
    ↓
Call OpenRouter API
    ↓
Parse response
    ↓
Return enhanced content
```

---

## 🛠️ Implementation Steps

1. Create `/api/course/enhance-content/route.ts`
   - Validate request
   - Build enhancement prompt
   - Call OpenRouter
   - Return result

2. Update `app/create/modules/page.tsx`
   - Import necessary components (Toast, Loading)
   - Implement `handleEnhanceWithAI()` fully
   - Implement `handleLessonAIEnhance()` fully
   - Add loading state management
   - Add error handling

3. Add Toast notifications
   - Show "Enhancing..." during process
   - Show "Enhanced!" on success
   - Show error message on failure

4. Test thoroughly
   - Module enhancement works
   - Lesson enhancement works
   - Data saves correctly
   - Error handling works
   - UI feedback is clear

5. Documentation
   - Document feature
   - Document prompts
   - Create user guide

---

## 📊 Data Flow Example

### Module Enhancement Flow
```
Current State:
{
  modules: [
    {
      id: "abc123",
      title: "Getting Started",
      description: "Learn basics",
      lessons: [...]
    }
  ]
}
    ↓ User clicks AI button
    ↓ API calls Claude
Claude returns: "An introduction to the fundamentals you need..."
    ↓
New State:
{
  modules: [
    {
      id: "abc123",
      title: "Getting Started",
      description: "An introduction to the fundamentals you need...",
      lessons: [...]
    }
  ]
}
    ↓
saveModulesAndLessons() → Database updated
```

---

## ✅ Success Criteria

- ✅ AI enhancement button works for modules
- ✅ AI enhancement button works for lessons
- ✅ Enhanced content is meaningful and relevant
- ✅ Changes save to database
- ✅ Loading states clear and informative
- ✅ Error handling graceful
- ✅ No broken functionality
- ✅ Proper error recovery and retry

---

## 🚀 Ready for Implementation

This analysis provides:
- Clear understanding of current state
- Specific enhancement prompts
- API design
- Frontend implementation strategy
- Data flow visualization
- Success criteria

**Next Steps:**
1. Create enhance-content API endpoint
2. Implement frontend handlers
3. Add loading/feedback states
4. Test and verify
5. Document feature
