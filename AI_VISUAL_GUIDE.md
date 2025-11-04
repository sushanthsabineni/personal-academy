# AI Integration Visual Guide & Architecture Diagrams

**Purpose:** Understand AI integration architecture visually  
**For:** All stakeholders (technical and non-technical)

---

## Current Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Browser                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Course Creation Wizard (4 Steps)                    │  │
│  │  • Step 1: Course Essentials ← AI suggestions (mock) │  │
│  │  • Step 2: Multimedia Options                        │  │
│  │  • Step 3: Modules & Lessons                         │  │
│  │  • Step 4: Storyboard                                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Next.js App Router                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  /api/course/ai-suggest (MOCK - keyword matching)    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Supabase (Database)                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  • courses, modules, lessons, slides                 │  │
│  │  • ai_generations (audit log - unused)               │  │
│  │  • credits_transactions                              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

⚠️ Current: No real AI, no LLM connections
```

---

## Proposed Architecture (Direct Integration)

```
┌──────────────────────────────────────────────────────────────┐
│                     User Browser                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Course Creation Wizard (4 Steps)                      │ │
│  │  • Step 1: Course Essentials                           │ │
│  │    └─ "AI suggests: 5 modules, 3 lessons each"         │ │
│  │  • Step 2: Multimedia (select options)                 │ │
│  │    └─ "Generate scripts, images, videos"              │ │
│  │  • Step 3: Modules & Lessons                           │ │
│  │    └─ "Generate complete structure"                    │ │
│  │  • Step 4: Storyboard                                  │ │
│  │    └─ "Enhance slides, generate assessments"          │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
         ↓                          ↓                     ↓
┌──────────────────────┐  ┌────────────────────┐  ┌──────────────┐
│ Real-time Request    │  │ Show Cost & Time   │  │ Get Auth     │
│ /api/course/ai-*     │  │ "50 credits, 20s" │  │ from Session │
└──────────────────────┘  └────────────────────┘  └──────────────┘
         ↓
┌────────────────────────────────────────────────────────────────┐
│              Next.js API Route Handler                          │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 1. Check authentication (Supabase)                       │ │
│  │ 2. Validate input (length, content)                      │ │
│  │ 3. Check user credits (available?)                       │ │
│  │ 4. Build optimized prompt                                │ │
│  │ 5. Call LLM API with timeout                             │ │
│  │ 6. Parse & validate response                             │ │
│  │ 7. Deduct credits (record transaction)                   │ │
│  │ 8. Log to ai_generations table                           │ │
│  │ 9. Return result to client                               │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
         ↓
    ┌─────────┴─────────────────────┬──────────────────────┐
    ↓                                ↓                      ↓
┌─────────────────┐    ┌─────────────────────┐    ┌──────────────────┐
│  OpenAI API     │    │ Anthropic API       │    │ Google Gemini    │
│ (Primary)       │    │ (Fallback)          │    │ (Fallback)       │
│                 │    │                     │    │                  │
│ • gpt-4o        │    │ • claude-3-sonnet   │    │ • gemini-2-flash │
│ • Fast & cheap  │    │ • More reliable     │    │ • Cost effective │
│ • Good quality  │    │ • Better reasoning  │    │ • Fast inference │
└─────────────────┘    └─────────────────────┘    └──────────────────┘
    ↓                        ↓                         ↓
    └────────────┬───────────┴──────────────┬─────────┘
                 ↓
        ┌─────────────────────┐
        │  Response Processing │
        │  • Parse JSON       │
        │  • Validate output  │
        │  • Count tokens     │
        │  • Calculate cost   │
        └─────────────────────┘
                 ↓
        ┌──────────────────────────────────────┐
        │     Supabase (Database Update)       │
        │  ┌──────────────────────────────────┤
        │  │ ai_generations.insert({          │
        │  │   user_id: userId,               │
        │  │   generation_type: 'module',     │
        │  │   credits_used: 50,              │
        │  │   ai_provider: 'openai',         │
        │  │   input_data: {...},             │
        │  │   output_data: {...},            │
        │  │   status: 'success',             │
        │  │   tokens_used: 2345,             │
        │  │ })                               │
        │  └──────────────────────────────────┤
        │  credits_transactions.insert({      │
        │    user_id, type: 'spent',          │
        │    amount: 50, description: 'AI'    │
        │  })                                  │
        │  courses.update({                   │
        │    modules: [...], status: 'updated'│
        │  })                                  │
        └──────────────────────────────────────┘
                 ↓
        ┌─────────────────────┐
        │ Response to Browser  │
        │ {                   │
        │   success: true,    │
        │   modules: [...],   │
        │   creditsUsed: 50,  │
        │   tokensUsed: 2345  │
        │ }                   │
        └─────────────────────┘
                 ↓
        ┌─────────────────────────────────┐
        │  Browser Displays               │
        │  • Generated course structure    │
        │  • Approve/edit/regenerate      │
        │  • Show credits remaining       │
        └─────────────────────────────────┘
