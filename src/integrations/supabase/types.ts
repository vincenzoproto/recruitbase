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
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
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
          avatar_url: string | null
          bio: string | null
          city: string | null
          created_at: string | null
          full_name: string
          id: string
          is_premium: boolean | null
          job_title: string | null
          linkedin_url: string | null
          onboarding_completed: boolean | null
          referral_code: string | null
          role: Database["public"]["Enums"]["user_role"]
          skills: string[] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string | null
          full_name: string
          id: string
          is_premium?: boolean | null
          job_title?: string | null
          linkedin_url?: string | null
          onboarding_completed?: boolean | null
          referral_code?: string | null
          role: Database["public"]["Enums"]["user_role"]
          skills?: string[] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          is_premium?: boolean | null
          job_title?: string | null
          linkedin_url?: string | null
          onboarding_completed?: boolean | null
          referral_code?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          skills?: string[] | null
          updated_at?: string | null
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
      calculate_match_score: {
        Args: { p_candidate_id: string; p_job_offer_id: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
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
