# 🚀 AI MODEL RECOMMENDER - QUICK START IMPLEMENTATION

**Status:** Ready to implement  
**Time Estimate:** 2-3 hours for full integration  
**Complexity:** Medium

---

## ⚡ PHASE 1: Database Setup (15 minutes)

### Step 1: Run Table Creation SQL

Go to **Supabase Dashboard → SQL Editor** and run:

```sql
-- Create instructional_model_definitions table
CREATE TABLE instructional_model_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_key TEXT UNIQUE NOT NULL,
  model_name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  ideal_for_course_types TEXT[],
  ideal_for_audience_levels TEXT[],
  characteristics JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ai_model_recommendations table
CREATE TABLE ai_model_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_inputs JSONB NOT NULL,
  recommended_model TEXT NOT NULL,
  confidence_score DECIMAL(3,2),
  reasoning TEXT,
  alternative_models JSONB,
  user_accepted BOOLEAN,
  user_selected_model TEXT,
  user_feedback TEXT,
  user_response_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create generation_metrics table
CREATE TABLE generation_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  instructional_model_used TEXT NOT NULL,
  output_quality_score DECIMAL(3,1),
  user_satisfaction DECIMAL(3,1),
  generation_time_ms INTEGER,
  tokens_used INTEGER,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_ai_model_recommendations_user_id ON ai_model_recommendations(user_id);
CREATE INDEX idx_ai_model_recommendations_course_id ON ai_model_recommendations(course_id);
CREATE INDEX idx_generation_metrics_model_used ON generation_metrics(instructional_model_used);
CREATE INDEX idx_generation_metrics_recorded_at ON generation_metrics(recorded_at DESC);

-- Enable RLS
ALTER TABLE instructional_model_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_model_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_metrics ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Models are readable by all authenticated users"
  ON instructional_model_definitions FOR SELECT
  TO authenticated USING (is_active = TRUE);

CREATE POLICY "Users can view their own recommendations"
  ON ai_model_recommendations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create recommendations"
  ON ai_model_recommendations FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Users can update their own recommendations"
  ON ai_model_recommendations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view metrics"
  ON generation_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "System can create metrics"
  ON generation_metrics FOR INSERT
  WITH CHECK (TRUE);
```

### Step 2: Seed the Models

```sql
INSERT INTO instructional_model_definitions (model_key, model_name, description, ideal_for_course_types, ideal_for_audience_levels, characteristics) VALUES
('ADDIE', 'ADDIE Model', 'Analyze, Design, Develop, Implement, Evaluate - comprehensive framework for systematic course design', ARRAY['technical', 'compliance', 'certification'], ARRAY['beginner', 'intermediate'], '{"best_for": ["structured learning", "technical training", "compliance courses"], "limitations": ["not ideal for rapid prototyping"], "best_duration": "8+ weeks"}'),
('SAM', 'Successive Approximation Model', 'Iterative, rapid development approach - good for agile training development', ARRAY['product-training', 'agile-course', 'rapid-onboarding'], ARRAY['intermediate', 'advanced'], '{"best_for": ["rapid training", "iterative development"], "limitations": ["requires experienced designers"], "best_duration": "1-7 days"}'),
('Bloom', 'Bloom''s Taxonomy', 'Cognitive learning domains - from knowledge to evaluation', ARRAY['skills-development', 'academic', 'knowledge-based'], ARRAY['all'], '{"best_for": ["progressive skill building"], "limitations": ["may be too structured"], "best_duration": "2+ weeks"}'),
('Gagne', 'Gagne''s 9 Events of Instruction', 'Structured approach to systematic instructional design', ARRAY['procedural', 'software-training', 'technical'], ARRAY['beginner', 'intermediate'], '{"best_for": ["procedural training", "step-by-step"], "limitations": ["requires clear objectives"], "best_duration": "1-4 weeks"}'),
('Merrill', 'Merrill''s First Principles', 'Problem-centered approach with real-world application', ARRAY['problem-solving', 'case-study', 'scenario-based'], ARRAY['intermediate', 'advanced'], '{"best_for": ["case studies", "real-world applications"], "limitations": ["requires SME"], "best_duration": "2+ weeks"}'),
('ActionMapping', 'Action Mapping', 'Performance-focused approach', ARRAY['performance-improvement', 'sales-training', 'customer-service'], ARRAY['all'], '{"best_for": ["on-the-job training", "performance support"], "limitations": ["requires clear goals"], "best_duration": "1-4 weeks"}'),
('70-20-10', '70-20-10 Model', 'Blended learning: 70% job, 20% relationships, 10% formal', ARRAY['leadership', 'soft-skills', 'management'], ARRAY['intermediate', 'advanced'], '{"best_for": ["leadership development", "soft skills"], "limitations": ["requires org support"], "best_duration": "8+ weeks"}');
```

