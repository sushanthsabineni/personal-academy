'use server'

// AI Course Generation Service
// Handles generating course structure, modules, lessons, quizzes, and assessments using OpenRouter
// With automatic retries, fallback models, and error recovery

import { callOpenRouter } from './openrouter'
import { getAIPromptConfigWithDb } from '@/lib/serverConfig'
import { withRetry, withFallbackModels, logError } from './errorRecovery'

/**
 * Generate course structure (modules and lessons)
 */
export async function generateCourseStructure(input: {
  courseTitle: string
  learningOutcomes: string
  targetAudience?: string
  duration?: number
  knowledgeLevel?: string
}) {
  const config = await getAIPromptConfigWithDb()

  if (!config.openrouterApiKey) {
    throw new Error('OpenRouter API key not configured')
  }

  const prompt = `${config.systemPromptText}

Generate a professional course structure for:
- Title: ${input.courseTitle}
- Learning Outcomes: ${input.learningOutcomes}
- Target Audience: ${input.targetAudience || 'General professionals'}
- Duration per Module: ${input.duration || 30} minutes
- Knowledge Level: ${input.knowledgeLevel || 'Intermediate'}

${config.courseStructurePrompt}

Respond ONLY with valid JSON (no markdown, no explanation) in this exact format:
{
  "courseTitle": "string",
  "modules": [
    {
      "id": 1,
      "title": "string",
      "description": "string",
      "duration": number,
      "lessonsCount": number,
      "learningObjectives": ["string"]
    }
  ],
  "totalDuration": number,
  "estimatedLessons": number
}`

  try {
    // Use fallback models with automatic retry and error recovery
    const { result, modelUsed } = await withFallbackModels(
      config.openrouterModel,
      async (model) => {
        return await withRetry(
          async () => {
            const response = await callOpenRouter(
              config.openrouterApiKey as string,
              {
                model,
                messages: [{ role: 'user', content: prompt }],
                temperature: config.temperature,
                maxTokens: 2000,
              },
              []
            )

            const content = response.choices[0]?.message?.content || ''
            const jsonMatch = content.match(/\{[\s\S]*\}/)
            if (!jsonMatch) {
              throw new Error('Invalid JSON response from AI')
            }

            return JSON.parse(jsonMatch[0])
          },
          'generateCourseStructure'
        )
      },
      'generateCourseStructure'
    )

    console.log(`Course structure generated using model: ${modelUsed}`)
    return result
  } catch (error) {
    logError('generateCourseStructure', error, { courseTitle: input.courseTitle })
    throw error
  }
}

/**
 * Generate lesson content for a specific lesson
 */
export async function generateLesson(input: {
  courseTitle: string
  moduleTitle: string
  lessonTitle: string
  learningObjectives: string[]
  priorKnowledge?: string
}) {
  const config = await getAIPromptConfigWithDb()

  if (!config.openrouterApiKey) {
    throw new Error('OpenRouter API key not configured')
  }

  const prompt = `${config.systemPromptText}

Generate detailed lesson content for:
- Course: ${input.courseTitle}
- Module: ${input.moduleTitle}
- Lesson: ${input.lessonTitle}
- Learning Objectives:
${input.learningObjectives.map((obj) => `  * ${obj}`).join('\n')}
${input.priorKnowledge ? `- Prior Knowledge: ${input.priorKnowledge}` : ''}

${config.lessonGenerationPrompt}

Include:
1. Introduction (50-100 words)
2. Key Concepts (3-5 concepts with explanations)
3. Real-World Examples (2-3 practical examples)
4. Key Takeaways (3-5 bullet points)
5. Summary (50-100 words)

Respond ONLY with valid JSON (no markdown, no explanation):
{
  "lessonTitle": "string",
  "introduction": "string",
  "concepts": [
    {
      "title": "string",
      "description": "string",
      "example": "string"
    }
  ],
  "realWorldExamples": ["string"],
  "keyTakeaways": ["string"],
  "summary": "string"
}`

  try {
    const response = await callOpenRouter(
      config.openrouterApiKey,
      {
        model: config.openrouterModel,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: config.temperature,
        maxTokens: 3000,
      },
      config.openrouterFallbackModels || []
    )

    const content = response.choices[0]?.message?.content || ''
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from AI')
    }

    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error('Error generating lesson content:', error)
    throw error
  }
}

/**
 * Generate quiz questions for a module
 */
