"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        throw error;
      }

      // Verificar se é admin master
      const { data: userData } = await supabase
        .from('users')
        .select('is_master, organization_id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (userData?.is_master) {
        router.push('/admin/master');
      } else if (userData?.organization_id) {
        // Buscar o slug da organização
        const { data: orgData } = await supabase
          .from('organizations')
          .select('slug')
          .eq('id', userData.organization_id)
          .single();

        router.push(`/admin/${orgData?.slug}`);
      } else {
        router.push('/');
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        id="email"
        label="Email"
        type="email"
        placeholder="seu@email.com"
        {...register('email')}
        error={errors.email?.message}
        required
      />

      <Input
        id="password"
        label="Senha"
        type="password"
        placeholder="******"
        {...register('password')}
        error={errors.password?.message}
        required
      />

      {errorMessage && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md">{errorMessage}</div>
      )}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Entrando...' : 'Entrar'}
      </Button>
    </form>
  );
}