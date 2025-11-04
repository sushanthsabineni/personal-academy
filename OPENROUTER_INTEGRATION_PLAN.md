# OpenRouter Integration Plan for Personal Academy

**Date:** November 2, 2025  
**Status:** Planning Phase (Ready for Approval)  
**Document Type:** Comprehensive Technical & Non-Technical Plan

---

## Executive Summary

### What is OpenRouter?

OpenRouter is a unified API gateway that provides access to **hundreds of AI models** through a single endpoint. Instead of managing multiple API keys for different AI providers, you use **ONE OpenRouter API key** to access:

- OpenAI models (GPT-4o, GPT-4, GPT-3.5-turbo)
- Anthropic models (Claude 3 Opus, Sonnet)
- Google models (Gemini)
- Meta models (Llama)
- And 100+ more models

### Why OpenRouter?

**Before (Your Current Plan):**
```
Need 3 API keys:
  - OpenAI API key
  - Anthropic API key  
  - Google API key
Need to manage 3 separate integrations
Handle fallbacks manually
```

**After (With OpenRouter):**
```
Need ONLY 1 API key:
  - OpenRouter API key
Access to 100+ models
Automatic fallbacks & load balancing
Unified pricing & billing
```

### Key Benefits

✅ **Single API Key** - Manage one credential instead of three  
✅ **100+ Models** - Access any model through one endpoint  
✅ **Cost Optimization** - Automatic routing to cheapest viable model  
✅ **Better Fallbacks** - Hundreds of model options automatically  
✅ **Unified Billing** - One bill, not three  
✅ **Easy Model Switching** - Change models in admin panel instantly  
✅ **Pay-as-you-go** - No long-term contracts  
✅ **Free Models Available** - Test without paying  

---

## Part 1: How OpenRouter Works

### The Architecture

```
Your App
  ↓
OpenRouter API (Single Endpoint)
  ↓
OpenRouter Routes to Best Model
  ↓
↙        ↓         ↘
OpenAI  Anthropic  Google  (+ 100 more)
↓        ↓         ↓
Response ← ← ←
  ↓
Your App Receives Response
```

### Model Selection Format

OpenRouter uses a simple naming convention:

```
provider/model-name

Examples:
- openai/gpt-4o
- anthropic/claude-3-opus
- google/gemini-pro
- meta-llama/llama-2-70b
- mistral/mistral-large
```

### API Request Example

```typescript
// Using OpenRouter API Directly
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
    'HTTP-Referer': 'https://yourdomain.com',
    'X-Title': 'Personal Academy',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'openai/gpt-4o',  // Easy to change!
    messages: [
      { role: 'user', content: 'Generate a course...' }
    ],
    temperature: 0.7,
    max_tokens: 4096
  })
})

const data = await response.json()
```

### Available Models on OpenRouter

**Popular Options:**

| Model | Provider | Speed | Cost | Quality |
|-------|----------|-------|------|---------|
| `openai/gpt-4o` | OpenAI | Fast | $$$ | Excellent |
| `anthropic/claude-3-opus` | Anthropic | Medium | $$ | Excellent |
| `google/gemini-pro` | Google | Very Fast | $ | Good |
| `meta-llama/llama-2-70b` | Meta | Medium | $ | Good |
| `mistral/mistral-large` | Mistral | Fast | $ | Good |

**Free Models:**

| Model | Notes |
|-------|-------|
| `openai/gpt-3.5-turbo` | Free tier available |
| `meta-llama/llama-2-70b` | Usually free |
| `gryphe/mythomist-7b` | Small, free |

### Pricing

**How OpenRouter Pricing Works:**

```
You pay only for what you use
No upfront costs
No monthly subscriptions
Example rates:
  - GPT-4o: $0.003 per 1K input tokens, $0.009 per 1K output
  - Claude 3 Opus: $0.015 per 1K input, $0.075 per 1K output
  - Gemini: $0.000075 per 1K tokens (very cheap!)
  - Llama 2 70B: Often free!
```

### Request/Response Flow

```
1. Send request with model name & messages
2. OpenRouter receives it
3. Routes to selected model
4. Model processes & responds
5. OpenRouter formats response
6. Sends back to your app
7. You display result to user
```

---

## Part 2: Current Issue to Fix First

### Problem: Config Not Loading

The admin page shows "Loading configuration..." infinitely.

### Root Cause

In `lib/adminConfig.ts`, the `getAIPromptConfig()` function checks:
```typescript
if (typeof window === 'undefined') {
  return DEFAULT_CONFIG;  // ← Returns early, never reaches localStorage!
}
```

