/**
 * Slide Generator Utility
 * Generates presentation slides from lesson content using AI with comprehensive course context
 */

export interface SlideGenerationInput {
  lessonTitle: string;
  lessonDescription: string;
  lessonDuration?: number; // in minutes
  moduleTitle?: string;
  moduleDescription?: string;
  courseTitle?: string;
  courseDescription?: string;
  courseDifficulty?: 'beginner' | 'intermediate' | 'advanced';
  courseLanguage?: string;
  targetAudience?: string;
  slidesPerLesson?: number; // default: 3
  prompt?: string; // Custom prompt template
  systemPreamble?: string; // Custom system prompt
  model?: string; // Custom model override
  temperature?: number; // Temperature setting
  max_tokens?: number; // Max tokens setting
}

export interface GeneratedSlide {
  slideNumber: number;
  title: string;
  content: string; // Bullet points or main content
  speakerNotes: string; // Speaker notes/talking points
  mediaNote?: string; // Media recommendations
  learningObjective?: string; // SMART learning objective
  interactionType?: string; // interactive, quiz, video, etc
  type: 'intro' | 'content' | 'conclusion'; // Slide type
}

export interface SlideGenerationOutput {
  slides: GeneratedSlide[];
  totalSlides: number;
  lessonTitle: string;
}

/**
 * Format slides for display (bullet points)
 */
function formatContent(text: string): string {
  // Ensure content is formatted as bullet points
  const lines = text.split('\n').filter(line => line.trim());
  return lines.map(line => {
    // Remove existing bullet points/numbering
    const cleaned = line.replace(/^[\s•\-\d+.)\]]\s*/, '').trim();
    return cleaned ? `• ${cleaned}` : '';
  }).filter(Boolean).join('\n');
}

/**
 * Generate slides from lesson using AI with full course context
 * Each lesson generates 3 slides with comprehensive pedagogical information
 */
export async function generateSlidesFromLesson(
  input: SlideGenerationInput,
  apiKey: string
): Promise<GeneratedSlide[]> {
  const {
    lessonTitle,
    lessonDescription,
    moduleTitle = 'Course Module',
    moduleDescription = '',
    courseTitle = 'Course',
    courseDescription = '',
    courseDifficulty = 'intermediate',
    courseLanguage = 'English',
    targetAudience = 'Adult learners',
  } = input;

  if (!apiKey) {
    throw new Error('OpenRouter API key not found');
  }

  // Build comprehensive context for the AI
  const contextInfo = [
    `Course: ${courseTitle}`,
    courseDescription ? `Course Overview: ${courseDescription}` : '',
    `Difficulty Level: ${courseDifficulty}`,
    `Language: ${courseLanguage}`,
    `Target Audience: ${targetAudience}`,
    `Module: ${moduleTitle}`,
    moduleDescription ? `Module Content: ${moduleDescription}` : '',
    `Lesson: ${lessonTitle}`,
    `Lesson Content: ${lessonDescription}`,
  ].filter(Boolean).join('\n');
  
  const prompt = `You are an expert instructional designer and e-learning specialist creating professional, pedagogically sound presentation slides.

COURSE CONTEXT:
${contextInfo}

Your task: Generate exactly 3 engaging, educational presentation slides for this lesson that align with e-learning best practices.

Return ONLY a valid JSON array (no markdown, no extra text) with this exact structure:
[
  {
    "slideNumber": 1,
    "title": "String (5-8 words, compelling title)",
    "type": "intro",
    "content": "Bullet point\\nBullet point\\nBullet point",
    "speakerNotes": "2-3 sentences of presenter talking points",
    "mediaNote": "Specific media/graphic recommendation (e.g., 'Infographic showing...', 'Video of...')",
    "learningObjective": "Specific SMART learning objective for this slide",
    "interactionType": "interactive|quiz|video|image|discussion|reflection"
  },
  {
    "slideNumber": 2,
    "title": "String",
    "type": "content",
    "content": "Bullet point\\nBullet point\\nBullet point\\nBullet point",
    "speakerNotes": "2-3 sentences",
    "mediaNote": "Media recommendation",
    "learningObjective": "SMART objective",
    "interactionType": "interactive|quiz|video|image|discussion|reflection"
  },
  {
    "slideNumber": 3,
    "title": "String",
    "type": "conclusion",
    "content": "Key takeaway 1\\nKey takeaway 2\\nKey takeaway 3",
    "speakerNotes": "2-3 sentences summarizing and connecting to next steps",
    "mediaNote": "Summary visual or checkpoint",
    "learningObjective": "Reinforce core learning outcomes",
    "interactionType": "reflection|quiz|discussion"
  }
]

DETAILED REQUIREMENTS:

1. SLIDE 1 (Introduction):
   - Type: "intro"
   - Hook the audience with relevance to ${targetAudience}
   - Clearly state what learners will gain
   - Title should be engaging and specific
   - Interaction: "interactive" or "video"

2. SLIDE 2 (Main Content):
   - Type: "content"
   - Include 4 key bullet points with depth
   - Use specific examples relevant to the course difficulty level (${courseDifficulty})
   - Start with foundations, build to complexity
   - Interaction: "quiz", "interactive", or "discussion"

3. SLIDE 3 (Conclusion):
   - Type: "conclusion"
   - Summarize 3 key takeaways
   - Connect to ${courseTitle} and learner goals
   - Include call-to-action for reflection
   - Interaction: "reflection", "quiz", or "discussion"

QUALITY STANDARDS:
- Content must be accurate and aligned with ${courseDifficulty} level
- Language: accessible but professional
- Tone: engaging and supportive
- Each objective uses SMART criteria (Specific, Measurable, Achievable, Relevant, Time-bound)
- Media notes provide concrete, actionable guidance
- Speaker notes are conversational and informative
- Interaction types vary to maintain engagement
- Bullet points are concise (8-15 words each)

Return valid JSON only. No markdown. No explanations.`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://personal-academy.com',
        'X-Title': 'Personal Academy',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 2500,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenRouter API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const contentText = data.choices?.[0]?.message?.content;

    if (!contentText) {
      throw new Error('No response from AI model');
    }

    // Parse JSON response
    let slides: GeneratedSlide[];
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = contentText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }

      slides = JSON.parse(jsonMatch[0]) as GeneratedSlide[];

      // Validate and format slides
      slides = slides.map((slide, index) => ({
        ...slide,
        slideNumber: index + 1,
        content: formatContent(slide.content),
        type: (slide.type || 'content') as 'intro' | 'content' | 'conclusion',
      }));
    } catch {
      console.error('Failed to parse AI response:', contentText);
      throw new Error('Failed to parse slide generation response');
    }

    return slides;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error during slide generation');
  }
}

