'use client';

import { useState } from 'react';
import { AdminLayout } from '@/components/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Shield, 
  Mail, 
  Database, 
  Globe, 
  Bell,
  Save,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // System Settings State
  const [systemSettings, setSystemSettings] = useState({
    siteName: 'AIForm Builder',
    siteDescription: 'Create beautiful forms with AI assistance',
    maintenanceMode: false,
    registrationEnabled: true,
    maxFormsPerUser: 50,
    maxSubmissionsPerForm: 1000,
  });

  // Email Settings State
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: 'AIForm Builder',
    emailNotifications: true,
  });

  // Security Settings State
  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: 24, // hours
    passwordMinLength: 8,
    requireEmailVerification: true,
    enableTwoFactor: false,
    maxLoginAttempts: 5,
    lockoutDuration: 30, // minutes
  });

  const handleSaveSystemSettings = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Settings Updated",
        description: "System settings have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save system settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEmailSettings = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Settings Updated",
        description: "Email settings have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save email settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSecuritySettings = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Settings Updated",
        description: "Security settings have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save security settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmailConnection = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Connection Test",
        description: "Email connection test successful!",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Unable to connect to email server.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground">
            Configure system-wide settings and preferences
          </p>
        </div>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <CardTitle>General Settings</CardTitle>
            </div>
            <CardDescription>
              Basic system configuration and limits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={systemSettings.siteName}
                  onChange={(e) => setSystemSettings(prev => ({ ...prev, siteName: e.target.value }))}
                  placeholder="Enter site name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxFormsPerUser">Max Forms Per User</Label>
                <Input
                  id="maxFormsPerUser"
                  type="number"
                  value={systemSettings.maxFormsPerUser}
                  onChange={(e) => setSystemSettings(prev => ({ ...prev, maxFormsPerUser: parseInt(e.target.value) }))}
                  placeholder="50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteDescription">Site Description</Label>
              <Textarea
                id="siteDescription"
                value={systemSettings.siteDescription}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                placeholder="Enter site description"
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Temporarily disable site access for maintenance
                  </p>
                </div>
                <Switch
                  checked={systemSettings.maintenanceMode}
                  onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, maintenanceMode: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>User Registration</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow new users to register accounts
                  </p>
                </div>
                <Switch
                  checked={systemSettings.registrationEnabled}
                  onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, registrationEnabled: checked }))}
                />
              </div>
            </div>

            <Separator />
            
            <div className="flex justify-end">
              <Button onClick={handleSaveSystemSettings} disabled={loading}>
                {loading ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save System Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <CardTitle>Email Configuration</CardTitle>
            </div>
            <CardDescription>
              SMTP settings for sending emails
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="smtpHost">SMTP Host</Label>
                <Input
                  id="smtpHost"
                  value={emailSettings.smtpHost}
                  onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
                  placeholder="smtp.gmail.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="smtpPort">SMTP Port</Label>
                <Input
                  id="smtpPort"
                  type="number"
                  value={emailSettings.smtpPort}
                  onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPort: parseInt(e.target.value) }))}
                  placeholder="587"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpUser">SMTP Username</Label>
                <Input
                  id="smtpUser"
                  value={emailSettings.smtpUser}
                  onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpUser: e.target.value }))}
                  placeholder="your-email@gmail.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="smtpPassword">SMTP Password</Label>
                <Input
                  id="smtpPassword"
                  type="password"
                  value={emailSettings.smtpPassword}
                  onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPassword: e.target.value }))}
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fromEmail">From Email</Label>
                <Input
                  id="fromEmail"
                  value={emailSettings.fromEmail}
                  onChange={(e) => setEmailSettings(prev => ({ ...prev, fromEmail: e.target.value }))}
                  placeholder="noreply@yoursite.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fromName">From Name</Label>
                <Input
                  id="fromName"
                  value={emailSettings.fromName}
                  onChange={(e) => setEmailSettings(prev => ({ ...prev, fromName: e.target.value }))}
                  placeholder="AIForm Builder"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Send system notifications via email
                </p>
              </div>
              <Switch
                checked={emailSettings.emailNotifications}
                onCheckedChange={(checked) => setEmailSettings(prev => ({ ...prev, emailNotifications: checked }))}
              />
            </div>

            <Separator />
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={handleTestEmailConnection} disabled={loading}>
                {loading ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                Test Connection
              </Button>
              
              <Button onClick={handleSaveEmailSettings} disabled={loading}>
                {loading ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Email Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Security Settings</CardTitle>
            </div>
            <CardDescription>
              Authentication and security configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                  placeholder="24"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="passwordMinLength">Min Password Length</Label>
                <Input
                  id="passwordMinLength"
                  type="number"
                  value={securitySettings.passwordMinLength}
                  onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordMinLength: parseInt(e.target.value) }))}
                  placeholder="8"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                <Input
                  id="maxLoginAttempts"
                  type="number"
                  value={securitySettings.maxLoginAttempts}
                  onChange={(e) => setSecuritySettings(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))}
                  placeholder="5"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lockoutDuration">Lockout Duration (minutes)</Label>
                <Input
                  id="lockoutDuration"
                  type="number"
                  value={securitySettings.lockoutDuration}
                  onChange={(e) => setSecuritySettings(prev => ({ ...prev, lockoutDuration: parseInt(e.target.value) }))}
                  placeholder="30"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Verification Required</Label>
                  <p className="text-sm text-muted-foreground">
                    Require users to verify their email address
                  </p>
                </div>
                <Switch
                  checked={securitySettings.requireEmailVerification}
                  onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, requireEmailVerification: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable 2FA for enhanced security
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={securitySettings.enableTwoFactor}
                    onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, enableTwoFactor: checked }))}
                  />
                  {securitySettings.enableTwoFactor && (
                    <Badge variant="secondary">Beta</Badge>
                  )}
                </div>
              </div>
            </div>

            <Separator />
            
            <div className="flex justify-end">
              <Button onClick={handleSaveSecuritySettings} disabled={loading}>
                {loading ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Security Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <CardTitle>System Information</CardTitle>
            </div>
            <CardDescription>
              Current system status and information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Application Version</Label>
                <div className="text-sm font-mono bg-muted p-2 rounded">v1.0.0</div>
              </div>
              
              <div className="space-y-2">
                <Label>Database Status</Label>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-100 text-green-800">Connected</Badge>
                  <span className="text-sm text-muted-foreground">PostgreSQL</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Environment</Label>
                <div className="text-sm font-mono bg-muted p-2 rounded">Production</div>
              </div>
              
              <div className="space-y-2">
                <Label>Last Backup</Label>
                <div className="text-sm text-muted-foreground">2024-01-15 03:00 UTC</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}