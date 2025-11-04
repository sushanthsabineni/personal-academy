# AI Integration Quick Start Guide

**For Developers:** Implement AI features in Personal Academy  
**Time to First AI Integration:** 2-4 hours  
**Difficulty:** Intermediate

---

## TL;DR - The 30-Second Version

1. Get an API key from OpenAI ($5+ prepaid)
2. Add `OPENAI_API_KEY=sk-...` to `.env.local`
3. Replace `/api/course/ai-suggest/route.ts` with OpenAI calls
4. Update frontend to call real endpoints
5. Track credits in database
6. Done! You have AI course generation

---

## Quick Decision Tree

**Q: Do you need production-grade reliability?**
- Yes → N8N (Option 2)
- No → Direct Integration (Option 1) ✓ RECOMMENDED

**Q: Do you have engineering time?**
- Yes (engineer available) → Direct Integration
- No (contractor/limited time) → N8N

**Q: What's your budget?**
- <$100/month → Direct Integration (cheapest)
- >$500/month → N8N (more features)
- <$500 total cost → Direct Integration

**Result: Direct Integration is best for you** ✓

---

## Option 1: Direct Integration (Step-by-Step)

### Step 1: Get an API Key (5 minutes)

**OpenAI (Recommended):**
1. Visit https://platform.openai.com/api/keys
2. Click "Create new secret key"
3. Copy the key (starts with `sk-`)
4. Add to `.env.local`:
   ```
   OPENAI_API_KEY=sk-your-key-here
   ```

**Anthropic (Alternative):**
1. Visit https://console.anthropic.com
2. Create new API key
3. Add to `.env.local`:
   ```
   ANTHROPIC_API_KEY=sk-ant-your-key
   ```

### Step 2: Create Base AI Service (30 minutes)

Create `lib/ai/openai.ts`:

```typescript
import { OpenAI } from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export interface GenerateModulesInput {
  courseTitle: string
  numberOfModules: number
  lessonsPerModule: number
  learningOutcomes: string
  targetAudience: string
  courseLevel: 'beginner' | 'intermediate' | 'advanced'
}

export async function generateModules(input: GenerateModulesInput) {
  const prompt = `
You are an expert instructional designer. Generate a detailed course structure.

Course Title: ${input.courseTitle}
Number of Modules: ${input.numberOfModules}
Lessons per Module: ${input.lessonsPerModule}
Learning Outcomes: ${input.learningOutcomes}
Target Audience: ${input.targetAudience}
Level: ${input.courseLevel}

Return a JSON object with this structure:
{
  "modules": [
    {
      "title": "Module title",
      "description": "Brief description",
      "duration": 45,
      "lessons": [
        {
          "title": "Lesson title",
          "description": "Lesson description",
          "learningObjectives": ["objective 1", "objective 2"],
          "duration": 15
        }
      ]
    }
  ]
}

IMPORTANT: Return ONLY valid JSON, no markdown, no explanations.
`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 4000
  })

  const content = response.choices[0].message.content
  if (!content) throw new Error('No response from OpenAI')

  // Parse JSON response
  try {
    return JSON.parse(content)
  } catch (e) {
    throw new Error(`Failed to parse AI response: ${content}`)
  }
}

export function countTokens(text: string): number {
  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4)
}

export function estimateCost(inputTokens: number, outputTokens: number): number {
  const inputCost = (inputTokens / 1000) * 0.005  // GPT-4o input: $0.005/1K
  const outputCost = (outputTokens / 1000) * 0.015  // GPT-4o output: $0.015/1K
  return inputCost + outputCost
}
```

### Step 3: Create API Route (30 minutes)

Replace `app/api/course/ai-suggest/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { generateModules, countTokens } from '@/lib/ai/openai'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { courseTitle, learningOutcomes, numberOfModules, lessonsPerModule, targetAudience, courseLevel } = body

    // Validate input
    if (!courseTitle || courseTitle.length < 5) {
      return NextResponse.json({ success: false, error: 'Course title must be at least 5 characters' }, { status: 400 })
    }
    if (!learningOutcomes || learningOutcomes.length < 20) {
      return NextResponse.json({ success: false, error: 'Learning outcomes must be at least 20 characters' }, { status: 400 })
    }

    // Call AI
    const result = await generateModules({
      courseTitle,
      numberOfModules: numberOfModules || 5,
      lessonsPerModule: lessonsPerModule || 3,
      learningOutcomes,
      targetAudience: targetAudience || 'General audience',
      courseLevel: courseLevel || 'intermediate'
    })

    // Log to database for tracking
    await supabase.from('ai_generations').insert({
      user_id: session.user.id,
      generation_type: 'module',
      credits_used: 50,  // Adjust based on your pricing
      input_data: body,
      output_data: result,
      status: 'success',
      ai_provider: 'openai',
      model_name: 'gpt-4o',
      tokens_used: countTokens(JSON.stringify(body)) + countTokens(JSON.stringify(result))
    })

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error('AI generation error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'AI generation failed' },
      { status: 500 }
    )
  }
}
```