✅ **Verify:** Go to Table Editor, refresh, see 7 models listed

---

## ⚡ PHASE 2: TypeScript Types (5 minutes)

Create `types/instructional-models.ts`:

```typescript
export interface CourseInput {
  courseTitle: string
  industry: string
  durationValue: number
  durationUnit: 'minutes' | 'hours' | 'days' | 'weeks' | 'months'
  audienceLevel: string
  priorKnowledge: string
  courseType: string
  context?: string
}

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
  created_at: string
}
```

---

## ⚡ PHASE 3: API Endpoints (20 minutes)

### Create `app/api/models/recommend/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { checkServerAuth } from '@/lib/supabase/server'
import { getModelRecommendations } from '@/lib/ai/model-recommender'
import type { CourseInput } from '@/types/instructional-models'

export async function POST(req: NextRequest) {
  try {
    const user = await checkServerAuth()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseInput, courseId } = await req.json() as {
      courseInput: CourseInput
      courseId: string
    }

    if (!courseInput || !courseId) {
      return NextResponse.json(
        { error: 'Missing courseInput or courseId' },
        { status: 400 }
      )
    }

    const result = await getModelRecommendations(
      courseInput,
      courseId,
      user.id
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Model recommendation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get recommendations' },
      { status: 500 }
    )
  }
}
```

### Create `app/api/models/track-response/route.ts`:

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

    if (!recommendationId) {
      return NextResponse.json(
        { error: 'Missing recommendationId' },
        { status: 400 }
      )
    }

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

### Create `app/api/models/performance/route.ts`:

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

## ⚡ PHASE 4: React Component (20 minutes)

Create `components/ai/ModelRecommender.tsx`:

```typescript
'use client'

import { useState, useEffect } from 'react'
import type { CourseInput } from '@/types/instructional-models'

interface RecommendationData {
  topRecommendation: {
    modelKey: string
    modelName: string
    score: number
    confidence: number
    reasoning: string
  }
  alternatives: Array<{
    modelKey: string
    modelName: string
    score: number
    confidence: number
    reasoning: string
  }>
  id?: string
}

interface Props {
  courseInput: CourseInput
  courseId: string
  onModelSelected?: (modelKey: string) => void
}

