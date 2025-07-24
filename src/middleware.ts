import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Verificar se o usuário está autenticado para acessar rotas /admin
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      const redirectUrl = new URL('/login', req.url);
      return NextResponse.redirect(redirectUrl);
    }

    // Verificar se é um admin master tentando acessar /admin/master
    if (req.nextUrl.pathname.startsWith('/admin/master')) {
      const { data: userData } = await supabase
        .from('users')
        .select('is_master')
        .eq('id', session.user.id)
        .single();

      if (!userData?.is_master) {
        // Redirecionar para a página inicial se não for admin master
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    // Verificar se o usuário pertence à organização que está tentando acessar
    if (req.nextUrl.pathname.startsWith('/admin/') && !req.nextUrl.pathname.startsWith('/admin/master')) {
      const slug = req.nextUrl.pathname.split('/')[2]; // Pega o slug da URL
      
      if (slug) {
        const { data: organization } = await supabase
          .from('organizations')
          .select('id')
          .eq('slug', slug)
          .single();

        if (organization) {
          const { data: userData } = await supabase
            .from('users')
            .select('organization_id, is_master')
            .eq('id', session.user.id)
            .single();

          // Permitir acesso se o usuário for admin master ou pertencer à organização
          if (!userData?.is_master && userData?.organization_id !== organization.id) {
            return NextResponse.redirect(new URL('/', req.url));
          }
        } else {
          // Organização não encontrada
          return NextResponse.redirect(new URL('/', req.url));
        }
      }
    }
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*'],
};