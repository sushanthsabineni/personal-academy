# AI Integration Plan for Personal Academy

**Document Version:** 1.0  
**Last Updated:** November 2, 2025  
**Status:** Strategic Analysis & Recommendations

---

## Executive Summary

Personal Academy is an AI-powered e-learning platform built with Next.js 15, TypeScript, and Supabase. Currently, **AI integration is minimal** - only basic module/lesson count suggestions exist. This document provides a comprehensive plan for connecting advanced AI models to generate entire course structures, content, multimedia prompts, assessments, and enhancements.

**Key Finding:** The codebase has excellent architectural foundations for AI integration. The platform already has:
- ✅ Credits system (for monetizing AI usage)
- ✅ `ai_generations` table (audit logging)
- ✅ API endpoints structure (Next.js App Router)
- ✅ Multi-step course creation wizard
- ✅ Database schema for content storage

---

## Current AI Integration Status

### What Exists Today

1. **AI Suggestion Endpoint** (`/api/course/ai-suggest`)
   - Basic rule-based logic only (keyword matching)
   - Suggests module/lesson counts based on keywords
   - No actual LLM integration
   - Located: `app/api/course/ai-suggest/route.ts`

2. **AI Tracking Infrastructure**
   - `ai_generations` table exists in database
   - Fields for: `generation_type`, `credits_used`, `ai_provider`, `model_name`, `tokens_used`
   - RLS policies configured
   - Ready for audit logging

3. **Frontend Placeholders**
   - "Enhance with AI" buttons in storyboard (`page.tsx`)
   - Quiz generation selector (AI vs manual)
   - Image/audio/video prompt options
   - Alert placeholders for future AI features

4. **Credits System**
   - 1,000 free credits for new users
   - Credits transaction tracking
   - Different rates for different AI operations (configurable in `lib/adminConfig.ts`)
   - Payment integration with Razorpay

### What's Missing

- ❌ Real LLM API integration (OpenAI, Anthropic, Google Gemini)
- ❌ Course content generation (modules, lessons, slides)
- ❌ Assessment/quiz generation
- ❌ Multimedia prompt generation (image, audio, video)
- ❌ Content enhancement/regeneration
- ❌ Error handling for failed generations
- ❌ Streaming/long-running job management
- ❌ A/B testing of different AI providers

---

## Solution Architecture

### Option 1: Direct LLM Integration (Recommended)

**Description:** Directly call OpenAI, Anthropic, or Google APIs from Next.js backend routes.

```
Client Browser
    ↓
Next.js API Route (/api/course/generate-content)
    ↓
LLM API (OpenAI/Anthropic/Google)
    ↓
Response Processing & DB Storage
    ↓
Client receives generated content
```

**Advantages:**
- ✅ Simplest to implement
- ✅ Lowest latency (direct API calls)
- ✅ Full control over prompts and parameters
- ✅ Easy debugging and monitoring
- ✅ Existing packages already in `package.json`:
  - `openai` (^6.7.0)
  - `@anthropic-ai/sdk` (^0.67.0)
  - `@google/generative-ai` (^0.24.1)

**Disadvantages:**
- ⚠️ API keys stored in server environment
- ⚠️ Rate limiting from LLM providers
- ⚠️ Direct cost correlation with usage
- ⚠️ No built-in retry/queue management
- ⚠️ Long responses could timeout on edge functions

**Cost Estimate:**
- OpenAI GPT-4: $0.03-0.06 per 1K tokens
- Anthropic Claude: $0.80-2.40 per 1M tokens  
- Google Gemini: $0.075-2.10 per 1M tokens
- Typical course generation: 10,000-50,000 tokens = $0.30-$3.00

**When to Use:** Small to medium teams, predictable traffic, willing to manage API keys.

---

### Option 2: N8N Workflow Automation

**Description:** Route AI requests through N8N automation platform for orchestration, error handling, and provider management.

```
Client Browser
    ↓
Next.js API Route (/api/course/generate-content)
    ↓
N8N Webhook Trigger
    ↓
N8N Workflow Logic
    ├─→ Validate Input
    ├─→ Select AI Provider (fallback strategy)
    ├─→ Call LLM API
    ├─→ Error Handling & Retry
    ├─→ Database Storage
    └─→ Send Webhook Response
    ↓
Client receives job ID or result
```

