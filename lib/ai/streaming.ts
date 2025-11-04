import { getAIPromptConfigWithDb } from '@/lib/serverConfig'
import { callOpenRouter } from './openrouter'
import { getPromptTemplate } from '@/lib/prompts/templates.server'
import { resolveTokens, renderTemplate } from '@/lib/prompts/tokenResolver.server'
import { trackAIUsage, estimateCost, checkUserCredits } from './costTracking'
import { withRetry, withFallbackModels, createErrorResponse, logError } from './errorRecovery'

/**
 * Streaming options for AI content generation
 */
export interface StreamingOptions {
  userId: string
  courseId?: string
  generationType: 'course_structure' | 'lesson_content' | 'quiz_questions' | 'assessment' | 'full_course'
  topic: string
  context?: Record<string, string | number | boolean>
  model?: string
}

/**
 * Stream response chunk for client consumption
 */
export interface StreamChunk {
  type: 'content' | 'metadata' | 'complete' | 'error'
  data: Record<string, string | number | boolean | Record<string, unknown>> | string
  timestamp: number
}

/**
 * Metadata about the streaming operation
 */
interface StreamMetadata {
  modelUsed: string
  startTime: number
  chunkCount: number
  totalTokens: number
  creditsUsed: number
  estimatedCost: number
}

/**
 * Create a streaming response for AI content generation
 * Uses Server-Sent Events for real-time updates
 */
