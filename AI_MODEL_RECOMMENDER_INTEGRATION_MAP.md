# 📁 AI MODEL RECOMMENDER - PROJECT STRUCTURE & INTEGRATION MAP

**Date:** November 5, 2025  
**Status:** Complete with implementation guide  
**Files Created:** 1 | Reviewed: 1 | Missing: 10 (with code provided)

---

## 📦 FILE STRUCTURE

```
personal-academy/
│
├── lib/
│   ├── ai/
│   │   ├── model-recommender.ts ✅ CREATED
│   │   │   └── Exports:
│   │   │       ├── getModelRecommendations()
│   │   │       ├── trackRecommendationResponse()
│   │   │       ├── getModelPerformanceStats()
│   │   │       ├── getAllModelPerformanceStats()
│   │   │       └── getComparativeModelAnalysis()
│   │   │
│   │   ├── openrouter.ts (EXISTING)
│   │   ├── streaming.ts (EXISTING)
│   │   └── errorRecovery.ts (EXISTING)
│   │
│   └── supabase/
│       ├── server.ts (EXISTING - provides checkServerAuth)
│       └── client.ts (EXISTING)
│
├── types/
│   ├── instructional-models.ts ⚠️ MISSING
│   │   └── Interfaces:
│   │       ├── CourseInput
│   │       ├── InstructionalModel
│   │       ├── ModelRecommendation
│   │       ├── ModelRecommendationRecord
│   │       └── GenerationMetric
│   │
│   └── index.ts (EXISTING)
│
├── components/
│   ├── ai/
│   │   ├── model-recommender.tsx ⚠️ MISSING (Client component)
│   │   ├── ModelRecommender.tsx ⚠️ MISSING (Alternative name)
│   │   │
│   │   └── (Other AI components)
│   │
│   └── (Other components)
│
├── app/
│   ├── api/
│   │   ├── models/
│   │   │   ├── recommend/
│   │   │   │   └── route.ts ⚠️ MISSING (POST endpoint)
│   │   │   │
│   │   │   ├── track-response/
│   │   │   │   └── route.ts ⚠️ MISSING (POST endpoint)
│   │   │   │
│   │   │   ├── performance/
│   │   │   │   └── route.ts ⚠️ MISSING (GET endpoint)
│   │   │   │
│   │   │   └── (Other model-related routes)
│   │   │
│   │   ├── course/
│   │   │   ├── generate-structure/route.ts (EXISTING)
│   │   │   ├── enhance-outcomes/route.ts (EXISTING)
│   │   │   └── enhance-content/route.ts (EXISTING)
│   │   │
│   │   ├── get-api-key/route.ts (EXISTING)
│   │   └── (Other API routes)
│   │
│   ├── create/
│   │   ├── step1/
│   │   │   └── page.tsx ⚠️ UPDATE NEEDED (Add ModelRecommender component)
│   │   │
│   │   ├── step2/page.tsx (EXISTING)
│   │   ├── step3/page.tsx (EXISTING)
│   │   └── storyboard/page.tsx (EXISTING)
│   │
│   ├── admin/
│   │   ├── models/
│   │   │   └── page.tsx ⚠️ MISSING (Dashboard)
│   │   │
│   │   ├── config/
│   │   │   ├── ai-prompts/page.tsx (EXISTING)
│   │   │   ├── openrouter/page.tsx (EXISTING)
│   │   │   └── (Other config pages)
│   │   │
│   │   └── (Other admin pages)
│   │
│   └── (Other app routes)
│
├── database/
│   ├── tables/
│   │   ├── instructional_model_definitions ⚠️ MISSING TABLE
│   │   ├── ai_model_recommendations ⚠️ MISSING TABLE
│   │   ├── generation_metrics ⚠️ MISSING TABLE
│   │   │
│   │   ├── courses (EXISTING)
│   │   ├── modules (EXISTING)
│   │   ├── lessons (EXISTING)
│   │   ├── slides (EXISTING)
│   │   └── (Other tables)
│   │
│   └── migrations/
│       └── [timestamp]_create_model_recommender_tables.sql ⚠️ MISSING
│
└── docs/
    ├── AI_MODEL_RECOMMENDER_REVIEW.md ✅ CREATED
    ├── AI_MODEL_RECOMMENDER_QUICK_START.md ✅ CREATED
    ├── DATABASE_SCHEMA.md (EXISTING - needs update)
    ├── COMPLETE_DATABASE_SCHEMA_EXPORT.md (EXISTING)
    └── (Other documentation)
```

