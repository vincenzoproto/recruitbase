export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      academy_content: {
        Row: {
          article_text: string | null
          category: string
          content_type: string
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_premium: boolean | null
          order_position: number | null
          title: string
          video_url: string | null
        }
        Insert: {
          article_text?: string | null
          category: string
          content_type: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_premium?: boolean | null
          order_position?: number | null
          title: string
          video_url?: string | null
        }
        Update: {
          article_text?: string | null
          category?: string
          content_type?: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_premium?: boolean | null
          order_position?: number | null
          title?: string
          video_url?: string | null
        }
        Relationships: []
      }
      achievements: {
        Row: {
          badge_type: string
          earned_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          badge_type: string
          earned_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          badge_type?: string
          earned_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ambassador_earnings: {
        Row: {
          ambassador_id: string
          amount: number
          created_at: string | null
          id: string
          paid_at: string | null
          payment_requested_at: string | null
          referral_id: string
          status: string
        }
        Insert: {
          ambassador_id: string
          amount?: number
          created_at?: string | null
          id?: string
          paid_at?: string | null
          payment_requested_at?: string | null
          referral_id: string
          status?: string
        }
        Update: {
          ambassador_id?: string
          amount?: number
          created_at?: string | null
          id?: string
          paid_at?: string | null
          payment_requested_at?: string | null
          referral_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ambassador_earnings_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "ambassador_referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      ambassador_referrals: {
        Row: {
          ambassador_id: string
          created_at: string | null
          first_payment_date: string | null
          id: string
          referral_code: string
          referred_user_id: string
          signup_date: string | null
          status: string
        }
        Insert: {
          ambassador_id: string
          created_at?: string | null
          first_payment_date?: string | null
          id?: string
          referral_code: string
          referred_user_id: string
          signup_date?: string | null
          status?: string
        }
        Update: {
          ambassador_id?: string
          created_at?: string | null
          first_payment_date?: string | null
          id?: string
          referral_code?: string
          referred_user_id?: string
          signup_date?: string | null
          status?: string
        }
        Relationships: []
      }
      applications: {
        Row: {
          applied_at: string | null
          candidate_id: string
          id: string
          job_offer_id: string
          status: string | null
        }
        Insert: {
          applied_at?: string | null
          candidate_id: string
          id?: string
          job_offer_id: string
          status?: string | null
        }
        Update: {
          applied_at?: string | null
          candidate_id?: string
          id?: string
          job_offer_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_job_offer_id_fkey"
            columns: ["job_offer_id"]
            isOneToOne: false
            referencedRelation: "job_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      biometric_credentials: {
        Row: {
          counter: number | null
          created_at: string | null
          credential_id: string
          device_name: string | null
          id: string
          last_used: string | null
          public_key: string
          user_id: string
        }
        Insert: {
          counter?: number | null
          created_at?: string | null
          credential_id: string
          device_name?: string | null
          id?: string
          last_used?: string | null
          public_key: string
          user_id: string
        }
        Update: {
          counter?: number | null
          created_at?: string | null
          credential_id?: string
          device_name?: string | null
          id?: string
          last_used?: string | null
          public_key?: string
          user_id?: string
        }
        Relationships: []
      }
      candidate_notes: {
        Row: {
          candidate_id: string
          content: string
          created_at: string | null
          id: string
          recruiter_id: string
        }
        Insert: {
          candidate_id: string
          content: string
          created_at?: string | null
          id?: string
          recruiter_id: string
        }
        Update: {
          candidate_id?: string
          content?: string
          created_at?: string | null
          id?: string
          recruiter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_notes_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_notes_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_tags: {
        Row: {
          candidate_id: string
          created_at: string | null
          id: string
          tag_name: string
        }
        Insert: {
          candidate_id: string
          created_at?: string | null
          id?: string
          tag_name: string
        }
        Update: {
          candidate_id?: string
          created_at?: string | null
          id?: string
          tag_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_tags_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_tasks: {
        Row: {
          candidate_id: string
          completed: boolean | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          recruiter_id: string
          title: string
        }
        Insert: {
          candidate_id: string
          completed?: boolean | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          recruiter_id: string
          title: string
        }
        Update: {
          candidate_id?: string
          completed?: boolean | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          recruiter_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_tasks_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_tasks_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string | null
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string | null
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "chat_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_groups: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      daily_recruiter_metrics: {
        Row: {
          avg_response_time_hours: number | null
          created_at: string | null
          date: string
          id: string
          new_contacts_count: number | null
          user_id: string
          weekly_conversion_rate: number | null
        }
        Insert: {
          avg_response_time_hours?: number | null
          created_at?: string | null
          date?: string
          id?: string
          new_contacts_count?: number | null
          user_id: string
          weekly_conversion_rate?: number | null
        }
        Update: {
          avg_response_time_hours?: number | null
          created_at?: string | null
          date?: string
          id?: string
          new_contacts_count?: number | null
          user_id?: string
          weekly_conversion_rate?: number | null
        }
        Relationships: []
      }
      favorites: {
        Row: {
          candidate_id: string
          created_at: string | null
          id: string
          recruiter_id: string
        }
        Insert: {
          candidate_id: string
          created_at?: string | null
          id?: string
          recruiter_id: string
        }
        Update: {
          candidate_id?: string
          created_at?: string | null
          id?: string
          recruiter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_messages: {
        Row: {
          content: string
          created_at: string | null
          group_id: string
          id: string
          media_url: string | null
          message_type: string | null
          read_by: string[] | null
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          group_id: string
          id?: string
          media_url?: string | null
          message_type?: string | null
          read_by?: string[] | null
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          group_id?: string
          id?: string
          media_url?: string | null
          message_type?: string | null
          read_by?: string[] | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "chat_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      interactions: {
        Row: {
          candidate_id: string
          content: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          recruiter_id: string
          type: string
        }
        Insert: {
          candidate_id: string
          content?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          recruiter_id: string
          type: string
        }
        Update: {
          candidate_id?: string
          content?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          recruiter_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "interactions_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactions_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_offers: {
        Row: {
          city: string
          created_at: string | null
          description: string
          experience_level: Database["public"]["Enums"]["experience_level"]
          id: string
          is_active: boolean | null
          recruiter_id: string
          sector: string
          title: string
          updated_at: string | null
        }
        Insert: {
          city: string
          created_at?: string | null
          description: string
          experience_level: Database["public"]["Enums"]["experience_level"]
          id?: string
          is_active?: boolean | null
          recruiter_id: string
          sector: string
          title: string
          updated_at?: string | null
        }
        Update: {
          city?: string
          created_at?: string | null
          description?: string
          experience_level?: Database["public"]["Enums"]["experience_level"]
          id?: string
          is_active?: boolean | null
          recruiter_id?: string
          sector?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_offers_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          candidate_id: string
          created_at: string | null
          id: string
          job_offer_id: string
          match_score: number
        }
        Insert: {
          candidate_id: string
          created_at?: string | null
          id?: string
          job_offer_id: string
          match_score: number
        }
        Update: {
          candidate_id?: string
          created_at?: string | null
          id?: string
          job_offer_id?: string
          match_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "matches_job_offer_id_fkey"
            columns: ["job_offer_id"]
            isOneToOne: false
            referencedRelation: "job_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          candidate_id: string
          created_at: string | null
          id: string
          notes: string | null
          recruiter_id: string
          scheduled_date: string
          scheduled_time: string
          status: string | null
        }
        Insert: {
          candidate_id: string
          created_at?: string | null
          id?: string
          notes?: string | null
          recruiter_id: string
          scheduled_date: string
          scheduled_time: string
          status?: string | null
        }
        Update: {
          candidate_id?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          recruiter_id?: string
          scheduled_date?: string
          scheduled_time?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meetings_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          media_url: string | null
          message_type: string | null
          read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          media_url?: string | null
          message_type?: string | null
          read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          media_url?: string | null
          message_type?: string | null
          read?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          link: string | null
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          link?: string | null
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          link?: string | null
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      pipeline_stages: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          position: number
          recruiter_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          position: number
          recruiter_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          position?: number
          recruiter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_stages_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string | null
          created_at: string
          hashtags: string[] | null
          id: string
          media_type: string | null
          media_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          hashtags?: string[] | null
          id?: string
          media_type?: string | null
          media_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          hashtags?: string[] | null
          id?: string
          media_type?: string | null
          media_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_views: {
        Row: {
          created_at: string | null
          id: string
          viewed_profile_id: string
          viewer_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          viewed_profile_id: string
          viewer_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          viewed_profile_id?: string
          viewer_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          availability: string | null
          avatar_url: string | null
          bio: string | null
          city: string | null
          created_at: string | null
          cv_url: string | null
          email_verified: boolean | null
          engagement_score: number | null
          full_name: string
          id: string
          is_favorite: boolean | null
          is_premium: boolean | null
          job_title: string | null
          last_contact_date: string | null
          linkedin_url: string | null
          linkedin_verified: boolean | null
          onboarding_completed: boolean | null
          phone_number: string | null
          pipeline_stage_id: string | null
          referral_code: string | null
          role: Database["public"]["Enums"]["user_role"]
          skills: string[] | null
          talent_relationship_score: number | null
          trs_last_updated: string | null
          updated_at: string | null
        }
        Insert: {
          availability?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string | null
          cv_url?: string | null
          email_verified?: boolean | null
          engagement_score?: number | null
          full_name: string
          id: string
          is_favorite?: boolean | null
          is_premium?: boolean | null
          job_title?: string | null
          last_contact_date?: string | null
          linkedin_url?: string | null
          linkedin_verified?: boolean | null
          onboarding_completed?: boolean | null
          phone_number?: string | null
          pipeline_stage_id?: string | null
          referral_code?: string | null
          role: Database["public"]["Enums"]["user_role"]
          skills?: string[] | null
          talent_relationship_score?: number | null
          trs_last_updated?: string | null
          updated_at?: string | null
        }
        Update: {
          availability?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string | null
          cv_url?: string | null
          email_verified?: boolean | null
          engagement_score?: number | null
          full_name?: string
          id?: string
          is_favorite?: boolean | null
          is_premium?: boolean | null
          job_title?: string | null
          last_contact_date?: string | null
          linkedin_url?: string | null
          linkedin_verified?: boolean | null
          onboarding_completed?: boolean | null
          phone_number?: string | null
          pipeline_stage_id?: string | null
          referral_code?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          skills?: string[] | null
          talent_relationship_score?: number | null
          trs_last_updated?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_pipeline_stage_id_fkey"
            columns: ["pipeline_stage_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      recruiter_stats: {
        Row: {
          avg_response_time_hours: number | null
          avg_trs: number | null
          badge_type: string | null
          country: string | null
          created_at: string | null
          id: string
          last_updated: string | null
          monthly_contacts: number | null
          ranking_position: number | null
          total_referral_earnings: number | null
          user_id: string
          weekly_conversion_rate: number | null
        }
        Insert: {
          avg_response_time_hours?: number | null
          avg_trs?: number | null
          badge_type?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          last_updated?: string | null
          monthly_contacts?: number | null
          ranking_position?: number | null
          total_referral_earnings?: number | null
          user_id: string
          weekly_conversion_rate?: number | null
        }
        Update: {
          avg_response_time_hours?: number | null
          avg_trs?: number | null
          badge_type?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          last_updated?: string | null
          monthly_contacts?: number | null
          ranking_position?: number | null
          total_referral_earnings?: number | null
          user_id?: string
          weekly_conversion_rate?: number | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_end: string | null
          trial_start: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_insights: {
        Row: {
          date: string | null
          id: string
          metric_type: string
          metric_value: number | null
          user_id: string
        }
        Insert: {
          date?: string | null
          id?: string
          metric_type: string
          metric_value?: number | null
          user_id: string
        }
        Update: {
          date?: string | null
          id?: string
          metric_type?: string
          metric_value?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_insights_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_achievement: {
        Args: { p_badge_type: string; p_user_id: string }
        Returns: undefined
      }
      calculate_match_score: {
        Args: { p_candidate_id: string; p_job_offer_id: string }
        Returns: number
      }
      calculate_trs: {
        Args: { candidate_uuid: string; recruiter_uuid: string }
        Returns: number
      }
      candidates_needing_followup: {
        Args: { recruiter_uuid: string }
        Returns: {
          candidate_id: string
          days_since_contact: number
          full_name: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      update_recruiter_rankings: { Args: never; Returns: undefined }
    }
    Enums: {
      experience_level: "entry" | "junior" | "mid" | "senior" | "lead"
      user_role: "recruiter" | "candidate" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      experience_level: ["entry", "junior", "mid", "senior", "lead"],
      user_role: ["recruiter", "candidate", "admin"],
    },
  },
} as const
