# AI Integration Implementation Checklist

**Status:** Ready to implement  
**Last Updated:** November 2, 2025

---

## Phase 0: Decision & Setup

- [ ] **Decision Made:** Direct Integration (Option 1) ✓ RECOMMENDED
- [ ] **Team Briefing:** Share AI_INTEGRATION_PLAN.md with team
- [ ] **Budget Approved:** Allocate $50-200 for initial LLM API testing
- [ ] **Timeline:** Allocated 2-4 weeks for Phase 1-2
- [ ] **LLM Chosen:** OpenAI (recommended) or Anthropic (alternative)

---

## Phase 1: Foundation (Week 1-2)

### 1.1 Environment Setup

- [ ] Sign up for OpenAI API: https://platform.openai.com
- [ ] Purchase $5-20 in prepaid credits
- [ ] Generate API key from dashboard
- [ ] Add to `.env.local`:
  ```
  OPENAI_API_KEY=sk-...
  OPENAI_MODEL=gpt-4o
  OPENAI_TEMPERATURE=0.7
  ```
- [ ] Create `.env.local.example` with placeholder values
- [ ] Add `.env.local` to `.gitignore` (security!)
- [ ] Test API key with curl:
  ```bash
  curl https://api.openai.com/v1/models \
    -H "Authorization: Bearer $OPENAI_API_KEY"
  ```

### 1.2 Create Base AI Utilities

- [ ] Create `lib/ai/` directory
- [ ] Create `lib/ai/openai.ts` with:
  - [ ] `generateModules()` function
  - [ ] `countTokens()` helper
  - [ ] `estimateCost()` function
  - [ ] Type definitions for input/output
  - [ ] Error handling
- [ ] Create `lib/ai/prompts.ts` with:
  - [ ] System prompt for course generation
  - [ ] Few-shot examples for better output
  - [ ] Prompt templates for different AI tasks
- [ ] Create `lib/ai/tokenCounter.ts` for accurate cost estimation
- [ ] Create `lib/ai/errorHandler.ts` for consistent error handling
- [ ] Create `lib/ai/provider.ts` for provider abstraction (extensible for future providers)

### 1.3 Testing Infrastructure

- [ ] Create `lib/ai/__tests__/` directory
- [ ] Write unit tests for:
  - [ ] Token counting accuracy
  - [ ] Cost calculation
  - [ ] JSON parsing
  - [ ] Error handling
- [ ] Create mock implementations for development
- [ ] Add `AI_MOCK_RESPONSES=true` env var for testing without API calls

### 1.4 Database Schema Updates

- [ ] Review existing `ai_generations` table
- [ ] Add migration for additional fields:
  - [ ] `user_prompt` (TEXT)
  - [ ] `ai_response_summary` (TEXT)
  - [ ] `quality_score` (INTEGER)
  - [ ] `was_regenerated` (BOOLEAN)
  - [ ] `parent_generation_id` (UUID)
- [ ] Create indexes for performance
- [ ] Test migration on staging database
- [ ] Document schema changes

### 1.5 Documentation

- [ ] Create API endpoint documentation
- [ ] Document environment variables
- [ ] Create developer guide for adding new AI features
- [ ] Document cost structure and credit system
- [ ] Add troubleshooting guide

---

## Phase 2: Core Integration (Week 2-4)

### 2.1 Replace AI Suggest Endpoint

- [ ] Update `app/api/course/ai-suggest/route.ts` with real OpenAI calls
- [ ] Implement input validation
- [ ] Add credit deduction logic
- [ ] Implement database logging to `ai_generations`
- [ ] Add error handling and retry logic
- [ ] Test with real API
- [ ] Monitor first 100 requests for errors
- [ ] Check token usage accuracy

### 2.2 Create Module Generation Endpoint

- [ ] Create `app/api/course/generate-modules/route.ts`
- [ ] Implement request validation
- [ ] Call OpenAI with appropriate prompt
- [ ] Parse and validate JSON response
- [ ] Store in database
- [ ] Deduc credits from user account
- [ ] Log to `ai_generations` table
- [ ] Add timeout handling (30-60 seconds)
- [ ] Test with various course types

### 2.3 Frontend Integration

- [ ] Update `app/create/essentials/page.tsx`:
  - [ ] Call real `/api/course/ai-suggest` endpoint
  - [ ] Show estimated credits before generating
  - [ ] Display loading spinner during generation
  - [ ] Show error messages clearly
  - [ ] Handle timeout scenarios
  - [ ] Show AI provider attribution

- [ ] Update `app/create/modules/page.tsx`:
  - [ ] Add "Generate with AI" button (if not exists)
  - [ ] Show credit cost before generation
  - [ ] Display generated modules with approval workflow
  - [ ] Add "Regenerate" option
  - [ ] Show generation timestamp and provider

### 2.4 Credit System Integration

- [ ] Review `lib/creditManagement.ts` implementation
- [ ] Add AI operation cost constants
- [ ] Create credit deduction function:
  ```typescript
  async function deductCredits(userId, operation, amount)
  ```