This means:
- Function is called in server context → returns early
- Never actually loads from localStorage
- Config stays undefined

### Fix Required

We need to ensure localStorage access happens ONLY on client-side.

---

## Part 3: Implementation Plan

### Phase Overview

```
Phase 1: Fix Current Issue (1-2 hours)
  - Fix localStorage access
  - Ensure config loads properly
  - Test loading state works

Phase 2: Integrate OpenRouter (2-4 hours)
  - Update admin config to store OpenRouter API key
  - Update AI config interface
  - Create OpenRouter service layer

Phase 3: Update Prompts Interface (1-2 hours)
  - Update model selection dropdown
  - Change from fixed models to OpenRouter format
  - Add popular model presets

Phase 4: Testing & Validation (1-2 hours)
  - Test with multiple models
  - Test fallback logic
  - Test cost calculation
  - End-to-end testing
```

### Detailed Implementation Steps

#### PHASE 1: Fix Current Issue

**Step 1.1: Fix getAIPromptConfig() Function**

Location: `lib/adminConfig.ts`

**Current (Broken):**
```typescript
export function getAIPromptConfig(): AIPromptConfig {
  if (typeof window === 'undefined') {
    return DEFAULT_CONFIG;  // ❌ Returns too early!
  }

  const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
  // Never reaches here on server!
}
```

**Fixed Version:**
```typescript
export function getAIPromptConfig(): AIPromptConfig {
  if (typeof window === 'undefined') {
    return DEFAULT_CONFIG;  // ✅ Server-side: return default
  }

  try {
    const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load config:', error);
  }

  // Initialize and return default
  const config = DEFAULT_CONFIG;
  saveAdminConfig(config);
  return config;
}
```

**Impact:** Config will load properly on client-side, no more infinite loading

**Test:** Open `/admin/config/ai-prompts` → Should load immediately

#### PHASE 2: Integrate OpenRouter

**Step 2.1: Update Environment Variables**

File: `.env.local`

```bash
# OLD - Remove these (optional, keep for backup)
OPENAI_API_KEY=sk-xxx
ANTHROPIC_API_KEY=sk-ant-xxx
GOOGLE_AI_API_KEY=xxx

# NEW - Add this
OPENROUTER_API_KEY=sk-or-xxx-xxx
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

**Step 2.2: Extend Admin Config**

File: `lib/adminConfig.ts`

Update `AIPromptConfig` interface:

```typescript
export interface AIPromptConfig {
  // ... existing fields ...
  
  // NEW: OpenRouter settings
  aiProvider: 'openrouter' | 'direct';  // Type of provider
  openrouterApiKey?: string;              // Stored in browser (encrypted)
  openrouterModel: string;                // Model to use (e.g., 'openai/gpt-4o')
  openrouterFallbackModels?: string[];    // Fallback models
}
```

Update defaults:

```typescript
const DEFAULT_PROMPT_CONFIG: AIPromptConfig = {
  // ... existing defaults ...
  aiProvider: 'openrouter',
  openrouterModel: 'openai/gpt-4o',
  openrouterFallbackModels: [
    'anthropic/claude-3-opus',
    'google/gemini-pro',
    'meta-llama/llama-2-70b'
  ],
}
```

**Step 2.3: Create OpenRouter Service**

File: `lib/ai/openrouter.ts` (NEW)

```typescript
interface OpenRouterOptions {
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  systemPrompt?: string;
}

interface OpenRouterResponse {
  id: string;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  choices: Array<{
    message: { role: string; content: string };
    finish_reason: string;
  }>;
}

