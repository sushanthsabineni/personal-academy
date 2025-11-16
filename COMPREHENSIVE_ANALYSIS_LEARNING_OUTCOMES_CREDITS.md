# Comprehensive Analysis: Learning Outcomes & Credit System Issues

**Date:** November 17, 2025  
**Status:** Analysis Complete - Ready for Step-by-Step Fix  
**Issues Identified:** 4 critical issues preventing AI Enhance from working

---

## 📊 ISSUE SUMMARY

### Error Reported
```
All fallback models exhausted for enhance-learning-outcomes. 
Last error: OpenRouter API error (mistral/mistral-large): 400 - 
mistral/mistral-large is not a valid model ID
```

### Root Causes (4 Issues)

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| 1 | Admin settings NOT storing fallback models | `admin_settings` table | Fallbacks not persisted, defaults used instead |
| 2 | getAIPromptConfigWithDb() NOT fetching fallbacks from DB | `lib/serverConfig.ts` | Config missing user-configured fallbacks |
| 3 | Admin page shows old model list | `lib/adminConfig.ts` | Admin settings have wrong fallback defaults |
| 4 | OpenRouter API might reject old model names | Unknown | Need to verify actual valid model IDs |

---

## 🔍 ISSUE #1: Database Schema Missing Fallback Models

### Problem
**File:** Supabase `admin_settings` table  
**Missing Columns:**
- `openrouter_fallback_models` (JSON array or text field)

### Current Structure (INCOMPLETE)
```sql
admin_settings table has:
✅ id
✅ user_id
✅ openrouter_api_key
✅ openrouter_model (primary model only)
✅ temperature
✅ max_tokens
❌ MISSING: openrouter_fallback_models
```

### Impact
- Admin configures fallback models in UI
- Settings are saved to localStorage (client-side only)
- When API runs server-side, it can't fetch the fallbacks from database
- Falls back to hardcoded DEFAULT fallbacks
- If those don't match OpenRouter's actual valid model IDs → error

---

## 🔍 ISSUE #2: serverConfig.ts NOT Fetching Fallbacks from Database

### Problem
**File:** `lib/serverConfig.ts` lines 56-71  
**Function:** `getAIPromptConfigWithDb()`

### Current Code (INCOMPLETE)
```typescript
export async function getAIPromptConfigWithDb(): Promise<AIPromptConfig> {
  try {
    const { getAdminSettingsFromDb } = await import('./supabase/adminSettings.server')
    const dbSettings = await getAdminSettingsFromDb()
    
    if (dbSettings && dbSettings.openrouter_api_key) {
      // ❌ PROBLEM: Only fetching 4 fields!
      return {
        ...DEFAULT_AI_PROMPT_CONFIG,
        openrouterApiKey: dbSettings.openrouter_api_key,
        openrouterModel: dbSettings.openrouter_model || DEFAULT_AI_PROMPT_CONFIG.openrouterModel,
        temperature: dbSettings.temperature || DEFAULT_AI_PROMPT_CONFIG.temperature,
        maxTokens: dbSettings.max_tokens || DEFAULT_AI_PROMPT_CONFIG.maxTokens,
        // ❌ MISSING: openrouterFallbackModels NOT fetched!
      };
    }
  } catch (error) {
    console.warn('Failed to fetch AI config from database:', error);
  }
  
  return DEFAULT_AI_PROMPT_CONFIG;  // ❌ Falls back to hardcoded defaults
}
```

### Impact
- API can't get admin-configured fallback models
- Always uses hardcoded defaults from `DEFAULT_AI_PROMPT_CONFIG`
- Admin settings in database are ignored for fallbacks
- Different from what admin configured

---

## 🔍 ISSUE #3: adminConfig.ts Default Fallbacks May Be Wrong

### Problem
**File:** `lib/adminConfig.ts` lines 107-110  
**In DEFAULT_CONFIG.aiPromptConfig:**

```typescript
openrouterFallbackModels: [
  'anthropic/claude-3-opus',
  'google/gemini-pro',           // ← POTENTIALLY WRONG!
  'meta-llama/llama-2-70b',
],
```

### Expected vs Actual
- Default list has only 3 models
- serverConfig.ts has 5 models (including mistral/mistral-large)
- These MIGHT not be valid OpenRouter model IDs
- No verification that they work with OpenRouter API

### Impact
- If defaults are wrong, fallback chain fails
- Error message says "mistral/mistral-large is not a valid model ID"
- Suggests this model ID doesn't exist in OpenRouter's actual API

---

## 🔍 ISSUE #4: Model IDs Don't Match OpenRouter API

### Problem
**Error says:** "mistral/mistral-large is not a valid model ID"  
**But our code has:** `mistral/mistral-large` in fallback list