```

---

## Data Flow: Course Generation

```
User Input (Step 1)
├─ Course Title: "Python for Beginners"
├─ Target Audience: "High school students"
├─ Learning Outcomes: "Learn Python basics..."
├─ Number of Modules: "Let AI decide"
└─ Lessons per Module: "Let AI decide"
        ↓
API Request: POST /api/course/ai-suggest
├─ Validate input (not null, min length)
├─ Check auth (user logged in)
├─ Calculate estimated tokens
├─ Check user credits (has 1000+)
├─ Create prompt:
│   "You are an expert course designer.
│    Generate a course structure for:
│    Title: Python for Beginners
│    Audience: High school students
│    ..."
└─ Call OpenAI API (timeout: 30 seconds)
        ↓
OpenAI Response
├─ Success: Returns structured JSON
│   {
│     "modules": [
│       {
│         "title": "Module 1: Basics",
│         "lessons": [...]
│       },
│       ...
│     ]
│   }
└─ Error: Returns error message
    (rate limited, invalid key, timeout, etc.)
        ↓
Backend Processing
├─ Parse JSON response
├─ Validate structure
├─ Count tokens (input + output)
├─ Calculate credits to deduct (50)
├─ Save to ai_generations table
├─ Deduct from user credits
├─ Save course data
└─ Return to browser with summary
        ↓
Browser receives result
├─ Display generated modules
├─ Show "Used 50 credits, 900 remaining"
├─ Allow user to approve/edit
├─ Offer to regenerate if needed
└─ Continue to next step
```

---

## Credit System Integration

```
User Account (Start)
├─ Total Credits: 1,000 (free tier)
├─ Available: 1,000
└─ Used This Month: 0
        ↓
User clicks "Generate Course Structure"
├─ System calculates: 50 credits needed
├─ Shows to user: "This will cost 50 credits"
├─ User confirms: Yes, proceed
        ↓
Credit Deduction Process
├─ 1. Reserve 50 credits (temp hold)
├─ 2. Call LLM API
├─ 3a. If SUCCESS:
│   └─ Record transaction: credits_transactions
│      ├─ type: 'spent'
│      ├─ amount: 50
│      └─ description: 'AI module generation'
├─ 3b. If FAILURE:
│   └─ Refund 50 credits (no charge)
│   └─ Show error to user
        ↓
User Account (After Success)
├─ Total Credits: 950 (1000 - 50)
├─ Available: 950
└─ Used This Month: 50
        ↓
Admin Dashboard Shows
├─ Daily spend: $0.15 (50 credits ÷ 333 = $0.15)
├─ Monthly projection: $4.50 at current rate
├─ User attribution: sushan@example.com
└─ Cost breakdown: Module generation (50cr)
```

---

## API Endpoint Structure

```
POST /api/course/ai-suggest
├─ Input: courseTitle, learningOutcomes, targetAudience
├─ Process: Quick structure recommendation (2-5 sec)
├─ Cost: 5 credits
├─ Output: { modules: "5", lessonsPerModule: "3", reason: "..." }
└─ Use Case: Step 1 - Help users decide on structure

POST /api/course/generate-modules
├─ Input: courseTitle, numberOfModules, lessonsPerModule, etc.
├─ Process: Generate full course structure (10-30 sec)
├─ Cost: 50 credits
├─ Output: { modules: [{title, lessons: [{title, description}]}] }
└─ Use Case: Step 3 - Actually create the modules

POST /api/course/generate-multimedia
├─ Input: modules, courseTitle, learningOutcomes
├─ Process: Generate media prompts (15-45 sec)
├─ Cost: 25 credits
├─ Output: { audioScripts, imagePrompts, videoSuggestions, quizzes }
└─ Use Case: Step 2 - Generate accompanying content

