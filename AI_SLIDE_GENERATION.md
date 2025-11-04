# AI-Powered Slide Generation System

## Overview

The Personal Academy platform now features an intelligent slide generation system that automatically creates professional e-learning slides based on all the course information entered across the first three creation steps. The system leverages Google's Gemini AI model via OpenRouter to generate pedagogically sound, engaging presentation slides.

## Architecture

### Data Flow

```text
Step 1: Course Essentials (title, description, difficulty, language, audience)
                ↓
Step 2: Course Modules (module titles, descriptions, structure)
                ↓
Step 3: Course Lessons (lesson titles, descriptions)
                ↓
Step 4: Storyboard & Slides ← AI GENERATION HAPPENS HERE
```

### Integration Points

The slide generation system pulls context from all previous pages:

**From Step 1 (Essentials):**

- Course title
- Course description
- Difficulty level (beginner, intermediate, advanced)
- Language
- Target audience

**From Step 2 (Modules):**

- Module titles
- Module descriptions
- Module order

**From Step 3 (Lessons):**

- Lesson titles
- Lesson descriptions
- Lesson order within modules

## How It Works

### 1. User Flow

1. User completes steps 1-3 of the course creation wizard
2. User navigates to Step 4: Storyboard & Slides
3. On page load, if no slides exist, an approval dialog appears
4. User clicks "Generate Slides"
5. System fetches all context data from the database
6. For each lesson, AI generates 3 comprehensive slides
7. Slides are saved to database and displayed in the interface

### 2. Slide Generation Process

For each lesson, the system:

1. **Fetches Context**: Gathers course, module, and lesson information
2. **Builds Prompt**: Creates a detailed prompt with all context data
3. **Calls AI**: Sends prompt to Google Gemini via OpenRouter API
4. **Parses Response**: Extracts JSON with slide information
5. **Formats Data**: Processes content, objectives, and metadata
6. **Saves to Database**: Inserts formatted slides into the database

### 3. AI Prompt Structure

The AI receives a comprehensive prompt that includes:

```text
COURSE CONTEXT:
- Course: [Title]
- Course Overview: [Description]
- Difficulty Level: [Level]
- Language: [Language]
- Target Audience: [Audience]
- Module: [Module Title]
- Module Content: [Module Description]
- Lesson: [Lesson Title]
- Lesson Content: [Lesson Description]

TASK: Generate 3 engaging presentation slides following e-learning best practices
```

## Generated Slide Structure

Each Slide Includes

```json
{
  "slideNumber": 1,
  "title": "Slide Title (5-8 words)",
  "type": "intro|content|conclusion",
  "content": "Bullet point 1\nBullet point 2\nBullet point 3",
  "speakerNotes": "2-3 sentences for presenter",
  "mediaNote": "Specific media/graphic recommendation",
  "learningObjective": "SMART learning objective",
  "interactionType": "interactive|quiz|video|image|discussion|reflection"
}
```

## Slide Types

### Slide 1 - Introduction

- **Type**: `intro`
- **Purpose**: Hook the audience, establish relevance
- **Content**: What learners will gain from the lesson
- **Interaction**: Interactive or video-based
- **Objective**: Engage and preview content

### Slide 2 - Main Content

- **Type**: `content`
- **Purpose**: Deliver core teaching content
- **Content**: 4 detailed bullet points with examples
- **Interaction**: Quiz, interactive elements, or discussion
- **Objective**: Teach key concepts aligned with difficulty level

### Slide 3 - Conclusion

- **Type**: `conclusion`
- **Purpose**: Summarize and reinforce learning
- **Content**: 3 key takeaways
- **Interaction**: Reflection, quiz, or discussion
- **Objective**: Reinforce and connect to next steps

## AI Customization by Course Level

The system tailors content to the course difficulty level:

### Beginner Level

- Simpler language and concepts
- More foundational explanations
- Visual examples and analogies
- Step-by-step instructions
- 3-4 key bullet points per slide

### Intermediate Level

- Balanced depth and accessibility
- Some technical terminology
- Real-world examples
- Problem-solving scenarios
- 4 detailed bullet points per slide

### Advanced Level

- Technical terminology
- Complex concepts
- Case studies and applications
- Best practices and frameworks
- 4-5 detailed bullet points per slide

## Key Features

### 1. Comprehensive Learning Objectives

- Uses SMART criteria (Specific, Measurable, Achievable, Relevant, Time-bound)
- Each slide has a clear, measurable learning objective
- Aligned with difficulty level and course goals

### 2. Varied Interaction Types

- **Interactive**: Hands-on practice elements
- **Quiz**: Assessment and knowledge check
- **Video**: Visual demonstration content
- **Image**: Visual explanation or infographic
- **Discussion**: Collaborative learning
- **Reflection**: Personal application and thinking

### 3. Speaker Notes

- 2-3 sentences of presenter talking points
- Conversational and informative tone
- Provides context and guidance for instructors
- Includes relevant examples

### 4. Media Recommendations

- Specific, actionable media suggestions
- Examples: "Infographic showing...", "Video demonstrating..."
- Helps instructors know exactly what media to source
- Supports multimedia learning

### 5. Contextual Awareness

- AI understands the full course arc
- Respects module structure and flow
- Considers target audience needs
- Maintains language consistency