### Hypothesis
- Our static model list in `openrouter.ts` might be outdated
- OpenRouter API might have changed model naming
- Model might be deprecated or no longer available
- Model ID format might be different than expected

### Solution Needed
- Verify actual valid model IDs from OpenRouter API
- Update all lists to match current valid models
- Test each model before adding to fallback chain

---

## 📋 DATA FLOW ANALYSIS

### Current (BROKEN) Flow
```
User at /create/essentials
  ↓
Fills in course details:
  ✅ courseTitle: "Python Basics"
  ✅ targetAudience: "Beginners"
  ✅ knowledgeLevel: "Beginner"
  ✅ duration: 30
  ✅ methodology: "lecture-based"
  ✅ learningOutcomes: "Students will understand..."
  ↓
Clicks "AI Enhance" button
  ↓
POST /api/course/enhance-outcomes
  ├─ Body includes: courseTitle, targetAudience, knowledgeLevel, etc.
  ├─ ✅ Body includes existingOutcomes: from learningOutcomes field
  ↓
API receives request
  ├─ ✅ Validates user is authenticated
  ├─ ✅ Checks user has 25 credits
  ├─ ✅ Gets config via getAIPromptConfigWithDb()
  │  └─ ❌ Config MISSING fallback models from database!
  ├─ Config has:
  │  ├─ ✅ openrouterApiKey (from database)
  │  ├─ ✅ openrouterModel: "openai/gpt-4o" (from database)
  │  ├─ ❌ openrouterFallbackModels: OLD HARDCODED LIST (not from database!)
  │  └─ Hardcoded fallbacks might not be valid!
  ↓
Calls withFallbackModels()
  ├─ Tries: openai/gpt-4o → fails
  ├─ Tries fallback #1: anthropic/claude-3-opus → fails
  ├─ Tries fallback #2: google/gemini-pro → fails
  ├─ Tries fallback #3: meta-llama/llama-2-70b → fails
  ├─ Calls getFallbackModels('meta-llama/llama-2-70b')
  │  └─ Returns: ['mistral/mistral-large', ...] from errorRecovery.ts
  ├─ Tries: mistral/mistral-large → FAILS!
  │  └─ ❌ "mistral/mistral-large is not a valid model ID"
  ↓
❌ ERROR: All models exhausted
```

### Data NOT Being Passed Correctly
1. **Learning Outcomes Input:** ✅ Passed correctly from form to API
2. **Course Context:** ✅ All fields (title, audience, level, duration) passed
3. **Admin Fallback Models:** ❌ NOT passed from database to API

---

## 🎯 LEARNING OUTCOMES DATA FLOW (CORRECT)

### Essentials Page → API → Learning Outcomes

**Step 1: Essentials Page**
```tsx
// formData has learningOutcomes
formData.learningOutcomes = "Students will understand..." // ← User input

// When user clicks AI Enhance:
<AIOutcomesPanel
  existingOutcomes={formData.learningOutcomes}  // ✅ Passed correctly
  courseTitle={formData.courseTitle}             // ✅ Passed correctly
  targetAudience={formData.targetAudience}       // ✅ Passed correctly
  knowledgeLevel={formData.knowledgeLevel}       // ✅ Passed correctly
  duration={formData.duration}                   // ✅ Passed correctly
  methodology={formData.methodology}             // ✅ Passed correctly
  approxModules={formData.approxModules}         // ✅ Passed correctly
  approxLessonsPerModule={formData.approxLessonsPerModule}  // ✅ Passed correctly
/>
```

**Step 2: AIOutcomesPanel Component**
```tsx
// handleEnhance() function sends to API
const res = await fetch('/api/course/enhance-outcomes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    courseTitle,               // ✅ Included
    targetAudience,            // ✅ Included
    knowledgeLevel,            // ✅ Included
    duration,                  // ✅ Included
    methodology,               // ✅ Included
    approxModules,             // ✅ Included
    approxLessonsPerModule,    // ✅ Included
    existingOutcomes,          // ✅ Included - User's initial outcomes!
  })
})
```

**Step 3: API Endpoint**
```typescript
// receive-outcomes/route.ts
const {
  courseTitle,                      // ✅ Received
  targetAudience,                   // ✅ Received
  knowledgeLevel,                   // ✅ Received
  duration,                         // ✅ Received
  methodology,                      // ✅ Received
  approxModules,                    // ✅ Received
  approxLessonsPerModule,           // ✅ Received
  existingOutcomes,                 // ✅ Received - User's initial outcomes!
} = await req.json()

// Build prompt using all context
const prompt = `... Context:
- Title: ${courseTitle}
- Audience: ${targetAudience}
- Level: ${knowledgeLevel}
- Duration: ${duration}
- Methodology: ${methodology}
- Modules: ${approxModules}
- Lessons/Module: ${approxLessonsPerModule}

