'use client';

import { WhiteLabel } from './WhiteLabel';

interface BrandingWrapperProps {
  isPremium: boolean;
  currentTier: 'free' | 'pro' | 'enterprise';
}

export function BrandingWrapper({ isPremium, currentTier }: BrandingWrapperProps) {
  const handleUpgrade = () => {
    window.location.href = '/pricing';
  };

  return (
    <WhiteLabel 
      isPremium={isPremium}
      currentTier={currentTier}
      onUpgrade={handleUpgrade}
    />
  );
}
