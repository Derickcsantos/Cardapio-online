import { createServerSupabaseClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/app/admin/components/ui/Button';
import { OrganizationForm } from '@/app/admin/components/OrganizationForm';
import { UserForm } from '@/app/admin/components/UserForm';

export default async function AdminMasterPage() {
  const supabase = createServerSupabaseClient();
  
  // Verificar se o usuário está autenticado e é admin master
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/login');
  }
  
  const { data: userData } = await supabase
    .from('users')
    .select('is_master')
    .eq('id', session.user.id)
    .single();
  
  if (!userData?.is_master) {
    redirect('/');
  }
  
  // Buscar todas as organizações
  const { data: organizations } = await supabase
    .from('organizations')
    .select('id, name, slug, whatsapp, instagram, created_at')
    .order('name');
  
  // Buscar todos os usuários (exceto admin master)
  const { data: users } = await supabase
    .from('users')
    .select(`
      id,
      organization_id,
      created_at,
      auth_users:id (email)
    `)
    .eq('is_master', false)
    .order('created_at', { ascending: false });
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Painel Admin Master</h1>
          <form action="/auth/signout" method="post">
            <Button type="submit" variant="secondary">Sair</Button>
          </form>
        </div>
      </header>
      
      <main className="container mx-auto p-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Seção de Organizações */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-6">Organizações</h2>
            
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">Adicionar Nova Organização</h3>
              <OrganizationForm onSuccess={() => {}} />
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Organizações Existentes</h3>
              <div className="space-y-4">
                {organizations?.map((org) => (
                  <div key={org.id} className="border p-4 rounded-md">
                    <h4 className="font-medium">{org.name}</h4>
                    <p className="text-sm text-gray-500">Slug: {org.slug}</p>
                    <div className="mt-2 flex gap-2">
                      <Link href={`/${org.slug}`} className="text-blue-600 hover:underline text-sm">Ver Página</Link>
                      <Link href={`/admin/${org.slug}`} className="text-blue-600 hover:underline text-sm">Ver Admin</Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Seção de Usuários */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-6">Usuários</h2>
            
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">Adicionar Novo Usuário</h3>
              <UserForm organizations={organizations || []} onSuccess={() => {}} />
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Usuários Existentes</h3>
              <div className="space-y-4">
                {users?.map((user) => {
                  const userEmail = user.auth_users?.email;
                  const orgName = organizations?.find(org => org.id === user.organization_id)?.name;
                  
                  return (
                    <div key={user.id} className="border p-4 rounded-md">
                      <h4 className="font-medium">{userEmail}</h4>
                      <p className="text-sm text-gray-500">Organização: {orgName || 'N/A'}</p>
                      <p className="text-sm text-gray-500">Criado em: {new Date(user.created_at).toLocaleDateString()}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}