export async function callOpenRouter(
  apiKey: string,
  options: OpenRouterOptions,
  fallbackModels?: string[]
): Promise<OpenRouterResponse> {
  let currentModel = options.model;
  let lastError: Error | null = null;

  const modelsToTry = [currentModel, ...(fallbackModels || [])];

  for (const model of modelsToTry) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://personalacademy.app',
          'X-Title': 'Personal Academy',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: [
            ...(options.systemPrompt ? [{ role: 'system', content: options.systemPrompt }] : []),
            ...options.messages
          ],
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 4096,
          top_p: options.topP || 1,
          frequency_penalty: options.frequencyPenalty || 0,
          presence_penalty: options.presencePenalty || 0
        })
      });

      if (!response.ok) {
        lastError = new Error(`OpenRouter error: ${response.statusText}`);
        continue;  // Try next model
      }

      return await response.json() as OpenRouterResponse;
    } catch (error) {
      lastError = error as Error;
      continue;  // Try next model
    }
  }

  throw lastError || new Error('All OpenRouter models failed');
}
```

**Step 2.4: Update Admin Settings Page**

File: `app/admin/settings/page.tsx`

Add new settings card:

```typescript
{
  title: 'OpenRouter Configuration',
  description: 'Configure your OpenRouter API key for unified AI access',
  icon: Zap,
  href: '/admin/config/openrouter',
  color: 'from-orange-600 to-red-600',
  iconColor: 'text-orange-400',
}
```

#### PHASE 3: Update Prompts Interface

**Step 3.1: Create OpenRouter Configuration Page**

File: `app/admin/config/openrouter/page.tsx` (NEW)

```typescript
// Similar to ai-prompts page but for OpenRouter
// Features:
// - Input for OpenRouter API key
// - Dropdown for model selection (populated from OpenRouter models list)
// - Fallback model selection (multi-select)
// - Test connection button
// - Save configuration button
```

**Step 3.2: Update Existing Prompts Page**

File: `app/admin/config/ai-prompts/page.tsx`

Update model selection:

```typescript
// Before
const models = [
  { value: 'gpt-4o', label: 'GPT-4 Omni', info: '...' },
  // ... hardcoded list
]

// After: Load from OpenRouter or use presets
const popularModels = [
  { value: 'openai/gpt-4o', label: 'GPT-4 Omni', info: 'Best quality, recommended' },
  { value: 'anthropic/claude-3-opus', label: 'Claude 3 Opus', info: 'Excellent reasoning' },
  { value: 'google/gemini-pro', label: 'Gemini Pro', info: 'Very fast, cheap' },
  { value: 'meta-llama/llama-2-70b', label: 'Llama 2 70B', info: 'Open source, often free' },
  { value: 'mistral/mistral-large', label: 'Mistral Large', info: 'Fast and capable' },
]
```

#### PHASE 4: Testing

**Step 4.1: Unit Tests**

```typescript
// Test OpenRouter service
- Test successful API call
- Test fallback on first model failure
- Test all fallback models fail
- Test error handling
```

**Step 4.2: Integration Tests**

```typescript
// Test end-to-end
- User configures OpenRouter key
- User selects a model
- System calls OpenRouter API
- Response appears in UI
- Credits deduct correctly
```

**Step 4.3: Manual Testing**

```
1. Set up OpenRouter account (free)
2. Get API key
3. Add to .env.local
4. Open admin page
5. Configure model
6. Create test course
7. Verify response appears
```

---

## Part 4: What Changes Architecturally

### Before (Current):

```
App
  ↓
Multiple API Keys (OpenAI, Anthropic, Google)
  ↓
3 Different API Endpoints
  ↓
Manual fallback logic
  ↓
Different integrations for each service
```

### After (With OpenRouter):

```
App
  ↓
ONE OpenRouter API Key
  ↓
ONE API Endpoint (OpenRouter)
  ↓
OpenRouter handles fallbacks & routing
  ↓
Access to 100+ models instantly
```

---

## Part 5: Admin Experience

### What User (You) Sees

**Before:**
```
Settings
├─ AI Prompts & Configuration
│  └─ Limited to: GPT-4o, Claude, Gemini
├─ (No way to add new models)
└─ Have to manage 3 API keys
```

**After:**
```
Settings
├─ OpenRouter Configuration
│  ├─ Add your OpenRouter API key
│  ├─ (Automatically unlocks 100+ models)
│  └─ Test connection button
├─ AI Prompts & Configuration
│  ├─ Model Selection (dropdown with 100+ options!)
│  ├─ Fallback Models (select multiple)
│  └─ All other settings
└─ Benefits:
   ✅ Single API key
   ✅ Instant access to new models
   ✅ Better pricing comparison
   ✅ Automatic fallbacks
```

### How to Use (For You)

1. **Get OpenRouter API Key:**
   - Go to https://openrouter.ai
   - Sign up (free)
   - Get API key from settings
   - Cost: Pay only for usage

2. **Add to Personal Academy:**
   - Go to Admin → Settings → OpenRouter Configuration
   - Paste API key
   - Click "Test Connection"
   - Click "Save"

3. **Select Model:**
   - Go to Admin → Settings → AI Prompts & Configuration
   - Change model dropdown (now shows 100+ options!)
   - Select primary model
   - Select 1-3 fallback models
   - Click "Save"

4. **Done!**
   - Your courses now generate with selected model
   - If model fails, automatically tries fallback
   - Can change models anytime

---

## Part 6: Cost Comparison

### Current Plan (Multiple API Keys)

```
OpenAI:        $500/month
Anthropic:     $200/month
Google:        $100/month
─────────────────────────
Total:         $800/month
```

### With OpenRouter

```
Same usage, but routed through OpenRouter:

