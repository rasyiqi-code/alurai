'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  DollarSign, 
  Share2, 
  Copy, 
  ExternalLink,
  TrendingUp,
  Gift,
  Star,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface AffiliateStats {
  totalReferrals: number;
  activeReferrals: number;
  totalEarnings: number;
  pendingEarnings: number;
  conversionRate: number;
  clickCount: number;
}

interface Referral {
  id: string;
  email: string;
  status: 'pending' | 'active' | 'converted';
  signupDate: string;
  conversionDate?: string;
  earnings: number;
  plan: string;
}

interface AffiliateData {
  referralCode: string;
  referralLink: string;
  stats: AffiliateStats;
  referrals: Referral[];
  payoutHistory: {
    id: string;
    amount: number;
    date: string;
    status: 'pending' | 'paid' | 'processing';
    method: string;
  }[];
}

interface AffiliateProgramProps {
  subscription?: {
    tier: string;
    status: string;
  } | null;
}

export function AffiliateProgram({ subscription }: AffiliateProgramProps) {
  const [affiliateData, setAffiliateData] = useState<AffiliateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [payoutEmail, setPayoutEmail] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    fetchAffiliateData();
  }, []);

  const fetchAffiliateData = async () => {
    try {
      const response = await fetch('/api/affiliate/data');
      if (response.ok) {
        const data = await response.json();
        setAffiliateData(data);
      }
    } catch (error) {
      console.error('Error fetching affiliate data:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinAffiliateProgram = async () => {
    if (!payoutEmail) {
      toast.error('Please enter your payout email');
      return;
    }

    setIsJoining(true);
    try {
      const response = await fetch('/api/affiliate/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payoutEmail })
      });

      if (response.ok) {
        toast.success('Successfully joined the affiliate program!');
        fetchAffiliateData();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to join affiliate program');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  const copyReferralLink = () => {
    if (affiliateData?.referralLink) {
      navigator.clipboard.writeText(affiliateData.referralLink);
      toast.success('Referral link copied to clipboard!');
    }
  };

  const shareReferralLink = () => {
    if (navigator.share && affiliateData?.referralLink) {
      navigator.share({
        title: 'Join AluForm - AI-Powered Form Builder',
        text: 'Create beautiful, intelligent forms with AI assistance!',
        url: affiliateData.referralLink
      });
    } else {
      copyReferralLink();
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // If user is not in affiliate program
  if (!affiliateData) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full h-16 w-16 flex items-center justify-center mb-4">
              <Users className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl">Join Our Affiliate Program</CardTitle>
            <CardDescription className="text-lg">
              Earn 30% commission for every successful referral!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  <h3 className="font-semibold">30% Commission</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Earn 30% of the subscription fee for each successful referral
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold">Lifetime Earnings</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Continue earning as long as your referrals remain subscribed
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <h3 className="font-semibold">Easy Sharing</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Get your unique referral link and start sharing immediately
                </p>
              </div>
            </div>

            <div className="max-w-md mx-auto space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Payout Email Address
                </label>
                <Input
                  type="email"
                  placeholder="your-email@example.com"
                  value={payoutEmail}
                  onChange={(e) => setPayoutEmail(e.target.value)}
                />
              </div>
              <Button 
                onClick={joinAffiliateProgram}
                disabled={isJoining}
                className="w-full"
                size="lg"
              >
                {isJoining ? 'Joining...' : 'Join Affiliate Program'}
              </Button>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                By joining, you agree to our affiliate terms and conditions. 
                Payouts are processed monthly for earnings above $50.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Referrals</p>
                <p className="text-2xl font-bold">{affiliateData.stats.totalReferrals}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold">${affiliateData.stats.totalEarnings}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold">{affiliateData.stats.conversionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Earnings</p>
                <p className="text-2xl font-bold">${affiliateData.stats.pendingEarnings}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Link */}
      <Card>
        <CardHeader>
          <CardTitle>Your Referral Link</CardTitle>
          <CardDescription>
            Share this link to start earning commissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input 
              value={affiliateData.referralLink} 
              readOnly 
              className="flex-1"
            />
            <Button onClick={copyReferralLink} variant="outline">
              <Copy className="h-4 w-4" />
            </Button>
            <Button onClick={shareReferralLink}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-sm text-gray-600">
            Referral Code: <code className="bg-gray-100 px-2 py-1 rounded">{affiliateData.referralCode}</code>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for detailed data */}
      <Tabs defaultValue="referrals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="payouts">Payout History</TabsTrigger>
        </TabsList>

        <TabsContent value="referrals">
          <Card>
            <CardHeader>
              <CardTitle>Your Referrals</CardTitle>
              <CardDescription>
                Track the status of your referred users
              </CardDescription>
            </CardHeader>
            <CardContent>
              {affiliateData.referrals.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No referrals yet</p>
                  <p className="text-sm text-gray-500">Start sharing your referral link to see results here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {affiliateData.referrals.map((referral) => (
                    <div key={referral.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{referral.email}</p>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={referral.status === 'converted' ? 'default' : 
                                   referral.status === 'active' ? 'secondary' : 'outline'}
                          >
                            {referral.status === 'converted' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {referral.status === 'active' && <Clock className="h-3 w-3 mr-1" />}
                            {referral.status}
                          </Badge>
                          <span className="text-sm text-gray-500">{referral.plan}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${referral.earnings}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(referral.signupDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts">
          <Card>
            <CardHeader>
              <CardTitle>Payout History</CardTitle>
              <CardDescription>
                Track your commission payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {affiliateData.payoutHistory.length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No payouts yet</p>
                  <p className="text-sm text-gray-500">Payouts are processed monthly for earnings above $50</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {affiliateData.payoutHistory.map((payout) => (
                    <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">${payout.amount}</p>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={payout.status === 'paid' ? 'default' : 
                                   payout.status === 'processing' ? 'secondary' : 'outline'}
                          >
                            {payout.status}
                          </Badge>
                          <span className="text-sm text-gray-500">{payout.method}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {new Date(payout.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}