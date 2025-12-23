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
  total_questions: number
  tests: {
    title: string
    test_types: {
      name: string
    }
  }
}

interface Answer {
  question_id: string
  selected_answer: number
  is_correct: boolean
  questions: {
    question_text: string
    correct_answer: number
    answer_0: string
    answer_1: string
    answer_2: string
    answer_3: string
  }
}

async function getAttemptResults(attemptId: string, userId: string) {
  const supabase = await createClient()

  // Get attempt details
  const { data: attempt, error: attemptError } = await supabase
    .from("user_test_attempts")
    .select(
      `
      id,
      score,
      time_spent,
      passed,
      total_questions,
      tests (
        title,
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
    console.error("Error fetching attempt:", attemptError)
    return null
  }

  // Get user answers with question details
  const { data: answers, error: answersError } = await supabase
    .from("user_answers")
    .select(
      `
      question_id,
      selected_answer,
      is_correct,
      questions (
        question_text,
        correct_answer,
        answer_0,
        answer_1,
        answer_2,
        answer_3
      )
    `,
    )
    .eq("attempt_id", attemptId)

  if (answersError) {
    console.error("Error fetching answers:", answersError)
    return null
  }

  return {
    attempt: attempt as Attempt,
    answers: answers as Answer[],
  }
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

  const data = await getAttemptResults(attemptId, user.id)

  if (!data) {
    redirect("/dashboard")
  }

  const { attempt, answers } = data

  const correctAnswers = answers.filter((a) => a.is_correct).length
  const incorrectAnswers = answers.length - correctAnswers

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
          <p className="text-xl text-gray-600">
            {attempt.tests.title} - {attempt.tests.test_types.name}
          </p>
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
              <CardTitle className="text-lg text-gray-600">Correct Answers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-green-600">
                {correctAnswers}/{attempt.total_questions}
              </div>
              <div className="mt-2 flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  {correctAnswers} Correct
                </span>
                <span className="flex items-center gap-1 text-red-600">
                  <XCircle className="h-4 w-4" />
                  {incorrectAnswers} Incorrect
                </span>
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
            {answers.map((answer, index) => {
              const question = answer.questions
              const selectedAnswerText = question[`answer_${answer.selected_answer}` as keyof typeof question] as string
              const correctAnswerText = question[`answer_${question.correct_answer}` as keyof typeof question] as string

              return (
                <div
                  key={answer.question_id}
                  className={`rounded-lg border-2 p-6 ${answer.is_correct ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
                >
                  <div className="mb-4 flex items-start justify-between">
                    <h3 className="flex-1 text-lg font-semibold leading-relaxed text-gray-900">
                      {index + 1}. {question.question_text}
                    </h3>
                    {answer.is_correct ? (
                      <CheckCircle className="h-6 w-6 shrink-0 text-green-600" />
                    ) : (
                      <XCircle className="h-6 w-6 shrink-0 text-red-600" />
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Your Answer: </span>
                      <span
                        className={`text-base ${answer.is_correct ? "text-green-700 font-medium" : "text-red-700"}`}
                      >
                        {answer.selected_answer === -1 ? "No answer selected" : selectedAnswerText}
                      </span>
                    </div>

                    {!answer.is_correct && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">Correct Answer: </span>
                        <span className="text-base font-medium text-green-700">{correctAnswerText}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
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