export async function createStreamingResponse(options: StreamingOptions): Promise<Response> {
  const config = await getAIPromptConfigWithDb()
  const apiKey = config.openrouterApiKey

  if (!apiKey) {
    throw new Error('OpenRouter API key not configured')
  }

  // Create a custom ReadableStream
  const encoder = new TextEncoder()
  let metadataCache: StreamMetadata | null = null

  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        metadataCache = {
          modelUsed: options.model || config.openrouterModel,
          startTime: Date.now(),
          chunkCount: 0,
          totalTokens: 0,
          creditsUsed: 0,
          estimatedCost: 0,
        }

        // Send initial metadata chunk
        const initialChunk: StreamChunk = {
          type: 'metadata',
          data: {
            status: 'starting',
            generationType: options.generationType,
            model: metadataCache.modelUsed,
          },
          timestamp: Date.now(),
        }
        const encoded = encoder.encode(`data: ${JSON.stringify(initialChunk)}\n\n`)
        controller.enqueue(encoded)

        // Build template-based prompt (stream_* templates)
        const tplKeyMap: Record<string, string> = {
          course_structure: 'stream_course_structure',
          lesson_content: 'stream_lesson_content',
          quiz_questions: 'stream_quiz_questions',
          assessment: 'stream_assessment',
          full_course: 'stream_course_structure',
        }
        const tpl = await getPromptTemplate(tplKeyMap[options.generationType] || 'stream_course_structure')
        const tokens = options.courseId ? await resolveTokens({ courseId: options.courseId }) : {}
        ;(tokens as any)['topic'] = options.topic
        const prompt = tpl?.template ? renderTemplate(tpl.template, tokens as any) : `${options.topic}`

        // Estimate cost
        const costEstimate = estimateCost(metadataCache.modelUsed, 500, 2000)
        metadataCache.estimatedCost = costEstimate.total
        metadataCache.creditsUsed = costEstimate.creditsUsed

        // Check user has credits
        const creditCheck = await checkUserCredits(options.userId, metadataCache.creditsUsed)
        if (!creditCheck.hasSufficientCredits) {
          const errorChunk: StreamChunk = {
            type: 'error',
            data: {
              error: 'insufficient_credits',
              message: `Insufficient credits. Required: ${metadataCache.creditsUsed}, Available: ${creditCheck.balance}`,
              balance: creditCheck.balance,
            },
            timestamp: Date.now(),
          }
          const errorEncoded = encoder.encode(`data: ${JSON.stringify(errorChunk)}\n\n`)
          controller.enqueue(errorEncoded)
          controller.close()
          return
        }

        // Send cost estimate
        const costChunk: StreamChunk = {
          type: 'metadata',
          data: {
            status: 'cost_calculated',
            creditsRequired: metadataCache.creditsUsed,
            estimatedCost: metadataCache.estimatedCost,
            userBalance: creditCheck.balance,
          },
          timestamp: Date.now(),
        }
        const costEncoded = encoder.encode(`data: ${JSON.stringify(costChunk)}\n\n`)
        controller.enqueue(costEncoded)

        // Generate with streaming, retries, and fallback models
        let fullContent = ''
        let inputTokens = 0
        let outputTokens = 0
        let modelUsed = metadataCache.modelUsed

        await withFallbackModels(
          metadataCache.modelUsed,
          async (primaryModel) => {
            modelUsed = primaryModel

            await withRetry(
              async () => {
                // Call OpenRouter API
                const response = await callOpenRouter(
                  apiKey,
                  {
                    model: primaryModel,
                    messages: [
                      ...(tpl?.system_preamble ? [{ role: 'system', content: tpl.system_preamble }] : []),
                      { role: 'user', content: prompt },
                    ],
                    temperature: 0.7,
                    maxTokens: 4000,
                  },
                  []
                )

                // Process response
                if (response.choices && response.choices[0]) {
                  const content = response.choices[0].message?.content || ''
                  fullContent += content
                  inputTokens = response.usage?.prompt_tokens || 500
                  outputTokens = response.usage?.completion_tokens || 2000

                  // Send content chunk
                  const contentChunk: StreamChunk = {
                    type: 'content',
                    data: {
                      content: content,
                      chunkIndex: metadataCache?.chunkCount || 0,
                      model: primaryModel,
                    },
                    timestamp: Date.now(),
                  }
                  const contentEncoded = encoder.encode(
                    `data: ${JSON.stringify(contentChunk)}\n\n`
                  )
                  controller.enqueue(contentEncoded)
                  if (metadataCache) {
                    metadataCache.chunkCount++
                  }
                }

                return fullContent
              },
              'streamContent'
            )

            return fullContent
          },
          'streamContent'
        )

        // Recalculate actual cost
        const actualCost = estimateCost(modelUsed, inputTokens, outputTokens)
        if (metadataCache) {
          metadataCache.creditsUsed = actualCost.creditsUsed
          metadataCache.estimatedCost = actualCost.total
          metadataCache.totalTokens = inputTokens + outputTokens
        }

        // Track usage
        const processingTime = Date.now() - (metadataCache?.startTime || Date.now())
        await trackAIUsage(
          options.userId,
          options.courseId,
          options.generationType,
          modelUsed,
          inputTokens,
          outputTokens,
          processingTime,
          'success'
        )

        // Parse and validate content if needed
        let parsedContent: string | Record<string, unknown> = fullContent
        if (options.generationType !== 'lesson_content') {
          try {
            const jsonMatch = fullContent.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
              parsedContent = JSON.parse(jsonMatch[0])
            }
          } catch {
            // If parsing fails, send raw content
            logError('streamContent', new Error('Failed to parse streaming content'), {
              context: { generationType: options.generationType },
            })
          }
        }

        // Send completion metadata
        const completeChunk: StreamChunk = {
          type: 'complete',
          data: {
            content: parsedContent,
            metadata: {
              modelUsed,
              totalTokens: metadataCache?.totalTokens || 0,
              inputTokens,
              outputTokens,
              creditsUsed: metadataCache?.creditsUsed || 0,
              estimatedCost: metadataCache?.estimatedCost || 0,
              processingTimeMs: processingTime,
              chunkCount: metadataCache?.chunkCount || 0,
            },
          },
          timestamp: Date.now(),
        }
        const completeEncoded = encoder.encode(`data: ${JSON.stringify(completeChunk)}\n\n`)
        controller.enqueue(completeEncoded)

        controller.close()
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'

        logError('streamContent', error instanceof Error ? error : new Error(String(error)), {
          context: { generationType: options.generationType, userId: options.userId },
        })

        const errorChunk: StreamChunk = {
          type: 'error',
          data: createErrorResponse(error),
          timestamp: Date.now(),
        }
        const errorEncoded = encoder.encode(`data: ${JSON.stringify(errorChunk)}\n\n`)
        controller.enqueue(errorEncoded)

        try {
          await trackAIUsage(
            options.userId,
            options.courseId,
            options.generationType,
            metadataCache?.modelUsed || 'unknown',
            0,
            0,
            Date.now() - (metadataCache?.startTime || Date.now()),
            'failed',
            errorMessage
          )
        } catch (trackingError) {
          logError('trackAIUsage', trackingError instanceof Error ? trackingError : new Error(String(trackingError)))
        }

        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

