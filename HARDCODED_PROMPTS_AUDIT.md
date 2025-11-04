# 🔍 HARDCODED AI PROMPTS AUDIT

**Date:** November 4, 2025  
**Purpose:** Complete inventory of all AI prompts and OpenRouter API calls  
**Status:** ✅ Comprehensive Audit Complete

---

## 📊 QUICK SUMMARY

| Location | Type | Purpose | Model | Configurable |
|----------|------|---------|-------|--------------|
| `lib/utils/slideGenerator.ts` | Prompt | Generate slides from lessons | openai/gpt-4o-mini | ❌ Hardcoded |
| `lib/ai/streaming.ts` | Prompts (5) | Course structure, lessons, quizzes, etc | configurable | ✅ Via function params |
| `app/api/course/generate-structure/route.ts` | Prompt | Generate course modules/lessons | Config-based | ✅ Via admin config |
| `app/api/course/enhance-outcomes/route.ts` | Prompt | Enhance learning objectives | Config-based | ✅ Via admin config |
| `app/api/course/enhance-content/route.ts` | Prompt | Enhance lesson content | Config-based | ✅ Via admin config |

---

## 🎯 HARDCODED PROMPT #1: Slide Generation

**File:** `lib/utils/slideGenerator.ts`  
**Lines:** 81-215  
**Model:** `openai/gpt-4o-mini` (hardcoded on line 173)  
**Temperature:** 0.8  
**Max Tokens:** 2500  
**Status:** ❌ NOT CONFIGURABLE

### The Exact Prompt:

```
You are an expert instructional designer and e-learning specialist creating professional, pedagogically sound presentation slides.

COURSE CONTEXT:
${contextInfo}

Your task: Generate exactly 3 engaging, educational presentation slides for this lesson that align with e-learning best practices.

Return ONLY a valid JSON array (no markdown, no extra text) with this exact structure:
[
  {
    "slideNumber": 1,
    "title": "String (5-8 words, compelling title)",
    "type": "intro",
    "content": "Bullet point\nBullet point\nBullet point",
    "speakerNotes": "2-3 sentences of presenter talking points",
    "mediaNote": "Specific media/graphic recommendation (e.g., 'Infographic showing...', 'Video of...')",
    "learningObjective": "Specific SMART learning objective for this slide",
    "interactionType": "interactive|quiz|video|image|discussion|reflection"
  },
  {
    "slideNumber": 2,
    "title": "String",
    "type": "content",
    "content": "Bullet point\nBullet point\nBullet point\nBullet point",
    "speakerNotes": "2-3 sentences",
    "mediaNote": "Media recommendation",
    "learningObjective": "SMART objective",
    "interactionType": "interactive|quiz|video|image|discussion|reflection"
  },
  {
    "slideNumber": 3,
    "title": "String",
    "type": "conclusion",
    "content": "Key takeaway 1\nKey takeaway 2\nKey takeaway 3",
    "speakerNotes": "2-3 sentences summarizing and connecting to next steps",
    "mediaNote": "Summary visual or checkpoint",
    "learningObjective": "Reinforce core learning outcomes",
    "interactionType": "reflection|quiz|discussion"
  }
]

DETAILED REQUIREMENTS:

1. SLIDE 1 (Introduction):
   - Type: "intro"
   - Hook the audience with relevance to ${targetAudience}
   - Clearly state what learners will gain
   - Title should be engaging and specific
   - Interaction: "interactive" or "video"

2. SLIDE 2 (Main Content):
   - Type: "content"
   - Include 4 key bullet points with depth
   - Use specific examples relevant to the course difficulty level (${courseDifficulty})
   - Start with foundations, build to complexity
   - Interaction: "quiz", "interactive", or "discussion"

3. SLIDE 3 (Conclusion):
   - Type: "conclusion"
   - Summarize 3 key takeaways
   - Connect to ${courseTitle} and learner goals
   - Include call-to-action for reflection
   - Interaction: "reflection", "quiz", or "discussion"

QUALITY STANDARDS:
- Content must be accurate and aligned with ${courseDifficulty} level
- Language: accessible but professional
- Tone: engaging and supportive
- Each objective uses SMART criteria (Specific, Measurable, Achievable, Relevant, Time-bound)
- Media notes provide concrete, actionable guidance
- Speaker notes are conversational and informative
- Interaction types vary to maintain engagement
- Bullet points are concise (8-15 words each)

Return valid JSON only. No markdown. No explanations.
```

