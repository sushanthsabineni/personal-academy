# Phase 3: API Integration - Implementation Plan

**Status:** Planning  
**Date:** November 2, 2025  
**Objective:** Replace dummy AI logic with real OpenRouter API integration

---

## 📊 Current State Analysis

### Existing Endpoint
**File:** `app/api/course/ai-suggest/route.ts`

**Current Implementation:**
- ❌ Mock/dummy logic only
- ❌ No real AI model calls
- ❌ No OpenRouter integration
- ✅ Proper auth check (Supabase session)
- ✅ Basic error handling

**Current Flow:**
```
User Request
  ↓
POST /api/course/ai-suggest
  ↓
suggestModulesAndLessons() function
  ↓
Returns mock suggestions based on keywords
  ↓
Response (no real AI used)
```

### What Needs to Change
```
User Request
  ↓
POST /api/course/ai-suggest
  ↓
Load configuration (OpenRouter API key, model)
  ↓
Call OpenRouter API with proper prompt
  ↓
Stream/process response
  ↓
Extract modules and lessons from AI response
  ↓
Track cost and usage
  ↓
Response (real AI-generated content)
```

---

## 🎯 Implementation Steps

### Step 1: Create AI Generation Service
**File:** `lib/ai/courseGeneration.ts` (NEW)

Will contain:
- Function to generate module structure
- Function to generate lesson content
- Function to generate quiz questions
- Function to generate assessments
- Proper prompt engineering
- Response parsing
- Error handling with fallbacks

### Step 2: Update API Endpoint
**File:** `app/api/course/ai-suggest/route.ts`

Changes:
- Load OpenRouter config from admin settings
- Call new generation service
- Track API calls and costs
- Return AI-generated suggestions
- Implement streaming (optional enhancement)

### Step 3: Add Cost Tracking
**File:** `lib/ai/costTracking.ts` (NEW)

Will track:
- API calls made
- Tokens used (input/output)
- Cost per request
- User credits deducted
- Daily/monthly usage

### Step 4: Update Course Creation Wizard
**File:** `app/create/essentials/page.tsx`

Changes:
- Show AI model being used
- Display cost estimate before generation
- Show loading state with token count
- Handle streaming responses
- Show any errors gracefully

### Step 5: Add Error Recovery
**Files:** Multiple

Handle:
- API timeouts
- Rate limits
- Model failures
- Fallback to secondary models
- User-friendly error messages

---

## 📋 Detailed Implementation

### Step 1: Create Generation Service

```typescript
// lib/ai/courseGeneration.ts

import { callOpenRouter, streamOpenRouter } from './openrouter'
import { getAIPromptConfig } from '@/lib/adminConfig'
import { estimateCost } from '@/lib/ai/openrouter'

// Generate course structure (modules and lessons)
export async function generateCourseStructure(input: {
  courseTitle: string
  learningOutcomes: string
  targetAudience?: string
  duration?: number
}) {
  const config = getAIPromptConfig()
  
  const prompt = `
    Generate a course structure for:
    - Title: ${input.courseTitle}
    - Learning Outcomes: ${input.learningOutcomes}
    - Target Audience: ${input.targetAudience || 'General'}
    - Duration: ${input.duration || 30} minutes per module
    
    ${config.courseStructurePrompt}
    
    Respond in JSON format with:
    {
      "modules": [
        {
          "title": "Module Name",
          "description": "Description",
          "lessonCount": 3,
          "learningObjectives": ["obj1", "obj2"]
        }
      ]
    }
  `
  
  const response = await callOpenRouter({
    prompt,
    model: config.openrouterModel,
    fallbackModels: config.openrouterFallbackModels,
    temperature: config.temperature,
    maxTokens: config.maxTokens,
  })
  
  return JSON.parse(response)
}

// Generate lesson content
export async function generateLessonContent(input: {
  moduleTitle: string
  lessonTitle: string
  learningObjectives: string[]
}) {
  const config = getAIPromptConfig()
  
  const prompt = `
    Generate detailed lesson content for:
    - Module: ${input.moduleTitle}
    - Lesson: ${input.lessonTitle}
    - Objectives: ${input.learningObjectives.join(', ')}
    
    ${config.lessonGenerationPrompt}
    
    Include:
    - Key concepts
    - Real-world examples
    - Practice questions
    - Summary points
  `
  
  return await callOpenRouter({
    prompt,
    model: config.openrouterModel,
    fallbackModels: config.openrouterFallbackModels,
  })
}

// Generate quiz questions
export async function generateQuizContent(input: {
  moduleTitle: string
  keyTopics: string[]
}) {
  const config = getAIPromptConfig()
  
  const prompt = `
    Generate 10 quiz questions for:
    - Module: ${input.moduleTitle}
    - Topics: ${input.keyTopics.join(', ')}
    
    ${config.quizGenerationPrompt}
    
    Include multiple choice and short answer questions.
    Format as JSON array.
  `
  
  return await callOpenRouter({
    prompt,
    model: config.openrouterModel,
    fallbackModels: config.openrouterFallbackModels,
  })
}
```

### Step 2: Update API Endpoint