**Advantages:**
- ✅ Visual workflow designer (no code)
- ✅ Built-in error handling & retries
- ✅ Multiple AI provider fallbacks
- ✅ Rate limiting & queue management
- ✅ Audit trail of all operations
- ✅ Easy to modify without redeployment
- ✅ Better for async/long-running tasks
- ✅ Can scale independently

**Disadvantages:**
- ⚠️ Additional infrastructure (N8N server)
- ⚠️ Extra hop = slightly higher latency
- ⚠️ Learning curve for workflow design
- ⚠️ Cost: Self-hosted (~$0) or Cloud (~$50-500/mo)
- ⚠️ Additional maintenance burden

**Cost Estimate:**
- N8N Self-hosted: $0
- N8N Cloud: $50-500/month depending on executions
- Plus LLM API costs

**When to Use:** Enterprise teams, complex workflows, need reliability, want to avoid code changes for prompt updates.

---

### Option 3: Hybrid Approach (Best of Both Worlds)

**Description:** Direct integration for simple/fast operations, N8N for complex/long-running operations.

```
Simple Operations (Module suggestions)
    ├─→ Direct API call from Next.js
    └─→ Fast response (<5s)

Complex Operations (Full course generation)
    ├─→ Next.js route triggers N8N webhook
    ├─→ Returns job ID immediately
    └─→ Polls or webhooks for completion
```

**Advantages:**
- ✅ Best latency for common operations
- ✅ Scalability for heavy operations
- ✅ Flexibility to grow
- ✅ Can test both approaches

**Disadvantages:**
- ⚠️ More complex codebase
- ⚠️ Must maintain both integrations

**When to Use:** Growing teams, variable traffic patterns, want flexibility.

---

## Recommended Implementation: Option 1 (Direct Integration)

**Why:** Your codebase already has all dependencies. This is fastest to implement and easiest to maintain initially.

---

## AI Integration Points & Features

### 1. **Step 1: Course Essentials (Enhancement)**

**Current:** Basic rule-based suggestions  
**Target:** AI-powered suggestions + content analysis

**Implementation:**
```typescript
// POST /api/course/ai-suggest (REPLACE existing)
- Input: courseTitle, learningOutcomes, targetAudience, industry
- Output: 
  {
    modulesCount: number,
    lessonsPerModule: number,
    estimatedDuration: number,
    suggestedStructure: {modules: Array<{title, topics}>},
    aiReason: string,
    tokensUsed: number,
    creditsUsed: number
  }
```

**AI Task:** Analyze course requirements → structure recommendation  
**LLM Model:** GPT-4o (fast, cost-effective)  
**Expected Credits:** 5-10 per suggestion  
**Latency:** 2-5 seconds

---

### 2. **Step 2: Multimedia Options (New)**

**Current:** Checkboxes only (no generation)  
**Target:** Generate media prompts & suggestions

**Implementation:**
```typescript
// POST /api/course/generate-multimedia
- Input: courseTitle, modules[], learningOutcomes
- Output: {
    audioScripts: [{slideId, script}],
    imagePrompts: [{slideId, prompt}],
    videoSuggestions: [{lessonId, suggestion}],
    quizQuestions: [{type, question, options}]
  }
```

**AI Tasks:**
- Generate narration scripts for each slide
- Create image generation prompts (for DALL-E, Midjourney)
- Suggest video topics
- Generate quiz questions

**LLM Model:** GPT-4o  
**Expected Credits:** 20-50 per course  
**Latency:** 10-20 seconds

---

### 3. **Step 3: Modules & Lessons (Core)**

**Current:** AI suggestion only in Step 1  
**Target:** Full module/lesson content generation

**Implementation:**
```typescript
// POST /api/course/generate-modules
- Input: courseTitle, numberOfModules, lessonsPerModule, 
         learningOutcomes, targetAudience, industry, duration
- Output: {
    modules: [
      {
        id, title, description, duration,
        lessons: [
          {
            id, title, description, learningObjectives,
            estimatedDuration, difficulty
          }
        ]
      }
    ],
    tokensUsed,
    creditsUsed
  }
```