${existingOutcomes ? `User's Initial Outcomes:\n${existingOutcomes}\n` : ''}

Task: Create detailed learning outcomes that...`

// ✅ Learning outcomes data flow is CORRECT!
```

**Step 4: AI Generation**
```typescript
// Call AI with prompt that includes ALL context + user's existing outcomes
const enhancedOutcomes = await withFallbackModels(
  config.openrouterModel,        // Primary model
  async (model) => {
    return await callOpenRouter(
      config.openrouterApiKey,
      {
        model,
        messages: [
          { role: 'system', content: systemText },
          { role: 'user', content: prompt },  // ✅ Includes all context + user outcomes
        ],
        temperature: config.temperature,
        maxTokens: 2000,
      },
      config.openrouterFallbackModels  // ❌ THIS IS THE PROBLEM!
    )
  },
  'enhance-learning-outcomes'
)
```

### Conclusion on Learning Outcomes
**✅ Learning outcomes data flow is CORRECT**
- User input is properly captured from form
- Existing outcomes are included in the prompt
- API receives all course context
- **PROBLEM:** The API fails because fallback models are wrong, not because data isn't passed

---

## 💳 CREDIT SYSTEM ANALYSIS

### Flow Analysis

**Step 1: Component Shows Credit Check**
```tsx
// AIOutcomesPanel.tsx
const hasEnoughCredits = userCredits >= ENHANCE_CREDITS_COST  // 25 credits

<button
  disabled={loading || !hasEnoughCredits}
  title={!hasEnoughCredits ? `Insufficient credits. Need ${ENHANCE_CREDITS_COST}, have ${userCredits}` : `...`}
>
  AI Enhance
</button>
```

**Step 2: API Validates Credits**
```typescript
// enhance-outcomes/route.ts
const { data: userProfile } = await supabase
  .from('profiles')
  .select('credits_balance')
  .eq('id', userId)
  .single()

const currentCredits = userProfile?.credits_balance || 0
if (currentCredits < ENHANCE_CREDITS_COST) {
  return NextResponse.json(
    { success: false, error: `Insufficient credits. You need ${ENHANCE_CREDITS_COST} credits but have ${currentCredits}` },
    { status: 402 }
  )
}
```

**Step 3: API Deducts Credits After Success**
```typescript
// After successful AI generation:
const newCreditsBalance = currentCredits - ENHANCE_CREDITS_COST
await supabase
  .from('profiles')
  .update({ credits_balance: newCreditsBalance })
  .eq('id', userId)

// Create transaction record:
await supabase
  .from('credits_transactions')
  .insert({
    user_id: userId,
    amount: -ENHANCE_CREDITS_COST,
    transaction_type: 'ai_enhance_outcomes',
    description: 'AI Learning Outcomes Enhancement',
    balance_after: newCreditsBalance,
    created_at: new Date().toISOString(),
  })

return NextResponse.json({
  success: true,
  outcomes: enhancedOutcomes.result,
  modelUsed: enhancedOutcomes.modelUsed,
  newCreditsBalance,
  timestamp: new Date().toISOString(),
})
```

**Step 4: Component Updates Local Credits**
```tsx
// AIOutcomesPanel.tsx handleEnhance()
if (data.outcomes && data.outcomes.outcomes) {
  const outcomesText = ...
  onEnhanced(outcomesText)
  
  // ✅ Update credits from response
  if (onCreditsUpdate && data.newCreditsBalance !== undefined) {
    onCreditsUpdate(data.newCreditsBalance)
  }
}
```

### Credit System Assessment
**✅ Credit system logic is CORRECT**
- Checks are in place
- Deduction happens after success
- Transaction logging works
- Frontend updates balance

**⚠️ But Credit Check Never Reached**
- API fails before credit deduction
- Because models are invalid
- User never gets to the point where credits are deducted
- Button appears disabled because either:
  1. userCredits is 0 (if not initialized), OR
  2. API fails due to model error

---

## 📝 ADMIN SETTINGS STRUCTURE ISSUE

### Problem
**AdminSettings interface is incomplete:**

```typescript
// Current (from adminSettings.server.ts)
export interface AdminSettings {
  id: string
  user_id: string
  openrouter_api_key?: string
  openrouter_model: string
  temperature: number
  max_tokens: number
  created_at: string
  updated_at: string
  // ❌ MISSING:
  // openrouter_fallback_models: string (JSON array)
}
```

