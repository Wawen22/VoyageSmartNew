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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      accommodations: {
        Row: {
          address: string | null
          booking_reference: string | null
          booking_url: string | null
          check_in: string
          check_in_time: string | null
          check_out: string
          check_out_time: string | null
          created_at: string
          created_by: string
          currency: string
          document_url: string | null
          id: string
          name: string
          notes: string | null
          price: number | null
          trip_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          booking_reference?: string | null
          booking_url?: string | null
          check_in: string
          check_in_time?: string | null
          check_out: string
          check_out_time?: string | null
          created_at?: string
          created_by: string
          currency?: string
          document_url?: string | null
          id?: string
          name: string
          notes?: string | null
          price?: number | null
          trip_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          booking_reference?: string | null
          booking_url?: string | null
          check_in?: string
          check_in_time?: string | null
          check_out?: string
          check_out_time?: string | null
          created_at?: string
          created_by?: string
          currency?: string
          document_url?: string | null
          id?: string
          name?: string
          notes?: string | null
          price?: number | null
          trip_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accommodations_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_items: {
        Row: {
          category: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string
          created_by: string
          id: string
          is_completed: boolean
          text: string
          trip_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          created_by: string
          id?: string
          is_completed?: boolean
          text: string
          trip_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          created_by?: string
          id?: string
          is_completed?: boolean
          text?: string
          trip_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checklist_items_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_splits: {
        Row: {
          amount: number
          created_at: string
          expense_id: string
          id: string
          is_paid: boolean
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          expense_id: string
          id?: string
          is_paid?: boolean
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          expense_id?: string
          id?: string
          is_paid?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_splits_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: Database["public"]["Enums"]["expense_category"]
          created_at: string
          created_by: string
          currency: string
          description: string
          expense_date: string
          id: string
          paid_by: string
          receipt_url: string | null
          trip_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          category?: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          created_by: string
          currency?: string
          description: string
          expense_date?: string
          id?: string
          paid_by: string
          receipt_url?: string | null
          trip_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          created_by?: string
          currency?: string
          description?: string
          expense_date?: string
          id?: string
          paid_by?: string
          receipt_url?: string | null
          trip_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      itinerary_activities: {
        Row: {
          activity_date: string
          category: string | null
          created_at: string
          created_by: string
          description: string | null
          end_time: string | null
          id: string
          latitude: number | null
          location: string | null
          longitude: number | null
          notes: string | null
          start_time: string | null
          title: string
          trip_id: string
          updated_at: string
        }
        Insert: {
          activity_date: string
          category?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          end_time?: string | null
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          notes?: string | null
          start_time?: string | null
          title: string
          trip_id: string
          updated_at?: string
        }
        Update: {
          activity_date?: string
          category?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          end_time?: string | null
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          notes?: string | null
          start_time?: string | null
          title?: string
          trip_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "itinerary_activities_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          title: string
          trip_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          title: string
          trip_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          title?: string
          trip_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
          is_pro: boolean | null
          stripe_customer_id: string | null
          ai_usage_count: number | null
          trial_ends_at: string | null
          pro_source: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
          is_pro?: boolean | null
          stripe_customer_id?: string | null
          ai_usage_count?: number | null
          trial_ends_at?: string | null
          pro_source?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          is_pro?: boolean | null
          stripe_customer_id?: string | null
          ai_usage_count?: number | null
          trial_ends_at?: string | null
          pro_source?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          id: string
          code: string
          code_hash: string
          name: string
          description: string | null
          type: Database["public"]["Enums"]["promo_code_type"]
          trial_days: number | null
          discount_percent: number | null
          lifetime_pro: boolean
          max_total_uses: number | null
          current_uses: number
          max_uses_per_user: number
          starts_at: string
          expires_at: string | null
          is_active: boolean
          created_by: string | null
          created_at: string
          updated_at: string
          notes: string | null
        }
        Insert: {
          id?: string
          code: string
          code_hash: string
          name: string
          description?: string | null
          type?: Database["public"]["Enums"]["promo_code_type"]
          trial_days?: number | null
          discount_percent?: number | null
          lifetime_pro?: boolean
          max_total_uses?: number | null
          current_uses?: number
          max_uses_per_user?: number
          starts_at?: string
          expires_at?: string | null
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
          notes?: string | null
        }
        Update: {
          id?: string
          code?: string
          code_hash?: string
          name?: string
          description?: string | null
          type?: Database["public"]["Enums"]["promo_code_type"]
          trial_days?: number | null
          discount_percent?: number | null
          lifetime_pro?: boolean
          max_total_uses?: number | null
          current_uses?: number
          max_uses_per_user?: number
          starts_at?: string
          expires_at?: string | null
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
          notes?: string | null
        }
        Relationships: []
      }
      promo_code_redemptions: {
        Row: {
          id: string
          user_id: string
          promo_code_id: string
          redeemed_at: string
          ip_address: string | null
          user_agent: string | null
          trial_ends_at: string | null
          discount_applied: number | null
          metadata: Json
        }
        Insert: {
          id?: string
          user_id: string
          promo_code_id: string
          redeemed_at?: string
          ip_address?: string | null
          user_agent?: string | null
          trial_ends_at?: string | null
          discount_applied?: number | null
          metadata?: Json
        }
        Update: {
          id?: string
          user_id?: string
          promo_code_id?: string
          redeemed_at?: string
          ip_address?: string | null
          user_agent?: string | null
          trial_ends_at?: string | null
          discount_applied?: number | null
          metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "promo_code_redemptions_promo_code_id_fkey"
            columns: ["promo_code_id"]
            isOneToOne: false
            referencedRelation: "promo_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      settlements: {
        Row: {
          amount: number
          created_at: string
          created_by: string
          from_user_id: string
          id: string
          notes: string | null
          settled_at: string
          to_user_id: string
          trip_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by: string
          from_user_id: string
          id?: string
          notes?: string | null
          settled_at?: string
          to_user_id: string
          trip_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string
          from_user_id?: string
          id?: string
          notes?: string | null
          settled_at?: string
          to_user_id?: string
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "settlements_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      transports: {
        Row: {
          arrival_datetime: string | null
          arrival_location: string
          booking_reference: string | null
          carrier: string | null
          created_at: string
          created_by: string
          currency: string
          departure_datetime: string
          departure_location: string
          document_url: string | null
          id: string
          notes: string | null
          price: number | null
          transport_type: Database["public"]["Enums"]["transport_type"]
          trip_id: string
          updated_at: string
        }
        Insert: {
          arrival_datetime?: string | null
          arrival_location: string
          booking_reference?: string | null
          carrier?: string | null
          created_at?: string
          created_by: string
          currency?: string
          departure_datetime: string
          departure_location: string
          document_url?: string | null
          id?: string
          notes?: string | null
          price?: number | null
          transport_type?: Database["public"]["Enums"]["transport_type"]
          trip_id: string
          updated_at?: string
        }
        Update: {
          arrival_datetime?: string | null
          arrival_location?: string
          booking_reference?: string | null
          carrier?: string | null
          created_at?: string
          created_by?: string
          currency?: string
          departure_datetime?: string
          departure_location?: string
          document_url?: string | null
          id?: string
          notes?: string | null
          price?: number | null
          transport_type?: Database["public"]["Enums"]["transport_type"]
          trip_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transports_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_invitations: {
        Row: {
          created_at: string
          id: string
          invited_by: string
          invited_email: string
          responded_at: string | null
          status: Database["public"]["Enums"]["invitation_status"]
          trip_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_by: string
          invited_email: string
          responded_at?: string | null
          status?: Database["public"]["Enums"]["invitation_status"]
          trip_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_by?: string
          invited_email?: string
          responded_at?: string | null
          status?: Database["public"]["Enums"]["invitation_status"]
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_invitations_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_members: {
        Row: {
          id: string
          joined_at: string
          role: Database["public"]["Enums"]["trip_member_role"]
          trip_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["trip_member_role"]
          trip_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["trip_member_role"]
          trip_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_members_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          cover_image: string | null
          created_at: string
          description: string | null
          destination: string
          end_date: string
          id: string
          is_public_shared: boolean
          public_share_token: string | null
          start_date: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cover_image?: string | null
          created_at?: string
          description?: string | null
          destination: string
          end_date: string
          id?: string
          is_public_shared?: boolean
          public_share_token?: string | null
          start_date: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cover_image?: string | null
          created_at?: string
          description?: string | null
          destination?: string
          end_date?: string
          id?: string
          is_public_shared?: boolean
          public_share_token?: string | null
          start_date?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_public_trip_accommodations: {
        Args: { _token: string; _trip_id: string }
        Returns: {
          address: string
          check_in: string
          check_in_time: string
          check_out: string
          check_out_time: string
          id: string
          name: string
        }[]
      }
      get_public_trip_activities: {
        Args: { _token: string; _trip_id: string }
        Returns: {
          activity_date: string
          category: string
          description: string
          end_time: string
          id: string
          location: string
          start_time: string
          title: string
        }[]
      }
      get_public_trip_by_token: {
        Args: { _token: string }
        Returns: {
          cover_image: string
          description: string
          destination: string
          end_date: string
          id: string
          start_date: string
          status: string
          title: string
        }[]
      }
      get_public_trip_transports: {
        Args: { _token: string; _trip_id: string }
        Returns: {
          arrival_datetime: string
          arrival_location: string
          carrier: string
          departure_datetime: string
          departure_location: string
          id: string
          transport_type: string
        }[]
      }
      is_trip_admin: {
        Args: { _trip_id: string; _user_id: string }
        Returns: boolean
      }
      is_trip_member: {
        Args: { _trip_id: string; _user_id: string }
        Returns: boolean
      }
      notify_trip_members: {
        Args: {
          _actor_id: string
          _link?: string
          _message: string
          _title: string
          _trip_id: string
          _type: string
        }
        Returns: undefined
      }
      redeem_promo_code: {
        Args: {
          p_code: string
          p_ip_address?: string | null
          p_user_agent?: string | null
        }
        Returns: Json
      }
      get_user_redemptions: {
        Args: Record<string, never>
        Returns: {
          id: string
          code_name: string
          code_type: Database["public"]["Enums"]["promo_code_type"]
          redeemed_at: string
          trial_ends_at: string | null
          discount_applied: number | null
          benefit: string
        }[]
      }
      create_promo_code: {
        Args: {
          p_code: string
          p_name: string
          p_type: Database["public"]["Enums"]["promo_code_type"]
          p_trial_days?: number | null
          p_discount_percent?: number | null
          p_lifetime_pro?: boolean
          p_max_total_uses?: number | null
          p_max_uses_per_user?: number
          p_expires_at?: string | null
          p_description?: string | null
          p_notes?: string | null
        }
        Returns: Json
      }
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
      get_admin_promo_codes: {
        Args: Record<string, never>
        Returns: {
          id: string
          code: string
          name: string
          description: string | null
          type: Database["public"]["Enums"]["promo_code_type"]
          trial_days: number | null
          discount_percent: number | null
          lifetime_pro: boolean
          max_total_uses: number | null
          current_uses: number
          max_uses_per_user: number
          starts_at: string
          expires_at: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          notes: string | null
          usage_percentage: number | null
        }[]
      }
      get_admin_promo_redemptions: {
        Args: { p_code_id?: string | null }
        Returns: {
          id: string
          user_id: string
          user_email: string
          user_fullname: string | null
          promo_code: string
          promo_code_name: string
          redeemed_at: string
          ip_address: string | null
          trial_ends_at: string | null
          discount_applied: number | null
        }[]
      }
      update_promo_code: {
        Args: {
          p_id: string
          p_name?: string | null
          p_description?: string | null
          p_max_total_uses?: number | null
          p_expires_at?: string | null
          p_is_active?: boolean | null
          p_notes?: string | null
        }
        Returns: Json
      }
      delete_promo_code: {
        Args: { p_id: string }
        Returns: Json
      }
      revoke_promo_redemption: {
        Args: { p_redemption_id: string }
        Returns: Json
      }
      get_promo_codes_stats: {
        Args: Record<string, never>
        Returns: Json
      }
    }
    Enums: {
      expense_category:
        | "food"
        | "transport"
        | "accommodation"
        | "activities"
        | "shopping"
        | "other"
      invitation_status: "pending" | "accepted" | "declined"
      promo_code_type: "trial" | "subscription" | "lifetime" | "discount"
      transport_type: "flight" | "train" | "bus" | "car" | "ferry" | "other"
      trip_member_role: "owner" | "admin" | "member"
      user_role: "user" | "admin"
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
      expense_category: [
        "food",
        "transport",
        "accommodation",
        "activities",
        "shopping",
        "other",
      ],
      invitation_status: ["pending", "accepted", "declined"],
      promo_code_type: ["trial", "subscription", "lifetime", "discount"],
      transport_type: ["flight", "train", "bus", "car", "ferry", "other"],
      trip_member_role: ["owner", "admin", "member"],
      user_role: ["user", "admin"],
    },
  },
} as const
