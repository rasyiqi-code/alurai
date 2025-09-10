'use client';

import { AdvancedAnalytics } from './AdvancedAnalytics';

interface AnalyticsWrapperProps {
  isPremium: boolean;
}

export function AnalyticsWrapper({ isPremium }: AnalyticsWrapperProps) {
  const handleUpgrade = () => {
    window.location.href = '/pricing';
  };

  return (
    <AdvancedAnalytics 
      isPremium={isPremium} 
      onUpgrade={handleUpgrade}
    />
  );
}
