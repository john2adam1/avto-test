import { redirect } from "next/navigation"
import { checkIsAdmin } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Users, CheckCircle, XCircle, Shield } from "lucide-react"
import { ToggleAdminButton } from "@/components/admin/toggle-admin-button"
import { GrantSubscriptionButton } from "@/components/admin/grant-subscription-button"

async function getUsers() {
  const supabase = await createClient()

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching users:", error)
    return []
  }

  // Get attempt stats for each user
  const usersWithStats = await Promise.all(
    profiles.map(async (profile) => {
      const { data: attempts } = await supabase
        .from("user_test_attempts")
        .select("score, passed")
        .eq("user_id", profile.id)
        .not("completed_at", "is", null)

      const totalAttempts = attempts?.length || 0
      const passedAttempts = attempts?.filter((a) => a.passed).length || 0
      const averageScore =
        totalAttempts > 0 ? Math.round(attempts!.reduce((sum, a) => sum + a.score, 0) / totalAttempts) : 0

      return {
        ...profile,
        stats: {
          totalAttempts,
          passedAttempts,
          averageScore,
        },
      }
    }),
  )

  return usersWithStats
}

export default async function UsersManagementPage() {
  const isAdmin = await checkIsAdmin()

  if (!isAdmin) {
    redirect("/dashboard")
  }

  const users = await getUsers()

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getSubscriptionStatusText = (user: any) => {
    const now = new Date()
    const trialEnd = user.trial_ends_at ? new Date(user.trial_ends_at) : null
    const subEnd = user.subscription_ends_at ? new Date(user.subscription_ends_at) : null

    if (user.is_admin) return { text: "Admin (Full Access)", color: "purple" }
    if (subEnd && subEnd > now) return { text: "Active Subscription", color: "green" }
    if (trialEnd && trialEnd > now) return { text: "Trial Active", color: "blue" }
    return { text: "No Access", color: "red" }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Users className="h-8 w-8 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          </div>
          <Button asChild variant="ghost">
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">All Users</h2>
          <p className="text-gray-600">View user statistics and manage subscriptions</p>
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>Users ({users.length})</CardTitle>
            <CardDescription>Registered users and their test performance</CardDescription>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <p className="py-8 text-center text-gray-600">No users registered yet</p>
            ) : (
              <div className="space-y-4">
                {users.map((user) => {
                  const status = getSubscriptionStatusText(user)
                  return (
                    <div key={user.id} className="rounded-lg border-2 p-4">
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex-1">
                            <div className="mb-2 flex items-center gap-2">
                              <p className="font-semibold text-gray-900">{user.email}</p>
                              {user.is_admin && (
                                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                                  <Shield className="mr-1 h-3 w-3" />
                                  Admin
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">Joined {formatDate(user.created_at)}</p>

                            {/* User Stats */}
                            <div className="mt-3 flex flex-wrap gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <span className="font-medium text-gray-700">Tests Taken:</span>
                                <span className="text-gray-900">{user.stats.totalAttempts}</span>
                              </div>
                              {user.stats.totalAttempts > 0 && (
                                <>
                                  <div className="flex items-center gap-1">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <span className="text-green-600">{user.stats.passedAttempts} Passed</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <XCircle className="h-4 w-4 text-red-600" />
                                    <span className="text-red-600">
                                      {user.stats.totalAttempts - user.stats.passedAttempts} Failed
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="font-medium text-gray-700">Avg Score:</span>
                                    <span className="text-gray-900">{user.stats.averageScore}%</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <ToggleAdminButton userId={user.id} userEmail={user.email} isAdmin={user.is_admin} />
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-700">Subscription Status:</span>
                              <Badge
                                variant="secondary"
                                className={
                                  status.color === "green"
                                    ? "bg-green-100 text-green-700"
                                    : status.color === "blue"
                                      ? "bg-blue-100 text-blue-700"
                                      : status.color === "purple"
                                        ? "bg-purple-100 text-purple-700"
                                        : "bg-red-100 text-red-700"
                                }
                              >
                                {status.text}
                              </Badge>
                            </div>
                          </div>

                          <div className="mb-3 grid gap-2 text-sm sm:grid-cols-2">
                            <div>
                              <span className="font-medium text-gray-700">Trial Ends:</span>{" "}
                              <span className="text-gray-900">{formatDate(user.trial_ends_at)}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Subscription Ends:</span>{" "}
                              <span className="text-gray-900">{formatDate(user.subscription_ends_at)}</span>
                            </div>
                          </div>

                          <GrantSubscriptionButton userId={user.id} userEmail={user.email} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
