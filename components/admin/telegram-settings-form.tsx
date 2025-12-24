"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MessageCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export function TelegramSettingsForm({ initialUsername }: { initialUsername: string }) {
  const [username, setUsername] = useState(initialUsername)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim()) {
      alert("Please enter a Telegram username")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/admin/update-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: "telegram_admin_username",
          value: username.trim().replace("@", ""),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update settings")
      }

      alert("Telegram username updated successfully!")
      router.refresh()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      console.error("Error updating settings:", errorMessage, error)
      alert(`Failed to update settings: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="telegram">Telegram Username</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MessageCircle className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              id="telegram"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="yourusername"
              className="pl-10"
              disabled={isLoading}
            />
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Enter your Telegram username without the @ symbol. Users will see this when their trial expires.
        </p>
        <p className="text-sm text-gray-600">
          Preview link:{" "}
          <a
            href={`https://t.me/${username.replace("@", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:underline"
          >
            https://t.me/{username.replace("@", "")}
          </a>
        </p>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 sm:w-auto">
        {isLoading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  )
}
