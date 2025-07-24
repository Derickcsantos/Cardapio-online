import { redirect } from 'next/navigation';
import Link from 'next/link';
import Card from '@/app/admin/components/ui/Card';
import OrganizationForm from '@/app/admin/components/OrganizationForm';

export default function NewOrganizationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Nova Organização</h1>
          <Link
            href="/admin/master"
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Voltar
          </Link>
        </div>
        
        <Card>
          <OrganizationForm onSuccess={() => redirect('/admin/master')} />
        </Card>
      </div>
    </div>
  );
}