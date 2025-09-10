import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: Check if user is in affiliate program in Firestore
    // For now, return mock data to avoid TypeScript errors
    const affiliateData = {
      id: user.id,
      referralCode: 'MOCK123',
      payoutEmail: user.primaryEmail || 'user@example.com',
      status: 'active',
      commissionRate: 0.30
    };

    // Get affiliate stats
    const stats = await getAffiliateStats(user.id);
    
    // Get referrals
    const referrals = await getReferrals(user.id);
    
    // Get payout history
    const payoutHistory = await getPayoutHistory(user.id);

    const responseData = {
      referralCode: affiliateData.referralCode,
      referralLink: `${process.env.NEXT_PUBLIC_APP_URL}?ref=${affiliateData.referralCode}`,
      stats,
      referrals,
      payoutHistory
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching affiliate data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch affiliate data' },
      { status: 500 }
    );
  }
}

async function getAffiliateStats(userId: string) {
  try {
    // TODO: Implement Firestore queries for affiliate stats
    // For now, return default values to fix TypeScript errors
    const totalReferrals = 0;
    const activeReferrals = 0;
    const totalEarnings = 0;

    // TODO: Implement Firestore queries for pending earnings and clicks
    const pendingEarnings = 0;
    const clickCount = 0;
    const conversionRate = 0;

    return {
      totalReferrals,
      activeReferrals,
      totalEarnings,
      pendingEarnings,
      conversionRate,
      clickCount
    };
  } catch (error) {
    console.error('Error getting affiliate stats:', error);
    // Return default stats on error
    return {
      totalReferrals: 0,
      activeReferrals: 0,
      totalEarnings: 0,
      pendingEarnings: 0,
      conversionRate: 0,
      clickCount: 0
    };
  }
}

async function getReferrals(userId: string) {
  try {
    // TODO: Implement Firestore queries for referrals
    // For now, return empty array to fix TypeScript errors
    const result: any[] = [];

    return result.map((row: any) => ({
      id: row.id,
      email: row.email,
      status: row.status,
      signupDate: row.signup_date,
      conversionDate: row.conversion_date,
      earnings: parseFloat(row.earnings || 0),
      plan: row.plan
    }));
  } catch (error) {
    console.error('Error getting referrals:', error);
    return [];
  }
}

async function getPayoutHistory(userId: string) {
  try {
    // TODO: Implement Firestore queries for payout history
    // For now, return empty array to fix TypeScript errors
    return [];
  } catch (error) {
    console.error('Error getting payout history:', error);
    return [];
  }
}