import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';

async function getOrganizations() {
  const { data, error } = await supabase
    .from('organizations')
    .select('id, name, slug')
    .order('name');

  if (error) {
    console.error('Erro ao buscar organizações:', error);
    return [];
  }

  return data;
}

export default async function Home() {
  const organizations = await getOrganizations();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Sistema de Cardápio Online</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Acesse o cardápio digital de diversos estabelecimentos ou faça login para gerenciar seu próprio cardápio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map((org) => (
            <Card key={org.id} className="hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold mb-2">{org.name}</h2>
              <Link
                href={`/${org.slug}`}
                className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Ver Cardápio
              </Link>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors"
          >
            Área de Administração
          </Link>
        </div>
      </div>
    </div>
  );
}
