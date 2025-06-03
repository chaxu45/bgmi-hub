import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// List of admin emails that are allowed to access admin routes
// This should match the list in auth-context.tsx
// In a production app, you might want to store this in a database
const ADMIN_EMAILS: string[] = [
  'onevalo66@gmail.com' // Your admin email
];

export async function middleware(request: NextRequest) {
  // Check if the request is for an admin route
  if (request.nextUrl.pathname.startsWith('/admin')) {
    console.log('Middleware: Checking admin route access for path:', request.nextUrl.pathname);
    
    // Get the session cookie
    const sessionCookie = request.cookies.get('session')?.value;
    console.log('Middleware: Session cookie present:', !!sessionCookie);

    if (!sessionCookie) {
      // No session cookie, redirect to login
      console.log('Middleware: No session cookie, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // In a real implementation, you would verify the session token with Firebase Admin SDK
      // For this implementation, we'll use a simplified approach
      // The actual verification would require Firebase Admin SDK on the server
      
      // For now, we'll check if there's a user email in cookies
      const userEmail = request.cookies.get('user_email')?.value;
      console.log('Middleware: User email from cookie:', userEmail);
      
      if (!userEmail) {
        console.log('Middleware: No user email in cookies, redirecting to login');
        return NextResponse.redirect(new URL('/login', request.url));
      }
      
      const decodedEmail = decodeURIComponent(userEmail);
      console.log('Middleware: Decoded email:', decodedEmail);
      console.log('Middleware: Admin emails list:', ADMIN_EMAILS);
      console.log('Middleware: Is admin?', ADMIN_EMAILS.includes(decodedEmail));
      
      if (!ADMIN_EMAILS.includes(decodedEmail)) {
        // Not an admin, redirect to login
        console.log('Middleware: Not an admin email, redirecting to login');
        return NextResponse.redirect(new URL('/login', request.url));
      }
      
      // User is authenticated and is an admin, allow access
      console.log('Middleware: User is authenticated and is an admin, allowing access');
      return NextResponse.next();
    } catch (error) {
      // Error verifying the token, redirect to login
      console.error('Middleware: Error verifying auth token:', error);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Not an admin route, allow access
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