### API Call Details:

```typescript
// Line 173: Model is hardcoded
model: 'openai/gpt-4o-mini',

// Lines 172-189: Full request
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'HTTP-Referer': 'https://personal-academy.com',
    'X-Title': 'Personal Academy',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'openai/gpt-4o-mini',        // ← HARDCODED
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.8,                   // ← HARDCODED
    max_tokens: 2500,                   // ← HARDCODED
  }),
});
```

### Context Variables Used:

```typescript
// These are DYNAMIC (come from course/lesson data):
- courseTitle: From input parameter
- courseDescription: From input parameter
- courseDifficulty: From course.knowledge_level
- courseLanguage: From input parameter (defaults to 'English')
- targetAudience: From course.target_audience
- moduleTitle: From input parameter
- moduleDescription: From input parameter
- lessonTitle: From input parameter
- lessonDescription: From input parameter
```

### Pedagogical Standards Mentioned:

The prompt explicitly requires:
- ✅ SMART learning objectives (Specific, Measurable, Achievable, Relevant, Time-bound)
- ✅ Varied interaction types (interactive, quiz, video, image, discussion, reflection)
- ✅ 3-slide structure (intro, content, conclusion)
- ✅ Difficulty-aligned content
- ✅ Media recommendations for each slide
- ✅ Speaker notes for presenters
- ✅ Accessible but professional language
- ✅ Concise bullet points (8-15 words each)

---

## 🎯 HARDCODED PROMPTS #2-6: Generic Content Generation

**File:** `lib/ai/streaming.ts`  
**Lines:** 301-320  
**Status:** ✅ PARTIALLY CONFIGURABLE (5 built-in types + dynamic context)

### The Prompts:

```typescript
function generatePrompt(
  generationType: string,
  topic: string,
  context?: Record<string, string | number | boolean>
): string {
  const baseContext = context ? `\n\nContext: ${JSON.stringify(context)}` : ''

  const prompts: Record<string, string> = {
    // PROMPT 1: Course Structure
    course_structure: `Create a comprehensive course structure for: "${topic}". Include modules, lessons, and learning objectives. Format as JSON.${baseContext}`,

    // PROMPT 2: Lesson Content
    lesson_content: `Write detailed lesson content for: "${topic}". Include explanations, examples, and key takeaways.${baseContext}`,

    // PROMPT 3: Quiz Questions
    quiz_questions: `Generate 10 quiz questions for: "${topic}". Include multiple choice, short answer, and true/false. Format as JSON.${baseContext}`,

    // PROMPT 4: Assessment
    assessment: `Create an assessment for: "${topic}". Include grading rubric and project requirements. Format as JSON.${baseContext}`,

    // PROMPT 5: Full Course
    full_course: `Create a complete course for: "${topic}". Include structure, lessons, quizzes, and assessment. Format as JSON.${baseContext}`,
  }

  return prompts[generationType] || prompts.course_structure
}
```

### Usage:

```typescript
// These are very minimal/generic - meant to be overridden by admin templates
// Called from: lib/ai/streaming.ts
// Can be customized via: Admin panel → Templates
```

---

## 🎯 HARDCODED PROMPTS #3: Course Structure Generation

**File:** `app/api/course/generate-structure/route.ts`  
**Lines:** 121-160  
**Status:** ✅ HIGHLY CONFIGURABLE

### The Prompt (Fallback when no admin template exists):

```typescript
function buildCoursGenerationPrompt(
  course: any,
  config: any,
  isRegenerate: boolean
): string {
  const userPreferences = buildUserPreferencesText(course)
  
  const basePrompt = `${config.systemPromptText}

You are an expert course designer. Generate a comprehensive course structure based on:

**Course Details:**
- Title: ${course.title}
- Description: ${course.description || 'Not provided'}
- Industry: ${course.industry || 'General'}
- Target Audience: ${course.target_audience || 'General professionals'}
- Knowledge Level: ${course.knowledge_level || 'Intermediate'}
- Duration: ${course.duration || 'Flexible'} hours
- Learning Outcomes: ${course.learning_outcomes || 'To be determined'}

${userPreferences}

${config.courseStructurePrompt || ''}

Generate a detailed, well-structured course with:
1. Clear module progression
2. Descriptive module titles and descriptions
3. Appropriate number of lessons per module
4. Realistic time estimates
5. Clear learning objectives

