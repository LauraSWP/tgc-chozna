// Generated TypeScript types for Supabase
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      card_definitions: {
        Row: {
          id: string
          set_id: string
          external_code: string | null
          name: string
          rarity_id: number
          type_line: string
          mana_cost: string | null
          power: number | null
          toughness: number | null
          keywords: string[] | null
          rules_json: Json
          flavor_text: string | null
          artist: string | null
          image_url: string | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          set_id: string
          external_code?: string | null
          name: string
          rarity_id: number
          type_line: string
          mana_cost?: string | null
          power?: number | null
          toughness?: number | null
          keywords?: string[] | null
          rules_json?: Json
          flavor_text?: string | null
          artist?: string | null
          image_url?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          set_id?: string
          external_code?: string | null
          name?: string
          rarity_id?: number
          type_line?: string
          mana_cost?: string | null
          power?: number | null
          toughness?: number | null
          keywords?: string[] | null
          rules_json?: Json
          flavor_text?: string | null
          artist?: string | null
          image_url?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "card_definitions_rarity_id_fkey"
            columns: ["rarity_id"]
            isOneToOne: false
            referencedRelation: "rarities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_definitions_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "card_sets"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          username: string
          role: Database["public"]["Enums"]["player_role"]
          avatar_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          username: string
          role?: Database["public"]["Enums"]["player_role"]
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          username?: string
          role?: Database["public"]["Enums"]["player_role"]
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      decks: {
        Row: {
          id: string
          owner: string
          name: string
          description: string | null
          is_legal: boolean | null
          format: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          owner: string
          name: string
          description?: string | null
          is_legal?: boolean | null
          format?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          owner?: string
          name?: string
          description?: string | null
          is_legal?: boolean | null
          format?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "decks_owner_fkey"
            columns: ["owner"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      // ... other table types will be here when generated
    }
    Views: {
      deck_summary: {
        Row: {
          id: string | null
          name: string | null
          owner: string | null
          format: string | null
          is_legal: boolean | null
          total_cards: number | null
          mainboard_cards: number | null
          sideboard_cards: number | null
          created_at: string | null
          updated_at: string | null
        }
      }
      user_collection_summary: {
        Row: {
          owner: string | null
          rarity_id: number | null
          rarity: Database["public"]["Enums"]["rarity_code"] | null
          total_cards: number | null
          foil_cards: number | null
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      match_status: "lobby" | "playing" | "finished"
      player_role: "player" | "admin" | "moderator"
      rarity_code: "common" | "uncommon" | "rare" | "mythic" | "land" | "token"
      zone_code: "library" | "hand" | "battlefield" | "graveyard" | "exile" | "stack"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
