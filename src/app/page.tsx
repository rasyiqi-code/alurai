import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Bot, BarChart, Palette, Sparkles, Zap, Shield, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-20 md:py-32 lg:py-40 overflow-hidden">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20"></div>

          <div className="relative container mx-auto px-4 md:px-6 text-center">
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/50 dark:border-blue-800/50">
                <Sparkles className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">AI-Powered Form Builder</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-headline leading-tight">
                <span className="bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Create Smart Forms
                </span>
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  in Seconds
                </span>
              </h1>

              {/* Description */}
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Build intelligent forms that adapt to your users, powered by AI. 
                <span className="text-blue-600 dark:text-blue-400 font-medium">No coding required.</span>
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button asChild size="lg" className="text-lg px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105">
                  <Link href="/create">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Start Building Free
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-8 py-4 border-2 hover:bg-muted/50">
                  <Link href="/login">
                    Watch Demo
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative w-full py-16 md:py-24 overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950/50 dark:via-gray-900 dark:to-blue-950/50"></div>
          <div className="absolute inset-0">
            <div className="absolute top-0 right-1/4 w-72 h-72 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl"></div>
          </div>

          <div className="relative container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200/50 dark:border-purple-800/50 mb-4">
                <Zap className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Key Features</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold font-headline mb-4 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Why Choose AlurAI?
              </h2>
              <p className="max-w-2xl mx-auto text-muted-foreground text-lg">
                Leading AI technology that transforms how you interact with forms
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="group hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-2 border-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Bot className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-foreground">AI Form Builder</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Create complex forms just by describing your needs. Our AI will generate the perfect form in seconds.
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 hover:-translate-y-2 border-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Palette className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-foreground">Custom Branding</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Customize your form's appearance to match your brand. Colors, fonts, logos - everything can be customized to reflect your company identity.
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-500 hover:-translate-y-2 border-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <BarChart className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-foreground">Deep Analytics</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Get deep insights into your form performance. Real-time analytics help optimize conversion rates.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
          
        {/* User Feedback Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Share Your Experience
              </h2>
              <p className="text-muted-foreground mb-8">
                Help us improve by sharing your feedback about AlurAI
              </p>
              
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <Link href="http://localhost:9003/form/PTgncXn9EhZT80IIFRWR" target="_blank">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Give Feedback
                </Link>
              </Button>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <h3 className="text-xl font-semibold text-center mb-8">Recent User Feedback</h3>
              
              {/* Placeholder for dynamic testimonials from form submissions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card p-6 rounded-lg border">
                  <p className="text-muted-foreground mb-4">
                    "AlurAI sangat membantu dalam membuat form dengan cepat. Interface-nya mudah dipahami."
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold mr-3">
                      AH
                    </div>
                    <div>
                      <p className="font-medium">Ahmad H.</p>
                      <p className="text-sm text-muted-foreground">Developer</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card p-6 rounded-lg border">
                  <p className="text-muted-foreground mb-4">
                    "Fitur AI-nya benar-benar membantu menghemat waktu. Recommended!"
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold mr-3">
                      SR
                    </div>
                    <div>
                      <p className="font-medium">Sari R.</p>
                      <p className="text-sm text-muted-foreground">Product Manager</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-8">
                <Link href="http://localhost:9003/form/PTgncXn9EhZT80IIFRWR" target="_blank" className="text-blue-600 hover:text-blue-700 font-medium">
                  View all feedback submissions →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Simple Value Proposition */}
        <section className="relative w-full py-16 md:py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900"></div>
          
          <div className="relative container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                What Makes AlurAI Different?
              </h2>
              <p className="max-w-2xl mx-auto text-muted-foreground">
                Simple AI-powered form creation that just works
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Bot className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">AI-Powered</h3>
                <p className="text-sm text-muted-foreground">Describe your form in plain language and let AI build it</p>
              </Card>
              
              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Instant Setup</h3>
                <p className="text-sm text-muted-foreground">No complex configuration or technical knowledge required</p>
              </Card>
              
              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BarChart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Smart Analytics</h3>
                <p className="text-sm text-muted-foreground">Get insights that help you improve your forms</p>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative w-full py-20 md:py-32 overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700"></div>
          
          {/* Animated background elements */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-cyan-400/20 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="relative container mx-auto px-4 md:px-6 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
                <Zap className="h-4 w-4 text-yellow-300" />
                <span className="text-sm font-medium text-white/90">Get Started</span>
              </div>
              
              <h2 className="text-4xl md:text-6xl font-bold font-headline mb-6 text-white leading-tight">
                Ready to Create Your 
                <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  First AI Form?
                </span>
              </h2>
              
              <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-white/90 leading-relaxed">
                Join <span className="font-semibold text-yellow-300">10,000+</span> users who have experienced the convenience of AlurAI
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-4 bg-white text-gray-900 hover:bg-gray-100 shadow-2xl hover:shadow-white/25 transition-all duration-300 hover:scale-105">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Free Now
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-white/30 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm bg-transparent">
                  View Demo
                </Button>
              </div>
              
              {/* Trust indicators */}
              <div className="flex flex-wrap justify-center items-center gap-8 text-white/70 text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>100% Free to start</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <span>Setup in 2 minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span>No credit card required</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Simple Footer */}
      <footer className="bg-muted/30 border-t">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 AlurAI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
