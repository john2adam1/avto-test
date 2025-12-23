"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"

interface TestTypeFormProps {
  testType?: {
    id: string
    name: string
    description: string
    time_limit: number
  }
}

export function TestTypeForm({ testType }: TestTypeFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    name: testType?.name || "",
    description: testType?.description || "",
    timeLimit: testType ? Math.floor(testType.time_limit / 60) : 30,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const supabase = createClient()

    const data = {
      name: formData.name,
      description: formData.description,
      time_limit: formData.timeLimit * 60,
    }

    if (testType) {
      const { error } = await supabase.from("test_types").update(data).eq("id", testType.id)

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
    } else {
      const { error } = await supabase.from("test_types").insert([data])

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
    }

    router.push("/admin/test-types")
    router.refresh()
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>{testType ? "Edit" : "Create"} Test Type</CardTitle>
        <CardDescription>
          {testType ? "Update the test type details" : "Add a new test category to the platform"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Mathematics"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this test type"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
            <Input
              id="timeLimit"
              type="number"
              min="1"
              value={formData.timeLimit}
              onChange={(e) => setFormData({ ...formData, timeLimit: Number.parseInt(e.target.value) })}
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Saving..." : testType ? "Update Test Type" : "Create Test Type"}
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