## Database Schema

Slides are stored in the `slides` table with fields:

```sql
CREATE TABLE slides (
  id uuid PRIMARY KEY,
  course_id uuid REFERENCES courses(id),
  module_id uuid REFERENCES modules(id),
  lesson_id uuid REFERENCES lessons(id),
  slide_number integer NOT NULL,
  title text,
  content text,
  learning_objective text,
  interaction_type text,
  media_notes text,
  ai_generated boolean DEFAULT false,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
```

## User Interface

### Storyboard Page Features

1. **Slide List Sidebar**
   - Shows all generated slides
   - Click to view details
   - Shows slide number and title
   - Responsive (hidden on mobile)

2. **Slide Detail View**
   - Full slide information display
   - Sections: Learning Objective, Content, Media & Speaker Notes, Interaction Type
   - Edit/Delete buttons
   - Previous/Next navigation
   - Slide counter

3. **Inline Editing**
   - Edit any slide field
   - Save or cancel changes
   - Real-time database updates

4. **Export Options**
   - PDF Document
   - PowerPoint Presentation
   - Word Document
   - Formats all slides with metadata

## Technical Details

### API Model

- **Provider**: OpenRouter
- **Model**: `google/gemini-2.0-flash`
- **Temperature**: 0.8 (high creativity for varied content)
- **Max Tokens**: 2500 (comprehensive slide generation)

### Performance

- ~0.5 second delay between API calls (rate limiting)
- Typical course: 30-50 slides generated in 2-5 minutes
- Error handling: Continues with remaining lessons if one fails

### Error Handling

- Clear error messages if API fails
- Graceful fallback if lesson data incomplete
- Preserves successful slides if generation partially fails
- Retry-friendly design

## Example Generated Slide

### Input Context

```text
Course: "Web Development Fundamentals"
Module: "HTML Basics"
Lesson: "Creating Your First Webpage"
Level: Beginner
Audience: High school students
```

### Generated Slide 1 (Introduction)

```json
{
  "slideNumber": 1,
  "title": "Build Your First Webpage Today",
  "type": "intro",
  "content": "• Learn the fundamental building blocks of web pages\n• Create valid HTML from scratch\n• Prepare for styling with CSS in the next module",
  "speakerNotes": "Welcome to HTML basics! Today you'll learn how websites are structured using HTML tags. By the end of this lesson, you'll be able to create a basic but complete webpage that works in any browser.",
  "mediaNote": "Opening animation: browser window showing a simple webpage loading",
  "learningObjective": "By the end of this lesson, beginners will be able to create a valid HTML5 document with proper structure and common elements.",
  "interactionType": "video"
}
```

## Best Practices for Using AI Slides

1. **Review Generated Content**: Always review AI-generated slides for accuracy
2. **Customize as Needed**: Edit slides to match your teaching style
3. **Add Media**: Use media recommendations to source appropriate images/videos
4. **Test Interactivity**: Verify interactive elements work as described
5. **Update Regularly**: Refresh slides annually or when course content changes

## Future Enhancements

Planned improvements to the slide generation system:

- [ ] Voice-over generation for speaker notes
- [ ] Automatic image/video suggestions with links
- [ ] Quiz question generation
- [ ] Multi-format export (Google Slides, Canva)
- [ ] Slide customization by teaching style
- [ ] A/B testing for engagement optimization
- [ ] Translation to multiple languages

## Configuration

### Environment Variables

```bash
OPENROUTER_API_KEY=your_api_key_here
```

### API Limits

- Rate: 1 request per 500ms per course
- Max slides per course: 500
- Max batch size: 50 lessons

## Support & Troubleshooting

### Issue: Slides not generating

**Solution**:

- Check API key configuration
- Verify course has modules and lessons
- Check course description not empty
- Try again after 30 seconds

### Issue: Poor quality slides

**Solution**:

- Provide more detailed lesson descriptions
- Specify target audience clearly
- Choose appropriate difficulty level
- Edit slides as needed

### Issue: Generation timeout

**Solution**:

- Try generating fewer lessons at once
- Check internet connection
- Verify API service status
- Contact support if persists

## API Reference

### Function: `generateSlidesForAllLessons()`

```typescript
generateSlidesForAllLessons(
  lessons: Array<{id, title, description}>,
  moduleTitle: string,
  moduleDescription: string,
  courseTitle: string,
  courseDescription: string,
  courseDifficulty: 'beginner' | 'intermediate' | 'advanced',
  courseLanguage: string,
  targetAudience: string,
  apiKey: string
): Promise<Array<{lessonId, lessonTitle, slides}>>
```

### Function: `generateSlidesFromLesson()`

```typescript
generateSlidesFromLesson(
  input: SlideGenerationInput,
  apiKey: string
): Promise<GeneratedSlide[]>
```

### Function: `formatSlidesForDatabase()`

```typescript
formatSlidesForDatabase(
  slides: GeneratedSlide[],
  courseId: string,
  moduleId: string,
  lessonId: string,
  startingSlideNumber?: number
): Array<{...database fields}>
```

## Conclusion

The AI-powered slide generation system transforms course creation from a manual, time-consuming process into an automated, intelligent workflow. By understanding the full context of a course, the system generates slides that are pedagogically sound, engaging, and perfectly aligned with learning objectives.
