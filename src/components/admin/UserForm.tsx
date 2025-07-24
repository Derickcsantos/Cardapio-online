import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Organization } from '@/types';

const userSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(6, 'A senha deve ter pelo menos 6 caracteres')
    .optional()
    .or(z.literal('')),
  organization_id: z.string().uuid('Selecione uma organização válida'),
});

type UserFormValues = z.infer<typeof userSchema>;

type UserFormProps = {
  organizations: Organization[];
  onSuccess: () => void;
};

export default function UserForm({ organizations, onSuccess }: UserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
  });

  const onSubmit = async (data: UserFormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Criar usuário no Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: data.password || undefined,
        email_confirm: true,
      });

      if (authError) throw authError;

      // Criar registro na tabela users
      const { error: dbError } = await supabase.from('users').insert({
        id: authData.user.id,
        organization_id: data.organization_id,
        is_master: false,
      });

      if (dbError) throw dbError;

      onSuccess();
    } catch (error: any) {
      setError(error.message || 'Erro ao criar usuário');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        id="email"
        label="Email"
        type="email"
        placeholder="usuario@exemplo.com"
        {...register('email')}
        error={errors.email?.message}
        required
      />

      <Input
        id="password"
        label="Senha"
        type="password"
        placeholder="Deixe em branco para gerar senha aleatória"
        {...register('password')}
        error={errors.password?.message}
      />

      <div className="mb-4">
        <label htmlFor="organization_id" className="block text-sm font-medium text-gray-700 mb-1">
          Organização <span className="text-red-500">*</span>
        </label>
        <select
          id="organization_id"
          {...register('organization_id')}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 ${errors.organization_id ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
        >
          <option value="">Selecione uma organização</option>
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
        {errors.organization_id && (
          <p className="mt-1 text-sm text-red-500">{errors.organization_id.message}</p>
        )}
      </div>

      {error && <div className="p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Criando...' : 'Criar Usuário'}
        </Button>
      </div>
    </form>
  );
}