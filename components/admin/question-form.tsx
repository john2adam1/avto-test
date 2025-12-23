"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { createClient } from "@/lib/supabase/client"

interface QuestionFormProps {
  testId: string
  orderIndex: number
  question?: {
    id: string
    question_text: string
    image_url: string | null
    correct_answer: number
    answer_0: string
    answer_1: string
    answer_2: string
    answer_3: string
  }
}

export function QuestionForm({ testId, orderIndex, question }: QuestionFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    questionText: question?.question_text || "",
    imageUrl: question?.image_url || "",
    answer0: question?.answer_0 || "",
    answer1: question?.answer_1 || "",
    answer2: question?.answer_2 || "",
    answer3: question?.answer_3 || "",
    correctAnswer: question?.correct_answer?.toString() || "0",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const supabase = createClient()

    const data = {
      test_id: testId,
      question_text: formData.questionText,
      image_url: formData.imageUrl || null,
      answer_0: formData.answer0,
      answer_1: formData.answer1,
      answer_2: formData.answer2,
      answer_3: formData.answer3,
      correct_answer: Number.parseInt(formData.correctAnswer),
      order_index: orderIndex,
    }

    if (question) {
      const { error } = await supabase.from("questions").update(data).eq("id", question.id)

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
    } else {
      const { error } = await supabase.from("questions").insert([data])

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
    }

    router.push(`/admin/tests/${testId}/questions`)
    router.refresh()
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>{question ? "Edit" : "Add"} Question</CardTitle>
        <CardDescription>
          {question ? "Update the question details" : "Create a new question for this test"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="questionText">Question Text</Label>
            <Textarea
              id="questionText"
              value={formData.questionText}
              onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
              placeholder="Enter the question"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL (optional)</Label>
            <Input
              id="imageUrl"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="space-y-4">
            <Label>Answer Options</Label>
            <RadioGroup
              value={formData.correctAnswer}
              onValueChange={(value) => setFormData({ ...formData, correctAnswer: value })}
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="0" id="answer0" />
                  <Label htmlFor="answer0" className="sr-only">
                    Answer A is correct
                  </Label>
                  <Input
                    value={formData.answer0}
                    onChange={(e) => setFormData({ ...formData, answer0: e.target.value })}
                    placeholder="Answer A"
                    required
                  />
                </div>

                <div className="flex items-center gap-3">
                  <RadioGroupItem value="1" id="answer1" />
                  <Label htmlFor="answer1" className="sr-only">
                    Answer B is correct
                  </Label>
                  <Input
                    value={formData.answer1}
                    onChange={(e) => setFormData({ ...formData, answer1: e.target.value })}
                    placeholder="Answer B"
                    required
                  />
                </div>

                <div className="flex items-center gap-3">
                  <RadioGroupItem value="2" id="answer2" />
                  <Label htmlFor="answer2" className="sr-only">
                    Answer C is correct
                  </Label>
                  <Input
                    value={formData.answer2}
                    onChange={(e) => setFormData({ ...formData, answer2: e.target.value })}
                    placeholder="Answer C"
                    required
                  />
                </div>

                <div className="flex items-center gap-3">
                  <RadioGroupItem value="3" id="answer3" />
                  <Label htmlFor="answer3" className="sr-only">
                    Answer D is correct
                  </Label>
                  <Input
                    value={formData.answer3}
                    onChange={(e) => setFormData({ ...formData, answer3: e.target.value })}
                    placeholder="Answer D"
                    required
                  />
                </div>
              </div>
            </RadioGroup>
            <p className="text-sm text-gray-600">Select the radio button next to the correct answer</p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Saving..." : question ? "Update Question" : "Add Question"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
