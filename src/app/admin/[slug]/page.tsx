import { notFound } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Card from '@/components/ui/Card';
import ImageUploader from '@/components/admin/ImageUploader';
import ImageGallery from '@/components/admin/ImageGallery';
import { Organization, Menu } from '@/types';

type PageProps = {
  params: {
    slug: string;
  };
};

async function getOrganization(slug: string): Promise<Organization | null> {
  const supabase = createServerComponentClient({ cookies });
  
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
  const supabase = createServerComponentClient({ cookies });
  
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

export default async function AdminOrganizationPage({ params }: PageProps) {
  const organization = await getOrganization(params.slug);

  if (!organization) {
    notFound();
  }

  const menuImages = await getMenuImages(organization.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Painel Administrativo</h1>
          <p className="text-gray-600">{organization.name}</p>
        </div>

        <Card title="Upload de Imagens do Cardápio" className="mb-8">
          <p className="mb-4 text-gray-600">
            Você pode enviar até 5 imagens do seu cardápio. As imagens serão exibidas em um carrossel na sua página pública.
          </p>
          <ImageUploader
            organizationSlug={organization.slug}
            organizationId={organization.id}
            onUploadComplete={() => {}}
            currentImagesCount={menuImages.length}
            maxImages={5}
          />
        </Card>

        <Card title="Imagens do Cardápio">
          <p className="mb-4 text-gray-600">
            Gerencie as imagens do seu cardápio. Você pode excluir imagens para adicionar novas.
          </p>
          <ImageGallery
            images={menuImages}
            organizationSlug={organization.slug}
            onImageDeleted={() => {}}
          />
        </Card>

        <div className="mt-8 text-center">
          <a
            href={`/${organization.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Visualizar Página Pública
          </a>
        </div>
      </div>
    </div>
  );
}