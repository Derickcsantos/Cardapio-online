import { notFound } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';
import MenuCarousel from '@/components/public/MenuCarousel';
import SocialLinks from '@/components/public/SocialLinks';
import { Organization, Menu } from '@/types';

type PageProps = {
  params: {
    slug: string;
  };
};

async function getOrganization(slug: string): Promise<Organization | null> {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

async function getMenuImages(organizationId: string): Promise<Menu[]> {
  const { data, error } = await supabase
    .from('menus')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar imagens do cardápio:', error);
    return [];
  }

  return data;
}

export default async function OrganizationPage({ params }: PageProps) {
  const organization = await getOrganization(params.slug);

  if (!organization) {
    notFound();
  }

  const menuImages = await getMenuImages(organization.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{organization.name}</h1>
          <p className="text-gray-600">Cardápio Digital</p>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <MenuCarousel images={menuImages} />
        </div>

        <div className="mt-8 text-center">
          <SocialLinks organization={organization} />
        </div>
      </div>
    </div>
  );
}