Respond ONLY with valid JSON (no markdown, no explanation) in this exact format:
{
  "modules": [
    {
      "title": "string (compelling module title)",
      "description": "string (2-3 sentences describing what learners will achieve)",
      "lessons": [
        {
          "title": "string (specific lesson title)",
          "description": "string (what will be covered in this lesson)"
        }
      ]
    }
  ]
}`

  // For regeneration requests, adds extra guidance
  if (isRegenerate) {
    return `${basePrompt}

IMPORTANT: This is a REGENERATION REQUEST. Think more deeply and creatively:
- Vary the structure from the previous version
- Consider alternative pedagogical approaches
- Ensure comprehensive topic coverage
- Make lessons more granular and focused
- Add more practical, hands-on lessons where appropriate`
  }

  return basePrompt
}
```

### Configuration Integration:

```typescript
// Lines 64-81: Uses admin config for customization
const { result, modelUsed } = await withFallbackModels(
  config.openrouterModel,           // ← From admin config
  async (model) => {
    return await withRetry(
      async () => {
        const response = await callOpenRouter(
          config.openrouterApiKey as string,
          {
            model,
            messages: [
              { role: 'system', content: (tpl?.system_preamble || config.systemPromptText) },  // ← CONFIGURABLE
              { role: 'user', content: prompt },
            ],
            temperature: typeof tpl?.temperature === 'number' ? tpl!.temperature! : (isRegenerate ? 0.8 : config.temperature),  // ← CONFIGURABLE
            maxTokens: typeof tpl?.max_tokens === 'number' ? tpl!.max_tokens! : 4000,  // ← CONFIGURABLE
          },
          []
        )
        // ...
      },
      'generateCourseStructure'
    )
  },
  'generateCourseStructure'
)
```

### User Preferences That Influence Prompt:

```typescript
// Dynamically added to prompt based on user selections:
1. approx_modules: 'let-ai-decide' | '3-5' | '6-8' | '8+'
2. approx_lessons_per_module: 'let-ai-decide' | '2-3' | '4-5' | '6-7'
3. knowledge_assessments: 'every_module' | 'end_of_course' | 'pre_post' | 'ai_decide'
4. audio_narration: boolean
5. video_content: boolean
6. image_generation: boolean
7. animation_motion: boolean

// Maps to readable text in prompt:
**User Preferences:**
- Preferred Number of Modules: Let AI decide the optimal number
- Lessons per Module: 2-3 lessons per module
- Assessment Strategy: Quiz at the end of every module
- Multimedia: Audio narration enabled
- Multimedia: Video content enabled
```

---

## 🎯 HARDCODED PROMPTS #4: Learning Outcomes Enhancement

**File:** `app/api/course/enhance-outcomes/route.ts`  
**Status:** ✅ HIGHLY CONFIGURABLE

### Default Prompt (from admin config):

The prompt is built dynamically based on:
- Admin-configured `systemPromptText`
- Admin-configured `learningOutcomesPrompt`
- Course title, description, knowledge level
- Current learning outcomes (if editing)
- Target audience

---

## 🎯 HARDCODED PROMPTS #5: Content Enhancement

**File:** `app/api/course/enhance-content/route.ts`  
**Status:** ✅ HIGHLY CONFIGURABLE

### Default Prompt (from admin config):

The prompt is built dynamically based on:
- Admin-configured `systemPromptText`
- Admin-configured `contentEnhancementPrompt`
- Lesson content
- Course context
- Difficulty level

---

## 📡 OPENROUTER API INTEGRATION POINTS

### 1. **Core OpenRouter Integration**
**File:** `lib/ai/openrouter.ts` (391 lines)

#### Function 1: `callOpenRouter()`
```typescript
export async function callOpenRouter(
  apiKey: string,
  options: OpenRouterOptions,
  fallbackModels: string[] = []
): Promise<OpenRouterResponse>
```

**Features:**
- ✅ Fallback model support (automatic retry with alternative models)
- ✅ Model-specific error handling
- ✅ Automatic retry logic
- ✅ HTTP headers: Authorization, HTTP-Referer, X-Title

**Endpoint:** `https://openrouter.ai/api/v1/chat/completions`

**Request Structure:**
```json
{
  "model": "openai/gpt-4o-mini",
  "messages": [
    {"role": "user", "content": "..."}
  ],
  "temperature": 0.7,
  "max_tokens": 4096,
  "top_p": 1,
  "frequency_penalty": 0,
  "presence_penalty": 0
}
```

