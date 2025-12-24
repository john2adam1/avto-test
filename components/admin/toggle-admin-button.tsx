"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Shield, ShieldOff } from "lucide-react"

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

    try {
      const response = await fetch("/api/admin/toggle-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          isAdmin: !isAdmin,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        alert(`Error: ${result.error || "Failed to update admin status"}`)
        setLoading(false)
        return
      }

      // Success - refresh the page to show updated status
      router.refresh()
    } catch (error) {
      console.error("Error toggling admin status:", error)
      alert(`Error: ${error instanceof Error ? error.message : "Failed to update admin status"}`)
      setLoading(false)
    }
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
