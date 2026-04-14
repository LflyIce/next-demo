import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 只保护 /statisticalTable 路径
  if (pathname.startsWith('/statisticalTable')) {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      // 没有 token，跳转登录
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // 有 token，通过（详细验证由前端页面做）
    return NextResponse.next();
  }

  // 登录页如果已登录则跳转统计页
  if (pathname === '/login') {
    const token = request.cookies.get('auth_token')?.value;
    if (token) {
      const statsUrl = new URL('/statisticalTable', request.url);
      return NextResponse.redirect(statsUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/statisticalTable/:path*', '/login'],
};
