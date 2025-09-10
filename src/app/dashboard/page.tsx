import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { stackServerApp } from '@/stack'
import UsageDashboard from '@/components/usage-dashboard'
import { PaymentSuccessHandler } from '@/components/payment-success-handler'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Settings, CreditCard, BarChart3, Users } from 'lucide-react'
import Link from 'next/link'
import { checkAdminAccess } from '@/app/admin/actions'

export default async function DashboardPage() {
  const user = await stackServerApp.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Check if user is admin
  const isAdmin = await checkAdminAccess()

  // Helper function to get grid class based on admin status
  const getGridClass = (isAdmin: boolean) => {
    return isAdmin ? 'md:grid-cols-4' : 'md:grid-cols-3';
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />
      <PaymentSuccessHandler />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 text-white">
            <div className="absolute inset-0 bg-black/10 dark:bg-black/20"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold mb-3 text-white">
                    Welcome back, {user.displayName || user.primaryEmail} 👋
                  </h1>
                  <p className="text-xl text-blue-100 dark:text-blue-200 mb-6">
                    Manage your subscription, track usage, and monitor your form performance.
                  </p>
                  <div className="flex gap-4">
                    <Link href="/create">
                      <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 dark:bg-white dark:text-blue-600 dark:hover:bg-blue-50 font-semibold">
                        <BarChart3 className="w-5 h-5 mr-2" />
                        Create New Form
                      </Button>
                    </Link>
                    <Link href="/analytics">
                      <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 dark:border-white dark:text-white dark:hover:bg-white/10">
                        <BarChart3 className="w-5 h-5 mr-2" />
                        View Analytics
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <div className="w-32 h-32 bg-white/20 dark:bg-white/10 rounded-full flex items-center justify-center">
                    <BarChart3 className="w-16 h-16 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
          <div className={`grid grid-cols-1 gap-6 ${getGridClass(isAdmin)}`}>
            <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <Link href="/create">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Create Form</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Build new AI-powered form</p>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <Link href="/analytics">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Analytics</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">View detailed insights</p>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <Link href="/pricing">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Billing</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Manage subscription</p>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>

            {isAdmin && (
              <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <Link href="/admin">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                        <Settings className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Admin Panel</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">System administration</p>
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            )}
          </div>
        </div>

        {/* Usage Dashboard */}
        <Suspense fallback={
          <div className="space-y-6">
            <div className="h-48 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl animate-pulse"></div>
              ))}
            </div>
          </div>
        }>
          <UsageDashboard userId={user.id} />
        </Suspense>
      </main>
    </div>
  )
}

export const metadata = {
  title: 'Dashboard - AlurAI',
  description: 'Manage your subscription and track usage'
}