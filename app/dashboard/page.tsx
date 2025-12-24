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
  test_type_id: string
  question_text: string
  image_url: string | null
  correct_answer: number
  answer_0: string
  answer_1: string
  answer_2: string
  answer_3: string
}

async function getTestTypes() {
  try {
    const supabase = await createClient()

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      console.error("Auth error when fetching test types:", authError)
      return []
    }

    if (!user) {
      console.error("User not authenticated when fetching test types")
      return []
    }

    const { data, error } = await supabase.from("test_types").select("*").order("name")

    if (error) {
      // Extract all properties (including non-enumerable ones)
      const allPropertyNames = Object.getOwnPropertyNames(error)
      const errorInfo: Record<string, unknown> = {}
      
      // Try to extract common error properties
      for (const prop of allPropertyNames) {
        try {
          const value = (error as unknown as Record<string, unknown>)[prop]
          if (value !== undefined) {
            errorInfo[prop] = value
          }
        } catch {
          // Skip properties that can't be accessed
        }
      }
      
      // Also try direct property access
      if ('message' in error) errorInfo.message = (error as { message?: string }).message
      if ('details' in error) errorInfo.details = (error as { details?: string }).details
      if ('hint' in error) errorInfo.hint = (error as { hint?: string }).hint
      if ('code' in error) errorInfo.code = (error as { code?: string }).code
      
      // Try to stringify the error
      let errorString = "Could not stringify error"
      try {
        errorString = JSON.stringify(error, Object.getOwnPropertyNames(error))
      } catch {
        try {
          errorString = String(error)
        } catch {
          errorString = "[Error object could not be serialized]"
        }
      }
      
      // Log comprehensive error information
      console.error("Error fetching test types:", {
        errorInfo,
        allPropertyNames,
        errorString,
        errorType: error?.constructor?.name || typeof error,
        userAuthenticated: !!user,
        userId: user?.id,
        userEmail: user?.email,
        timestamp: new Date().toISOString(),
      })
      
      // Additional diagnostic: Try a simple query to check if RLS is the issue
      const { data: testData, error: testError } = await supabase
        .from("test_types")
        .select("id")
        .limit(1)
      
      if (testError) {
        console.error("Diagnostic query also failed:", {
          message: testError.message,
          code: testError.code,
          details: testError.details,
        })
      } else {
        console.warn("Diagnostic query succeeded but main query failed - possible ordering issue")
      }
      
      return []
    }

    if (!data) {
      console.warn("No data returned from test_types query")
      return []
    }

    return data as TestType[]
  } catch (err) {
    console.error("Unexpected error in getTestTypes:", err)
    return []
  }
}

async function getTestByType(testTypeId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.from("tests").select("*").eq("test_type_id", testTypeId).single()

  if (error) {
    // Test doesn't exist for this category yet
    return null
  }

  return data as Test | null
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

  // Fetch one test for each test type (one test per category)
  const testTypesWithTest = await Promise.all(
    testTypes.map(async (testType) => {
      const test = await getTestByType(testType.id)
      return {
        ...testType,
        test,
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
          {testTypesWithTest.map((testType) => (
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

                {testType.test ? (
                  <Button
                    asChild={subscriptionStatus.hasAccess}
                    className="w-full"
                    variant={subscriptionStatus.hasAccess ? "default" : "outline"}
                    disabled={!subscriptionStatus.hasAccess}
                  >
                    {subscriptionStatus.hasAccess ? (
                      <Link href={`/test/${testType.test!.id}`}>Start Test</Link>
                    ) : (
                      <span>Start Test</span>
                    )}
                  </Button>
                ) : (
                  <p className="text-sm text-gray-500">Test not available yet</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {testTypesWithTest.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-lg text-gray-600">No test categories available yet.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
