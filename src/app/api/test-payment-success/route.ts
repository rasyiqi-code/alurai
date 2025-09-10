import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Test endpoint to simulate payment success redirect
  const testUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success&plan=pro&session_id=test_session_123&checkout_id=test_checkout_456`;
  
  return NextResponse.json({
    message: 'Test payment success URL generated',
    testUrl: testUrl,
    instructions: 'Visit this URL to test payment success handling'
  });
}
