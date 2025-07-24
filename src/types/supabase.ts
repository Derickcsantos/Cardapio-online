export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          whatsapp: string | null;
          instagram: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          whatsapp?: string | null;
          instagram?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          whatsapp?: string | null;
          instagram?: string | null;
          created_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          organization_id: string | null;
          is_master: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          organization_id?: string | null;
          is_master?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string | null;
          is_master?: boolean;
          created_at?: string;
        };
      };
      menus: {
        Row: {
          id: string;
          organization_id: string;
          image_url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          image_url: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          image_url?: string;
          created_at?: string;
        };
      };
    };
  };
};