- [ ] Implement refund on failed generation
- [ ] Create transaction logging
- [ ] Show credit balance after each operation
- [ ] Add credit expiration tracking if needed

### 2.5 Monitoring & Analytics

- [ ] Create dashboard query for daily usage:
  ```sql
  SELECT DATE_TRUNC('day', created_at) as date,
    ai_provider, COUNT(*) as requests,
    SUM(credits_used) as credits_used,
    SUM(tokens_used) as tokens_used
  FROM ai_generations
  GROUP BY 1, 2
  ```
- [ ] Add GraphQL query or REST endpoint for analytics
- [ ] Create admin dashboard widget showing AI usage
- [ ] Set up alerts for:
  - [ ] API errors > 5% failure rate
  - [ ] Daily costs exceeding budget
  - [ ] Rate limit warnings

### 2.6 Testing & QA

- [ ] Unit tests for all AI functions
- [ ] Integration tests for API routes
- [ ] End-to-end tests for full workflow:
  - [ ] Create course → AI suggests structure → Save to DB
  - [ ] Check credits are deducted
  - [ ] Verify logging in `ai_generations`
- [ ] Test error scenarios:
  - [ ] API key invalid
  - [ ] Rate limited
  - [ ] Timeout
  - [ ] Malformed response
- [ ] Load testing with 10+ concurrent requests
- [ ] Cost tracking verification
- [ ] User acceptance testing with beta users

---

## Phase 3: Enhancement Features (Week 4-6)

### 3.1 Create Additional Endpoints

- [ ] `POST /api/course/generate-multimedia`
  - [ ] Generate narration scripts
  - [ ] Image prompts for visualization
  - [ ] Video suggestions
  - [ ] Quiz questions

- [ ] `POST /api/course/enhance-slide`
  - [ ] Improve slide content
  - [ ] Suggest interactive elements
  - [ ] Add learning objectives
  - [ ] Improve clarity/readability

- [ ] `POST /api/course/generate-assessment`
  - [ ] Create quiz questions
  - [ ] Generate answer explanations
  - [ ] Calculate difficulty levels
  - [ ] Verify pedagogical alignment

### 3.2 Frontend Updates for Enhancements

- [ ] Update storyboard editor (`app/create/storyboard/page.tsx`):
  - [ ] Replace "Enhance with AI" placeholder with real endpoint
  - [ ] Show enhancement suggestions
  - [ ] Add regeneration options
  - [ ] Show AI reasoning

- [ ] Update multimedia step (`app/create/multimedia/page.tsx`):
  - [ ] Generate real prompts on selection
  - [ ] Show estimated credits
  - [ ] Display generated content inline
  - [ ] Add regeneration workflow

- [ ] Add feedback collection:
  - [ ] "Was this helpful?" UI
  - [ ] Quality rating (1-5 stars)
  - [ ] Store feedback for ML improvement

### 3.3 Advanced Features

- [ ] Implement regeneration workflow:
  - [ ] Track which content was regenerated
  - [ ] Store parent/child relationships
  - [ ] Show regeneration history

- [ ] Add content comparison:
  - [ ] Show before/after
  - [ ] Side-by-side comparison
  - [ ] One-click restore to previous version

- [ ] Implement approval workflow:
  - [ ] SME review step
  - [ ] Approve/reject AI suggestions
  - [ ] Track approval metrics

---

## Phase 4: Optimization & Scale (Week 6+)

### 4.1 Performance Optimization

- [ ] Implement response caching:
  - [ ] Cache identical requests for 24 hours
  - [ ] Cache by prompt hash
  - [ ] Monitor cache hit rates

- [ ] Add streaming for long responses:
  - [ ] Stream results to client in real-time
  - [ ] Show content as it's being generated
  - [ ] Better UX for 30+ second operations

- [ ] Optimize prompts:
  - [ ] A/B test different prompt styles
  - [ ] Measure content quality
  - [ ] Track user regeneration rates
  - [ ] Iterate based on feedback

### 4.2 Cost Optimization

- [ ] Analyze token usage patterns:
  - [ ] Identify inefficient prompts
  - [ ] Track cost per user/course
  - [ ] Identify outliers

- [ ] Implement model selection logic:
  - [ ] Use GPT-3.5-turbo for simple tasks (90% cost reduction)
  - [ ] Use GPT-4 only for complex generation
  - [ ] A/B test model performance

- [ ] Add budget controls:
  - [ ] Per-user monthly limits
  - [ ] Per-course generation limits
  - [ ] Admin override capability

### 4.3 Reliability Improvements

- [ ] Implement provider fallback:
  - [ ] Try OpenAI first
  - [ ] Fallback to Anthropic if rate limited
  - [ ] Fallback to Google Gemini if both fail

- [ ] Add automatic retries:
  - [ ] Exponential backoff (1s, 2s, 4s)
  - [ ] Max 3 retries
  - [ ] Configurable retry logic

- [ ] Implement circuit breaker:
  - [ ] Disable AI if error rate > 20%
  - [ ] Auto-recovery after 5 minutes
  - [ ] Alert admin

