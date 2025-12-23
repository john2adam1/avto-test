"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Progress } from "@/components/ui/progress"
import Image from "next/image"

interface Question {
  id: string
  question_text: string
  image_url: string
  correct_answer: number
  answer_0: string
  answer_1: string
  answer_2: string
  answer_3: string
  order_index: number
}

interface TestInterfaceProps {
  testId: string
  testTitle: string
  testTypeName: string
  timeLimit: number
  questions: Question[]
  userId: string
}

export function TestInterface({ testId, testTitle, testTypeName, timeLimit, questions, userId }: TestInterfaceProps) {
  const router = useRouter()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({})
  const [timeRemaining, setTimeRemaining] = useState(timeLimit)
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [startTime] = useState(Date.now())

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  // Initialize test attempt
  useEffect(() => {
    const initAttempt = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("user_test_attempts")
        .insert({
          user_id: userId,
          test_id: testId,
          started_at: new Date().toISOString(),
          total_questions: questions.length,
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating attempt:", error)
        return
      }

      setAttemptId(data.id)
    }

    initAttempt()
  }, [testId, userId, questions.length])

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0) {
      handleSubmitTest()
      return
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleSelectAnswer = (answerIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: answerIndex,
    }))
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  const handleSubmitTest = async () => {
    if (isSubmitting || !attemptId) return

    setIsSubmitting(true)
    const supabase = createClient()

    try {
      // Calculate results
      let correctCount = 0
      const userAnswers = questions.map((q) => {
        const selectedAnswer = selectedAnswers[q.id] ?? -1
        const isCorrect = selectedAnswer === q.correct_answer
        if (isCorrect) correctCount++

        return {
          attempt_id: attemptId,
          question_id: q.id,
          selected_answer: selectedAnswer,
          is_correct: isCorrect,
        }
      })

      // Insert user answers
      const { error: answersError } = await supabase.from("user_answers").insert(userAnswers)

      if (answersError) {
        console.error("Error saving answers:", answersError)
        return
      }

      // Calculate time spent
      const timeSpent = Math.floor((Date.now() - startTime) / 1000)
      const score = Math.round((correctCount / questions.length) * 100)
      const passed = score >= 70

      // Update attempt with results
      const { error: updateError } = await supabase
        .from("user_test_attempts")
        .update({
          completed_at: new Date().toISOString(),
          time_spent: timeSpent,
          score,
          passed,
        })
        .eq("id", attemptId)

      if (updateError) {
        console.error("Error updating attempt:", updateError)
        return
      }

      // Redirect to results page
      router.push(`/test/${testId}/results/${attemptId}`)
    } catch (error) {
      console.error("Error submitting test:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isTimeRunningOut = timeRemaining < 60
  const selectedAnswer = selectedAnswers[currentQuestion?.id]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header with Timer */}
      <header className="border-b bg-white/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{testTitle}</h1>
              <p className="text-sm text-gray-600">{testTypeName}</p>
            </div>
            <div
              className={`flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-2xl font-bold ${
                isTimeRunningOut ? "bg-red-100 text-red-600" : "bg-indigo-100 text-indigo-600"
              }`}
            >
              <Clock className="h-6 w-6" />
              {formatTime(timeRemaining)}
            </div>
          </div>
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <p className="mt-2 text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>
        </div>
      </header>

      {/* Question Content */}
      <main className="container mx-auto px-6 py-8">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl leading-relaxed">{currentQuestion?.question_text}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Question Image */}
            {currentQuestion?.image_url && (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
                <Image
                  src={currentQuestion.image_url || "/placeholder.svg"}
                  alt="Question illustration"
                  fill
                  className="object-cover"
                  crossOrigin="anonymous"
                />
              </div>
            )}

            {/* Answer Options */}
            <div className="grid gap-3">
              {[0, 1, 2, 3].map((index) => {
                const answerText = currentQuestion?.[`answer_${index}` as keyof Question] as string
                const isSelected = selectedAnswer === index

                return (
                  <button
                    key={index}
                    onClick={() => handleSelectAnswer(index)}
                    className={`rounded-lg border-2 p-4 text-left transition-all hover:shadow-md ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50 shadow-md"
                        : "border-gray-200 bg-white hover:border-indigo-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 font-semibold ${
                          isSelected ? "border-indigo-600 bg-indigo-600 text-white" : "border-gray-300 bg-white"
                        }`}
                      >
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="text-lg">{answerText}</span>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between gap-4 pt-4">
              <Button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                variant="outline"
                size="lg"
                className="bg-transparent"
              >
                Previous
              </Button>

              <div className="flex gap-2">
                {questions.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-2 rounded-full ${
                      index === currentQuestionIndex
                        ? "bg-indigo-600"
                        : selectedAnswers[questions[index].id] !== undefined
                          ? "bg-green-500"
                          : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>

              {currentQuestionIndex < questions.length - 1 ? (
                <Button onClick={handleNext} size="lg">
                  Next
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <Button onClick={handleSubmitTest} disabled={isSubmitting} size="lg">
                  {isSubmitting ? "Submitting..." : "Submit Test"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