/**
 * Generate prompt based on generation type
 */
function generatePrompt(
  generationType: string,
  topic: string,
  context?: Record<string, string | number | boolean>
): string {
  const baseContext = context ? `\n\nContext: ${JSON.stringify(context)}` : ''

  const prompts: Record<string, string> = {
    course_structure: `Create a comprehensive course structure for: "${topic}". Include modules, lessons, and learning objectives. Format as JSON.${baseContext}`,

    lesson_content: `Write detailed lesson content for: "${topic}". Include explanations, examples, and key takeaways.${baseContext}`,

    quiz_questions: `Generate 10 quiz questions for: "${topic}". Include multiple choice, short answer, and true/false. Format as JSON.${baseContext}`,

    assessment: `Create an assessment for: "${topic}". Include grading rubric and project requirements. Format as JSON.${baseContext}`,

    full_course: `Create a complete course for: "${topic}". Include structure, lessons, quizzes, and assessment. Format as JSON.${baseContext}`,
  }

  return prompts[generationType] || prompts.course_structure
}

/**
 * Parse Server-Sent Event stream on client side
 */
export async function parseStreamingResponse(
  response: Response
): Promise<AsyncIterable<StreamChunk>> {
  const reader = response.body?.getReader()
  if (!reader) throw new Error('No response body')

  let buffer = ''

  return {
    async *[Symbol.asyncIterator]() {
      try {
        while (true) {
          const { done, value } = await reader.read()

          if (done) break

          const chunk = new TextDecoder().decode(value)
          buffer += chunk

          // Parse SSE format: "data: {...}\n\n"
          const parts = buffer.split('\n\n')

          // Keep the last incomplete chunk in buffer
          buffer = parts[parts.length - 1]

          // Process complete chunks
          for (let i = 0; i < parts.length - 1; i++) {
            const line = parts[i].trim()
            if (line.startsWith('data: ')) {
              try {
                const jsonStr = line.slice(6)
                const parsed = JSON.parse(jsonStr)
                yield parsed as StreamChunk
              } catch {
                console.error('Failed to parse SSE chunk')
              }
            }
          }
        }

        // Process any remaining buffer
        if (buffer.trim().startsWith('data: ')) {
          try {
            const jsonStr = buffer.trim().slice(6)
            const parsed = JSON.parse(jsonStr)
            yield parsed as StreamChunk
          } catch {
            console.error('Failed to parse final SSE chunk')
          }
        }
      } finally {
        reader.releaseLock()
      }
    },
  }
}

/**
 * Get streaming status information
 */
export interface StreamingStatus {
  activeStreams: number
  totalChunksSent: number
  averageChunkSize: number
  uptime: number
}

const streamingMetrics = {
  activeStreams: 0,
  totalChunksSent: 0,
  totalChunkBytes: 0,
  startTime: Date.now(),
}

export function getStreamingStatus(): StreamingStatus {
  return {
    activeStreams: streamingMetrics.activeStreams,
    totalChunksSent: streamingMetrics.totalChunksSent,
    averageChunkSize:
      streamingMetrics.totalChunksSent > 0
        ? streamingMetrics.totalChunkBytes / streamingMetrics.totalChunksSent
        : 0,
    uptime: Date.now() - streamingMetrics.startTime,
  }
}

/**
 * Update streaming metrics
 */
export function updateStreamingMetrics(
  activeStreams: number,
  chunksSent: number = 0,
  chunkBytes: number = 0
): void {
  streamingMetrics.activeStreams = activeStreams
  streamingMetrics.totalChunksSent += chunksSent
  streamingMetrics.totalChunkBytes += chunkBytes
}
