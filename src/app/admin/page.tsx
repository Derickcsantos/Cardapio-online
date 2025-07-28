import { redirect } from 'next/navigation';

export default function AdminPage() {
  // Opcionalmente, poderia buscar a organização do usuário autenticado aqui
  // Como estamos sem autenticação via Supabase, você pode redirecionar diretamente para um slug fixo ou condicional

  redirect('/admin/pizzaria-praca'); // substitua pelo slug correto ou detecte dinamicamente
}
