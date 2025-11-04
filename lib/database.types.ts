export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      courses: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          status: 'draft' | 'in_progress' | 'completed' | 'archived'
          current_step: number

          // Step 1 fields
          industry: string | null
          target_audience: string | null
          knowledge_level: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null
          learning_outcomes: string | null
          duration: number | null
          methodology: string | null
          target_location: string | null
          file_notes: string | null
          number_of_modules: number | null
          number_of_lessons_per_module: number | null
          expected_duration_unit: 'minutes' | 'hours' | null
          reference_links: string | null
          file_description: string | null

          // Step 2 fields
          course_type: 'simple' | 'interactive' | 'highly_interactive' | 'scenario_driven' | null
          audio_narration: boolean
          image_generation: boolean
          video_content: boolean
          knowledge_assessments: 'every_module' | 'end_of_course' | 'pre_post' | 'ai_decide' | null
          animation_motion: boolean
          engagement_percentage: number | null

          created_at: string
          updated_at: string
          completed_at: string | null
          deleted_at: string | null
        }
        Insert: Omit<Row, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Insert>
      }

      modules: {
        Row: {
          id: string
          course_id: string
          title: string
          description: string | null
          order_index: number
          ai_generated: boolean
          approved: boolean
          approved_at: string | null
          approved_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Row, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Insert>
      }

      lessons: {
        Row: {
          id: string
          module_id: string
          title: string
          description: string | null
          order_index: number
          estimated_duration: number | null
          ai_generated: boolean
          approved: boolean
          approved_at: string | null
          approved_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Row, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Insert>
      }

      slides: {
        Row: {
          id: string
          lesson_id: string
          slide_number: number
          title: string | null
          learning_objective: string | null
          duration: number | null // seconds
          engagement_score: number | null

          // Content fields
          on_screen_content: string | null
          narration_script: string | null
          visual_assets_notes: string | null
          interactive_components: {
            type: string
            config: Record<string, unknown>
          }[] | null

          // Assessment
          interaction_type: string | null
          assessment_type: string | null
          assessment_data: {
            question: string
            options: string[]
            correct_answer: string | number
            feedback: Record<string, string>
          } | null

          // Technical
          navigation_flow: string | null
          developer_notes: string | null
          file_format_compatibility: string[] | null

          // Approval
          approved: boolean
          approved_at: string | null
          approved_by: string | null

          created_at: string
          updated_at: string
        }
        Insert: Omit<Row, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Insert>
      }

      file_uploads: {
        Row: {
          id: string
          user_id: string
          course_id: string | null
          file_name: string
          file_url: string | null
          file_type: string | null
          file_size: number | null
          file_description: string | null
          processing_status: 'pending' | 'processing' | 'completed' | 'failed'
          processing_error: string | null
          extracted_text: string | null
          metadata: Record<string, unknown> | null
          created_at: string
        }
        Insert: Omit<Row, 'id' | 'created_at'>
        Update: Partial<Insert>
      }
    }

    Views: {
      course_details_view: {
        Row: {
          course_id: string
          title: string
          user_id: string
          status: string
          current_step: number
          number_of_modules: number | null
          number_of_lessons_per_module: number | null
          engagement_percentage: number | null
          modules_count: number
          lessons_count: number
          slides_count: number
          files_count: number
          approved_modules: number
          approved_lessons: number
          approved_slides: number
        }
      }
    }
  }
}