POST /api/course/enhance-slide
├─ Input: slideContent, userFeedback
├─ Process: Improve existing content (5-15 sec)
├─ Cost: 5 credits per slide
├─ Output: { enhancedContent, suggestions }
└─ Use Case: Step 4 - Polish and improve content

POST /api/course/generate-assessment
├─ Input: lessonContent, numberOfQuestions
├─ Process: Create quiz questions (10-20 sec)
├─ Cost: 10 credits
├─ Output: { questions: [{question, options, correctAnswer, explanation}] }
└─ Use Case: Step 4 - Auto-generate assessments
```

---

## Error Handling Flow

```
User triggers AI generation
        ↓
Try to call LLM API
├─ Network timeout (>30s)
│   └─ Retry (up to 3 times with exponential backoff)
│      └─ Still fails? → Refund credits, show user error
├─ Rate limited (429)
│   └─ Wait 60s, retry
│      └─ Still failing? → User message: "Please try again later"
├─ Invalid API key
│   └─ Alert admin immediately
│      └─ User message: "System error, contacting support"
├─ Malformed response (not JSON)
│   └─ Log error with full response
│      └─ Refund credits, show user error
└─ Success (200)
    └─ Process and return result
        ↓
User sees result or error
├─ Success: Display generated content
├─ Recoverable error: "Please try again"
└─ Fatal error: "Contact support, we've logged this"
```

---

## Scaling Architecture (Phase 4 - Future)

```
Current (Direct Integration):
┌────────────┐       ┌─────────────────┐
│  Next.js   │────→  │  OpenAI API     │
│  (1 req)   │       │  (1 concurrent) │
└────────────┘       └─────────────────┘

With N8N (Async jobs):
┌────────────┐       ┌──────────────────┐       ┌──────────┐
│  Next.js   │────→  │  N8N Webhook     │────→  │ OpenAI   │
│  Request   │       │  (job queue)     │       │ Fallback │
└────────────┘       └──────────────────┘       │ Anthropic│
                     ↓                           └──────────┘
                     └─ Process async
                        Return job ID
                     ↓
                     Client polls for result
                     OR webhook notifies

Benefits:
├─ Handle 100+ concurrent requests
├─ Automatic retry with backoff
├─ Provider fallback (no service downtime)
├─ Queue management (fair scheduling)
├─ Audit trail (all operations logged)
└─ Update prompts without code changes
```

---

## Implementation Timeline

```
Week 1 (Foundation)
├─ Mon: API key setup, create lib/ai/
├─ Tue: Write openai.ts service
├─ Wed: Create test endpoint
├─ Thu: Add database logging
└─ Fri: Deploy to staging

Week 2 (Core Integration)
├─ Mon: Replace /api/course/ai-suggest
├─ Tue: Create /api/course/generate-modules
├─ Wed: Update frontend Step 1
├─ Thu: Update frontend Step 3
└─ Fri: Test with real users

Week 3 (Enhancement)
├─ Mon: Create multimedia endpoint
├─ Tue: Create enhance-slide endpoint
├─ Wed: Create assessment endpoint
├─ Thu: Update frontend Step 2 & 4
└─ Fri: Full end-to-end testing

Week 4+ (Optimization)
├─ Mon-Fri: Monitor, optimize, gather feedback
├─ Add caching, provider fallbacks
├─ A/B test prompts
├─ Analyze costs
└─ Plan Phase 4 or N8N migration
```

---

## Cost Breakdown Example

```
Scenario: 100 courses created in first month

Course Generation:
├─ Step 1: Suggestion (5 credits) × 100 users = 500 credits
├─ Step 3: Generate modules (50 credits) × 80 users = 4,000 credits
├─ Step 2: Multimedia (25 credits) × 60 users = 1,500 credits
└─ Step 4: Enhancements (5 credits) × 500 slides = 2,500 credits

Total: 8,500 credits used

Cost Calculation:
├─ OpenAI gpt-4o: ~$0.08-0.15 per 1K tokens
├─ Avg tokens per credit: 1 token
├─ Total tokens: 8,500
├─ Cost: $0.68 - $1.28
└─ At $0.01 per credit: $85 revenue

Profit: $85 - $1.28 = $83.72 (98% margin!)

User Satisfaction:
├─ 100 courses created in 1 month
├─ Average creation time: 30 min → 5 min (6x faster)
├─ User retention increase: 40-50%
└─ Platform competitiveness: 🚀 Major advantage
```

---

## Success Metrics Dashboard

```
At glance overview:

