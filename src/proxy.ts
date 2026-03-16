import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const basicAuth = req.headers.get('authorization');
  const url = req.nextUrl;

  // We only want to lock down the Command Center
  if (url.pathname.startsWith('/forge-command')) {
    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      const [user, pwd] = atob(authValue).split(':');

      // CHANGE THESE TO WHATEVER YOU WANT
      if (user === 'admin' && pwd === 'foundrymillion') {
        return NextResponse.next();
      }
    }

    // If no password or wrong password, trigger the browser's native login popup
    return new NextResponse('Unauthorized access to Forge Command.', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"',
      },
    });
  }

  return NextResponse.next();
}

// Tell Next.js to only run this middleware on the command route to save compute
export const config = {
  matcher: ['/forge-command/:path*'],
};