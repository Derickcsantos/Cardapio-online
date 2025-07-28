import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const userId = req.cookies.get('user_id')?.value;

  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!userId) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const { data: userData, error } = await supabase
      .from('users')
      .select('is_master, organization_id')
      .eq('id', userId)
      .single();

    if (error || !userData) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    if (req.nextUrl.pathname.startsWith('/admin/master')) {
      if (!userData.is_master) {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    if (req.nextUrl.pathname.startsWith('/admin/') && !req.nextUrl.pathname.startsWith('/admin/master')) {
      const slug = req.nextUrl.pathname.split('/')[2];

      if (slug) {
        const { data: org } = await supabase
          .from('organizations')
          .select('id')
          .eq('slug', slug)
          .single();

        if (!org || (userData.organization_id !== org.id && !userData.is_master)) {
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