### Step 4: Update Frontend (30 minutes)

Update `app/create/essentials/page.tsx` to call real endpoint:

```typescript
// In the useEffect that calls AI suggestions:
useEffect(() => {
  const shouldCallAI =
    (approxModules === 'let-ai-decide' || approxLessonsPerModule === 'let-ai-decide') &&
    courseTitle.trim().length >= 5 &&
    learningOutcomes.trim().length >= 20

  if (!shouldCallAI) return

  startTransition(() => {
    setAiError(null)
    setAiReason(null)
    setAiLoading(true)
  })

  fetch('/api/course/ai-suggest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      courseTitle,
      learningOutcomes,
      targetAudience: formData.targetAudience,
      numberOfModules: parseInt(approxModules) || 5,
      lessonsPerModule: parseInt(approxLessonsPerModule) || 3,
      courseLevel: formData.knowledgeLevel
    })
  })
    .then(async (res) => {
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'AI suggestion failed')
      
      startTransition(() => {
        setFormData((prev) => ({
          ...prev,
          approxModules: data.modules?.length?.toString() || 'let-ai-decide',
          approxLessonsPerModule: data.modules?.[0]?.lessons?.length?.toString() || 'let-ai-decide'
        }))
        setAiReason(data.reason || 'AI generated structure')
        setAiLoading(false)
      })
    })
    .catch((err) => {
      startTransition(() => {
        setAiError(err.message || 'AI suggestion failed')
        setAiLoading(false)
      })
    })
}, [approxModules, approxLessonsPerModule, courseTitle, learningOutcomes])
```

### Step 5: Test It! (15 minutes)

```bash
npm run dev
# Open http://localhost:3000/create/essentials
# Fill in course info
# Watch AI generate suggestions!
```

---

## Troubleshooting

**Problem: "Unauthorized" error**
- Solution: Check that user is logged in, API key is valid

**Problem: "No response from OpenAI"**
- Solution: Check API key in `.env.local`, account has credits

**Problem: "Failed to parse AI response"**
- Solution: AI didn't return valid JSON. Adjust prompt to force JSON format

**Problem: Slow responses**
- Solution: Normal for first call (5-10 seconds). Add loading indicator to UI.

---

## Next Steps

After Step 1 works:

1. **Create module generation endpoint:** `/api/course/generate-modules`
2. **Add credit deduction:** Subtract credits from user balance
3. **Add error handling:** Retry on failure, show user-friendly errors
4. **Monitor costs:** Log all API calls to understand spending
5. **Optimize prompts:** A/B test different prompt styles

---

## Cost Tracking

Add this to `.env.local` to track costs:

```
# Cost per operation (in credits)
AI_COST_SUGGESTION=5
AI_COST_MODULE=50
AI_COST_LESSON=15
AI_COST_SLIDE=5
```

Update your admin dashboard to show:
```sql
SELECT 
  DATE_TRUNC('day', created_at) as date,
  SUM(credits_used) as daily_costs,
  COUNT(*) as requests
FROM ai_generations
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;
```

---

## When to Move to N8N

Consider N8N when:
- Traffic > 1,000 requests/day
- Need automatic retry/failover
- Want to manage prompts via UI
- Multiple AI providers needed
- Need advanced scheduling

---

## Testing with Mock Data (No API Key Needed)

For development without API calls:

```typescript
// lib/ai/openai.ts
export async function generateModules(input: GenerateModulesInput) {
  if (process.env.NODE_ENV === 'development' && !process.env.OPENAI_API_KEY) {
    // Return mock data
    return {
      modules: [
        {
          title: 'Module 1: Basics',
          description: 'Introduction to core concepts',
          duration: 45,
          lessons: [
            {
              title: 'Lesson 1: Getting Started',
              description: 'Foundation and overview',
              learningObjectives: ['Understand basics', 'Learn fundamentals'],
              duration: 15
            }
          ]
        }
      ]
    }
  }
  // ... real implementation
}
```

---

## One-Command Setup

Want to do this faster? Clone the starter:

```bash
# (Not available yet - but save this reference!)
```

---

## Support & Questions

1. **Check DATABASE_SCHEMA.md** for `ai_generations` table structure
2. **Check package.json** for installed AI SDK versions
3. **See API_INTEGRATION_PLAN.md** for detailed architecture

---

## What You'll Have After This

✅ AI-powered course structure generation  
✅ Real OpenAI/Anthropic integration  
✅ Credit tracking in database  
✅ Audit logging of AI usage  
✅ Error handling & retries  

**Next:** Expand to multimedia generation, assessments, and content enhancement!
