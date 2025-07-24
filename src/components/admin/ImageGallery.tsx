import { useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import { Menu } from '@/types';

type ImageGalleryProps = {
  images: Menu[];
  organizationSlug: string;
  onImageDeleted: () => void;
};

export default function ImageGallery({ images, organizationSlug, onImageDeleted }: ImageGalleryProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (image: Menu) => {
    if (!confirm('Tem certeza que deseja excluir esta imagem?')) return;

    setIsDeleting(image.id);
    setError(null);

    try {
      // Extrair o nome do arquivo da URL
      const fileName = image.image_url.split('/').pop();
      const filePath = `${organizationSlug}/${fileName}`;

      // Excluir do banco de dados
      const { error: dbError } = await supabase
        .from('menus')
        .delete()
        .eq('id', image.id);

      if (dbError) throw dbError;

      // Excluir do storage
      const { error: storageError } = await supabase.storage
        .from('menu-images')
        .remove([filePath]);

      if (storageError) {
        console.error('Erro ao excluir arquivo do storage:', storageError);
        // Não interrompe o fluxo, pois o registro já foi removido do banco
      }

      onImageDeleted();
    } catch (error: any) {
      setError(error.message || 'Erro ao excluir imagem');
    } finally {
      setIsDeleting(null);
    }
  };

  if (images.length === 0) {
    return <p className="text-gray-500">Nenhuma imagem enviada ainda.</p>;
  }

  return (
    <div>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image) => (
          <div key={image.id} className="relative group rounded-lg overflow-hidden border border-gray-200">
            <div className="aspect-w-16 aspect-h-9 relative">
              <Image
                src={image.image_url}
                alt="Imagem do cardápio"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
              <Button
                variant="danger"
                onClick={() => handleDelete(image)}
                disabled={isDeleting === image.id}
              >
                {isDeleting === image.id ? 'Excluindo...' : 'Excluir'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}