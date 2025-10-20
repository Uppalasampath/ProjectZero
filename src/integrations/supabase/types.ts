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
      activity_log: {
        Row: {
          action_type: string
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      carbon_credit_purchases: {
        Row: {
          blockchain_transaction_id: string | null
          certificate_url: string | null
          id: string
          platform_commission: number | null
          price_per_ton: number
          project_id: string
          purchase_date: string | null
          quantity_tons: number
          retirement_date: string | null
          total_cost: number
          user_id: string
        }
        Insert: {
          blockchain_transaction_id?: string | null
          certificate_url?: string | null
          id?: string
          platform_commission?: number | null
          price_per_ton: number
          project_id: string
          purchase_date?: string | null
          quantity_tons: number
          retirement_date?: string | null
          total_cost: number
          user_id: string
        }
        Update: {
          blockchain_transaction_id?: string | null
          certificate_url?: string | null
          id?: string
          platform_commission?: number | null
          price_per_ton?: number
          project_id?: string
          purchase_date?: string | null
          quantity_tons?: number
          retirement_date?: string | null
          total_cost?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "carbon_credit_purchases_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "carbon_offset_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carbon_credit_purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      carbon_emissions: {
        Row: {
          calculation_method: string | null
          created_at: string | null
          data_quality_score: number | null
          id: string
          reporting_period_end: string
          reporting_period_start: string
          scope_1_total: number | null
          scope_2_total: number | null
          scope_3_breakdown: Json | null
          scope_3_total: number | null
          updated_at: string | null
          user_id: string
          verified: boolean | null
        }
        Insert: {
          calculation_method?: string | null
          created_at?: string | null
          data_quality_score?: number | null
          id?: string
          reporting_period_end: string
          reporting_period_start: string
          scope_1_total?: number | null
          scope_2_total?: number | null
          scope_3_breakdown?: Json | null
          scope_3_total?: number | null
          updated_at?: string | null
          user_id: string
          verified?: boolean | null
        }
        Update: {
          calculation_method?: string | null
          created_at?: string | null
          data_quality_score?: number | null
          id?: string
          reporting_period_end?: string
          reporting_period_start?: string
          scope_1_total?: number | null
          scope_2_total?: number | null
          scope_3_breakdown?: Json | null
          scope_3_total?: number | null
          updated_at?: string | null
          user_id?: string
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "carbon_emissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      carbon_offset_projects: {
        Row: {
          available_credits: number
          blockchain_registry_id: string | null
          certification_type: string | null
          created_at: string | null
          id: string
          image_url: string | null
          impact_metrics: Json | null
          location_country: string | null
          location_region: string | null
          price_per_ton: number
          project_description: string | null
          project_name: string
          project_type: string
          satellite_verified: boolean | null
          verification_date: string | null
        }
        Insert: {
          available_credits: number
          blockchain_registry_id?: string | null
          certification_type?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          impact_metrics?: Json | null
          location_country?: string | null
          location_region?: string | null
          price_per_ton: number
          project_description?: string | null
          project_name: string
          project_type: string
          satellite_verified?: boolean | null
          verification_date?: string | null
        }
        Update: {
          available_credits?: number
          blockchain_registry_id?: string | null
          certification_type?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          impact_metrics?: Json | null
          location_country?: string | null
          location_region?: string | null
          price_per_ton?: number
          project_description?: string | null
          project_name?: string
          project_type?: string
          satellite_verified?: boolean | null
          verification_date?: string | null
        }
        Relationships: []
      }
      compliance_data_points: {
        Row: {
          completion_status: string | null
          data_source: string | null
          data_value: Json | null
          framework_id: string
          id: string
          last_updated: string | null
          requirement_code: string
          requirement_description: string | null
          requirement_name: string | null
          source_document_urls: Json | null
          verified: boolean | null
        }
        Insert: {
          completion_status?: string | null
          data_source?: string | null
          data_value?: Json | null
          framework_id: string
          id?: string
          last_updated?: string | null
          requirement_code: string
          requirement_description?: string | null
          requirement_name?: string | null
          source_document_urls?: Json | null
          verified?: boolean | null
        }
        Update: {
          completion_status?: string | null
          data_source?: string | null
          data_value?: Json | null
          framework_id?: string
          id?: string
          last_updated?: string | null
          requirement_code?: string
          requirement_description?: string | null
          requirement_name?: string | null
          source_document_urls?: Json | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_data_points_framework_id_fkey"
            columns: ["framework_id"]
            isOneToOne: false
            referencedRelation: "compliance_frameworks"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_frameworks: {
        Row: {
          applicable: boolean | null
          completion_percentage: number | null
          created_at: string | null
          framework_name: string
          id: string
          last_submission_date: string | null
          next_submission_date: string | null
          status: string | null
          submission_deadline: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          applicable?: boolean | null
          completion_percentage?: number | null
          created_at?: string | null
          framework_name: string
          id?: string
          last_submission_date?: string | null
          next_submission_date?: string | null
          status?: string | null
          submission_deadline?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          applicable?: boolean | null
          completion_percentage?: number | null
          created_at?: string | null
          framework_name?: string
          id?: string
          last_submission_date?: string | null
          next_submission_date?: string | null
          status?: string | null
          submission_deadline?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_frameworks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      emission_sources: {
        Row: {
          activity_data: number | null
          activity_unit: string | null
          category_name: string | null
          created_at: string | null
          data_source: string | null
          emission_amount: number | null
          emission_factor: number | null
          emission_id: string | null
          id: string
          scope: number
          source_document_url: string | null
          source_type: string
          user_id: string
        }
        Insert: {
          activity_data?: number | null
          activity_unit?: string | null
          category_name?: string | null
          created_at?: string | null
          data_source?: string | null
          emission_amount?: number | null
          emission_factor?: number | null
          emission_id?: string | null
          id?: string
          scope: number
          source_document_url?: string | null
          source_type: string
          user_id: string
        }
        Update: {
          activity_data?: number | null
          activity_unit?: string | null
          category_name?: string | null
          created_at?: string | null
          data_source?: string | null
          emission_amount?: number | null
          emission_factor?: number | null
          emission_id?: string | null
          id?: string
          scope?: number
          source_document_url?: string | null
          source_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emission_sources_emission_id_fkey"
            columns: ["emission_id"]
            isOneToOne: false
            referencedRelation: "carbon_emissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emission_sources_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          api_credentials: Json | null
          connection_status: string | null
          created_at: string | null
          id: string
          integration_type: string
          last_sync_date: string | null
          sync_frequency: string | null
          user_id: string
        }
        Insert: {
          api_credentials?: Json | null
          connection_status?: string | null
          created_at?: string | null
          id?: string
          integration_type: string
          last_sync_date?: string | null
          sync_frequency?: string | null
          user_id: string
        }
        Update: {
          api_credentials?: Json | null
          connection_status?: string | null
          created_at?: string | null
          id?: string
          integration_type?: string
          last_sync_date?: string | null
          sync_frequency?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "integrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      material_favorites: {
        Row: {
          created_at: string | null
          id: string
          material_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          material_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          material_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "material_favorites_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "waste_materials"
            referencedColumns: ["id"]
          },
        ]
      }
      materiality_assessments: {
        Row: {
          assessment_date: string
          created_at: string | null
          financial_materiality_scores: Json | null
          id: string
          impact_materiality_scores: Json | null
          methodology: string | null
          stakeholder_survey_responses: Json | null
          status: string | null
          topics_assessed: Json | null
          user_id: string
        }
        Insert: {
          assessment_date: string
          created_at?: string | null
          financial_materiality_scores?: Json | null
          id?: string
          impact_materiality_scores?: Json | null
          methodology?: string | null
          stakeholder_survey_responses?: Json | null
          status?: string | null
          topics_assessed?: Json | null
          user_id: string
        }
        Update: {
          assessment_date?: string
          created_at?: string | null
          financial_materiality_scores?: Json | null
          id?: string
          impact_materiality_scores?: Json | null
          methodology?: string | null
          stakeholder_survey_responses?: Json | null
          status?: string | null
          topics_assessed?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "materiality_assessments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          id: string
          message: string | null
          notification_type: string
          read: boolean | null
          title: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          notification_type: string
          read?: boolean | null
          title: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          notification_type?: string
          read?: boolean | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_name: string | null
          company_size: string | null
          created_at: string | null
          email: string
          headquarters_location: string | null
          id: string
          industry: string | null
          logo_url: string | null
          net_zero_target_year: number | null
          onboarding_completed: boolean | null
          revenue_range: string | null
          subscription_tier: string | null
          updated_at: string | null
        }
        Insert: {
          company_name?: string | null
          company_size?: string | null
          created_at?: string | null
          email: string
          headquarters_location?: string | null
          id: string
          industry?: string | null
          logo_url?: string | null
          net_zero_target_year?: number | null
          onboarding_completed?: boolean | null
          revenue_range?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Update: {
          company_name?: string | null
          company_size?: string | null
          created_at?: string | null
          email?: string
          headquarters_location?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          net_zero_target_year?: number | null
          onboarding_completed?: boolean | null
          revenue_range?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      supplier_assessments: {
        Row: {
          assessment_status: string | null
          created_at: string | null
          emissions_data: Json | null
          esg_score: number | null
          id: string
          response_date: string | null
          supplier_email: string | null
          supplier_name: string
          user_id: string
        }
        Insert: {
          assessment_status?: string | null
          created_at?: string | null
          emissions_data?: Json | null
          esg_score?: number | null
          id?: string
          response_date?: string | null
          supplier_email?: string | null
          supplier_name: string
          user_id: string
        }
        Update: {
          assessment_status?: string | null
          created_at?: string | null
          emissions_data?: Json | null
          esg_score?: number | null
          id?: string
          response_date?: string | null
          supplier_email?: string | null
          supplier_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_assessments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_ratings: {
        Row: {
          created_at: string | null
          id: string
          rated_by: string
          rating: number
          review: string | null
          transaction_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          rated_by: string
          rating: number
          review?: string | null
          transaction_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          rated_by?: string
          rating?: number
          review?: string | null
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_ratings_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          buyer_id: string
          carbon_credits_generated: number | null
          carbon_credits_value: number | null
          completed_at: string | null
          created_at: string | null
          escrow_status: string | null
          id: string
          logistics_provider: string | null
          material_id: string | null
          platform_fee: number | null
          quantity: number
          seller_id: string
          status: string | null
          total_amount: number
          tracking_number: string | null
          unit_price: number
        }
        Insert: {
          buyer_id: string
          carbon_credits_generated?: number | null
          carbon_credits_value?: number | null
          completed_at?: string | null
          created_at?: string | null
          escrow_status?: string | null
          id?: string
          logistics_provider?: string | null
          material_id?: string | null
          platform_fee?: number | null
          quantity: number
          seller_id: string
          status?: string | null
          total_amount: number
          tracking_number?: string | null
          unit_price: number
        }
        Update: {
          buyer_id?: string
          carbon_credits_generated?: number | null
          carbon_credits_value?: number | null
          completed_at?: string | null
          created_at?: string | null
          escrow_status?: string | null
          id?: string
          logistics_provider?: string | null
          material_id?: string | null
          platform_fee?: number | null
          quantity?: number
          seller_id?: string
          status?: string | null
          total_amount?: number
          tracking_number?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "transactions_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "waste_materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      waste_materials: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_urls: Json | null
          location_address: string | null
          location_lat: number | null
          location_lng: number | null
          material_subtype: string | null
          material_type: string
          price_per_unit: number | null
          purity_percentage: number | null
          quality_grade: string | null
          quantity: number
          status: string | null
          unit: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_urls?: Json | null
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          material_subtype?: string | null
          material_type: string
          price_per_unit?: number | null
          purity_percentage?: number | null
          quality_grade?: string | null
          quantity: number
          status?: string | null
          unit: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_urls?: Json | null
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          material_subtype?: string | null
          material_type?: string
          price_per_unit?: number | null
          purity_percentage?: number | null
          quality_grade?: string | null
          quantity?: number
          status?: string | null
          unit?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "waste_materials_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_carbon_credits: {
        Args: { material_type: string; quantity_tons: number }
        Returns: {
          carbon_tons: number
          credit_value: number
        }[]
      }
      calculate_distance: {
        Args: { lat1: number; lat2: number; lon1: number; lon2: number }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_activity: {
        Args: {
          p_action_type: string
          p_description: string
          p_metadata?: Json
          p_user_id: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "contributor" | "viewer"
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
      app_role: ["admin", "manager", "contributor", "viewer"],
    },
  },
} as const
