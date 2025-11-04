# 🔍 AI MODEL RECOMMENDER - COMPREHENSIVE REVIEW

**File Created:** `lib/ai/model-recommender.ts`  
**Date:** November 5, 2025  
**Status:** ✅ File Created + Review Complete

---

## 📋 SUMMARY OF ENHANCEMENTS MADE

### ✅ Bug Fixed
1. **Line 117:** Changed `topRecommendation: sortedRecommendations` → `topRecommendation: sortedRecommendations[0]`
   - Was returning entire array instead of the top model
   - Now correctly returns the single highest-scoring model

### ✅ Improvements Added
1. **Enhanced error handling** in `trackRecommendationResponse()`
   - Added try-catch block
   - Added `user_response_at` timestamp tracking

2. **New function:** `getAllModelPerformanceStats()`
   - Get stats for ALL models at once instead of one-by-one
   - Better for dashboard/analytics views

3. **New function:** `getComparativeModelAnalysis()`
   - Compare multiple models side-by-side
   - Great for decision-making UI

---

## ❌ MISSING ITEMS - CRITICAL FOR YOUR PROJECT

### 1️⃣ **MISSING: Database Tables**

Your file references 3 tables that DON'T exist yet:

**Table 1: `instructional_model_definitions`** ❌
```sql
CREATE TABLE instructional_model_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_key TEXT UNIQUE NOT NULL, -- 'ADDIE', 'SAM', 'Bloom', etc.
  model_name TEXT NOT NULL, -- Full name
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  ideal_for_course_types TEXT[], -- Array of course types
  ideal_for_audience_levels TEXT[], -- Array of audience levels
  characteristics JSONB, -- {best_for: [...], limitations: [...]}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Table 2: `ai_model_recommendations`** ❌
```sql
CREATE TABLE ai_model_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_inputs JSONB NOT NULL, -- CourseInput + converted values
  recommended_model TEXT NOT NULL, -- Model key
  confidence_score DECIMAL(3,2), -- 0-1
  reasoning TEXT,
  alternative_models JSONB, -- Array of {model, score, reason}
  user_accepted BOOLEAN,
  user_selected_model TEXT,
  user_feedback TEXT,
  user_response_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Table 3: `generation_metrics`** ❌
```sql
CREATE TABLE generation_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  instructional_model_used TEXT NOT NULL,
  output_quality_score DECIMAL(3,1), -- 1-10
  user_satisfaction DECIMAL(3,1), -- 1-10
  generation_time_ms INTEGER,
  tokens_used INTEGER,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 2️⃣ **MISSING: Type Definitions**

Create `types/instructional-models.ts`:

```typescript
export interface InstructionalModel {
  id: string
  model_key: string
  model_name: string
  description: string
  is_active: boolean
  ideal_for_course_types: string[]
  ideal_for_audience_levels: string[]
  characteristics: {
    best_for: string[]
    limitations: string[]
    best_duration: string
  }
  created_at: string
  updated_at: string
}

export interface ModelRecommendationRecord {
  id: string
  course_id: string
  user_id: string
  user_inputs: CourseInput & {
    durationInDays: number
    durationCategory: string
  }
  recommended_model: string
  confidence_score: number
  reasoning: string
  alternative_models: Array<{
    model: string
    score: number
    reason: string
  }>
  user_accepted: boolean | null
  user_selected_model: string | null
  user_feedback: string | null
  user_response_at: string | null
  created_at: string
  updated_at: string
}

export interface GenerationMetric {
  id: string
  course_id: string
  user_id: string
  instructional_model_used: string
  output_quality_score: number
  user_satisfaction: number
  generation_time_ms: number
  tokens_used: number
  recorded_at: string
}
```

---

### 3️⃣ **MISSING: API Endpoints**

Create `app/api/models/recommend/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { checkServerAuth } from '@/lib/supabase/server'
import { getModelRecommendations } from '@/lib/ai/model-recommender'

export async function POST(req: NextRequest) {
  try {
    const user = await checkServerAuth()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseInput, courseId } = await req.json()

    const result = await getModelRecommendations(
      courseInput,
      courseId,
      user.id
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Model recommendation error:', error)
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    )
  }
}
```

Create `app/api/models/track-response/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { checkServerAuth } from '@/lib/supabase/server'
import { trackRecommendationResponse } from '@/lib/ai/model-recommender'

