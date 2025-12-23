"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"

interface TestFormProps {
  test?: {
    id: string
    title: string
    test_type_id: string
  }
  testTypes: Array<{
    id: string
    name: string
  }>
}

export function TestForm({ test, testTypes }: TestFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    title: test?.title || "",
    testTypeId: test?.test_type_id || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const supabase = createClient()

    const data = {
      title: formData.title,
      test_type_id: formData.testTypeId,
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
        <CardDescription>{test ? "Update the test details" : "Add a new test to the platform"}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Test Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Algebra Basics Quiz"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="testType">Test Type</Label>
            <Select
              value={formData.testTypeId}
              onValueChange={(value) => setFormData({ ...formData, testTypeId: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a test type" />
              </SelectTrigger>
              <SelectContent>
                {testTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
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
