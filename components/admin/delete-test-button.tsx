"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export function DeleteTestButton({ testId, testTitle }: { testId: string; testTitle: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${testTitle}"? This will delete all associated questions.`)) {
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.from("tests").delete().eq("id", testId)

    if (error) {
      alert(`Error: ${error.message}`)
      setLoading(false)
      return
    }

    router.refresh()
  }

  return (
    <Button size="sm" variant="destructive" onClick={handleDelete} disabled={loading}>
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}
