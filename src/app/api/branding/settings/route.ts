import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { SubscriptionService } from '@/lib/subscription-service';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has premium subscription
    const subscription = await SubscriptionService.getUserSubscription(user.id);
    if (!subscription || subscription.tier === 'free') {
      return NextResponse.json(
        { error: 'Premium subscription required' },
        { status: 403 }
      );
    }

    // Fetch branding settings from database
    const settings = await getBrandingSettings(user.id);

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching branding settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch branding settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has premium subscription
    const subscription = await SubscriptionService.getUserSubscription(user.id);
    if (!subscription || subscription.tier === 'free') {
      return NextResponse.json(
        { error: 'Premium subscription required' },
        { status: 403 }
      );
    }

    const settings = await request.json();

    // Validate settings based on subscription tier
    const validatedSettings = validateBrandingSettings(settings, subscription.tier);

    // Save branding settings to database
    await saveBrandingSettings(user.id, validatedSettings);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving branding settings:', error);
    return NextResponse.json(
      { error: 'Failed to save branding settings' },
      { status: 500 }
    );
  }
}

async function getBrandingSettings(userId: string) {
  try {
    const brandingRef = doc(db, 'branding_settings', userId);
    const brandingSnap = await getDoc(brandingRef);

    if (!brandingSnap.exists()) {
      // Return default settings if none exist
      return {
        logo: '',
        companyName: '',
        primaryColor: '#3b82f6',
        secondaryColor: '#64748b',
        accentColor: '#10b981',
        customDomain: '',
        favicon: '',
        footerText: '',
        hideAluFormBranding: false,
        customCSS: '',
        emailTemplate: {
          headerColor: '#3b82f6',
          footerText: '',
          logo: ''
        }
      };
    }

    const settings = brandingSnap.data();
    return {
      logo: settings.logo || '',
      companyName: settings.companyName || '',
      primaryColor: settings.primaryColor || '#3b82f6',
      secondaryColor: settings.secondaryColor || '#64748b',
      accentColor: settings.accentColor || '#10b981',
      customDomain: settings.customDomain || '',
      favicon: settings.favicon || '',
      footerText: settings.footerText || '',
      hideAluFormBranding: settings.hideAluFormBranding || false,
      customCSS: settings.customCSS || '',
      emailTemplate: {
        headerColor: settings.emailTemplate?.headerColor || '#3b82f6',
        footerText: settings.emailTemplate?.footerText || '',
        logo: settings.emailTemplate?.logo || ''
      }
    };
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

async function saveBrandingSettings(userId: string, settings: any) {
  try {
    const brandingRef = doc(db, 'branding_settings', userId);
    
    const brandingData = {
      userId,
      logo: settings.logo,
      companyName: settings.companyName,
      primaryColor: settings.primaryColor,
      secondaryColor: settings.secondaryColor,
      accentColor: settings.accentColor,
      customDomain: settings.customDomain,
      favicon: settings.favicon,
      footerText: settings.footerText,
      hideAluFormBranding: settings.hideAluFormBranding,
      customCSS: settings.customCSS,
      emailTemplate: {
        headerColor: settings.emailTemplate.headerColor,
        footerText: settings.emailTemplate.footerText,
        logo: settings.emailTemplate.logo
      },
      updatedAt: new Date().toISOString()
    };

    await setDoc(brandingRef, brandingData, { merge: true });
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

function validateBrandingSettings(settings: any, tier: string) {
  const validated = { ...settings };

  // Restrict features based on subscription tier
  if (tier === 'free') {
    // Free tier cannot use any branding features
    throw new Error('Branding features require Pro or Enterprise subscription');
  }

  if (tier === 'pro') {
    // Pro tier restrictions
    validated.hideAluFormBranding = false; // Only Enterprise can hide branding
    validated.customDomain = ''; // Only Enterprise can use custom domains
  }

  // Validate color formats
  const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  if (validated.primaryColor && !colorRegex.test(validated.primaryColor)) {
    validated.primaryColor = '#3b82f6';
  }
  if (validated.secondaryColor && !colorRegex.test(validated.secondaryColor)) {
    validated.secondaryColor = '#64748b';
  }
  if (validated.accentColor && !colorRegex.test(validated.accentColor)) {
    validated.accentColor = '#10b981';
  }

  // Validate domain format
  if (validated.customDomain) {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(validated.customDomain)) {
      validated.customDomain = '';
    }
  }

  // Sanitize CSS (basic validation)
  if (validated.customCSS) {
    // Remove potentially dangerous CSS
    validated.customCSS = validated.customCSS
      .replace(/@import/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/expression\(/gi, '');
  }

  return validated;
}