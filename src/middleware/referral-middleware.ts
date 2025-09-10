import { NextRequest, NextResponse } from 'next/server';

export function handleReferralTracking(request: NextRequest) {
  const url = request.nextUrl.clone();
  const referralCode = url.searchParams.get('ref');
  
  if (referralCode) {
    // Store referral code in cookie for later use during signup
    const response = NextResponse.next();
    
    // Set referral cookie that expires in 30 days
    response.cookies.set('referral_code', referralCode, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    // Track the click asynchronously (fire and forget)
    trackReferralClick(referralCode, request);
    
    // Remove ref parameter from URL and redirect
    url.searchParams.delete('ref');
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

async function trackReferralClick(referralCode: string, request: NextRequest) {
  try {
    const userAgent = request.headers.get('user-agent') || '';
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ipAddress = forwardedFor?.split(',')[0] || realIp || 'unknown';

    // Make internal API call to track the click
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/affiliate/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        referralCode,
        userAgent,
        ipAddress
      })
    });
  } catch (error) {
    // Silently fail - don't break the user experience
    console.error('Failed to track referral click:', error);
  }
}

export function getReferralCodeFromCookie(request: NextRequest): string | null {
  return request.cookies.get('referral_code')?.value || null;
}