**AI Task:** Generate complete course structure with content  
**LLM Model:** GPT-4 (best for complex content)  
**Expected Credits:** 50-100 per course  
**Latency:** 20-60 seconds (consider async job)

---

### 4. **Step 4: Storyboard (Enhancement)**

**Current:** Manual slide editing only  
**Target:** AI enhancement & regeneration

**Implementation:**
```typescript
// POST /api/course/enhance-slide
- Input: slideId, slideContent, userFeedback
- Output: {
    enhancedContent: {
      title, content, learningObjective, mediaNotes
    },
    suggestions: [],
    tokensUsed,
    creditsUsed
  }

// POST /api/course/generate-assessment
- Input: lessonId, lessonContent, numberOfQuestions
- Output: {
    questions: [{type, question, options, correctAnswer, explanation}],
    tokensUsed,
    creditsUsed
  }
```

**AI Tasks:**
- Improve slide content based on pedagogy
- Generate assessments & quizzes
- Suggest interactive elements
- Create narration scripts

**LLM Model:** GPT-4o  
**Expected Credits:** 5-20 per enhancement  
**Latency:** 5-15 seconds

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Set up environment variables for LLM APIs
- [ ] Create base AI service utilities
- [ ] Implement error handling & logging
- [ ] Add test endpoints with mock data

### Phase 2: Core Generation (Week 2-4)
- [ ] Implement `POST /api/course/ai-suggest` (replace existing)
- [ ] Implement `POST /api/course/generate-modules`
- [ ] Add credit deduction logic
- [ ] Add `ai_generations` audit logging
- [ ] Test with real LLM APIs

### Phase 3: Enhancement Features (Week 4-6)
- [ ] Implement `POST /api/course/generate-multimedia`
- [ ] Implement `POST /api/course/enhance-slide`
- [ ] Implement `POST /api/course/generate-assessment`
- [ ] Update frontend UI to consume endpoints
- [ ] Add real-time feedback

### Phase 4: Optimization & Scale (Week 6+)
- [ ] Add async job processing for long tasks
- [ ] Implement provider fallback strategy
- [ ] Add streaming for real-time content
- [ ] Optimize prompts based on user feedback
- [ ] Consider N8N migration if needed

---

## Database Schema Additions

The `ai_generations` table is already prepared, but add these enhancements:

```sql
-- Extend ai_generations for better tracking
ALTER TABLE ai_generations ADD COLUMN (
  user_prompt TEXT,  -- What the user asked
  ai_response_summary TEXT,  -- First 500 chars of response
  quality_score INTEGER,  -- User rating 1-5
  was_regenerated BOOLEAN DEFAULT false,  -- Was this regenerated?
  parent_generation_id UUID REFERENCES ai_generations(id)  -- Link to original
);

-- Track AI provider costs
CREATE TABLE ai_provider_costs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider TEXT NOT NULL,  -- openai, anthropic, google
  model TEXT NOT NULL,
  generation_type TEXT NOT NULL,
  input_cost_per_1k_tokens DECIMAL(10,6),
  output_cost_per_1k_tokens DECIMAL(10,6),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Environment Variables Setup

Add to `.env.local`:

```bash
# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o
OPENAI_TEMPERATURE=0.7

# Anthropic (optional fallback)
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-sonnet

# Google Gemini (optional fallback)
GOOGLE_AI_API_KEY=AIzaSy...
GOOGLE_AI_MODEL=gemini-2.0-flash

# AI Configuration
AI_MAX_RETRIES=3
AI_TIMEOUT_MS=60000
AI_REQUEST_TIMEOUT_MS=30000

# Cost management
AI_GENERATION_CREDIT_RATES_MODULE=50
AI_GENERATION_CREDIT_RATES_LESSON=15
AI_GENERATION_CREDIT_RATES_SLIDE=5
AI_GENERATION_CREDIT_RATES_ENHANCEMENT=10
```

---

## API Endpoint Specifications

### 1. AI Suggest Endpoint

```typescript
// POST /api/course/ai-suggest
interface Request {
  courseTitle: string
  learningOutcomes: string
  targetAudience?: string
  industry?: string
}

