# AI Slide Generation - Quick Start Guide

## What It Does

The AI slide generation feature automatically creates professional presentation slides for your courses. Based on everything you enter in Steps 1-3 of the course creation wizard, the system generates 3 slides per lesson using Google's Gemini AI:

- **Slide 1**: Introduction (hooks & previews content)
- **Slide 2**: Main content (teaches key concepts)
- **Slide 3**: Conclusion (summarizes & reinforces)

## How to Use It

### Step 1: Complete Course Essentials

Fill out the course basics:

- Course title
- Description
- Difficulty level (beginner/intermediate/advanced)
- Target audience
- Language

### Step 2: Create Modules

Add modules with:

- Module titles
- Descriptions

### Step 3: Create Lessons

Add lessons with:

- Lesson titles
- Descriptions

### Step 4: Generate Slides

1. Go to the Storyboard page
2. Click "Generate Slides" button
3. AI fetches ALL context from previous steps
4. For each lesson, generates 3 complete slides
5. Slides appear in the interface

## Generated Slide Contains

Each slide includes:

| Field | Description |
|-------|-------------|
| **Title** | 5-8 word slide headline |
| **Content** | 3-4 bullet points with key information |
| **Type** | Intro, Content, or Conclusion |
| **Learning Objective** | SMART objective (Specific, Measurable, Achievable, Relevant, Time-bound) |
| **Interaction Type** | How students engage: interactive, quiz, video, image, discussion, reflection |
| **Media Notes** | Specific suggestions for graphics, videos, or interactive elements |
| **Speaker Notes** | 2-3 sentences of talking points for instructors |

## Example

**Input (from Steps 1-3):**

- Course: "Web Development Basics"
- Module: "HTML Fundamentals"
- Lesson: "Creating Your First Page"
- Audience: High school students
- Level: Beginner

**Generated Slide Output:**

```text
Title: "Build Your First Webpage Today"
Type: Introduction

Content:
• Learn the fundamental building blocks of web pages
• Create valid HTML from scratch
• Prepare for styling with CSS in the next module

Learning Objective: 
By the end of this lesson, beginners will be able to create a valid HTML5 
document with proper structure and common elements.

Speaker Notes:
Welcome to HTML basics! Today you'll learn how websites are structured 
using HTML tags. By the end of this lesson, you'll be able to create a 
basic but complete webpage that works in any browser.

Media Notes:
Opening animation: browser window showing a simple webpage loading

Interaction Type: Video
```

## AI Customization

### By Difficulty Level

**Beginner:**

- Simpler language
- More examples & analogies
- Step-by-step instructions
- 3-4 bullet points per slide

**Intermediate:**

- Balanced depth
- Some technical terms
- Real-world examples
- 4 detailed bullet points

**Advanced:**

- Technical terminology
- Complex concepts
- Case studies
- 4-5 detailed bullet points

### By Target Audience

The AI considers your target audience to:

- Use appropriate language level
- Include relevant examples
- Suggest suitable media types
- Match pace and complexity

## How It Works

1. **Fetches Context**
   - Course details (title, description, difficulty, language, audience)
   - Module descriptions (not just titles)
   - Lesson information

2. **Creates Intelligent Prompt**
   - Includes all context data
   - Specifies pedagogical requirements
   - Requests SMART learning objectives
   - Requires JSON structure for reliability

3. **Generates with AI**
   - Uses Google Gemini 2.0 Flash model
   - High creativity (temperature: 0.8)
   - Generates 3 slides per lesson
   - ~2-5 minutes for typical course

4. **Saves to Database**
   - Stores with all metadata
   - Marks as `ai_generated: true`
   - Saves learning objectives & interaction types
   - Includes media recommendations

5. **Displays in Interface**
   - Shows in slide list sidebar
   - Full details in slide view
   - Edit/delete capabilities
   - Export to PDF/PowerPoint/Word

## Tips for Best Results

### Provide Detailed Context

**Good course description:**
"Web development fundamentals covering HTML5, CSS3, and JavaScript. Students will build a responsive website with forms and interactive elements. Designed for beginners with no prior coding experience."

**Poor description:**
"Web development"

### Use Clear Lesson Descriptions

**Good:**
"Students will learn semantic HTML5 tags (header, nav, main, footer), why they matter for accessibility and SEO, and practice using them in a real page structure."

**Poor:**
"HTML tags"

### Match Audience to Difficulty

- **Beginner + High School Students**: Simple examples, no prerequisites
- **Intermediate + Professional**: Industry contexts, business applications
- **Advanced + Developers**: Best practices, performance considerations

### Review & Customize

- AI generates solid foundation - review for accuracy
- Edit for your teaching style
- Add/update media suggestions
- Verify learning objectives align with your goals

## Video: Using AI Slides

The generated speaker notes are written for:

- Conversational tone
- Timing: ~1-2 minutes per slide
- Natural transitions between points
- Context-aware teaching suggestions

## Export Your Slides

Once generated, export in multiple formats:

- **PDF**: For sharing and printing
- **PowerPoint**: For presentations
- **Word**: For instructor notes & lesson plans

Exports include:

- All slide content
- Learning objectives
- Speaker notes
- Media recommendations
- Interaction type indicators

## Troubleshooting

### Slides Not Generating?

- ✓ Verify API key is configured
- ✓ Check course has modules & lessons
- ✓ Ensure course description not empty
- ✓ Try again after 30 seconds
- ✓ Check internet connection

### Poor Quality Slides?

- ✓ Provide more detailed descriptions
- ✓ Clarify target audience
- ✓ Choose appropriate difficulty level
- ✓ Manually edit as needed

### Generation Timing Out?

- ✓ Generate fewer lessons at once
- ✓ Check internet connection
- ✓ Verify API service availability
- ✓ Try again in a few moments

## Technical Details

| Aspect | Details |
|--------|---------|
| **AI Model** | Google Gemini 2.0 Flash via OpenRouter |
| **Temperature** | 0.8 (high creativity) |
| **Max Tokens** | 2500 per generation |
| **Rate Limit** | 0.5s between API calls |
| **Typical Speed** | 3 slides per lesson in ~10 seconds |
| **Cost** | Depends on OpenRouter pricing |

## Database Schema

Slides stored in `slides` table:

```sql
- slide_number: integer
- title: text
- content: text (bullet points)
- learning_objective: text (NEW)
- interaction_type: text (NEW)
- media_notes: text (includes speaker notes)
- ai_generated: boolean (true for AI slides)
```

## Future Enhancements

- [ ] Voice-over generation for speaker notes
- [ ] Auto image/video sourcing with links
- [ ] Quiz question generation
- [ ] Multi-format exports (Google Slides, Canva)
- [ ] Slide customization by teaching style
- [ ] Translation to multiple languages

## Support

For issues:

1. Check troubleshooting section above
2. Verify all course information is complete
3. Review AI_SLIDE_GENERATION.md for detailed documentation
4. Contact support with error message

## Key Files

- `lib/utils/slideGenerator.ts` - AI generation logic
- `app/create/storyboard/page.tsx` - Storyboard UI
- Database: `slides` table

---

**Next Steps:**

1. ✅ Complete course creation (Steps 1-3)
2. ✅ Go to Step 4: Storyboard & Slides
3. ✅ Click "Generate Slides"
4. ✅ Review generated content
5. ✅ Edit as needed
6. ✅ Export for use

Happy creating! 🎓
