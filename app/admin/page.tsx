import { redirect } from "next/navigation"
import { checkIsAdmin, getAdminStats } from "@/lib/supabase/admin"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { BookOpen, Users, FileText, Activity, Settings } from "lucide-react"

export default async function AdminDashboardPage() {
  const isAdmin = await checkIsAdmin()

  if (!isAdmin) {
    redirect("/dashboard")
  }

  const stats = await getAdminStats()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Settings className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">Admin Panel</span>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost">
              <Link href="/dashboard">User Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-lg text-gray-600">Manage your test platform</p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
              <Users className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Test Types</CardTitle>
              <BookOpen className="h-5 w-5 text-pink-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.totalTestTypes}</div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Tests</CardTitle>
              <FileText className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.totalTests}</div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Attempts</CardTitle>
              <Activity className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.totalAttempts}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-2 hover:shadow-xl transition-all hover:scale-105">
            <CardHeader>
              <CardTitle>Manage Tests</CardTitle>
              <CardDescription>Create, edit, and delete tests and questions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/admin/tests">Manage Tests</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-xl transition-all hover:scale-105">
            <CardHeader>
              <CardTitle>Manage Users</CardTitle>
              <CardDescription>View user statistics and manage permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/admin/users">Manage Users</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-xl transition-all hover:scale-105">
            <CardHeader>
              <CardTitle>Test Types</CardTitle>
              <CardDescription>Create and manage test categories</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/admin/test-types">Manage Types</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-xl transition-all hover:scale-105">
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Configure Telegram contact and system settings</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/admin/settings">Settings</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Recent Test Attempts</CardTitle>
            <CardDescription>Latest completions across all users</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentAttempts.length === 0 ? (
              <p className="py-8 text-center text-gray-600">No test attempts yet</p>
            ) : (
              <div className="space-y-3">
                {stats.recentAttempts.map((attempt: any) => (
                  <div key={attempt.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{attempt.profiles?.email}</p>
                      <p className="text-sm text-gray-600">{attempt.tests?.title}</p>
                      <p className="text-xs text-gray-500">{formatDate(attempt.completed_at)}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold ${
                          attempt.passed ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                        }`}
                      >
                        {attempt.score}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