#### Function 2: `streamOpenRouter()`
```typescript
export async function* streamOpenRouter(
  apiKey: string,
  options: OpenRouterOptions,
  fallbackModels: string[] = []
): AsyncGenerator<OpenRouterStreamEvent>
```

**Features:**
- ✅ Server-sent events (SSE) streaming
- ✅ Real-time token-by-token responses
- ✅ Fallback model support
- ✅ Error recovery

---

### 2. **Slide Generation**
**File:** `lib/utils/slideGenerator.ts` (348 lines)

#### Function: `generateSlidesFromLesson()`

**API Endpoint:** `https://openrouter.ai/api/v1/chat/completions`

**Parameters (Hardcoded):**
```javascript
{
  model: 'openai/gpt-4o-mini',
  temperature: 0.8,
  max_tokens: 2500
}
```

**Request Headers:**
```javascript
{
  'Authorization': 'Bearer ${apiKey}',
  'HTTP-Referer': 'https://personal-academy.com',
  'X-Title': 'Personal Academy',
  'Content-Type': 'application/json'
}
```

**Usage Location:** `app/create/storyboard/page.tsx` → Button: "Generate Slides"

---

### 3. **Course Structure Generation**
**File:** `app/api/course/generate-structure/route.ts`

**Endpoint:** `/api/course/generate-structure` (POST)

**Parameters (Configurable via Admin):**
```javascript
{
  model: config.openrouterModel,        // Configurable
  temperature: config.temperature,      // Configurable
  max_tokens: 4000,                     // Default, can be overridden
}
```

**Request Headers:**
```javascript
{
  'Authorization': 'Bearer ${apiKey}',
  'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL,
  'X-Title': 'Personal Academy',
  'Content-Type': 'application/json'
}
```

---

### 4. **Learning Outcomes Enhancement**
**File:** `app/api/course/enhance-outcomes/route.ts`

**Endpoint:** `/api/course/enhance-outcomes` (POST)

**Parameters (Configurable):**
```javascript
{
  model: config.openrouterModel,
  temperature: config.temperature,
  max_tokens: 2000,
}
```

---

### 5. **Content Enhancement**
**File:** `app/api/course/enhance-content/route.ts`

**Endpoint:** `/api/course/enhance-content` (POST)

**Parameters (Configurable):**
```javascript
{
  model: config.openrouterModel,
  temperature: config.temperature,
  max_tokens: 3000,
}
```

---

## 🔧 CONFIGURATION SYSTEM

### Where Prompts Are Configured:

**Admin Panel:** `/admin/config/ai-prompts`  
**File:** `app/admin/config/ai-prompts/page.tsx`

**Configurable Fields:**

| Field | Type | Current Value | Purpose |
|-------|------|---------------|---------|
| `systemPromptText` | TEXT | (Admin set) | System message for all AI calls |
| `courseStructurePrompt` | TEXT | (Admin set) | Extra guidance for course structure generation |
| `learningOutcomesPrompt` | TEXT | (Admin set) | Extra guidance for learning objectives |
| `contentEnhancementPrompt` | TEXT | (Admin set) | Extra guidance for content enhancement |
| `temperature` | NUMBER | 0.7 | Creativity level (0-1) |
| `openrouterModel` | TEXT | openai/gpt-4o-mini | Primary AI model |
| `openrouterFallbackModels` | ARRAY | ['anthropic/claude-3-opus', ...] | Backup models |

---

## 🎛️ WHAT'S HARDCODED VS CONFIGURABLE

### ❌ HARDCODED (Cannot be changed without code edit):

1. **Slide Generation Prompt** - `lib/utils/slideGenerator.ts` (348 lines)
   - Model: `openai/gpt-4o-mini`
   - Temperature: `0.8`
   - Max tokens: `2500`
   - Full prompt template: 135+ lines
   - **Status:** Entire prompt is hardcoded

2. **Generic Content Generation** - `lib/ai/streaming.ts` (5 prompts)
   - 5 generic prompt templates
   - **Status:** Hardcoded, but minimal

### ✅ CONFIGURABLE (Can be changed via Admin Panel):

1. **Course Structure Generation** - Fallback prompt + system message
2. **Learning Outcomes Enhancement** - System message + custom prompt
3. **Content Enhancement** - System message + custom prompt
4. **All parameters:**
   - Model selection
   - Temperature
   - Max tokens
   - System preamble