interface Response {
  success: boolean
  modules?: string
  lessonsPerModule?: string
  estimatedDuration?: number
  reason: string
  tokensUsed?: number
  creditsUsed?: number
  error?: string
}
```

### 2. Generate Modules Endpoint

```typescript
// POST /api/course/generate-modules
interface Request {
  courseTitle: string
  numberOfModules: number
  lessonsPerModule: number
  learningOutcomes: string
  targetAudience: string
  industry: string
  courseLevel: 'beginner' | 'intermediate' | 'advanced'
  courseDuration: number  // in minutes
}

interface Response {
  success: boolean
  modules?: Array<{
    id: string
    title: string
    description: string
    duration: number
    lessons: Array<{
      id: string
      title: string
      description: string
      learningObjectives: string[]
      duration: number
    }>
  }>
  tokensUsed?: number
  creditsUsed?: number
  estimatedCost?: number
  error?: string
}
```

### 3. Generate Multimedia Endpoint

```typescript
// POST /api/course/generate-multimedia
interface Request {
  courseTitle: string
  modules: Array<{id: string, title: string, lessons: Array<{id: string, title: string, slides: Array<{id: string, title: string, content: string}>}>}>
  learningOutcomes: string
  includeAudio: boolean
  includeImagePrompts: boolean
  includeVideoPrompts: boolean
  includeQuiz: boolean
}

interface Response {
  success: boolean
  audioScripts?: Array<{slideId: string, script: string}>
  imagePrompts?: Array<{slideId: string, prompt: string}>
  videoSuggestions?: Array<{lessonId: string, suggestion: string}>
  quizQuestions?: Array<{slideId: string, questions: QuizQuestion[]}>
  tokensUsed?: number
  creditsUsed?: number
  error?: string
}
```

---

## Credit System Integration

**Credit Rates by Operation:**

| Operation | Base Credits | Calculation |
|-----------|-------------|------------|
| Module Suggestion | 5 | Fixed |
| Module Generation | 50 | Fixed per module |
| Lesson Generation | 15 | Fixed per lesson |
| Slide Enhancement | 5 | Fixed per slide |
| Quiz Generation | 10 | Variable by question count |
| Audio Narration | 20 | Variable by duration |
| Image Prompt | 3 | Fixed per prompt |
| Video Suggestion | 8 | Fixed per video |

**Credit Flow:**
1. User initiates AI generation
2. Frontend estimates credits needed (show to user)
3. User confirms
4. Backend deducts credits (reserved)
5. AI API called
6. If success: commit transaction to `ai_generations`
7. If failure: refund reserved credits
8. Frontend shows summary of credits used

---

## Error Handling Strategy

```typescript
interface AIError {
  type: 'RATE_LIMIT' | 'INVALID_KEY' | 'QUOTA_EXCEEDED' | 'NETWORK' | 'INVALID_INPUT' | 'TIMEOUT'
  message: string
  retryable: boolean
  suggestedWait?: number  // milliseconds
}

// Handling:
- RATE_LIMIT: Retry with exponential backoff
- INVALID_KEY: Alert user, don't retry
- QUOTA_EXCEEDED: Suggest credit purchase
- NETWORK: Retry up to 3 times
- INVALID_INPUT: Return validation error
- TIMEOUT: Allow user to retry
```

---

## Monitoring & Analytics

Track in `ai_generations` table:
- Generation type and success rate
- Average tokens used (cost tracking)
- User regeneration patterns
- Quality ratings (if implemented)
- Time to complete

Dashboard queries:
```sql
-- Cost tracking
SELECT 
  DATE_TRUNC('day', created_at) as date,
  ai_provider,
  SUM(credits_used) as daily_credits,
  COUNT(*) as requests,
  AVG(processing_time_ms) as avg_time_ms
FROM ai_generations
GROUP BY DATE_TRUNC('day', created_at), ai_provider;

-- Generation success rates
SELECT generation_type, 
  COUNT(*) total,
  SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful
