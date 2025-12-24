"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import { useRouter } from "next/navigation"

export function GrantSubscriptionButton({ userId, userEmail }: { userId: string; userEmail: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const grantSubscription = async (months: number) => {
    if (!confirm(`Grant ${months} month subscription to ${userEmail}?`)) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/admin/grant-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          months,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to grant subscription")
      }

      alert(`Successfully granted ${months} month subscription!`)
      router.refresh()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      console.error("Error granting subscription:", errorMessage, error)
      alert(`Failed to grant subscription: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => grantSubscription(1)}
        disabled={isLoading}
        className="bg-green-50 hover:bg-green-100"
      >
        <Calendar className="mr-2 h-4 w-4" />
        Grant 1 Month
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => grantSubscription(3)}
        disabled={isLoading}
        className="bg-blue-50 hover:bg-blue-100"
      >
        <Calendar className="mr-2 h-4 w-4" />
        Grant 3 Months
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => grantSubscription(12)}
        disabled={isLoading}
        className="bg-purple-50 hover:bg-purple-100"
      >
        <Calendar className="mr-2 h-4 w-4" />
        Grant 12 Months
      </Button>
    </div>
  )
}
