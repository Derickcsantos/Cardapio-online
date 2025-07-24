import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Card from '@/components/ui/Card';
import LoginForm from '@/components/auth/LoginForm';

export default async function LoginPage() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    // Verificar se é admin master
    const { data: userData } = await supabase
      .from('users')
      .select('is_master, organization_id')
      .eq('id', session.user.id)
      .single();

    if (userData?.is_master) {
      redirect('/admin/master');
    } else if (userData?.organization_id) {
      // Buscar o slug da organização
      const { data: orgData } = await supabase
        .from('organizations')
        .select('slug')
        .eq('id', userData.organization_id)
        .single();

      redirect(`/admin/${orgData?.slug}`);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Card title="Login" className="w-full">
          <LoginForm />
        </Card>
      </div>
    </div>
  );
}