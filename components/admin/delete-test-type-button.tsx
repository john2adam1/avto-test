"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export function DeleteTestTypeButton({ testTypeId, testTypeName }: { testTypeId: string; testTypeName: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete "${testTypeName}"? This will delete all associated tests and questions.`,
      )
    ) {
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.from("test_types").delete().eq("id", testTypeId)

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
