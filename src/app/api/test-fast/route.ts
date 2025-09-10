import { NextResponse } from 'next/server';

export async function GET() {
  console.log('Ultra fast test API called');
  return NextResponse.json({ message: 'fast', timestamp: Date.now() });
}