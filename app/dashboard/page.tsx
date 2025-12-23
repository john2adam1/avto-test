import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { BookOpen, Clock } from "lucide-react"
import { LogoutButton } from "@/components/logout-button"
import { getSubscriptionStatus, getTelegramUsername } from "@/lib/supabase/subscription"
import { SubscriptionBanner } from "@/components/subscription-banner"
import { checkIsAdmin } from "@/lib/supabase/admin"

interface TestType {
  id: string
  name: string
  description: string
  time_limit: number
}

interface Test {
  id: string
  title: string
}

async function getTestTypes() {
  const supabase = await createClient()

  const { data, error } = await supabase.from("test_types").select("*").order("name")

  if (error) {
    console.error("Error fetching test types:", error)
    return []
  }

  return data as TestType[]
}

async function getTestsByType(testTypeId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.from("tests").select("id, title").eq("test_type_id", testTypeId)

  if (error) {
    console.error("Error fetching tests:", error)
    return []
  }

  return data as Test[]
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const subscriptionStatus = await getSubscriptionStatus()
  const telegramUsername = await getTelegramUsername()
  const isAdmin = await checkIsAdmin()

  if (!subscriptionStatus) {
    redirect("/auth/login")
  }

  const testTypes = await getTestTypes()

  // Fetch tests for each test type
  const testTypesWithTests = await Promise.all(
    testTypes.map(async (testType) => {
      const tests = await getTestsByType(testType.id)
      return {
        ...testType,
        tests,
      }
    }),
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-indigo-600" />
            <span className="text-2xl font-bold text-gray-900">TestMaster</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            {isAdmin && (
              <Button asChild variant="ghost">
                <Link href="/admin">Admin Panel</Link>
              </Button>
            )}
            <Button asChild variant="ghost">
              <Link href="/dashboard/results">My Results</Link>
            </Button>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <SubscriptionBanner
            hasAccess={subscriptionStatus.hasAccess}
            isTrial={subscriptionStatus.isTrial}
            isSubscribed={subscriptionStatus.isSubscribed}
            timeRemaining={subscriptionStatus.timeRemaining}
            telegramUsername={telegramUsername}
          />
        </div>

        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">Choose Your Test</h1>
          <p className="text-lg text-gray-600">Select a test type to begin your challenge</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testTypesWithTests.map((testType) => (
            <Card key={testType.id} className="border-2 transition-all hover:scale-105 hover:shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl">{testType.name}</CardTitle>
                <CardDescription className="text-base">{testType.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{Math.floor(testType.time_limit / 60)} minutes</span>
                </div>

                <div className="space-y-2">
                  {testType.tests.length > 0 ? (
                    testType.tests.map((test) => (
                      <Button
                        key={test.id}
                        asChild={subscriptionStatus.hasAccess}
                        className="w-full bg-transparent"
                        variant="outline"
                        disabled={!subscriptionStatus.hasAccess}
                      >
                        {subscriptionStatus.hasAccess ? (
                          <Link href={`/test/${test.id}`}>{test.title}</Link>
                        ) : (
                          <span>{test.title}</span>
                        )}
                      </Button>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No tests available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {testTypesWithTests.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-lg text-gray-600">No test types available yet.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