### 4.4 Advanced Monitoring

- [ ] Create comprehensive analytics dashboard:
  - [ ] Daily/weekly/monthly usage trends
  - [ ] Cost analysis by feature
  - [ ] User adoption metrics
  - [ ] Content quality metrics

- [ ] Set up production monitoring:
  - [ ] Error tracking (Sentry/LogRocket)
  - [ ] Performance monitoring
  - [ ] Cost alerting
  - [ ] Rate limit tracking

---

## Future: N8N Migration (Optional, Month 3+)

Only proceed if you exceed Phase 4 requirements:

- [ ] Set up N8N instance (self-hosted or cloud)
- [ ] Create N8N workflows mirroring API routes
- [ ] Point Next.js routes to N8N webhooks
- [ ] Test parity with direct integration
- [ ] Migrate user traffic gradually
- [ ] Monitor performance
- [ ] Decommission direct integration when ready

---

## Security Checklist

- [ ] API keys never in version control
- [ ] API keys rotated quarterly
- [ ] Rate limiting implemented per user
- [ ] Input validation on all endpoints
- [ ] Output validation (no injection attempts)
- [ ] Logging sensitive data redacted
- [ ] Database encryption enabled
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] Admin audit trail enabled

---

## Compliance & Legal

- [ ] Privacy policy updated for AI usage
- [ ] Terms of service updated
- [ ] Data retention policy for AI requests
- [ ] GDPR compliance verified
- [ ] User consent for AI training (if applicable)
- [ ] Content attribution (credit OpenAI, etc.)
- [ ] Disclosure that content is AI-generated

---

## Budget Tracking

### Estimated Costs (3-month period)

| Phase | LLM Costs | Infrastructure | Total |
|-------|-----------|-----------------|-------|
| Phase 1 (Testing) | $50 | $0 | $50 |
| Phase 2 (100 users × 10 courses) | $500 | $0 | $500 |
| Phase 3 (1000 users × 20 courses) | $5,000 | $0 | $5,000 |
| Phase 4 (Optimization) | $3,000 | $0 | $3,000 |
| **Total** | **$8,550** | **$0** | **$8,550** |

### Cost Reduction Strategies

- Use GPT-3.5-turbo for 70% of operations (-80% cost)
- Implement caching (-20% cost)
- Batch operations (-15% cost)
- Estimated savings: **$5,136 (60% reduction)**

---

## Known Limitations & Workarounds

| Issue | Cause | Workaround |
|-------|-------|-----------|
| AI hallucination | Model limitations | Add manual review step |
| Long generation times | API latency | Use async jobs, show progress |
| Cost overruns | Unexpected traffic | Set spending limits |
| Rate limiting | API quotas | Implement queue system |
| Content quality varies | Prompt sensitivity | A/B test prompts |

---

## Success Metrics

Track these KPIs to measure success:

- [ ] **Adoption Rate:** % of users using AI features (Target: >30%)
- [ ] **Generation Quality:** User satisfaction rating (Target: >4/5)
- [ ] **Cost Efficiency:** Cost per course generated (Target: <$1)
- [ ] **Time Saved:** Average course creation time (Target: <20 min)
- [ ] **Error Rate:** Failed generations <5%
- [ ] **User Retention:** Courses completed with AI (Target: >60%)

---

## Stakeholder Communication

### Week 1 Kickoff

- [ ] Share this checklist with team
- [ ] Set team expectations for timeline
- [ ] Discuss budget implications
- [ ] Assign owners for each phase
- [ ] Schedule weekly sync meetings

### Mid-Phase Updates

- [ ] Weekly progress reports
- [ ] Share monitoring dashboards
- [ ] Discuss issues/blockers
- [ ] Adjust timeline if needed

### Launch Announcement

- [ ] Update product roadmap
- [ ] Announce AI features to users
- [ ] Create marketing content
- [ ] Prepare customer support docs
- [ ] Monitor feedback closely

---

## Sign-Off

- [ ] Project Manager: _________________ Date: _______
- [ ] Tech Lead: _________________ Date: _______
- [ ] Product Manager: _________________ Date: _______
- [ ] Executive Sponsor: _________________ Date: _______

---

## Questions Before Starting?

1. **API Key Management:** How will we manage and rotate API keys securely?
2. **Cost Control:** What's the monthly budget cap for AI services?
3. **Content Quality:** Who reviews AI-generated content?
4. **User Communication:** How do we explain AI usage to users?
5. **Data Privacy:** How long do we retain AI request logs?
6. **Rollback Plan:** What if AI quality is unacceptable?
7. **Timeline:** What's the absolute deadline for Phase 1?
8. **Team Bandwidth:** Who implements this? Contractor vs internal?

---

## Next Action

**This Week:**
1. Approve this checklist
2. Get OpenAI API key
3. Schedule Phase 1 kickoff meeting
4. Assign development resources

**Go/No-Go Decision Point:** End of Week 1
- Sufficient API quota?
- Team bandwidth confirmed?
- Budget approved?
- Timeline realistic?

Let's build AI-powered course generation! 🚀