export async function generateQuiz(input: {
  courseTitle: string
  moduleTitle: string
  keyTopics: string[]
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
}) {
  const config = await getAIPromptConfigWithDb()

  if (!config.openrouterApiKey) {
    throw new Error('OpenRouter API key not configured')
  }

  const difficulty = input.difficulty || 'intermediate'

  const prompt = `${config.systemPromptText}

Generate ${difficulty} quiz questions for:
- Course: ${input.courseTitle}
- Module: ${input.moduleTitle}
- Key Topics:
${input.keyTopics.map((topic) => `  * ${topic}`).join('\n')}

${config.quizGenerationPrompt}

Create exactly 10 questions:
- 6 multiple choice questions (with 4 options each)
- 2 short answer questions (10-20 word answer)
- 2 essay questions (requires paragraph answer)

Respond ONLY with valid JSON (no markdown, no explanation):
{
  "questions": [
    {
      "id": 1,
      "type": "multiple-choice",
      "question": "string",
      "options": ["string"],
      "correctAnswer": number,
      "explanation": "string"
    },
    {
      "id": 2,
      "type": "short-answer",
      "question": "string",
      "correctAnswerKeywords": ["string"],
      "explanation": "string"
    },
    {
      "id": 3,
      "type": "essay",
      "question": "string",
      "rubric": "string",
      "keyPoints": ["string"]
    }
  ]
}`

  try {
    const response = await callOpenRouter(
      config.openrouterApiKey,
      {
        model: config.openrouterModel,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        maxTokens: 2500,
      },
      config.openrouterFallbackModels || []
    )

    const content = response.choices[0]?.message?.content || ''
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from AI')
    }

    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error('Error generating quiz content:', error)
    throw error
  }
}

/**
 * Generate assessment content for a course
 */
export async function generateAssessment(input: {
  courseTitle: string
  learningOutcomes: string[]
  assessmentType: 'final-project' | 'case-study' | 'capstone'
}) {
  const config = await getAIPromptConfigWithDb()

  if (!config.openrouterApiKey) {
    throw new Error('OpenRouter API key not configured')
  }

  const prompt = `${config.systemPromptText}

Generate a ${input.assessmentType} assessment for:
- Course: ${input.courseTitle}
- Learning Outcomes:
${input.learningOutcomes.map((outcome) => `  * ${outcome}`).join('\n')}

${config.assessmentPrompt}

Create a comprehensive assessment that:
1. Covers all learning outcomes
2. Is practical and real-world applicable
3. Can be completed in 2-4 hours
4. Has clear success criteria

Respond ONLY with valid JSON (no markdown, no explanation):
{
  "title": "string",
  "description": "string",
  "duration": "string",
  "objectives": ["string"],
  "requirements": ["string"],
  "deliverables": ["string"],
  "successCriteria": ["string"],
  "resources": ["string"],
  "rubric": {
    "criteria": [
      {
        "name": "string",
        "description": "string",
        "points": number
      }
    ],
    "totalPoints": number
  }
}`

  try {
    const response = await callOpenRouter(
      config.openrouterApiKey,
      {
        model: config.openrouterModel,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: config.temperature,
        maxTokens: 2000,
      },
      config.openrouterFallbackModels || []
    )

    const content = response.choices[0]?.message?.content || ''
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from AI')
    }

    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error('Error generating assessment content:', error)
    throw error
  }
}

/**
 * Generate comprehensive course plan
 */
export async function generateCompleteCourseContent(input: {
  courseTitle: string
  learningOutcomes: string
  targetAudience?: string
  duration?: number
  knowledgeLevel?: string
}) {
  try {
    // Step 1: Generate course structure
    const structure = await generateCourseStructure(input)

    // Step 2: Generate content for first module as example
    if (structure.modules && structure.modules.length > 0) {
      const firstModule = structure.modules[0]
      const content = await generateLessonContent({
        courseTitle: input.courseTitle,
        moduleTitle: firstModule.title,
        lessonTitle: `${firstModule.title} - Introduction`,
        learningObjectives: firstModule.learningObjectives || [],
        priorKnowledge: input.knowledgeLevel,
      })

      return {
        structure,
        sampleLessonContent: content,
        status: 'success',
      }
    }

    return {
      structure,
      status: 'partial',
    }
  } catch (error) {
    console.error('Error generating complete course content:', error)
    throw error
  }
}
