export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      events: {
        Row: {
          actual: string | null;
          country: string | null;
          created_at: string;
          currency: string;
          event_time: string;
          forecast: string | null;
          id: string;
          impact: Database["public"]["Enums"]["impact_level"];
          market_assets: Database["public"]["Enums"]["market_asset"][];
          previous: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          actual?: string | null;
          country?: string | null;
          created_at?: string;
          currency: string;
          event_time: string;
          forecast?: string | null;
          id?: string;
          impact?: Database["public"]["Enums"]["impact_level"];
          market_assets?: Database["public"]["Enums"]["market_asset"][];
          previous?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          actual?: string | null;
          country?: string | null;
          created_at?: string;
          currency?: string;
          event_time?: string;
          forecast?: string | null;
          id?: string;
          impact?: Database["public"]["Enums"]["impact_level"];
          market_assets?: Database["public"]["Enums"]["market_asset"][];
          previous?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      notification_logs: {
        Row: {
          attempt_count: number;
          created_at: string;
          error_message: string | null;
          event_id: string;
          id: string;
          last_attempt_at: string | null;
          locked_until: string | null;
          notification_type: string;
          processing_started_at: string | null;
          provider_message_id: string | null;
          recipient_email: string | null;
          reminder_interval_minutes: number;
          sent_at: string | null;
          status: Database["public"]["Enums"]["notification_status"];
          subscription_id: string | null;
          user_id: string | null;
        };
        Insert: {
          attempt_count?: number;
          created_at?: string;
          error_message?: string | null;
          event_id: string;
          id?: string;
          notification_type: string;
          last_attempt_at?: string | null;
          locked_until?: string | null;
          processing_started_at?: string | null;
          provider_message_id?: string | null;
          recipient_email?: string | null;
          reminder_interval_minutes: number;
          sent_at?: string | null;
          status?: Database["public"]["Enums"]["notification_status"];
          subscription_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          attempt_count?: number;
          created_at?: string;
          error_message?: string | null;
          event_id?: string;
          id?: string;
          notification_type?: string;
          last_attempt_at?: string | null;
          locked_until?: string | null;
          processing_started_at?: string | null;
          provider_message_id?: string | null;
          recipient_email?: string | null;
          reminder_interval_minutes?: number;
          sent_at?: string | null;
          status?: Database["public"]["Enums"]["notification_status"];
          subscription_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "notification_logs_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string | null;
          id: string;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          id: string;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          id?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          reminder_intervals_minutes: number[];
          timezone: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          reminder_intervals_minutes?: number[];
          timezone?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          reminder_intervals_minutes?: number[];
          timezone?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      subscription_market_preferences: {
        Row: {
          asset_code: string | null;
          created_at: string;
          id: string;
          market: Database["public"]["Enums"]["market_category"];
          subscription_id: string;
        };
        Insert: {
          asset_code?: string | null;
          created_at?: string;
          id?: string;
          market: Database["public"]["Enums"]["market_category"];
          subscription_id: string;
        };
        Update: {
          asset_code?: string | null;
          created_at?: string;
          id?: string;
          market?: Database["public"]["Enums"]["market_category"];
          subscription_id?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      list_economic_event_countries: {
        Args: Record<PropertyKey, never>;
        Returns: {
          country: string;
        }[];
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      update_notification_preferences: {
        Args: { _market_preferences: Json; _reminder_intervals: number[] };
        Returns: undefined;
      };
      claim_notification_jobs: {
        Args: { _limit?: number };
        Returns: {
          id: string;
          recipient_email: string;
          title: string;
          country: string | null;
          currency: string;
          impact: Database["public"]["Enums"]["impact_level"];
          event_time: string;
          market_assets: Database["public"]["Enums"]["market_asset"][];
          reminder_interval_minutes: number;
        }[];
      };
      complete_notification_job: {
        Args: { _id: string; _provider_message_id: string };
        Returns: undefined;
      };
      fail_notification_job: { Args: { _id: string; _error_message: string }; Returns: undefined };
      generate_due_notification_jobs: { Args: Record<PropertyKey, never>; Returns: number };
    };
    Enums: {
      app_role: "admin" | "user";
      impact_level: "low" | "medium" | "high";
      market_asset: "forex" | "bitcoin" | "ethereum" | "gold" | "silver" | "major_indices";
      market_category: "forex" | "crypto" | "metals" | "indices";
      notification_status: "pending" | "processing" | "sent" | "failed" | "skipped";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      impact_level: ["low", "medium", "high"],
      market_asset: ["forex", "bitcoin", "ethereum", "gold", "silver", "major_indices"],
      market_category: ["forex", "crypto", "metals", "indices"],
    },
  },
} as const;
