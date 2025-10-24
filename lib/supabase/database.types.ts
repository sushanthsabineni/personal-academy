// TypeScript types for Supabase schema
// Based on DATABASE_SCHEMA.md
// Generated for use with @supabase/auth-helpers-nextjs

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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          credits_balance: number
          is_premium: boolean
          referral_code: string
          referred_by: string | null
          auth_provider: string
          email_verified: boolean
          last_login_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          credits_balance?: number
          is_premium?: boolean
          referral_code?: string
          referred_by?: string | null
          auth_provider?: string
          email_verified?: boolean
          last_login_at?: string | null
        }
        Update: {
          full_name?: string | null
          avatar_url?: string | null
          credits_balance?: number
          is_premium?: boolean
          last_login_at?: string | null
        }
      }
      courses: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          status: 'draft' | 'in_progress' | 'completed' | 'archived'
          current_step: number
          industry: string | null
          target_audience: string | null
          knowledge_level: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null
          learning_outcomes: string | null
          duration: number | null
          methodology: string | null
          target_location: string | null
          file_notes: string | null
          created_at: string
          updated_at: string
          completed_at: string | null
          deleted_at: string | null
        }
        Insert: {
          user_id: string
          title: string
          description?: string | null
          status?: 'draft' | 'in_progress' | 'completed' | 'archived'
          current_step?: number
          industry?: string | null
          target_audience?: string | null
          knowledge_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null
          learning_outcomes?: string | null
          duration?: number | null
          methodology?: string | null
          target_location?: string | null
          file_notes?: string | null
        }
        Update: {
          title?: string
          description?: string | null
          status?: 'draft' | 'in_progress' | 'completed' | 'archived'
          current_step?: number
          completed_at?: string | null
          industry?: string | null
          target_audience?: string | null
          knowledge_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null
          learning_outcomes?: string | null
          duration?: number | null
          methodology?: string | null
          target_location?: string | null
          file_notes?: string | null
          deleted_at?: string | null
        }
      }
      modules: {
        Row: {
          id: string
          course_id: string
          title: string
          description: string | null
          order_index: number
          is_approved: boolean
          ai_generated: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          course_id: string
          title: string
          description?: string | null
          order_index: number
          is_approved?: boolean
          ai_generated?: boolean
        }
        Update: {
          title?: string
          description?: string | null
          order_index?: number
          is_approved?: boolean
        }
      }
      lessons: {
        Row: {
          id: string
          module_id: string
          course_id: string
          title: string
          description: string | null
          order_index: number
          duration: number | null
          ai_generated: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          module_id: string
          course_id: string
          title: string
          description?: string | null
          order_index: number
          duration?: number | null
          ai_generated?: boolean
        }
        Update: {
          title?: string
          description?: string | null
          order_index?: number
          duration?: number | null
        }
      }
      slides: {
        Row: {
          id: string
          lesson_id: string
          module_id: string
          course_id: string
          slide_number: number
          title: string | null
          learning_objective: string | null
          content: string | null
          media_notes: string | null
          interaction_type: string | null
          assessment_type: string | null
          color: string
          narration: string | null
          ai_notes: string | null
          duration: number | null
          engagement_score: number | null
          ai_generated: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          lesson_id: string
          module_id: string
          course_id: string
          slide_number: number
          title?: string | null
          learning_objective?: string | null
          content?: string | null
          media_notes?: string | null
          interaction_type?: string | null
          assessment_type?: string | null
          color?: string
          narration?: string | null
          ai_notes?: string | null
          duration?: number | null
          engagement_score?: number | null
          ai_generated?: boolean
        }
        Update: {
          title?: string | null
          learning_objective?: string | null
          content?: string | null
          media_notes?: string | null
          interaction_type?: string | null
          assessment_type?: string | null
          color?: string
          narration?: string | null
          ai_notes?: string | null
          duration?: number | null
          engagement_score?: number | null
        }
      }
      credits_transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          type: 'purchase' | 'earned' | 'spent' | 'refund' | 'bonus' | 'referral'
          description: string
          balance_after: number
          invoice_number: string | null
          payment_id: string | null
          course_id: string | null
          referral_id: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          user_id: string
          amount: number
          type: 'purchase' | 'earned' | 'spent' | 'refund' | 'bonus' | 'referral'
          description: string
          balance_after: number
          invoice_number?: string | null
          payment_id?: string | null
          course_id?: string | null
          referral_id?: string | null
          metadata?: Json
        }
        Update: {
          amount?: number
          type?: 'purchase' | 'earned' | 'spent' | 'refund' | 'bonus' | 'referral'
          description?: string
          balance_after?: number
        }
      }
      referrals: {
        Row: {
          id: string
          referrer_id: string
          referee_id: string
          referral_code: string
          status: 'pending' | 'completed' | 'expired'
          referrer_bonus_credits: number
          referee_bonus_credits: number
          referee_first_purchase_at: string | null
          referee_first_purchase_amount: number | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          referrer_id: string
          referee_id: string
          referral_code: string
          status?: 'pending' | 'completed' | 'expired'
          referrer_bonus_credits?: number
          referee_bonus_credits?: number
        }
        Update: {
          status?: 'pending' | 'completed' | 'expired'
          referrer_bonus_credits?: number
          referee_bonus_credits?: number
          referee_first_purchase_at?: string | null
          referee_first_purchase_amount?: number | null
          completed_at?: string | null
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          stripe_payment_intent_id: string
          stripe_customer_id: string | null
          stripe_payment_method_id: string | null
          amount: number
          currency: string
          credits_purchased: number
          status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded' | 'canceled'
          payment_method_type: string | null
          card_last4: string | null
          card_brand: string | null
          receipt_url: string | null
          invoice_number: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          stripe_payment_intent_id: string
          amount: number
          currency: string
          credits_purchased: number
          status?: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded' | 'canceled'
          stripe_customer_id?: string | null
          stripe_payment_method_id?: string | null
          payment_method_type?: string | null
          card_last4?: string | null
          card_brand?: string | null
          receipt_url?: string | null
          invoice_number?: string | null
          metadata?: Json
        }
        Update: {
          status?: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded' | 'canceled'
          stripe_customer_id?: string | null
          stripe_payment_method_id?: string | null
          payment_method_type?: string | null
          card_last4?: string | null
          card_brand?: string | null
          receipt_url?: string | null
        }
      }
      file_uploads: {
        Row: {
          id: string
          user_id: string
          course_id: string | null
          file_name: string
          file_size: number
          file_type: string
          storage_path: string
          upload_status: 'pending' | 'processing' | 'completed' | 'failed'
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          course_id?: string | null
          file_name: string
          file_size: number
          file_type: string
          storage_path: string
          upload_status?: 'pending' | 'processing' | 'completed' | 'failed'
        }
        Update: {
          upload_status?: 'pending' | 'processing' | 'completed' | 'failed'
        }
      }
      ai_generations: {
        Row: {
          id: string
          user_id: string
          course_id: string | null
          generation_type: string
          prompt_text: string | null
          response_text: string | null
          tokens_used: number
          credits_spent: number
          model_version: string
          created_at: string
        }
        Insert: {
          user_id: string
          course_id?: string | null
          generation_type: string
          prompt_text?: string | null
          response_text?: string | null
          tokens_used: number
          credits_spent: number
          model_version: string
        }
        Update: {
          response_text?: string | null
          tokens_used?: number
          credits_spent?: number
        }
      }
    }
    Functions: {
      get_user_credits: {
        Args: { user_uuid: string }
        Returns: number
      }
      update_credit_balance: {
        Args: {
          user_uuid: string
          amount_change: number
          transaction_type: string
          transaction_description: string
          related_payment_id?: string | null
          related_course_id?: string | null
        }
        Returns: boolean
      }
      get_course_stats: {
        Args: { course_uuid: string }
        Returns: {
          total_modules: number
          total_lessons: number
          total_slides: number
          estimated_duration: number
        }
      }
      get_referral_stats: {
        Args: { user_uuid: string }
        Returns: {
          total_referrals: number
          completed_referrals: number
          pending_referrals: number
          total_credits_earned: number
        }
      }
      process_referral_bonus: {
        Args: {
          referee_uuid: string
          purchase_amount: number
          purchase_credits: number
        }
        Returns: boolean
      }
    }
  }
}
