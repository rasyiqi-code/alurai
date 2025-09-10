import { NextRequest, NextResponse } from 'next/server';
import { handleReferralTracking } from './src/middleware/referral-middleware';

export function middleware(request: NextRequest) {
  // Handle referral tracking for all routes
  const referralResponse = handleReferralTracking(request);
  
  // If referral middleware returned a redirect, use it
  if (referralResponse.status === 302) {
    return referralResponse;
  }

  // Continue with normal request processing
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};