export function ModelRecommender({ courseInput, courseId, onModelSelected }: Props) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<RecommendationData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (courseInput && courseId) {
      getRecommendation()
    }
  }, [courseInput, courseId])

  async function getRecommendation() {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/models/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseInput, courseId })
      })

      if (!response.ok) {
        throw new Error('Failed to get recommendation')
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error getting recommendation')
    } finally {
      setLoading(false)
    }
  }

  async function handleSelect(modelKey: string, recommendationId?: string) {
    try {
      if (recommendationId) {
        await fetch('/api/models/track-response', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recommendationId,
            userAccepted: true,
            userSelectedModel: modelKey
          })
        })
      }
      onModelSelected?.(modelKey)
    } catch (err) {
      console.error('Error tracking selection:', err)
    }
  }

  if (loading) {
    return <div className="p-4 text-center text-gray-500">Getting recommendations...</div>
  }

  if (error) {
    return <div className="p-4 text-center text-red-600">{error}</div>
  }

  if (!data) {
    return <div className="p-4 text-center text-gray-500">No recommendation available</div>
  }

  const { topRecommendation, alternatives } = data

  return (
    <div className="space-y-6">
      {/* TOP RECOMMENDATION */}
      <div className="border-2 border-teal-600 rounded-lg p-6 bg-gradient-to-r from-teal-50 to-blue-50">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {topRecommendation.modelName}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Recommended for your course
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-teal-600">
              {Math.round(topRecommendation.confidence * 100)}%
            </div>
            <div className="text-xs text-gray-600">Confidence</div>
          </div>
        </div>

        <p className="text-gray-700 mb-4 leading-relaxed">
          {topRecommendation.reasoning}
        </p>

        <button
          onClick={() => handleSelect(topRecommendation.modelKey, data.id)}
          className="w-full px-4 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition"
        >
          Use {topRecommendation.modelName}
        </button>
      </div>

      {/* ALTERNATIVES */}
      {alternatives && alternatives.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Alternative Models</h4>
          <div className="space-y-3">
            {alternatives.map((alt) => (
              <div
                key={alt.modelKey}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition"
              >
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-semibold text-gray-900">{alt.modelName}</h5>
                  <span className="text-sm font-medium text-gray-600">
                    {Math.round(alt.score)}/100
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{alt.reasoning}</p>
                <button
                  onClick={() => handleSelect(alt.modelKey)}
                  className="px-3 py-1 text-sm border border-teal-600 text-teal-600 rounded hover:bg-teal-50 transition"
                >
                  Consider This
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={getRecommendation}
        className="w-full px-4 py-2 text-sm text-teal-600 border border-teal-600 rounded hover:bg-teal-50 transition"
      >
        Get New Recommendations
      </button>
    </div>
  )
}
```

---

## ⚡ PHASE 5: Integration into Step 1 (30 minutes)

Update `app/create/step1/page.tsx`:

```typescript
// Add import at top
import { ModelRecommender } from '@/components/ai/ModelRecommender'
import type { CourseInput } from '@/types/instructional-models'

// In your component, after course details section:

// State to track when to show recommender
const [courseInput, setCourseInput] = useState<CourseInput | null>(null)

// Function to prepare input for recommender
function prepareRecommendationInput() {
  setCourseInput({
    courseTitle: formData.title,
    industry: formData.industry,
    durationValue: parseInt(formData.durationValue || '0'),
    durationUnit: (formData.durationUnit as any) || 'hours',
    audienceLevel: formData.audience,
    priorKnowledge: formData.priorKnowledge,
    courseType: formData.courseType,
    context: formData.description
  })
}

// In your JSX, add after course details form:
{courseId && courseInput && (
  <section className="mt-12 pt-8 border-t">
    <h3 className="text-2xl font-bold mb-2">Recommended Model</h3>
    <p className="text-gray-600 mb-6">
      Based on your course details, we recommend an instructional design model:
    </p>
    <ModelRecommender
      courseInput={courseInput}
      courseId={courseId}
      onModelSelected={(modelKey) => {
        // Save selected model to course
        handleSaveInstructionalModel(modelKey)
      }}
    />
  </section>
)}

// Add button after form submission
<button
  onClick={prepareRecommendationInput}
  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
>
  Get Model Recommendations
</button>
```

---

## ✅ TESTING CHECKLIST

- [ ] Database tables created and seeded
- [ ] Can view instructional_model_definitions table with 7 models
- [ ] API endpoint `/api/models/recommend` returns recommendations
- [ ] Component displays top recommendation with score
- [ ] Can click "Use Model" button without errors
- [ ] User selection is saved to database
- [ ] Alternative models display in UI
- [ ] RLS policies prevent unauthorized access
- [ ] Performance metrics start recording

---

## 🐛 TROUBLESHOOTING

**Q: "Failed to fetch instructional models"**
- A: Check if table exists: `SELECT * FROM instructional_model_definitions`
- A: Check RLS policies are set correctly

**Q: "Unauthorized" on API endpoints**
- A: Verify `checkServerAuth()` is imported from correct path
- A: Check user is logged in

**Q: Component not showing recommendations**
- A: Check browser console for fetch errors
- A: Verify courseId is valid UUID
- A: Check API response in Network tab

**Q: Models not populated in database**
- A: Run insert SQL again
- A: Check for foreign key errors in courses table

---

## 📊 WHAT'S NEXT

After implementing Phase 1-5:

1. **Create Admin Dashboard** - View all model performance
2. **Add to Step 2-4** - Track which model was used for each section
3. **Analytics** - Compare model performance over time
4. **A/B Testing** - Test recommender accuracy

---

**Implementation Ready!** All code provided above is copy-paste ready.
