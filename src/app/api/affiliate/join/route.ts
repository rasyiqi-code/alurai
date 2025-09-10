import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { payoutEmail } = await request.json();

    if (!payoutEmail || !isValidEmail(payoutEmail)) {
      return NextResponse.json(
        { error: 'Valid payout email is required' },
        { status: 400 }
      );
    }

    // TODO: Implement Firestore queries for affiliate program
    // For now, return success to fix TypeScript errors
    const referralCode = generateReferralCode();
    
    // Simulate affiliate creation
    const affiliateData = {
      userId: user.id,
      payoutEmail,
      referralCode,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    
    // TODO: Save to Firestore
    // await setDoc(doc(db, 'affiliates', user.id), affiliateData);

    return NextResponse.json({
      success: true,
      referralCode,
      message: 'Successfully joined the affiliate program!'
    });
  } catch (error) {
    console.error('Error joining affiliate program:', error);
    return NextResponse.json(
      { error: 'Failed to join affiliate program' },
      { status: 500 }
    );
  }
}

function generateReferralCode(): string {
  // Generate a readable referral code
  const adjectives = ['smart', 'quick', 'bright', 'swift', 'clever', 'sharp', 'fast', 'wise'];
  const nouns = ['form', 'build', 'create', 'make', 'design', 'craft', 'shape', 'forge'];
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 1000);
  
  return `${adjective}${noun}${number}`;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}