# Module Duration Calculation Analysis & Implementation Plan

**Date:** November 3, 2025  
**Status:** Analysis Complete - Ready for Implementation

---

## 1. REQUEST ANALYSIS

**Goal:** Calculate approximate module duration based on user selections from Step 1 (Essentials) and Step 2 (Multimedia) and display it throughout the course creation flow.

**Key Points:**
- Duration should be calculated from selections in Steps 1-2
- Should update all module durations (not just one)
- Display as "Approx: X minutes" format
- Update both:
  - Individual module duration fields in Step 3 (modules page)
  - Top stats badge showing total Duration

---

## 2. DATA SOURCES

### Step 1 (Essentials) - `app/create/essentials/page.tsx`
User inputs that impact duration:
```
- duration: number (minutes - base course duration, default 30)
- durationUnit: 'minutes' | 'hours'
- approxModules: string (e.g., 'let-ai-decide', '5', '10')
- approxLessonsPerModule: string (e.g., 'let-ai-decide', '3', '5')
- methodology: string (e.g., 'let-ai-decide', specific methodology)
- knowledgeLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
- targetAudience: string
- learningOutcomes: string
```

### Step 2 (Multimedia) - `app/create/multimedia/page.tsx`
Multimedia selections that impact duration:
```
- courseType: 'simple' | 'interactive' | 'highly_interactive' | 'scenario_driven'
- quizOption: 'every_module' | 'end_of_course' | 'pre_post' | 'ai_decide'
- selectedOptions:
  - audioNarration: boolean
  - imageGeneration: boolean
  - videoContent: boolean
  - knowledgeAssessments: boolean
  - animationMotion: boolean
```

### Current Storage
- **Database:** Supabase `courses` table
- **Fields:** `duration` (integer, minutes), `methodology`, `knowledge_level`
- **Status:** Step 2 selections currently NOT persisted to database
- **Action Needed:** Need to either:
  1. Fetch from Step 2 state (if user navigates back)
  2. Store Step 2 selections in database (recommended)

---

## 3. DURATION CALCULATION ALGORITHM

### Formula
```
Approximate Duration = Base Duration × Complexity Multiplier

Where:
- Base Duration = Step 1 duration (in minutes)
- Complexity Multiplier = courseType × multimediaOptions × quizStrategy
```

### Multiplier Breakdown

#### A. Course Type Complexity (1.0 - 1.5x)
```
- 'simple' (text-based):           1.0x  (no additional time)
- 'interactive':                   1.15x (+15% time for interactions)
- 'highly_interactive':            1.30x (+30% for rich interactions)
- 'scenario_driven':               1.50x (+50% for branching/decisions)
```

#### B. Multimedia Elements (+5-20% per selection)
Each selected feature adds time for creation/narration/assessments:
```
- audioNarration:      +10% (voiceover scripts add narration time)
- imageGeneration:     +5%  (less time, mostly visual)
- videoContent:        +15% (most time-intensive)
- knowledgeAssessments:+20% (quiz/assessment creation time)
- animationMotion:     +10% (animation add complexity)
```

#### C. Quiz Strategy
```
- 'every_module':      base + 20% (assessments every module)
- 'end_of_course':     base + 5%  (single assessment)
- 'pre_post':          base + 10% (pre-course + post-course)
- 'ai_decide':         base + 12% (average between strategies)
```

### Example Calculations

**Example 1: Simple Text-Based Course**
- Base: 30 minutes
- Type: 'simple' = 1.0x
- Options: none selected = 0%
- Quiz: 'ai_decide' = +12%
- Result: 30 × 1.0 × (1 + 0) × 1.12 = **33.6 ≈ 34 minutes**

**Example 2: Highly Interactive with Audio & Video**
- Base: 60 minutes
- Type: 'highly_interactive' = 1.30x
- Options: audio (+10%) + video (+15%) = +25%
- Quiz: 'every_module' = +20%
- Result: 60 × 1.30 × (1 + 0.25) × 1.20 = **117 minutes**

**Example 3: Scenario-Driven with All Options**
- Base: 45 minutes
- Type: 'scenario_driven' = 1.50x
- Options: audio (+10%) + images (+5%) + video (+15%) + assessments (+20%) + animation (+10%) = +60%
- Quiz: 'pre_post' = +10%
- Result: 45 × 1.50 × 1.60 × 1.10 = **118.8 ≈ 119 minutes**

---

## 4. PER-MODULE DURATION

For individual modules (in Step 3), divide total by number of modules:
```
Module Duration = (Total Approx Duration / Number of Modules)

Example:
- Total: 117 minutes
- Modules: 5
- Per Module: 117 / 5 = 23.4 ≈ 23 minutes per module
```

---

## 5. IMPLEMENTATION LOCATIONS

### File: Step 3 Modules Page
**Path:** `app/create/modules/page.tsx`

**Changes Required:**
1. Add function to fetch course data (Steps 1-2 selections)
2. Calculate approximate duration on page load
3. Distribute to all modules
4. Update duration badge at top
5. Re-calculate when user changes module count (if editable)

**Current Structure:**
- Line 707: `totalDuration` already calculates from individual module.duration
- Line 775-785: Duration badge displays in stats bar
- Module.duration is string format (e.g., "15 min")

