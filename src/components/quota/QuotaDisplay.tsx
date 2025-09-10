'use client';

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle2, XCircle, Infinity } from 'lucide-react';
import { useQuota, useMultipleQuotas, QuotaStatus } from '@/hooks/use-quota';
import { UsageAction } from '@/lib/usage-tracker';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface QuotaDisplayProps {
  action: UsageAction;
  title: string;
  description?: string;
  showUpgradeButton?: boolean;
  className?: string;
}

export function QuotaDisplay({ 
  action, 
  title, 
  description, 
  showUpgradeButton = true,
  className 
}: QuotaDisplayProps) {
  const { quota, loading, error } = useQuota(action);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-sm">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-2 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !quota) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-500" />
            {title}
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-500">{error || 'Failed to load quota'}</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (percentage: number, isUnlimited: boolean) => {
    if (isUnlimited) return 'text-blue-600';
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressColor = (percentage: number, isUnlimited: boolean) => {
    if (isUnlimited) return 'bg-blue-500';
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusIcon = (percentage: number, isUnlimited: boolean) => {
    if (isUnlimited) return <Infinity className="w-4 h-4 text-blue-600" />;
    if (percentage >= 90) return <AlertTriangle className="w-4 h-4 text-red-600" />;
    if (percentage >= 75) return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    return <CheckCircle2 className="w-4 h-4 text-green-600" />;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            {getStatusIcon(quota.percentage, quota.isUnlimited)}
            {title}
          </span>
          {quota.percentage >= 90 && !quota.isUnlimited && (
            <Badge variant="destructive" className="text-xs">
              Near Limit
            </Badge>
          )}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className={getStatusColor(quota.percentage, quota.isUnlimited)}>
              {quota.currentUsage} used
            </span>
            <span className="text-muted-foreground">
              {quota.isUnlimited ? 'Unlimited' : `of ${quota.limit}`}
            </span>
          </div>
          
          {!quota.isUnlimited && (
            <Progress 
              value={quota.percentage} 
              className="h-2"
            />
          )}
          
          {quota.isUnlimited && (
            <div className="h-2 bg-blue-100 rounded-full">
              <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: '100%' }} />
            </div>
          )}
        </div>

        {quota.percentage >= 80 && !quota.isUnlimited && showUpgradeButton && (
          <div className="pt-2">
            <Link href="/pricing">
              <Button size="sm" variant="outline" className="w-full">
                Upgrade Plan
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface QuotaDashboardProps {
  actions: Array<{
    action: UsageAction;
    title: string;
    description?: string;
  }>;
  className?: string;
}

export function QuotaDashboard({ actions, className }: QuotaDashboardProps) {
  const actionList = actions.map(a => a.action);
  const { quotas, loading, error } = useMultipleQuotas(actionList);

  if (loading) {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
        {actions.map((action, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-sm">{action.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse">
                <div className="h-2 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center">
            <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-500">Failed to load quota information</p>
            <p className="text-xs text-muted-foreground mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
      {actions.map((actionConfig) => {
        const quota = quotas[actionConfig.action];
        
        if (!quota) {
          return (
            <Card key={actionConfig.action}>
              <CardHeader>
                <CardTitle className="text-sm">{actionConfig.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">No data available</p>
              </CardContent>
            </Card>
          );
        }

        return (
          <QuotaDisplayCard
            key={actionConfig.action}
            title={actionConfig.title}
            description={actionConfig.description}
            quota={quota}
          />
        );
      })}
    </div>
  );
}

interface QuotaDisplayCardProps {
  title: string;
  description?: string;
  quota: QuotaStatus;
}

function QuotaDisplayCard({ title, description, quota }: QuotaDisplayCardProps) {
  const getStatusColor = (percentage: number, isUnlimited: boolean) => {
    if (isUnlimited) return 'text-blue-600';
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressColor = (percentage: number, isUnlimited: boolean) => {
    if (isUnlimited) return 'bg-blue-500';
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusIcon = (percentage: number, isUnlimited: boolean) => {
    if (isUnlimited) return <Infinity className="w-4 h-4 text-blue-600" />;
    if (percentage >= 90) return <AlertTriangle className="w-4 h-4 text-red-600" />;
    if (percentage >= 75) return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    return <CheckCircle2 className="w-4 h-4 text-green-600" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            {getStatusIcon(quota.percentage, quota.isUnlimited)}
            {title}
          </span>
          {quota.percentage >= 90 && !quota.isUnlimited && (
            <Badge variant="destructive" className="text-xs">
              Near Limit
            </Badge>
          )}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className={getStatusColor(quota.percentage, quota.isUnlimited)}>
              {quota.currentUsage} used
            </span>
            <span className="text-muted-foreground">
              {quota.isUnlimited ? 'Unlimited' : `of ${quota.limit}`}
            </span>
          </div>
          
          {!quota.isUnlimited && (
            <Progress 
              value={quota.percentage} 
              className="h-2"
            />
          )}
          
          {quota.isUnlimited && (
            <div className="h-2 bg-blue-100 rounded-full">
              <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: '100%' }} />
            </div>
          )}
        </div>

        {quota.percentage >= 80 && !quota.isUnlimited && (
          <div className="pt-2">
            <Link href="/pricing">
              <Button size="sm" variant="outline" className="w-full">
                Upgrade Plan
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}