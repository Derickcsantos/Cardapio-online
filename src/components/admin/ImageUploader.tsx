import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';

type ImageUploaderProps = {
  organizationSlug: string;
  organizationId: string;
  onUploadComplete: () => void;
  currentImagesCount: number;
  maxImages?: number;
};

export default function ImageUploader({
  organizationSlug,
  organizationId,
  onUploadComplete,
  currentImagesCount,
  maxImages = 5,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const remainingSlots = maxImages - currentImagesCount;

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      
      // Verificar se não excede o limite de imagens
      if (acceptedFiles.length > remainingSlots) {
        setError(`Você só pode adicionar mais ${remainingSlots} imagem(ns)`);
        return;
      }

      setIsUploading(true);
      setError(null);

      try {
        for (let i = 0; i < acceptedFiles.length; i++) {
          const file = acceptedFiles[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}.${fileExt}`;
          const filePath = `${organizationSlug}/${fileName}`;

          // Upload da imagem para o Storage
          const { error: uploadError } = await supabase.storage
            .from('menu-images')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          // Obter a URL pública da imagem
          const { data: urlData } = supabase.storage
            .from('menu-images')
            .getPublicUrl(filePath);

          // Salvar referência no banco de dados
          const { error: dbError } = await supabase.from('menus').insert({
            organization_id: organizationId,
            image_url: urlData.publicUrl,
          });

          if (dbError) throw dbError;

          // Atualizar progresso
          setUploadProgress(Math.round(((i + 1) / acceptedFiles.length) * 100));
        }

        onUploadComplete();
      } catch (error: any) {
        setError(error.message || 'Erro ao fazer upload da imagem');
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [organizationSlug, organizationId, onUploadComplete, remainingSlots]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    disabled: isUploading || remainingSlots <= 0,
    maxFiles: remainingSlots,
  });

  if (remainingSlots <= 0) {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md">
        Você atingiu o limite máximo de {maxImages} imagens. Remova alguma imagem para adicionar novas.
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'} ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <div>
            <p className="mb-2">Enviando... {uploadProgress}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-lg mb-1">
              {isDragActive
                ? 'Solte as imagens aqui'
                : 'Arraste e solte imagens aqui, ou clique para selecionar'}
            </p>
            <p className="text-sm text-gray-500">
              Formatos aceitos: JPG, PNG, WebP (máx. {remainingSlots} imagens)
            </p>
          </div>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}