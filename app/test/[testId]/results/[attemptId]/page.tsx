import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Trophy, Clock, CheckCircle, XCircle, ArrowLeft, RotateCcw } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface Attempt {
  id: string
  score: number
  time_spent: number
  passed: boolean
  selected_answer: number
  is_correct: boolean
  tests: {
    question_text: string
    image_url: string | null
    correct_answer: number
    answer_0: string
    answer_1: string
    answer_2: string
    answer_3: string
    test_types: {
      name: string
    }
  }
}

async function getAttemptResults(attemptId: string, userId: string) {
  const supabase = await createClient()

  // Get attempt details with test and question data
  const { data: attempt, error: attemptError } = await supabase
    .from("user_test_attempts")
    .select(
      `
      id,
      score,
      time_spent,
      passed,
      selected_answer,
      is_correct,
      tests (
        question_text,
        image_url,
        correct_answer,
        answer_0,
        answer_1,
        answer_2,
        answer_3,
        test_types (
          name
        )
      )
    `,
    )
    .eq("id", attemptId)
    .eq("user_id", userId)
    .single()

  if (attemptError || !attempt) {
    if (attemptError) {
      const errorInfo = {
        message: attemptError.message || "Unknown error",
        details: attemptError.details || "No details available",
        hint: attemptError.hint || "No hint available",
        code: attemptError.code || "No code available",
      }
      console.error("Error fetching attempt:", errorInfo, "Full error:", JSON.stringify(attemptError, Object.getOwnPropertyNames(attemptError)))
    } else {
      console.error("Error fetching attempt: No attempt data returned")
    }
    return null
  }

  // Handle nested objects - Supabase might return arrays for nested relations
  const test = Array.isArray(attempt.tests) ? attempt.tests[0] : attempt.tests
  const testType = test && Array.isArray(test.test_types) ? test.test_types[0] : test?.test_types
  const processedAttempt = {
    ...attempt,
    tests: test ? { ...test, test_types: testType } : test,
  }

  return processedAttempt as Attempt
}

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ testId: string; attemptId: string }>
}) {
  const { testId, attemptId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const attempt = await getAttemptResults(attemptId, user.id)

  if (!attempt) {
    redirect("/dashboard")
  }

  const test = attempt.tests
  const selectedAnswerText = test[`answer_${attempt.selected_answer}` as keyof typeof test] as string
  const correctAnswerText = test[`answer_${test.correct_answer}` as keyof typeof test] as string

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {/* Results Header */}
        <div className="mb-8 text-center">
          <div
            className={`mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full ${
              attempt.passed ? "bg-green-100" : "bg-red-100"
            }`}
          >
            {attempt.passed ? (
              <Trophy className="h-12 w-12 text-green-600" />
            ) : (
              <XCircle className="h-12 w-12 text-red-600" />
            )}
          </div>
          <h1 className="mb-2 text-4xl font-bold text-gray-900">
            {attempt.passed ? "Congratulations!" : "Keep Practicing!"}
          </h1>
          <p className="text-xl text-gray-600">{test.test_types.name}</p>
        </div>

        {/* Score Overview */}
        <div className="mb-8 grid gap-6 md:grid-cols-3">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-lg text-gray-600">Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-indigo-600">{attempt.score}%</div>
              <Progress value={attempt.score} className="mt-4 h-3" />
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-lg text-gray-600">Time Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-8 w-8 text-indigo-600" />
                <div className="text-4xl font-bold text-gray-900">{formatTime(attempt.time_spent)}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-lg text-gray-600">Result</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-green-600">
                {attempt.passed ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-12 w-12" />
                    <span>Passed</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <XCircle className="h-12 w-12" />
                    <span>Failed</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Question Review */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl">Question Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div
              className={`rounded-lg border-2 p-6 ${
                attempt.is_correct ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
              }`}
            >
              <div className="mb-4 flex items-start justify-between">
                <h3 className="flex-1 text-lg font-semibold leading-relaxed text-gray-900">{test.question_text}</h3>
                {attempt.is_correct ? (
                  <CheckCircle className="h-6 w-6 shrink-0 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 shrink-0 text-red-600" />
                )}
              </div>

              {test.image_url && (
                <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
                  <img src={test.image_url} alt="Question illustration" className="h-full w-full object-cover" />
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600">Your Answer: </span>
                  <span
                    className={`text-base ${attempt.is_correct ? "text-green-700 font-medium" : "text-red-700"}`}
                  >
                    {attempt.selected_answer === -1 ? "No answer selected" : selectedAnswerText}
                  </span>
                </div>

                {!attempt.is_correct && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Correct Answer: </span>
                    <span className="text-base font-medium text-green-700">{correctAnswerText}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href={`/test/${testId}`}>
              <RotateCcw className="mr-2 h-5 w-5" />
              Retake Test
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="bg-transparent">
            <Link href="/dashboard/results">View All Results</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="bg-transparent">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
