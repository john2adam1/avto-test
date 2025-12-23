"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Shield, ShieldOff } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export function ToggleAdminButton({
  userId,
  userEmail,
  isAdmin,
}: {
  userId: string
  userEmail: string
  isAdmin: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    const action = isAdmin ? "revoke admin access from" : "grant admin access to"
    if (!confirm(`Are you sure you want to ${action} ${userEmail}?`)) {
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.from("profiles").update({ is_admin: !isAdmin }).eq("id", userId)

    if (error) {
      alert(`Error: ${error.message}`)
      setLoading(false)
      return
    }

    router.refresh()
  }

  return (
    <Button size="sm" variant={isAdmin ? "destructive" : "default"} onClick={handleToggle} disabled={loading}>
      {isAdmin ? (
        <>
          <ShieldOff className="mr-2 h-4 w-4" />
          Revoke Admin
        </>
      ) : (
        <>
          <Shield className="mr-2 h-4 w-4" />
          Make Admin
        </>
      )}
    </Button>
  )
}