**What needs to be added:**
```typescript
// Should be:
export interface AdminSettings {
  id: string
  user_id: string
  openrouter_api_key?: string
  openrouter_model: string
  openrouter_fallback_models?: string  // ← NEW: JSON string of array
  temperature: number
  max_tokens: number
  created_at: string
  updated_at: string
}
```

**Database table is also incomplete:**
```sql
-- Current admin_settings table is missing column:
ALTER TABLE admin_settings ADD COLUMN openrouter_fallback_models TEXT;

-- Should store JSON array like:
["anthropic/claude-3-opus", "google/gemini-pro", ...]
```

---

## 🎯 COMPREHENSIVE STEP-BY-STEP FIX PLAN

### Phase 1: Database & Admin Settings (Prerequisite)

**Step 1.1:** Update `AdminSettings` interface to include fallback models
- **File:** `lib/supabase/adminSettings.server.ts`
- **Change:** Add `openrouter_fallback_models?: string` to interface
- **Test:** Interface compiles without errors

**Step 1.2:** Update admin settings table schema
- **File:** Supabase migration or direct SQL
- **Change:** Add column: `openrouter_fallback_models TEXT`
- **Test:** Column can be queried from database

**Step 1.3:** Update admin config page to show/edit fallback models
- **File:** `app/admin/config/openrouter/page.tsx`
- **Change:** Show checkboxes to select fallback models
- **Change:** Save selected models to database
- **Test:** Can select models and they save to database

---

### Phase 2: Config Fetching (Fix serverConfig.ts)

**Step 2.1:** Update `getAIPromptConfigWithDb()` to fetch fallbacks
- **File:** `lib/serverConfig.ts`
- **Change:** Include `openrouterFallbackModels` in returned config
- **From:** Parse JSON from database column
- **Fallback:** Use defaults if not in database
- **Test:** Config includes admin-configured fallbacks

**Step 2.2:** Verify model IDs are valid
- **File:** `lib/ai/openrouter.ts`
- **Change:** Ensure model list matches actual OpenRouter API
- **Test:** Call OpenRouter API and verify model IDs work

**Step 2.3:** Update defaults to match actual valid models
- **File:** `lib/adminConfig.ts` and `lib/serverConfig.ts`
- **Change:** Ensure defaults are tested and valid
- **Test:** Defaults don't produce "invalid model ID" errors

---

### Phase 3: Error Recovery (Fix fallback chain)

**Step 3.1:** Review `getFallbackModels()` function
- **File:** `lib/ai/errorRecovery.ts`
- **Verify:** All model IDs in map are valid
- **Update:** Use only models we've verified work
- **Test:** No "invalid model ID" errors

**Step 3.2:** Test fallback chain
- **Test:** Primary model fails → tries fallback #1 → fallback #2, etc.
- **Test:** All models in chain are valid
- **Test:** One model eventually succeeds

---

### Phase 4: Integration & Testing

**Step 4.1:** Test complete flow
1. Admin goes to `/admin/config/openrouter`
2. Selects: GPT-4 Omni (primary), Claude 3 Opus, Gemini 1.5 Pro (fallbacks)
3. Saves configuration
4. Config saved to database
5. User goes to `/create/essentials`
6. Fills in course details
7. Clicks "AI Enhance"
8. API fetches config from database (includes fallbacks)
9. Primary model called → succeeds or fails
10. If fails → tries fallback #1 → succeeds
11. Learning outcomes generated
12. Credits deducted
13. Frontend updated with new balance

**Step 4.2:** Verify no "invalid model ID" errors
- Test each model individually
- Verify all are valid with OpenRouter API
- No fallback chain exhaustion

---

## 📌 SUMMARY TABLE

| Issue | Root Cause | Fix Location | Priority |
|-------|-----------|--------------|----------|
| Fallbacks not saved | DB schema incomplete | Database + interfaces | CRITICAL |
| Fallbacks not fetched | serverConfig incomplete | `lib/serverConfig.ts` | CRITICAL |
| Model IDs invalid | Outdated/wrong model list | Multiple files | CRITICAL |
| Learning outcomes data | (None - flow is correct) | (Working as designed) | N/A |
| Credit validation | API unreachable due to model error | Fix models first | MEDIUM |

---

## ✅ SUCCESS CRITERIA

After all fixes:
- ✅ Admin can configure fallback models and see them saved
- ✅ API fetches config including fallback models from database
- ✅ Model IDs are valid with OpenRouter API
- ✅ Primary model tries first
- ✅ Fallback models work if primary fails
- ✅ Learning outcomes generated successfully
- ✅ Credits deducted and balance updated
- ✅ No "invalid model ID" errors
- ✅ Button shows correct credit balance
- ✅ User sees enhanced learning outcomes in textarea

---

**Status:** Ready for Step-by-Step Implementation
