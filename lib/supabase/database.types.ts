// Generated from isolated local Supabase; run scripts/backend/local.mjs types.
export type Json = string | number | boolean | null | {
    [key: string]: Json | undefined;
} | Json[];
export type Database = {
    "public": {
        Tables: {
            "place_sources": {
                Row: {
                    "attribution": string;
                    "feature": string | null;
                    "field_key": string;
                    "id": string;
                    "is_primary": boolean;
                    "kind": string;
                    "license": string;
                    "method": string | null;
                    "place_id": string;
                    "provider": string;
                    "retrieved_at": string;
                    "source_url": string;
                };
                ComputedFields: never;
                Insert: {
                    "attribution": string;
                    "feature"?: string | null;
                    "field_key": string;
                    "id"?: string;
                    "is_primary"?: boolean;
                    "kind": string;
                    "license": string;
                    "method"?: string | null;
                    "place_id": string;
                    "provider": string;
                    "retrieved_at": string;
                    "source_url": string;
                };
                Update: {
                    "attribution"?: string;
                    "feature"?: string | null;
                    "field_key"?: string;
                    "id"?: string;
                    "is_primary"?: boolean;
                    "kind"?: string;
                    "license"?: string;
                    "method"?: string | null;
                    "place_id"?: string;
                    "provider"?: string;
                    "retrieved_at"?: string;
                    "source_url"?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "place_sources_place_id_fkey";
                        columns: [
                            "place_id"
                        ];
                        isOneToOne: false;
                        referencedRelation: "places";
                        referencedColumns: [
                            "id"
                        ];
                    }
                ];
            };
            "places": {
                Row: {
                    "category": string;
                    "created_at": string;
                    "description": string;
                    "id": string;
                    "image_url": string | null;
                    "latitude": number;
                    "longitude": number;
                    "region": string;
                    "slug": string;
                    "status": string;
                    "tags": (string)[];
                    "title": string;
                    "why": string;
                };
                ComputedFields: never;
                Insert: {
                    "category": string;
                    "created_at"?: string;
                    "description": string;
                    "id"?: string;
                    "image_url"?: string | null;
                    "latitude": number;
                    "longitude": number;
                    "region": string;
                    "slug": string;
                    "status"?: string;
                    "tags"?: (string)[];
                    "title": string;
                    "why": string;
                };
                Update: {
                    "category"?: string;
                    "created_at"?: string;
                    "description"?: string;
                    "id"?: string;
                    "image_url"?: string | null;
                    "latitude"?: number;
                    "longitude"?: number;
                    "region"?: string;
                    "slug"?: string;
                    "status"?: string;
                    "tags"?: (string)[];
                    "title"?: string;
                    "why"?: string;
                };
                Relationships: [
                ];
            };
            "profiles": {
                Row: {
                    "bio": string | null;
                    "created_at": string;
                    "display_name": string | null;
                    "hometown": string | null;
                    "id": string;
                };
                ComputedFields: never;
                Insert: {
                    "bio"?: string | null;
                    "created_at"?: string;
                    "display_name"?: string | null;
                    "hometown"?: string | null;
                    "id": string;
                };
                Update: {
                    "bio"?: string | null;
                    "created_at"?: string;
                    "display_name"?: string | null;
                    "hometown"?: string | null;
                    "id"?: string;
                };
                Relationships: [
                ];
            };
            "saved_places": {
                Row: {
                    "created_at": string;
                    "place_id": string;
                    "user_id": string;
                };
                ComputedFields: never;
                Insert: {
                    "created_at"?: string;
                    "place_id": string;
                    "user_id": string;
                };
                Update: {
                    "created_at"?: string;
                    "place_id"?: string;
                    "user_id"?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "saved_places_place_id_fkey";
                        columns: [
                            "place_id"
                        ];
                        isOneToOne: false;
                        referencedRelation: "places";
                        referencedColumns: [
                            "id"
                        ];
                    }
                ];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
};
type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];
export type Tables<DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]) | {
    schema: keyof DatabaseWithoutInternals;
}, TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
} ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"]) : never = never> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
} ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
    Row: infer R;
} ? R : never : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]) ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
    Row: infer R;
} ? R : never : never;
export type TablesInsert<DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | {
    schema: keyof DatabaseWithoutInternals;
}, TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
} ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] : never = never> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
} ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I;
} ? I : never : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I;
} ? I : never : never;
export type TablesUpdate<DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | {
    schema: keyof DatabaseWithoutInternals;
}, TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
} ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] : never = never> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
} ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U;
} ? U : never : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U;
} ? U : never : never;
export type Enums<DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | {
    schema: keyof DatabaseWithoutInternals;
}, EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
} ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"] : never = never> = DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
} ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName] : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions] : never;
export type CompositeTypes<PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"] | {
    schema: keyof DatabaseWithoutInternals;
}, CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
} ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"] : never = never> = PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
} ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName] : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"] ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions] : never;
export const Constants = {
    "public": {
        Enums: {}
    }
} as const;
