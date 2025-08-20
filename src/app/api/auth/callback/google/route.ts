import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state');

    // Decode the return URL from state parameter
    const returnUrl = state ? decodeURIComponent(state) : '/';

    if (error) {
      return NextResponse.redirect(new URL(`${returnUrl}?error=access_denied`, request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL(`${returnUrl}?error=no_code`, request.url));
    }

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    // Store tokens in session/database (for now, we'll redirect with success)
    // In production, you should store these tokens securely associated with the user
    const response = NextResponse.redirect(new URL(`${returnUrl}?google_auth=success`, request.url));
    
    // Store tokens in httpOnly cookies for security
    response.cookies.set('google_access_token', tokens.access_token || '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600 // 1 hour
    });
    
    if (tokens.refresh_token) {
      response.cookies.set('google_refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 // 30 days
      });
    }

    return response;
  } catch (error) {
    console.error('Error in Google OAuth callback:', error);
    // Try to get state for return URL, fallback to root if not available
    const searchParams = request.nextUrl.searchParams;
    const state = searchParams.get('state');
    const returnUrl = state ? decodeURIComponent(state) : '/';
    return NextResponse.redirect(new URL(`${returnUrl}?error=oauth_error`, request.url));
  }
}