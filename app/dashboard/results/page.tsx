import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { BookOpen, Trophy, Clock, ArrowLeft, CheckCircle, XCircle } from "lucide-react"

interface Attempt {
  id: string
  score: number
  time_spent: number
  passed: boolean
  completed_at: string
  test_id: string
  tests: {
    id: string
    test_types: {
      name: string
    }
  }
}

async function getUserAttempts(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("user_test_attempts")
    .select(
      `
      id,
      score,
      time_spent,
      passed,
      completed_at,
      test_id,
      tests (
        id,
        test_types (
          name
        )
      )
    `,
    )
    .eq("user_id", userId)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false })

  if (error) {
    const errorInfo = {
      message: error.message || "Unknown error",
      details: error.details || "No details available",
      hint: error.hint || "No hint available",
      code: error.code || "No code available",
    }
    console.error("Error fetching attempts:", errorInfo, "Full error:", JSON.stringify(error, Object.getOwnPropertyNames(error)))
    return []
  }

  if (!data) {
    return []
  }

  // Type assertion with proper handling of nested objects
  return data.map((item) => {
    const test = Array.isArray(item.tests) ? item.tests[0] : item.tests
    const testType = test && Array.isArray(test.test_types) ? test.test_types[0] : test?.test_types
    return {
      ...item,
      tests: test ? { ...test, test_types: testType } : test,
    }
  }) as Attempt[]
}

export default async function ResultsHistoryPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const attempts = await getUserAttempts(user.id)

  const totalTests = attempts.length
  const passedTests = attempts.filter((a) => a.passed).length
  const averageScore = totalTests > 0 ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / totalTests) : 0

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-indigo-600" />
            <span className="text-2xl font-bold text-gray-900">TestMaster</span>
          </div>
          <Button asChild variant="ghost">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">My Test Results</h1>
          <p className="text-lg text-gray-600">Track your progress and review past attempts</p>
        </div>

        {/* Statistics Overview */}
        {totalTests > 0 && (
          <div className="mb-8 grid gap-6 md:grid-cols-3">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg text-gray-600">Total Tests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold text-indigo-600">{totalTests}</div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg text-gray-600">Pass Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold text-green-600">
                  {totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0}%
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {passedTests} of {totalTests} passed
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg text-gray-600">Average Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Trophy className="h-8 w-8 text-indigo-600" />
                  <div className="text-4xl font-bold text-gray-900">{averageScore}%</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Attempts List */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl">Test History</CardTitle>
          </CardHeader>
          <CardContent>
            {attempts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <BookOpen className="mb-4 h-16 w-16 text-gray-400" />
                <p className="mb-2 text-xl font-semibold text-gray-900">No tests completed yet</p>
                <p className="mb-6 text-gray-600">Start taking tests to see your results here</p>
                <Button asChild>
                  <Link href="/dashboard">Browse Tests</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {attempts.map((attempt) => {
                  const test = Array.isArray(attempt.tests) ? attempt.tests[0] : attempt.tests
                  const testType = test && Array.isArray(test.test_types) ? test.test_types[0] : test?.test_types
                  
                  return (
                    <div
                      key={attempt.id}
                      className="flex flex-col gap-4 rounded-lg border-2 p-4 transition-all hover:shadow-lg sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{testType?.name || "Unknown Test"}</h3>
                        <p className="mt-1 text-sm text-gray-500">{formatDate(attempt.completed_at)}</p>
                      </div>

                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold ${
                            attempt.passed ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                          }`}
                        >
                          {attempt.score}%
                        </div>
                      </div>

                      <div className="flex gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatTime(attempt.time_spent)}
                        </div>
                        {attempt.passed ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            Passed
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-red-600">
                            <XCircle className="h-4 w-4" />
                            Failed
                          </div>
                        )}
                      </div>

                      <Button asChild size="sm">
                        <Link href={`/test/${attempt.test_id}/results/${attempt.id}`}>View Details</Link>
                      </Button>
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