---

## 🔄 DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                    COURSE CREATION WIZARD                       │
│                      (Step 1: Essentials)                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
        ┌────────────────────────────────────┐
        │  User fills course details:        │
        │  - Title                           │
        │  - Industry                        │
        │  - Duration (value + unit)         │
        │  - Audience Level                  │
        │  - Prior Knowledge                 │
        │  - Course Type                     │
        └────────┬─────────────────┬─────────┘
                 │                 │
                 ▼                 ▼
        ┌──────────────┐  ┌──────────────────────────┐
        │ User clicks  │  │ ModelRecommender          │
        │ "Get Model   │─▶│ component renders         │
        │ Rec."        │  └──────────┬────────────────┘
        └──────────────┘             │
                                     ▼
                        ┌────────────────────────────┐
                        │ POST /api/models/recommend │
                        │ Endpoint (Server-side)     │
                        └────────┬───────────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────────┐
                    │ getModelRecommendations()    │
                    │ (lib/ai/model-recommender)   │
                    └────────┬─────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
   ┌─────────┐         ┌─────────┐         ┌─────────┐
   │ Query   │         │ Score   │         │ Generate│
   │ Models  │         │ Each    │         │ Reason- │
   │ from DB │         │ Model   │         │ ing     │
   │         │         │         │         │         │
   │instructional_model_│         │         │         │
   │definitions         │         │         │         │
   └─────────┘         └─────────┘         └─────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            ▼
            ┌─────────────────────────────────┐
            │ Save to ai_model_recommendations │
            │ Database Table                   │
            └──────────┬──────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────┐
        │ Return JSON:                      │
        │ {                                 │
        │   topRecommendation: {...},      │
        │   alternatives: [...],           │
        │   allScores: {...}               │
        │ }                                 │
        └──────────┬───────────────────────┘
                   │
                   ▼
        ┌──────────────────────────────────┐
        │ ModelRecommender component       │
        │ renders recommendations UI       │
        └──────────┬───────────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
   ┌──────────┐        ┌─────────────┐
   │ User     │        │ User clicks │
   │ reads    │        │ "Use Model" │
   │ reasoning│        │ button      │
   └──────────┘        └──────┬──────┘
                              │
                              ▼
                   ┌──────────────────────┐
                   │ POST /api/models/    │
                   │ track-response       │
                   │ Endpoint             │
                   └──────────┬───────────┘
                              │
                              ▼
                   ┌──────────────────────────┐
                   │ trackRecommendationResponse()
                   │ - Mark as accepted        │
                   │ - Record user choice      │
                   │ - Update database         │
                   └──────────┬────────────────┘
                              │
                              ▼
                   ┌──────────────────────┐
                   │ Model saved to course│
                   │ Proceed to Step 2    │
                   └──────────────────────┘
```

---

## 🔌 API ENDPOINTS

### Endpoint 1: Get Recommendations
```
POST /api/models/recommend

Request:
{
  "courseInput": {
    "courseTitle": "Python for Beginners",
    "industry": "technology",
    "durationValue": 8,
    "durationUnit": "hours",
    "audienceLevel": "beginner",
    "priorKnowledge": "none",
    "courseType": "technical",
    "context": "Learn Python basics"
  },
  "courseId": "abc-123-def"
}

Response:
{
  "topRecommendation": {
    "modelKey": "SAM",
    "modelName": "Successive Approximation Model",
    "score": 92,
    "confidence": 0.92,
    "reasoning": "Perfect for quick 8 hours training | Ideal for short-duration courses",
    "bestFor": ["product-training", "rapid-onboarding"],
    "considerIf": ["rapid training"]
  },
  "alternatives": [
    {
      "modelKey": "ActionMapping",
      "modelName": "Action Mapping",
      "score": 88,
      "confidence": 0.88,
      "reasoning": "Works for quick performance fixes",
      ...
    }
  ],
  "allScores": {
    "ADDIE": 42,
    "SAM": 92,
    "Bloom": 68,
    ...
  },
  "userInputs": {...}
}
```

### Endpoint 2: Track User Response
```
POST /api/models/track-response