FROM ai_generations
GROUP BY generation_type;
```

---

## Security Considerations

1. **API Keys:**
   - Store in `.env.local` (server-only, never expose to client)
   - Use environment variables, never hardcode
   - Rotate keys periodically

2. **Rate Limiting:**
   - Implement per-user rate limits in Next.js
   - Track failed attempts
   - Block suspicious patterns

3. **Input Validation:**
   - Sanitize all user prompts
   - Max length limits on inputs
   - Block injection attempts

4. **Audit Logging:**
   - Log all AI requests in `ai_generations`
   - Track costs per user
   - Monitor for abuse

5. **Content Filtering:**
   - Validate AI responses for harmful content
   - Implement content moderation if needed

---

## Cost Optimization Tips

1. **Use Smaller Models:**
   - GPT-4o for complex tasks
   - GPT-3.5-turbo for simple tasks
   - Save 90% on some operations

2. **Batch Operations:**
   - Generate multiple modules in one API call
   - Reduce overhead

3. **Caching:**
   - Cache common prompt responses
   - Avoid regenerating identical inputs

4. **Token Counting:**
   - Pre-count tokens before API calls
   - Set strict token limits
   - Show estimated cost to user

---

## Comparison: Direct Integration vs N8N

| Aspect | Direct Integration | N8N |
|--------|-------------------|-----|
| **Setup Time** | 2-4 hours | 1-2 days |
| **Latency** | 2-5s | 3-8s |
| **Scalability** | Good (within Vercel limits) | Excellent |
| **Maintenance** | Code changes needed | UI-based workflow changes |
| **Error Handling** | Manual coding | Built-in |
| **Cost** | LLM only | LLM + $0-500/mo |
| **Monitoring** | Custom logging | Built-in dashboards |
| **Learning Curve** | Minimal | Moderate |
| **Best For** | MVP, small teams | Enterprise, complex workflows |

---

## Migration Path: Direct → N8N (Future)

If you outgrow direct integration:

1. Create N8N webhook endpoints
2. Point Next.js routes to N8N instead of LLM APIs
3. Gradually migrate complex logic to N8N
4. Remove N8N when ready, keep direct integration

---

## Testing Strategy

```typescript
// Mock AI responses for testing
const mockGenerateModules = async () => ({
  modules: [
    {
      id: '1',
      title: 'Module 1: Basics',
      description: 'Introduction to core concepts',
      lessons: [...]
    }
  ]
})

// Integration tests
- Test credit deduction logic
- Test database logging
- Test error scenarios
- Test concurrent requests
```

---

## Next Steps

1. **Choose Architecture:** Direct Integration (recommended)
2. **Set Up API Keys:** Get OpenAI, Anthropic, or Google API keys
3. **Phase 1 Implementation:** Start with basic suggestions
4. **Phase 2 Implementation:** Add module generation
5. **Monitor & Optimize:** Track costs, adjust rates
6. **Gather Feedback:** User testing for quality
7. **Iterate:** Improve prompts based on results

---

## Questions to Answer Before Starting

1. **Budget:** How much can you spend on AI API costs monthly?
2. **Primary LLM:** OpenAI (most popular) or Anthropic (safety) or Google (fast)?
3. **Features Priority:** Which AI features matter most to users?
4. **Timeline:** Do you need this in weeks or months?
5. **Scale:** Expected monthly active users?
6. **Content Quality:** Can users regenerate if not satisfied?
7. **Customization:** Will users be able to customize AI prompts?

---

## Appendix: File Structure for AI Integration

```
lib/ai/
├── openai.ts            # OpenAI integration
├── anthropic.ts         # Anthropic integration
├── google.ts            # Google Gemini integration
├── provider.ts          # Provider interface
├── prompts.ts           # Centralized prompts library
├── tokenCounter.ts      # Token counting utility
└── costCalculator.ts    # Cost estimation

app/api/course/
├── ai-suggest/
│   └── route.ts         # (REPLACE: add real AI)
├── generate-modules/
│   └── route.ts         # NEW
├── generate-multimedia/
│   └── route.ts         # NEW
├── enhance-slide/
│   └── route.ts         # NEW
└── generate-assessment/
    └── route.ts         # NEW
```

---

## Conclusion

Your platform is well-positioned for AI integration. The recommended approach is **direct LLM integration** using OpenAI as the primary provider. With 50-100 lines of TypeScript and existing dependencies, you can activate AI-powered course generation within 2-4 weeks. Start with basic suggestions, add module generation, then expand to multimedia and assessment generation.

The pathway is clear: **API routes → LLM calls → Database storage → Frontend updates → User feedback → Optimization.**