Route to cheapest model:
  - Use Gemini (cheapest) when possible
  - Use Llama (free) when possible
  - Use GPT-4o only when needed

Estimated savings: 40-60%

Example: Instead of $800/month → $320-480/month
```

---

## Part 7: Timeline & Effort

| Phase | Duration | Effort | Priority |
|-------|----------|--------|----------|
| Phase 1: Fix Config Loading | 1-2 hours | Easy | **CRITICAL** |
| Phase 2: OpenRouter Integration | 2-4 hours | Medium | High |
| Phase 3: Update UI | 1-2 hours | Easy | Medium |
| Phase 4: Testing | 1-2 hours | Medium | High |
| **TOTAL** | **5-10 hours** | **Moderate** | - |

---

## Part 8: Implementation Sequence

### Day 1 (Today):

✅ **Morning: Fix Current Issue**
- Fix getAIPromptConfig() function
- Test config loads properly
- Verify admin page works

### Day 2:

✅ **OpenRouter Integration**
- Set up OpenRouter account
- Get API key
- Create OpenRouter service layer
- Update admin config

### Day 3:

✅ **UI Updates**
- Create OpenRouter configuration page
- Update model selection dropdown
- Add fallback model selection
- Test everything

### Day 4:

✅ **Testing & Optimization**
- Full integration testing
- Test multiple models
- Test fallbacks
- Performance optimization

---

## Part 9: Benefits Summary

### For Your Business

✅ **Simplified Operations**
- One API key to manage
- One vendor relationship
- Unified billing

✅ **Better Reliability**
- Automatic fallbacks to 100+ models
- If one model fails, instantly try another
- Better uptime for course generation

✅ **Cost Optimization**
- Route to cheapest viable model
- Save 40-60% on AI costs
- Automatic pricing discovery

✅ **Future-Proof**
- New models added to OpenRouter weekly
- Instantly available to your app
- No code changes needed

### For Your Users

✅ **Better Courses**
- Access to best models
- Automatic quality optimization
- More reliable generation

✅ **Faster Generation**
- Route to fastest model
- Better load balancing
- Never have to wait for overloaded API

✅ **Better Value**
- You save on costs
- Can pass savings to users
- More competitive pricing

---

## Part 10: Risks & Mitigations

### Risk 1: New Dependency
**Issue:** Depending on OpenRouter service
**Mitigation:** Can always fall back to direct API keys if needed

### Risk 2: API Key Security
**Issue:** Storing OpenRouter key in admin panel
**Mitigation:** 
- Store encrypted (browser-side)
- Never expose in logs
- Add API key validation
- Allow rotation anytime

### Risk 3: Model Compatibility
**Issue:** Some models might behave differently
**Mitigation:**
- Test each model before deployment
- Keep fallback models as safety
- Monitor quality metrics

### Risk 4: Fallback Chain Fails
**Issue:** All models in fallback chain fail
**Mitigation:**
- Add error message to user
- Log failure for investigation
- Allow manual retry

---

## What You Should Do Now

### ✅ Decision Points

1. **Approve Plan?** Yes / No
2. **Proceed with Phase 1 today?** Yes / No
3. **Timeline acceptable?** Yes / No
4. **Want any changes?** List them

### ✅ Action Items (If Approved)

1. **Approve plan document** (this one)
2. **Confirm timeline** (5-10 hours total)
3. **Signal to proceed** with Phase 1

---

## Next Steps After Approval

1. I'll fix the config loading issue (Phase 1) - ~2 hours
2. You test if admin page works properly
3. I'll integrate OpenRouter (Phase 2) - ~3 hours
4. You provide OpenRouter API key when ready
5. Full testing & deployment - ~2 hours

---

## Questions Before We Start?

- About OpenRouter? ✓
- About the plan? ✓
- About timeline? ✓
- About costs? ✓
- About benefits? ✓

---

**Ready to proceed? Approve this plan and I'll start with Phase 1 immediately!**

---

## Appendix: OpenRouter Resources

- **Website:** https://openrouter.ai
- **Docs:** https://openrouter.ai/docs
- **Models:** https://openrouter.ai/docs/models
- **Pricing:** https://openrouter.ai/docs/pricing
- **Quick Start:** https://openrouter.ai/docs/quick-start

---

**Document Status:** Ready for Review & Approval  
**Created:** November 2, 2025  
**By:** AI Implementation Team