Request:
{
  "recommendationId": "rec-123-xyz",
  "userAccepted": true,
  "userSelectedModel": "SAM",
  "userFeedback": "Great recommendation!"
}

Response:
{ "success": true }
```

### Endpoint 3: Get Performance Stats
```
GET /api/models/performance?daysBack=30

Response:
[
  {
    "model": "SAM",
    "sampleSize": 45,
    "avgQuality": 8.7,
    "avgSatisfaction": 8.5,
    "trend": "improving"
  },
  {
    "model": "ADDIE",
    "sampleSize": 32,
    "avgQuality": 7.9,
    "avgSatisfaction": 7.6,
    "trend": "stable"
  },
  ...
]
```

---

## 🗄️ DATABASE SCHEMA ADDITIONS

### Table 1: instructional_model_definitions
```
Columns:
- id: UUID PK
- model_key: TEXT UNIQUE (ADDIE, SAM, Bloom, etc.)
- model_name: TEXT (Full name)
- description: TEXT
- is_active: BOOLEAN (Default: TRUE)
- ideal_for_course_types: TEXT[] (Array of course types)
- ideal_for_audience_levels: TEXT[] (Array of levels)
- characteristics: JSONB (Schema: {best_for[], limitations[], best_duration})
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ

Indexes:
- model_key (UNIQUE)
- is_active

Sample Data (7 rows):
- ADDIE, SAM, Bloom, Gagne, Merrill, ActionMapping, 70-20-10
```

### Table 2: ai_model_recommendations
```
Columns:
- id: UUID PK
- course_id: UUID FK → courses(id)
- user_id: UUID FK → profiles(id)
- user_inputs: JSONB (CourseInput + durationInDays, durationCategory)
- recommended_model: TEXT (Model key)
- confidence_score: DECIMAL(3,2) (0-1)
- reasoning: TEXT (Why this model)
- alternative_models: JSONB (Array of alternatives)
- user_accepted: BOOLEAN (Nullable - tracks if user accepted)
- user_selected_model: TEXT (Which model user actually chose)
- user_feedback: TEXT (User comment)
- user_response_at: TIMESTAMPTZ (When user responded)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ

Indexes:
- course_id
- user_id
- created_at DESC

Foreign Keys:
- course_id → courses(id)
- user_id → profiles(id)
```

### Table 3: generation_metrics
```
Columns:
- id: UUID PK
- course_id: UUID FK → courses(id)
- user_id: UUID FK → profiles(id)
- instructional_model_used: TEXT (Which model was used)
- output_quality_score: DECIMAL(3,1) (1-10 rating)
- user_satisfaction: DECIMAL(3,1) (1-10 rating)
- generation_time_ms: INTEGER (How long generation took)
- tokens_used: INTEGER (AI tokens consumed)
- recorded_at: TIMESTAMPTZ

Indexes:
- instructional_model_used
- recorded_at DESC

Foreign Keys:
- course_id → courses(id)
- user_id → profiles(id)
```

---

## 🔗 INTEGRATION POINTS

### 1. Step 1 Course Creation (`app/create/step1/page.tsx`)
- Add ModelRecommender component after form
- Pass courseInput state
- Handle onModelSelected callback
- Save selected model to course record

### 2. Step 2-4 & Storyboard
- Record which model is being used
- Send metrics to generation_metrics table after generation
- Track quality scores
- Enable model comparison

### 3. Admin Dashboard (`app/admin/models/page.tsx`)
- View all model performance stats
- Compare models side-by-side
- See trend over time
- Filter by date range

### 4. Existing AI Functions
- `lib/ai/openrouter.ts` - No changes needed
- `lib/ai/streaming.ts` - No changes needed
- `lib/utils/slideGenerator.ts` - No changes needed
- All existing code continues to work

---

## 🔐 SECURITY CONSIDERATIONS

### Row-Level Security (RLS)

```sql
-- Public models (readable by all authenticated users)
ALTER TABLE instructional_model_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Models are readable by authenticated users"
  ON instructional_model_definitions FOR SELECT
  TO authenticated USING (is_active = TRUE);