**Update Points:**
```typescript
// Near line 90-100 (initialization)
// Fetch course + multimedia selections
// Calculate approx duration
// Apply to all modules

// Line 707 (totalDuration calculation)
// Already sums up, but now calculated from approx instead of DB

// Line 775 (Duration badge)
// Display "Approx: X min" instead of just "X min"
```

### New Utility Function
**Path:** `lib/utils/durationCalculator.ts` (create new)

```typescript
interface DurationInput {
  baseDuration: number // in minutes
  courseType: 'simple' | 'interactive' | 'highly_interactive' | 'scenario_driven'
  quizStrategy: 'every_module' | 'end_of_course' | 'pre_post' | 'ai_decide'
  audioNarration: boolean
  imageGeneration: boolean
  videoContent: boolean
  knowledgeAssessments: boolean
  animationMotion: boolean
  numberOfModules?: number
}

export function calculateApproximateDuration(input: DurationInput): {
  totalDuration: number
  perModuleDuration: number
}
```

---

## 6. DATABASE PERSISTENCE

### Step 2 Selections Storage Issue
Currently, Step 2 multimedia selections are **NOT** stored in database.

**Options:**
1. **Add new column to courses table:**
   ```sql
   ALTER TABLE courses ADD COLUMN IF NOT EXISTS multimedia_config JSONB DEFAULT NULL;
   ```
   Store: `{ audioNarration: true, videoContent: false, ... }`

2. **Add new column for course type:**
   ```sql
   ALTER TABLE courses ADD COLUMN IF NOT EXISTS course_type TEXT DEFAULT 'simple';
   ```

3. **Add new column for quiz strategy:**
   ```sql
   ALTER TABLE courses ADD COLUMN IF NOT EXISTS quiz_strategy TEXT DEFAULT 'ai_decide';
   ```

**Recommended:** Option 1 (store all in JSONB) to be flexible for future additions

---

## 7. IMPLEMENTATION STEPS

### Step 1: Create Utility Function
**File:** `lib/utils/durationCalculator.ts`
- Implement calculation algorithm
- Include default fallbacks for missing data
- Return both total and per-module duration

### Step 2: Fetch Step 2 Data in Step 3
**File:** `app/create/modules/page.tsx`
- Fetch course data on mount (or from sidebar context)
- Fetch multimedia selections (from DB or localStorage)
- Call calculator function

### Step 3: Update Module Durations
**File:** `app/create/modules/page.tsx`
- When modules load, calculate individual module duration
- Apply "Approx: X min" format
- Store in state for display

### Step 4: Update UI Display
**File:** `app/create/modules/page.tsx`
- Update duration badge to show "Approx: X min"
- Update individual module duration display
- Ensure formatting consistency

### Step 5: Handle Recalculation
**File:** `app/create/modules/page.tsx`
- If modules are added/deleted, recalculate
- Maintain proportional distribution

---

## 8. FALLBACK STRATEGY

If Step 2 selections are not available:
```typescript
// Use defaults
const defaults = {
  courseType: 'interactive',
  quizStrategy: 'ai_decide',
  audioNarration: true,
  imageGeneration: true,
  videoContent: false,
  knowledgeAssessments: true,
  animationMotion: false,
}
```

This provides reasonable estimate even without explicit selection.

---

## 9. DISPLAY FORMAT

### Badge (Top Stats)
```
Duration: Approx 117 min
```

### Module Card
```
Duration
Approx 23 min
```

### Lesson Item
```
Duration: Approx 5 min
(keep as is, individual lessons)
```

---

## 10. VALIDATION & CONSTRAINTS

### Minimum Durations
- Per module: 5 minutes minimum
- Per lesson: 3 minutes minimum
- Total course: 15 minutes minimum

### Maximum Durations
- Per module: 120 minutes maximum
- Total course: 600 minutes maximum (practical limit)

### Rounding
- Round to nearest 1 minute for display
- Use Math.round() for calculations

---

## 11. EDGE CASES

1. **No modules generated yet**
   → Show "Approx: TBD" or skip display

2. **User changes module count manually**
   → Recalculate per-module duration proportionally

3. **Zero selections (all false)**
   → Still apply base calculation, show "Approx: X min"

4. **Missing Step 2 data**
   → Use defaults, show "Approx: X min (estimated)"

---

## 12. TESTING SCENARIOS

1. ✅ Test simple + no multimedia = ~30 min
2. ✅ Test highly_interactive + all options = ~120 min
3. ✅ Test per-module calculation with 5 modules
4. ✅ Test with no Step 2 data (fallbacks)
5. ✅ Test minimum/maximum bounds
6. ✅ Test after module deletion
7. ✅ Test badge displays correctly formatted

---

## Summary

| Aspect | Details |
|--------|---------|
| **Base Input** | Step 1 duration (30-60 minutes typically) |
| **Multipliers** | Course type (1.0-1.5x), multimedia options (+60% max), quiz strategy (+5-20%) |
| **Output** | Total duration & per-module duration |
| **Display** | "Approx: X minutes" format in stats badge and module cards |
| **Storage** | Calculated on load, not persisted (derived from selections) |
| **Fallback** | Reasonable defaults if Step 2 data unavailable |

