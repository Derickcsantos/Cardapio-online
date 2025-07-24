import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Organization } from '@/types';

const organizationSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  slug: z
    .string()
    .min(3, 'Slug deve ter pelo menos 3 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  whatsapp: z.string().optional(),
  instagram: z.string().optional(),
});

type OrganizationFormValues = z.infer<typeof organizationSchema>;

type OrganizationFormProps = {
  organization?: Organization;
  onSuccess: () => void;
};

export default function OrganizationForm({ organization, onSuccess }: OrganizationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationSchema),
    defaultValues: organization
      ? {
          name: organization.name,
          slug: organization.slug,
          whatsapp: organization.whatsapp || '',
          instagram: organization.instagram || '',
        }
      : undefined,
  });

  const onSubmit = async (data: OrganizationFormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Verificar se o slug já existe (apenas para novas organizações)
      if (!organization) {
        const { data: existingOrg, error: checkError } = await supabase
          .from('organizations')
          .select('id')
          .eq('slug', data.slug)
          .single();

        if (existingOrg) {
          setError('Este slug já está em uso. Escolha outro.');
          setIsSubmitting(false);
          return;
        }

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError;
        }
      }

      if (organization) {
        // Atualizar organização existente
        const { error: updateError } = await supabase
          .from('organizations')
          .update({
            name: data.name,
            slug: data.slug,
            whatsapp: data.whatsapp || null,
            instagram: data.instagram || null,
          })
          .eq('id', organization.id);

        if (updateError) throw updateError;
      } else {
        // Criar nova organização
        const { error: insertError } = await supabase.from('organizations').insert({
          name: data.name,
          slug: data.slug,
          whatsapp: data.whatsapp || null,
          instagram: data.instagram || null,
        });

        if (insertError) throw insertError;
      }

      onSuccess();
    } catch (error: any) {
      setError(error.message || 'Erro ao salvar organização');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        id="name"
        label="Nome da Organização"
        placeholder="Ex: Trailer do Marinho"
        {...register('name')}
        error={errors.name?.message}
        required
      />

      <Input
        id="slug"
        label="Slug (URL)"
        placeholder="Ex: trailer-marinho"
        {...register('slug')}
        error={errors.slug?.message}
        required
      />

      <Input
        id="whatsapp"
        label="WhatsApp"
        placeholder="Ex: 5511999999999 (apenas números)"
        {...register('whatsapp')}
        error={errors.whatsapp?.message}
      />

      <Input
        id="instagram"
        label="Instagram"
        placeholder="Ex: trailermarinho (sem @)"
        {...register('instagram')}
        error={errors.instagram?.message}
      />

      {error && <div className="p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? organization
              ? 'Atualizando...'
              : 'Criando...'
            : organization
            ? 'Atualizar'
            : 'Criar'}
        </Button>
      </div>
    </form>
  );
}