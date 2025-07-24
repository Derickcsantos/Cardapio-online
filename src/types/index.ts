export type Organization = {
  id: string;
  name: string;
  slug: string;
  whatsapp: string | null;
  instagram: string | null;
  created_at: string;
};

export type User = {
  id: string;
  organization_id: string | null;
  is_master: boolean;
  created_at: string;
  email?: string;
};

export type Menu = {
  id: string;
  organization_id: string;
  image_url: string;
  created_at: string;
};