```typescript
// app/api/course/ai-suggest/route.ts (UPDATED)

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { generateCourseStructure } from '@/lib/ai/courseGeneration'
import { estimateCost } from '@/lib/ai/openrouter'
import { getAIPromptConfig } from '@/lib/adminConfig'
import { trackCostUsage } from '@/lib/ai/costTracking'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { courseTitle, learningOutcomes, targetAudience, duration } = await req.json()
    
    if (!courseTitle || !learningOutcomes) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get AI configuration
    const config = getAIPromptConfig()
    if (!config.openrouterApiKey) {
      return NextResponse.json(
        { success: false, error: 'OpenRouter API key not configured' },
        { status: 500 }
      )
    }

    // Estimate cost
    const estimatedCost = estimateCost({
      model: config.openrouterModel,
      inputTokens: 1000, // Rough estimate
      outputTokens: 500,
    })

    // Check user credits (optional: add later)
    // const credits = await getUserCredits(session.user.id)
    // if (credits < estimatedCost) {
    //   return NextResponse.json(
    //     { success: false, error: 'Insufficient credits' },
    //     { status: 402 }
    //   )
    // }

    // Generate course structure
    const suggestion = await generateCourseStructure({
      courseTitle,
      learningOutcomes,
      targetAudience,
      duration,
    })

    // Track usage and cost
    await trackCostUsage({
      userId: session.user.id,
      model: config.openrouterModel,
      estimatedCost,
      type: 'course-structure-generation',
    })

    return NextResponse.json({
      success: true,
      ...suggestion,
      estimatedCost,
      model: config.openrouterModel,
    })
  } catch (error) {
    console.error('ai-suggest error', error)
    return NextResponse.json(
      { success: false, error: 'AI generation failed' },
      { status: 500 }
    )
  }
}
```

### Step 3: Cost Tracking Service

```typescript
// lib/ai/costTracking.ts (NEW)

import { supabase } from '@/lib/supabase/client'

export interface CostTrackingRecord {
  userId: string
  model: string
  estimatedCost: number
  actualCost?: number
  type: 'course-structure-generation' | 'lesson-generation' | 'quiz-generation' | 'assessment-generation'
  tokensUsed?: number
  timestamp: string
}

export async function trackCostUsage(record: Omit<CostTrackingRecord, 'timestamp'>) {
  try {
    const { data, error } = await supabase
      .from('ai_usage_tracking')
      .insert([{
        ...record,
        timestamp: new Date().toISOString(),
      }])

    if (error) {
      console.error('Failed to track cost usage:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error tracking cost usage:', error)
    return null
  }
}

export async function getUserTotalCost(userId: string, days = 30) {
  try {
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - days)

    const { data, error } = await supabase
      .from('ai_usage_tracking')
      .select('estimatedCost')
      .eq('userId', userId)
      .gte('timestamp', pastDate.toISOString())

    if (error) {
      console.error('Failed to get user total cost:', error)
      return 0
    }

    return data.reduce((sum, record) => sum + (record.estimatedCost || 0), 0)
  } catch (error) {
    console.error('Error getting user total cost:', error)
    return 0
  }
}
```

---

## 🗄️ Database Schema (Optional Enhancement)

To fully track usage, add this table to Supabase:

```sql
CREATE TABLE ai_usage_tracking (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model VARCHAR NOT NULL,
  estimated_cost DECIMAL(10, 6) NOT NULL,
  actual_cost DECIMAL(10, 6),
  type VARCHAR NOT NULL,
  tokens_used INTEGER,
  timestamp TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ai_usage_user_id ON ai_usage_tracking(user_id);
CREATE INDEX idx_ai_usage_timestamp ON ai_usage_tracking(timestamp);
```

---

## 📋 Implementation Phases

### Phase 3A: Core API Integration (1-2 hours)
- ✅ Create courseGeneration.ts service
- ✅ Update ai-suggest endpoint
- ✅ Test with real OpenRouter API

### Phase 3B: Cost Tracking (1 hour)
- ✅ Create costTracking.ts service
- ✅ Add database schema
- ✅ Integrate tracking into endpoint

### Phase 3C: Streaming Support (2 hours)
- ✅ Add streaming to courseGeneration
- ✅ Update endpoint to handle streams
- ✅ Update UI to display streaming

### Phase 3D: Error Recovery & Fallbacks (1 hour)
- ✅ Implement fallback model logic
- ✅ Handle API timeouts
- ✅ Handle rate limits
- ✅ User-friendly error messages

---

## 🧪 Testing Plan

### Test Cases
1. **Valid Request** - Should generate course structure
2. **Missing API Key** - Should return error
3. **Missing Fields** - Should return validation error
4. **API Timeout** - Should fail gracefully
5. **Model Failure** - Should try fallback model
6. **Cost Tracking** - Should record usage

### Manual Testing
1. Configure OpenRouter API key in admin panel
2. Create a new course
3. Fill in course title and learning outcomes
4. Trigger AI suggestion
5. Verify course structure is generated
6. Check cost tracking in database

---

## ✅ Success Criteria

- ✅ Real AI models used instead of dummy logic
- ✅ OpenRouter integration working end-to-end
- ✅ Cost tracking implemented and accurate
- ✅ Fallback models working when primary fails
- ✅ User-friendly error handling
- ✅ No breaking changes to existing functionality
- ✅ Performance acceptable (< 30 second timeout)

---

## 🚀 Deployment Checklist

- [ ] All code reviewed
- [ ] Tested locally with real API key
- [ ] Database schema deployed (if applicable)
- [ ] Environment variables set for production
- [ ] Cost limits in place (optional safety feature)
- [ ] Error logging configured
- [ ] Monitoring set up for API usage
- [ ] Documentation updated

---

## 📚 Files to Create/Modify

### New Files (Create)
- `lib/ai/courseGeneration.ts` - AI generation service
- `lib/ai/costTracking.ts` - Cost tracking service
- `lib/ai/database.schema.sql` - Database schema (optional)

### Modified Files
- `app/api/course/ai-suggest/route.ts` - Update endpoint

### Future Enhancements (Phase 3C+)
- `lib/ai/streaming.ts` - Streaming support
- `app/create/essentials/page.tsx` - UI updates

---

**Ready to proceed?** Which step would you like to implement first?
