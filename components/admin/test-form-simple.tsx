"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"

interface TestFormProps {
  test?: {
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
  testTypes: Array<{
    id: string
    name: string
  }>
}

export function TestFormSimple({ test, testTypes }: TestFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    testTypeId: test?.test_type_id || "",
    questionText: test?.question_text || "",
    imageUrl: test?.image_url || "",
    correctAnswer: test?.correct_answer?.toString() || "0",
    answer0: test?.answer_0 || "",
    answer1: test?.answer_1 || "",
    answer2: test?.answer_2 || "",
    answer3: test?.answer_3 || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const supabase = createClient()

    const data = {
      test_type_id: formData.testTypeId,
      question_text: formData.questionText,
      image_url: formData.imageUrl || null,
      correct_answer: Number.parseInt(formData.correctAnswer),
      answer_0: formData.answer0,
      answer_1: formData.answer1,
      answer_2: formData.answer2,
      answer_3: formData.answer3,
    }

    if (test) {
      const { error } = await supabase.from("tests").update(data).eq("id", test.id)

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
    } else {
      const { error } = await supabase.from("tests").insert([data])

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
    }

    router.push("/admin/tests")
    router.refresh()
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>{test ? "Edit" : "Create"} Test</CardTitle>
        <CardDescription>
          {test ? "Update the test question and answers" : "Create a new test for a category (one test per category)"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="testType">Test Category *</Label>
            <Select
              value={formData.testTypeId}
              onValueChange={(value) => setFormData({ ...formData, testTypeId: value })}
              required
              disabled={!!test}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a test category" />
              </SelectTrigger>
              <SelectContent>
                {testTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {test && <p className="text-xs text-gray-500">Category cannot be changed after creation</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="questionText">Question Text *</Label>
            <Textarea
              id="questionText"
              value={formData.questionText}
              onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
              placeholder="Enter your question here..."
              required
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL (Optional)</Label>
            <Input
              id="imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="answer0">Answer A *</Label>
              <Input
                id="answer0"
                value={formData.answer0}
                onChange={(e) => setFormData({ ...formData, answer0: e.target.value })}
                placeholder="First answer option"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="answer1">Answer B *</Label>
              <Input
                id="answer1"
                value={formData.answer1}
                onChange={(e) => setFormData({ ...formData, answer1: e.target.value })}
                placeholder="Second answer option"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="answer2">Answer C *</Label>
              <Input
                id="answer2"
                value={formData.answer2}
                onChange={(e) => setFormData({ ...formData, answer2: e.target.value })}
                placeholder="Third answer option"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="answer3">Answer D *</Label>
              <Input
                id="answer3"
                value={formData.answer3}
                onChange={(e) => setFormData({ ...formData, answer3: e.target.value })}
                placeholder="Fourth answer option"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="correctAnswer">Correct Answer *</Label>
            <Select
              value={formData.correctAnswer}
              onValueChange={(value) => setFormData({ ...formData, correctAnswer: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select correct answer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">A - {formData.answer0 || "Answer A"}</SelectItem>
                <SelectItem value="1">B - {formData.answer1 || "Answer B"}</SelectItem>
                <SelectItem value="2">C - {formData.answer2 || "Answer C"}</SelectItem>
                <SelectItem value="3">D - {formData.answer3 || "Answer D"}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Saving..." : test ? "Update Test" : "Create Test"}
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