---

## 🚀 RECOMMENDATIONS

### PRIORITY 1: Make Slide Generation Configurable

**Current:** Hardcoded 135+ line prompt in `lib/utils/slideGenerator.ts`  
**Recommendation:** Move to admin database template

**Steps:**
1. Create template row in `prompt_templates` table:
   ```sql
   INSERT INTO prompt_templates (name, template, tokens_schema, system_preamble, temperature, max_tokens)
   VALUES ('slide_generation', '...', {...}, '...', 0.8, 2500)
   ```

2. Update `generateSlidesFromLesson()` to fetch template:
   ```typescript
   const tpl = await getPromptTemplate('slide_generation')
   if (tpl?.template) {
     // Use template
   }
   ```

3. Add Admin UI for editing slide generation prompt

**Benefit:** No code redeploy needed to adjust slide quality

---

### PRIORITY 2: Create Prompt Versioning

**Current:** Single prompt version for each type  
**Recommendation:** Support A/B testing and version history

**Implementation:**
```typescript
interface PromptVersion {
  id: string
  template_name: string
  version: number
  template: string
  temperature: number
  max_tokens: number
  active: boolean
  created_by: string
  created_at: timestamp
}
```

---

### PRIORITY 3: Add Prompt Analytics

**Current:** No tracking of prompt effectiveness  
**Recommendation:** Log which prompt version produced what results

**Track:**
- Which model was used
- Temperature setting
- Output quality score
- User satisfaction
- Token usage
- Cost

---

## 📋 INVENTORY TABLE

| # | File | Type | Hardcoded | Configurable | Model | Purpose |
|---|------|------|-----------|--------------|-------|---------|
| 1 | `lib/utils/slideGenerator.ts` | Prompt | ✅ YES | ❌ NO | gpt-4o-mini | Generate 3 slides per lesson |
| 2 | `lib/ai/streaming.ts` | Prompt | ✅ YES | ⚠️ PARTIAL | Any | Generic content gen (5 types) |
| 3 | `app/api/course/generate-structure/route.ts` | Prompt | ❌ NO | ✅ YES | Config | Generate course structure |
| 4 | `app/api/course/enhance-outcomes/route.ts` | Prompt | ❌ NO | ✅ YES | Config | Enhance learning outcomes |
| 5 | `app/api/course/enhance-content/route.ts` | Prompt | ❌ NO | ✅ YES | Config | Enhance lesson content |
| 6 | `lib/ai/openrouter.ts` | Integration | N/A | ✅ YES | Any | Core OpenRouter API wrapper |

---

## 🔐 SECURITY CONSIDERATIONS

### API Key Handling:

✅ **Correct:**
- API key stored in environment variable: `OPENROUTER_API_KEY`
- Key passed via Authorization header: `Bearer ${apiKey}`
- Server-side API calls only (no client-side exposure)

✅ **Default Fallback Models:**
```typescript
openrouterFallbackModels: [
  'anthropic/claude-3-opus',
  'anthropic/claude-3-sonnet',
  'mistralai/mistral-large',
]
```

---

## 💡 PROMPT QUALITY METRICS

### Slide Generation Prompt Quality:

**Strengths:**
- ✅ Very detailed (135+ lines)
- ✅ Explicit JSON schema specified
- ✅ SMART learning objectives required
- ✅ Varied interaction types enforced
- ✅ Pedagogical standards defined
- ✅ Specific bullet point length requirements

**Areas for Improvement:**
- ⚠️ Temperature of 0.8 may be too high for consistency
- ⚠️ No explicit instruction to avoid plagiarism
- ⚠️ No domain-specific examples provided
- ⚠️ Could include accessibility requirements (WCAG 2.1)

---

## 📞 FILES TO UPDATE IF CHANGING PROMPTS

1. **Slide Prompt:** `lib/utils/slideGenerator.ts` (lines 81-215)
2. **Course Structure Prompt:** `app/api/course/generate-structure/route.ts` (lines 121-160)
3. **Generic Prompts:** `lib/ai/streaming.ts` (lines 301-320)
4. **Admin Config UI:** `app/admin/config/ai-prompts/page.tsx`
5. **Prompt Templates Table:** `DATABASE_SCHEMA.md` (if using database templates)

---

**Audit Complete!** All 5 major prompt locations identified and documented.
