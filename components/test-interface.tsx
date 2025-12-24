"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface TestInterfaceProps {
  testId: string
  testTypeName: string
  timeLimit: number
  questionText: string
  imageUrl: string | null
  answer0: string
  answer1: string
  answer2: string
  answer3: string
  correctAnswer: number
  userId: string
}

export function TestInterface({
  testId,
  testTypeName,
  timeLimit,
  questionText,
  imageUrl,
  answer0,
  answer1,
  answer2,
  answer3,
  correctAnswer,
  userId,
}: TestInterfaceProps) {
  const router = useRouter()
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(timeLimit)
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [startTime] = useState(Date.now())

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
          selected_answer: -1, // Will be updated on submit
          is_correct: false,
        })
        .select()
        .single()

      if (error) {
        const errorInfo = {
          message: error.message || "Unknown error",
          details: error.details || "No details available",
          hint: error.hint || "No hint available",
          code: error.code || "No code available",
        }
        console.error("Error creating attempt:", errorInfo, "Full error:", JSON.stringify(error, Object.getOwnPropertyNames(error)))
        return
      }

      setAttemptId(data.id)
    }

    initAttempt()
  }, [testId, userId])

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0) {
      handleSubmitTest()
      return
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmitTest()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleSubmitTest = async () => {
    if (isSubmitting || !attemptId || selectedAnswer === null) {
      // If no answer selected, still submit but mark as incorrect
      if (selectedAnswer === null && !isSubmitting && attemptId) {
        // Continue with submission
      } else {
        return
      }
    }

    setIsSubmitting(true)
    const supabase = createClient()

    try {
      const finalAnswer = selectedAnswer ?? -1
      const isCorrect = finalAnswer === correctAnswer
      const timeSpent = Math.floor((Date.now() - startTime) / 1000)
      const score = isCorrect ? 100 : 0
      const passed = isCorrect

      // Update attempt with results
      const { error: updateError } = await supabase
        .from("user_test_attempts")
        .update({
          completed_at: new Date().toISOString(),
          time_spent: timeSpent,
          score,
          passed,
          selected_answer: finalAnswer,
          is_correct: isCorrect,
        })
        .eq("id", attemptId)

      if (updateError) {
        const errorInfo = {
          message: updateError.message || "Unknown error",
          details: updateError.details || "No details available",
          hint: updateError.hint || "No hint available",
          code: updateError.code || "No code available",
        }
        console.error("Error updating attempt:", errorInfo, "Full error:", JSON.stringify(updateError, Object.getOwnPropertyNames(updateError)))
        return
      }

      // Redirect to results page
      router.push(`/test/${testId}/results/${attemptId}`)
    } catch (error) {
      console.error("Error submitting test:", error instanceof Error ? error.message : "Unknown error", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isTimeRunningOut = timeRemaining < 60
  const answers = [answer0, answer1, answer2, answer3]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header with Timer */}
      <header className="border-b bg-white/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{testTypeName} Test</h1>
              <p className="text-sm text-gray-600">Answer the question before time runs out</p>
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
        </div>
      </header>

      {/* Question Content */}
      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl leading-relaxed">{questionText}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Question Image */}
            {imageUrl && (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
                <Image
                  src={imageUrl}
                  alt="Question illustration"
                  fill
                  className="object-cover"
                  crossOrigin="anonymous"
                />
              </div>
            )}

            {/* Answer Options */}
            <div className="grid gap-3">
              {answers.map((answerText, index) => {
                const isSelected = selectedAnswer === index

                return (
                  <button
                    key={index}
                    onClick={() => setSelectedAnswer(index)}
                    disabled={isSubmitting}
                    className={`rounded-lg border-2 p-4 text-left transition-all hover:shadow-md ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50 shadow-md"
                        : "border-gray-200 bg-white hover:border-indigo-300"
                    } ${isSubmitting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
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

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleSubmitTest}
                disabled={isSubmitting || selectedAnswer === null}
                size="lg"
                className="min-w-[200px]"
              >
                {isSubmitting ? "Submitting..." : "Submit Answer"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