/**
 * Generate slides for multiple lessons with full course context
 */
export async function generateSlidesForAllLessons(
  lessons: Array<{
    id: string;
    title: string;
    description: string;
  }>,
  moduleTitle: string,
  moduleDescription: string = '',
  courseTitle: string = 'Course',
  courseDescription: string = '',
  courseKnowledgeLevel: string = 'intermediate',
  targetAudience: string = 'Adult learners',
  apiKey: string
): Promise<Array<{
  lessonId: string;
  lessonTitle: string;
  slides: GeneratedSlide[];
}>> {
  const results = [];

  for (const lesson of lessons) {
    try {
      const slides = await generateSlidesFromLesson(
        {
          lessonTitle: lesson.title,
          lessonDescription: lesson.description,
          moduleTitle,
          moduleDescription,
          courseTitle,
          courseDescription,
          courseDifficulty: courseKnowledgeLevel as 'beginner' | 'intermediate' | 'advanced',
          courseLanguage: 'English',
          targetAudience,
          slidesPerLesson: 3,
        },
        apiKey
      );

      results.push({
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        slides,
      });

      // Small delay between API calls to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Error generating slides for lesson "${lesson.title}":`, error);
      // Continue with next lesson even if one fails
    }
  }

  return results;
}

/**
 * Format slides for database insertion with comprehensive fields
 */
export function formatSlidesForDatabase(
  slides: GeneratedSlide[],
  courseId: string,
  moduleId: string,
  lessonId: string,
  startingSlideNumber: number = 1
): Array<{
  course_id: string;
  module_id: string;
  lesson_id: string;
  slide_number: number;
  title: string;
  content: string;
  narration: string;
  media_notes?: string;
  learning_objective?: string;
  interaction_type?: string;
  ai_generated: boolean;
}> {
  return slides.map((slide, index) => {
    const slideData: Record<string, unknown> = {
      course_id: courseId,
      module_id: moduleId,
      lesson_id: lessonId,
      slide_number: startingSlideNumber + index,
      title: slide.title,
      content: slide.content,
      narration: slide.speakerNotes,
      learning_objective: slide.learningObjective,
      interaction_type: slide.interactionType,
      ai_generated: true,
    };

    // Only add optional fields if they have values
    if (slide.mediaNote) {
      slideData.media_notes = slide.mediaNote;
    }

    // ai_notes column may not exist yet - only add if needed for your schema
    // if (slide.mediaNote) {
    //   slideData.ai_notes = `Media: ${slide.mediaNote}`;
    // }

    return slideData as {
      course_id: string;
      module_id: string;
      lesson_id: string;
      slide_number: number;
      title: string;
      content: string;
      narration: string;
      media_notes?: string;
      learning_objective?: string;
      interaction_type?: string;
      ai_generated: boolean;
    };
  });
}
