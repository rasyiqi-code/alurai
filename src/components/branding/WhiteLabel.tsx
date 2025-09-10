'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Eye, Save, RotateCcw, Palette, Globe, Crown } from 'lucide-react';
import { toast } from 'sonner';

interface BrandingSettings {
  logo: string;
  companyName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  customDomain: string;
  favicon: string;
  footerText: string;
  hideAluFormBranding: boolean;
  customCSS: string;
  emailTemplate: {
    headerColor: string;
    footerText: string;
    logo: string;
  };
}

interface WhiteLabelProps {
  isPremium: boolean;
  currentTier: 'free' | 'pro' | 'enterprise';
  onUpgrade?: () => void;
}

const defaultSettings: BrandingSettings = {
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

export function WhiteLabel({ isPremium, currentTier, onUpgrade }: WhiteLabelProps) {
  const [settings, setSettings] = useState<BrandingSettings>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (isPremium) {
      fetchBrandingSettings();
    }
  }, [isPremium]);

  const fetchBrandingSettings = async () => {
    try {
      const response = await fetch('/api/branding/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings({ ...defaultSettings, ...data });
      }
    } catch (error) {
      console.error('Error fetching branding settings:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/branding/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        toast.success('Branding settings saved successfully!');
      } else {
        toast.error('Failed to save branding settings');
      }
    } catch (error) {
      console.error('Error saving branding settings:', error);
      toast.error('Failed to save branding settings');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    toast.info('Settings reset to default');
  };

  const handleFileUpload = async (file: File, type: 'logo' | 'favicon') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const response = await fetch('/api/branding/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const { url } = await response.json();
        setSettings(prev => ({
          ...prev,
          [type]: url
        }));
        toast.success(`${type} uploaded successfully!`);
      } else {
        toast.error(`Failed to upload ${type}`);
      }
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      toast.error(`Failed to upload ${type}`);
    }
  };

  if (!isPremium) {
    return (
      <Card className="p-8 text-center">
        <div className="space-y-4">
          <Crown className="h-16 w-16 mx-auto text-muted-foreground" />
          <div>
            <h3 className="text-xl font-semibold">White-Label Branding</h3>
            <p className="text-muted-foreground mt-2">
              Customize your forms with your own branding, colors, and domain. Remove AluForm branding completely.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="secondary">Custom Logo</Badge>
            <Badge variant="secondary">Brand Colors</Badge>
            <Badge variant="secondary">Custom Domain</Badge>
            <Badge variant="secondary">Remove AluForm Branding</Badge>
            <Badge variant="secondary">Custom CSS</Badge>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {currentTier === 'free' ? 'Available in Pro and Enterprise plans' : 'Available in Enterprise plan'}
            </p>
            <Button onClick={onUpgrade} className="mt-4">
              {currentTier === 'free' ? 'Upgrade to Pro' : 'Upgrade to Enterprise'}
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Crown className="h-6 w-6" />
            White-Label Branding
          </h2>
          <p className="text-muted-foreground">Customize your forms with your own branding</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? 'Exit Preview' : 'Preview'}
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="colors">Colors & Theme</TabsTrigger>
          <TabsTrigger value="domain">Custom Domain</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>Basic company details for branding</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={settings.companyName}
                    onChange={(e) => setSettings(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Your Company Name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="footerText">Footer Text</Label>
                  <Textarea
                    id="footerText"
                    value={settings.footerText}
                    onChange={(e) => setSettings(prev => ({ ...prev, footerText: e.target.value }))}
                    placeholder="© 2024 Your Company. All rights reserved."
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="hideAluFormBranding"
                    checked={settings.hideAluFormBranding}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, hideAluFormBranding: checked }))}
                    disabled={currentTier !== 'enterprise'}
                  />
                  <Label htmlFor="hideAluFormBranding" className="flex items-center gap-2">
                    Hide AluForm Branding
                    {currentTier !== 'enterprise' && <Badge variant="outline">Enterprise Only</Badge>}
                  </Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Logo & Assets</CardTitle>
                <CardDescription>Upload your company logo and favicon</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Company Logo</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {settings.logo ? (
                      <div className="space-y-2">
                        <img src={settings.logo} alt="Logo" className="h-16 mx-auto" />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('logo-upload')?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Change Logo
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-8 w-8 mx-auto text-gray-400" />
                        <Button
                          variant="outline"
                          onClick={() => document.getElementById('logo-upload')?.click()}
                        >
                          Upload Logo
                        </Button>
                      </div>
                    )}
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'logo');
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Recommended: PNG or SVG, max 2MB
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Favicon</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {settings.favicon ? (
                      <div className="space-y-2">
                        <img src={settings.favicon} alt="Favicon" className="h-8 w-8 mx-auto" />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('favicon-upload')?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Change Favicon
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-6 w-6 mx-auto text-gray-400" />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('favicon-upload')?.click()}
                        >
                          Upload Favicon
                        </Button>
                      </div>
                    )}
                    <input
                      id="favicon-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'favicon');
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Recommended: ICO or PNG, 32x32px
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="colors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Color Scheme
              </CardTitle>
              <CardDescription>Customize the color palette for your forms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={settings.primaryColor}
                      onChange={(e) => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={settings.secondaryColor}
                      onChange={(e) => setSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={settings.secondaryColor}
                      onChange={(e) => setSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      placeholder="#64748b"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accentColor"
                      type="color"
                      value={settings.accentColor}
                      onChange={(e) => setSettings(prev => ({ ...prev, accentColor: e.target.value }))}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={settings.accentColor}
                      onChange={(e) => setSettings(prev => ({ ...prev, accentColor: e.target.value }))}
                      placeholder="#10b981"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* Color Preview */}
              <div className="mt-6 p-4 border rounded-lg">
                <h4 className="font-medium mb-3">Preview</h4>
                <div className="space-y-3">
                  <div 
                    className="h-12 rounded flex items-center px-4 text-white font-medium"
                    style={{ backgroundColor: settings.primaryColor }}
                  >
                    Primary Color - Buttons, Headers
                  </div>
                  <div 
                    className="h-10 rounded flex items-center px-4 text-white"
                    style={{ backgroundColor: settings.secondaryColor }}
                  >
                    Secondary Color - Text, Borders
                  </div>
                  <div 
                    className="h-8 rounded flex items-center px-4 text-white"
                    style={{ backgroundColor: settings.accentColor }}
                  >
                    Accent Color - Links, Highlights
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="domain" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Custom Domain
              </CardTitle>
              <CardDescription>Use your own domain for forms and landing pages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customDomain">Custom Domain</Label>
                <Input
                  id="customDomain"
                  value={settings.customDomain}
                  onChange={(e) => setSettings(prev => ({ ...prev, customDomain: e.target.value }))}
                  placeholder="forms.yourcompany.com"
                  disabled={currentTier !== 'enterprise'}
                />
                {currentTier !== 'enterprise' && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Badge variant="outline">Enterprise Only</Badge>
                    Custom domains are available in Enterprise plan
                  </p>
                )}
              </div>

              {currentTier === 'enterprise' && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Setup Instructions</h4>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Add a CNAME record pointing to: <code className="bg-blue-100 px-1 rounded">forms.aluform.com</code></li>
                    <li>Verify domain ownership by adding TXT record</li>
                    <li>SSL certificate will be automatically provisioned</li>
                    <li>Domain will be active within 24 hours</li>
                  </ol>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom CSS</CardTitle>
              <CardDescription>Add custom CSS to further customize your forms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="customCSS">Custom CSS</Label>
                <Textarea
                  id="customCSS"
                  value={settings.customCSS}
                  onChange={(e) => setSettings(prev => ({ ...prev, customCSS: e.target.value }))}
                  placeholder={`/* Custom CSS for your forms */
.form-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.form-button {
  border-radius: 25px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}`}
                  rows={10}
                  className="font-mono text-sm"
                  disabled={currentTier === 'free'}
                />
                {currentTier === 'free' && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Badge variant="outline">Pro/Enterprise Only</Badge>
                    Custom CSS is available in Pro and Enterprise plans
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email Template Branding</CardTitle>
              <CardDescription>Customize email notifications with your branding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emailHeaderColor">Email Header Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="emailHeaderColor"
                    type="color"
                    value={settings.emailTemplate.headerColor}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      emailTemplate: { ...prev.emailTemplate, headerColor: e.target.value }
                    }))}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <Input
                    value={settings.emailTemplate.headerColor}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      emailTemplate: { ...prev.emailTemplate, headerColor: e.target.value }
                    }))}
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailFooterText">Email Footer Text</Label>
                <Textarea
                  id="emailFooterText"
                  value={settings.emailTemplate.footerText}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    emailTemplate: { ...prev.emailTemplate, footerText: e.target.value }
                  }))}
                  placeholder="This email was sent by Your Company Name"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default WhiteLabel;