-- Recommendations (user sees only their own)
ALTER TABLE ai_model_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own recommendations"
  ON ai_model_recommendations FOR SELECT
  USING (auth.uid() = user_id);

-- Metrics (only admins can see)
ALTER TABLE generation_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view metrics"
  ON generation_metrics FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );
```

### API Authentication
- All endpoints check `checkServerAuth()` first
- Only authenticated users can access
- Server-side Supabase client used (not browser)
- User ID verified from session

---

## 📊 TESTING WORKFLOW

### Manual Testing Steps:

1. **Database Setup** ✅
   - [ ] Create 3 tables
   - [ ] Seed 7 models
   - [ ] Verify data in Table Editor

2. **Types** ✅
   - [ ] Create types file
   - [ ] Import types in components
   - [ ] No TypeScript errors

3. **API Endpoints** ✅
   - [ ] POST /api/models/recommend works
   - [ ] POST /api/models/track-response works
   - [ ] GET /api/models/performance works

4. **Component** ✅
   - [ ] Component renders without errors
   - [ ] Shows recommendation
   - [ ] Shows alternatives
   - [ ] Buttons work

5. **Integration** ✅
   - [ ] Added to Step 1
   - [ ] Appears after form submission
   - [ ] Can select model
   - [ ] Model saved to course

6. **Admin Dashboard** ✅
   - [ ] Dashboard page loads
   - [ ] Shows all model stats
   - [ ] Displays performance trends

---

## 📈 SCALING & PERFORMANCE

### Optimization Opportunities:

1. **Caching** - Cache model definitions (rarely change)
2. **Batch Operations** - Get all models once, not per request
3. **Aggregation** - Pre-aggregate performance metrics daily
4. **Indexing** - Already included in schema
5. **Pagination** - Add to getAllModelPerformanceStats()

### Monitoring:

- Track API response times
- Monitor database query times
- Alert on model recommendation failures
- Track user acceptance rates per model
- Measure quality score trends

---

## 🚀 FUTURE ENHANCEMENTS

1. **Machine Learning Integration**
   - Train model to predict user preference
   - Weight recommendations based on historical data
   - Improve scoring algorithm over time

2. **A/B Testing**
   - Test different recommendation algorithms
   - Measure impact on user satisfaction
   - Track course quality by model

3. **Model Comparison Tool**
   - Side-by-side model comparison
   - What-if scenarios
   - Detailed breakdowns by factor

4. **Advanced Analytics**
   - Cohort analysis
   - Funnel from recommendation to completion
   - ROI by model
   - User feedback sentiment analysis

5. **Integration with AI Generation**
   - Use selected model to inform slide generation
   - Customize prompts based on model principles
   - Track model performance in final output

---

## ✅ IMPLEMENTATION CHECKLIST

**Phase 1: Database & Types (30 minutes)**
- [ ] Create 3 database tables
- [ ] Seed 7 instructional models
- [ ] Create types/instructional-models.ts
- [ ] Export types in types/index.ts

**Phase 2: API Endpoints (45 minutes)**
- [ ] Create app/api/models/recommend/route.ts
- [ ] Create app/api/models/track-response/route.ts
- [ ] Create app/api/models/performance/route.ts
- [ ] Test all endpoints with Postman

**Phase 3: React Component (45 minutes)**
- [ ] Create components/ai/ModelRecommender.tsx
- [ ] Style with Tailwind
- [ ] Handle loading/error states
- [ ] Test component in isolation

**Phase 4: Integration (60 minutes)**
- [ ] Update app/create/step1/page.tsx
- [ ] Add ModelRecommender component
- [ ] Save model selection to database
- [ ] Test end-to-end flow

**Phase 5: Admin Dashboard (45 minutes)**
- [ ] Create app/admin/models/page.tsx
- [ ] Add navigation to admin panel
- [ ] Display performance stats
- [ ] Add filtering/sorting

**Phase 6: Monitoring & Optimization (30 minutes)**
- [ ] Add error logging
- [ ] Monitor performance
- [ ] Optimize queries
- [ ] Document in admin guide

**Total Time: 4-5 hours**

---

**All files, code, and implementation details provided!** Ready to build! 🚀