╔════════════════════════════════════════════════════════╗
║                   AI GENERATION METRICS                ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║  Today:  45 generations  Success rate: 98%            ║
║  Cost:   $5.23           Errors: 1                    ║
║  Users:  32              Avg time: 8.3 sec            ║
║                                                        ║
║  This Month:  1,245 generations                       ║
║  Revenue:     $125 (from credits)                     ║
║  Cost:        $15 (to LLM APIs)                       ║
║  Profit:      $110 (87% margin)                       ║
║                                                        ║
║  User Satisfaction: 4.7 / 5.0 ⭐                     ║
║  Adoption Rate:     68% of users tried AI features    ║
║  Regeneration Rate: 23% (users asking for better)     ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
```

---

## Decision Tree: Which Option?

```
Do you have an engineer available?
├─ YES
│  └─ Direct Integration ✓ RECOMMENDED
│     ├─ Fast (2 weeks)
│     ├─ Cheap ($0 ops cost)
│     └─ Easy to maintain
├─ NO (Contractor/Limited time)
│  └─ N8N (Option 2)
│     ├─ Slower (3-4 weeks)
│     ├─ Higher ops cost ($50-500/mo)
│     └─ But easier to modify

Budget available for first 3 months?
├─ <$200
│  └─ Direct Integration ✓ (only LLM costs)
├─ $200-500
│  └─ Either option works
└─ >$500
   └─ N8N (enterprise setup) ✓

Expected monthly active users?
├─ <1,000
│  └─ Direct Integration ✓ (sufficient scaling)
├─ 1,000-10,000
│  └─ Direct Integration (with caching)
└─ >10,000
   └─ N8N (better scaling) ✓

Need prompt management UI?
├─ No
│  └─ Direct Integration ✓ (code changes ok)
└─ Yes (change without deploying)
   └─ N8N ✓

RESULT: For you = Direct Integration ✓
```

---

## Next Steps Visualization

```
TODAY
  │
  ├─ Read AI_RESEARCH_SUMMARY.md (30 min) ← You are here
  │
WEEK 1
  ├─ Get OpenAI API key (15 min)
  │
  ├─ Follow AI_QUICK_START.md Steps 1-2 (2 hours)
  │  └─ Result: lib/ai/openai.ts service created
  │
  ├─ Deploy to staging (1 hour)
  │  └─ Result: Test endpoint running
  │
  └─ Team review + feedback (2 hours)
     └─ Decision: Proceed with Phase 2?

WEEK 2-3
  ├─ Implement AI endpoints (Phase 2)
  │  └─ Replace /api/course/ai-suggest
  │  └─ Create /api/course/generate-modules
  │  └─ Update frontend
  │
  └─ Internal testing + refinement
     └─ Fix bugs, optimize prompts

WEEK 4+
  ├─ Beta launch with select users
  │  └─ Gather feedback
  │  └─ Monitor costs & performance
  │
  ├─ Full rollout to all users
  │  └─ Monitor adoption
  │  └─ Track success metrics
  │
  └─ Plan Phase 3 & 4 enhancements

END RESULT: 🚀 AI-powered course generation live!
```

---

## Quick Reference: Which File to Read When

```
Question                          File to Check
─────────────────────────────────────────────────
"What should I do?"              → AI_QUICK_START.md
"Why this approach?"             → AI_INTEGRATION_PLAN.md
"What's the timeline?"           → AI_IMPLEMENTATION_CHECKLIST.md
"What's already done?"           → AI_RESEARCH_SUMMARY.md
"Show me the big picture"        → This file (Visual Guide)
"I'm confused about costs"       → AI_INTEGRATION_PLAN.md costs section
"What about errors?"             → This file (Error Handling Flow)
"How do I track progress?"       → AI_IMPLEMENTATION_CHECKLIST.md
"What LLM should I use?"         → AI_INTEGRATION_PLAN.md comparison
"Is this realistic?"             → AI_RESEARCH_SUMMARY.md findings
```

---

## Architecture Summary

**Current:** Rule-based suggestions, no real AI  
**Proposed:** Direct OpenAI integration via Next.js API routes  
**Timeline:** 2-4 weeks for MVP (Phase 1-2)  
**Cost:** $50-200 setup + LLM usage (very profitable)  
**Scalability:** Handles 1,000+ daily requests without N8N  
**Future:** Can migrate to N8N when hitting limits  

✅ **Recommendation:** Implement Direct Integration (Option 1)

**You're Ready to Start!** 🚀