export async function POST(req: NextRequest) {
  try {
    const user = await checkServerAuth()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { recommendationId, userAccepted, userSelectedModel, userFeedback } = await req.json()

    await trackRecommendationResponse(
      recommendationId,
      userAccepted,
      userSelectedModel,
      userFeedback
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Track response error:', error)
    return NextResponse.json(
      { error: 'Failed to track response' },
      { status: 500 }
    )
  }
}
```

Create `app/api/models/performance/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { checkServerAuth } from '@/lib/supabase/server'
import { getAllModelPerformanceStats } from '@/lib/ai/model-recommender'

export async function GET(req: NextRequest) {
  try {
    const user = await checkServerAuth()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const daysBack = req.nextUrl.searchParams.get('daysBack')
    const stats = await getAllModelPerformanceStats(
      daysBack ? parseInt(daysBack) : 30
    )

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Performance stats error:', error)
    return NextResponse.json(
      { error: 'Failed to get performance stats' },
      { status: 500 }
    )
  }
}
```

---

### 4️⃣ **MISSING: React Component Integration**

Create `components/ai/ModelRecommender.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { CourseInput, ModelRecommendation } from '@/lib/ai/model-recommender'

interface Props {
  courseId: string
  onRecommendationAccepted?: (model: string) => void
}

export function ModelRecommender({ courseId, onRecommendationAccepted }: Props) {
  const [loading, setLoading] = useState(false)
  const [recommendation, setRecommendation] = useState<ModelRecommendation | null>(null)
  const [alternatives, setAlternatives] = useState<ModelRecommendation[]>([])

  async function handleGetRecommendation(courseInput: CourseInput) {
    setLoading(true)
    try {
      const response = await fetch('/api/models/recommend', {
        method: 'POST',
        body: JSON.stringify({ courseInput, courseId })
      })
      
      const result = await response.json()
      setRecommendation(result.topRecommendation)
      setAlternatives(result.alternatives)
    } catch (error) {
      console.error('Error getting recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAccept(model: string) {
    try {
      await fetch('/api/models/track-response', {
        method: 'POST',
        body: JSON.stringify({
          recommendationId: recommendation?.modelKey,
          userAccepted: true,
          userSelectedModel: model
        })
      })
      onRecommendationAccepted?.(model)
    } catch (error) {
      console.error('Error tracking response:', error)
    }
  }

  return (
    <div className="space-y-6">
      {recommendation && (
        <div className="border rounded-lg p-6 bg-gradient-to-r from-teal-50 to-blue-50">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {recommendation.modelName}
          </h3>
          <p className="text-gray-700 mb-4">{recommendation.reasoning}</p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Confidence: {Math.round(recommendation.confidence * 100)}%
            </span>
            <button
              onClick={() => handleAccept(recommendation.modelKey)}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              Use This Model
            </button>
          </div>
        </div>
      )}

      {alternatives.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-700">Alternative Models</h4>
          {alternatives.map((alt) => (
            <div key={alt.modelKey} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h5 className="font-medium">{alt.modelName}</h5>
                <span className="text-sm text-gray-500">
                  {Math.round(alt.score)}/100
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{alt.reasoning}</p>
              <button
                onClick={() => handleAccept(alt.modelKey)}
                className="px-3 py-1 text-sm border border-teal-600 text-teal-600 rounded hover:bg-teal-50"
              >
                Consider
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

### 5️⃣ **MISSING: Integration into Step 1**

Update `app/create/step1/page.tsx` to include model recommendation:

```typescript
// Add this after course essentials are filled
import { ModelRecommender } from '@/components/ai/ModelRecommender'

// In your component JSX:
<section className="mt-8 pt-8 border-t">
  <h3 className="text-lg font-semibold mb-4">Instructional Model</h3>
  <p className="text-gray-600 mb-6">
    Based on your course details, we recommend an instructional design model.
  </p>
  <ModelRecommender 
    courseId={courseId}
    onRecommendationAccepted={(model) => {
      // Save selected model to course
      handleSaveInstructionalModel(model)
    }}
  />
</section>
```

---

### 6️⃣ **MISSING: Admin Dashboard for Models**

Create `app/admin/models/page.tsx`:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { getAllModelPerformanceStats } from '@/lib/ai/model-recommender'

export default function ModelsAdminPage() {
  const [stats, setStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await fetch('/api/models/performance?daysBack=30')
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Instructional Model Performance</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((model) => (
          <div key={model.model} className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">{model.model}</h3>
            <div className="space-y-1 text-sm">
              <p className="text-gray-600">
                Quality: <span className="font-semibold">{model.avgQuality}/10</span>
              </p>
              <p className="text-gray-600">
                Satisfaction: <span className="font-semibold">{model.avgSatisfaction}/10</span>
              </p>
              <p className="text-gray-600">
                Sample Size: <span className="font-semibold">{model.sampleSize}</span>
              </p>
              <p className="text-gray-600">
                Trend: <span className="font-semibold">{model.trend}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

### 7️⃣ **MISSING: Database Seed Data**

Create `supabase_seed_instructional_models.sql`:

```sql
INSERT INTO instructional_model_definitions (model_key, model_name, description, ideal_for_course_types, ideal_for_audience_levels, characteristics) VALUES
('ADDIE', 'ADDIE Model', 
 'Analyze, Design, Develop, Implement, Evaluate - comprehensive framework for systematic course design',
 ARRAY['technical', 'compliance', 'certification'],
 ARRAY['beginner', 'intermediate'],
 '{
   "best_for": ["structured learning", "technical training", "compliance courses"],
   "limitations": ["not ideal for rapid prototyping", "requires detailed analysis"],
   "best_duration": "8+ weeks"
 }'),

('SAM', 'Successive Approximation Model',
 'Iterative, rapid development approach - good for agile training development',
 ARRAY['product-training', 'agile-course', 'rapid-onboarding'],
 ARRAY['intermediate', 'advanced'],
 '{
   "best_for": ["rapid training", "iterative development", "changing requirements"],
   "limitations": ["requires experienced instructional designers", "less structured"],
   "best_duration": "1-7 days"
 }'),

('Bloom', 'Bloom''s Taxonomy',
 'Cognitive learning domains - from knowledge to evaluation for comprehensive skill development',
 ARRAY['skills-development', 'academic', 'knowledge-based'],
 ARRAY['all'],
 '{
   "best_for": ["progressive skill building", "knowledge assessment", "academic courses"],
   "limitations": ["may be too structured for some creative courses"],
   "best_duration": "2+ weeks"
 }'),

('Gagne', 'Gagne''s 9 Events of Instruction',
 'Structured approach to systematic instructional design with clear phases',
 ARRAY['procedural', 'software-training', 'technical'],
 ARRAY['beginner', 'intermediate'],
 '{
   "best_for": ["procedural training", "step-by-step learning", "skills development"],
   "limitations": ["requires clear learning objectives"],
   "best_duration": "1-4 weeks"
 }'),

('Merrill', 'Merrill''s First Principles of Instruction',
 'Problem-centered approach with real-world application emphasis',
 ARRAY['problem-solving', 'case-study', 'scenario-based'],
 ARRAY['intermediate', 'advanced'],
 '{
   "best_for": ["case studies", "problem-solving", "real-world applications"],
   "limitations": ["requires subject matter expertise", "more complex to design"],
   "best_duration": "2+ weeks"
 }'),

('ActionMapping', 'Action Mapping',
 'Performance-focused approach - focus on what learners need to DO, not what they need to KNOW',
 ARRAY['performance-improvement', 'sales-training', 'customer-service'],
 ARRAY['all'],
 '{
   "best_for": ["on-the-job training", "performance support", "quick reference materials"],
   "limitations": ["requires clear performance goals"],
   "best_duration": "1 day - 4 weeks"
 }'),

('70-20-10', '70-20-10 Model',
 'Blended learning approach - 70% job experience, 20% relationships, 10% formal learning',
 ARRAY['leadership', 'soft-skills', 'management'],
 ARRAY['intermediate', 'advanced'],
 '{
   "best_for": ["leadership development", "soft skills", "long-term skill building"],
   "limitations": ["requires organizational support", "not for immediate needs"],
   "best_duration": "8+ weeks"
 }');
```

---

### 8️⃣ **MISSING: Error Handling & Validation**

Add to `lib/ai/model-recommender.ts`:

```typescript
/**
 * Validate CourseInput before processing
 */
export function validateCourseInput(input: CourseInput): string[] {
  const errors: string[] = []

  if (!input.courseTitle?.trim()) {
    errors.push('Course title is required')
  }

  if (!input.industry?.trim()) {
    errors.push('Industry is required')
  }

  if (input.durationValue <= 0) {
    errors.push('Duration must be greater than 0')
  }

  if (!['minutes', 'hours', 'days', 'weeks', 'months'].includes(input.durationUnit)) {
    errors.push('Invalid duration unit')
  }

  if (!input.audienceLevel?.trim()) {
    errors.push('Audience level is required')
  }

  if (!input.courseType?.trim()) {
    errors.push('Course type is required')
  }

  return errors
}

// Update getModelRecommendations to validate:
export async function getModelRecommendations(
  courseInput: CourseInput,
  courseId?: string,
  userId?: string
): Promise<RecommendationResult> {
  // Add validation
  const validationErrors = validateCourseInput(courseInput)
  if (validationErrors.length > 0) {
    throw new Error(`Validation failed: ${validationErrors.join(', ')}`)
  }

  // ... rest of function
}
```

---

### 9️⃣ **MISSING: RLS Policies**

Add to your database setup:

```sql
-- ai_model_recommendations RLS policies
CREATE POLICY "Users can view their own recommendations"
  ON ai_model_recommendations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create recommendations"
  ON ai_model_recommendations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own recommendations"
  ON ai_model_recommendations FOR UPDATE
  USING (auth.uid() = user_id);

-- generation_metrics RLS policies
CREATE POLICY "Admins can view all metrics"
  ON generation_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

CREATE POLICY "System can create metrics"
  ON generation_metrics FOR INSERT
  WITH CHECK (true);

ALTER TABLE ai_model_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_metrics ENABLE ROW LEVEL SECURITY;
```

---

### 🔟 **MISSING: Testing Utilities**

Create `lib/ai/__tests__/model-recommender.test.ts`:

```typescript
import { 
  getModelRecommendations, 
  validateCourseInput,
  convertDurationToDays 
} from '../model-recommender'

describe('Model Recommender', () => {
  describe('Duration conversion', () => {
    it('converts minutes to days', () => {
      const result = convertDurationToDays(60, 'minutes')
      expect(result).toBeCloseTo(1/24, 5)
    })

    it('converts hours to days', () => {
      const result = convertDurationToDays(8, 'hours')
      expect(result).toBeCloseTo(1/3, 5)
    })

    it('converts weeks to days', () => {
      const result = convertDurationToDays(2, 'weeks')
      expect(result).toBe(14)
    })
  })

  describe('Input validation', () => {
    it('rejects empty course title', () => {
      const input = {
        courseTitle: '',
        industry: 'tech',
        durationValue: 8,
        durationUnit: 'hours',
        audienceLevel: 'beginner',
        priorKnowledge: 'none',
        courseType: 'technical'
      }
      const errors = validateCourseInput(input)
      expect(errors).toContain('Course title is required')
    })

    it('rejects invalid duration', () => {
      const input = {
        courseTitle: 'Python 101',
        industry: 'tech',
        durationValue: -5,
        durationUnit: 'hours',
        audienceLevel: 'beginner',
        priorKnowledge: 'none',
        courseType: 'technical'
      }
      const errors = validateCourseInput(input)
      expect(errors).toContain('Duration must be greater than 0')
    })
  })
})
```

---

## 📊 IMPLEMENTATION CHECKLIST

- [ ] Create 3 database tables (instructional_model_definitions, ai_model_recommendations, generation_metrics)
- [ ] Create types in `types/instructional-models.ts`
- [ ] Create 3 API endpoints (recommend, track-response, performance)
- [ ] Create ModelRecommender React component
- [ ] Integrate into Step 1 of course creation wizard
- [ ] Create admin dashboard for model performance
- [ ] Seed database with 7 instructional models
- [ ] Add input validation to model-recommender.ts
- [ ] Add RLS policies to Supabase
- [ ] Add tests for model-recommender functions
- [ ] Update `DATABASE_SCHEMA.md` with new tables
- [ ] Add documentation to admin panel

---

## 🎯 PRIORITY ORDER (PHASE ROLLOUT)

**Phase 1 - Foundation (Day 1):**
- ✅ Database tables created
- ✅ Seed data inserted
- ✅ API endpoints created

**Phase 2 - Integration (Day 2):**
- ✅ React component created
- ✅ Integrated into Step 1
- ✅ Basic testing working

**Phase 3 - Analytics (Day 3):**
- ✅ Admin dashboard
- ✅ Performance tracking
- ✅ Model comparison views

---

## 🚀 NEXT STEPS

1. **Run SQL to create tables** - Use seed data provided
2. **Export TypeScript types** - `npx supabase gen types`
3. **Create API endpoints** - Copy-paste provided code
4. **Build React component** - Use provided component
5. **Test end-to-end** - Get recommendations → Accept/Reject → Track response

---

**Review Complete!** All 10 missing components identified with code examples ready to implement.
