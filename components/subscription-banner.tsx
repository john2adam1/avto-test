"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, MessageCircle } from "lucide-react"

interface SubscriptionBannerProps {
  hasAccess: boolean
  isTrial: boolean
  isSubscribed: boolean
  timeRemaining: number | null
  telegramUsername: string
}

export function SubscriptionBanner({
  hasAccess,
  isTrial,
  isSubscribed,
  timeRemaining,
  telegramUsername,
}: SubscriptionBannerProps) {
  const [timeLeft, setTimeLeft] = useState(timeRemaining)

  useEffect(() => {
    if (!timeLeft || timeLeft <= 0) return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (!prev || prev <= 1000) {
          clearInterval(interval)
          window.location.reload()
          return 0
        }
        return prev - 1000
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timeLeft])

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const days = Math.floor(totalSeconds / 86400)
    const hours = Math.floor((totalSeconds % 86400) / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${seconds}s`
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    }
    return `${seconds}s`
  }

  // Show trial countdown
  if (isTrial && timeLeft && timeLeft > 0) {
    return (
      <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-indigo-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Free Trial Active</h3>
              <p className="text-sm text-gray-600">Time remaining: {formatTime(timeLeft)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show subscription countdown
  if (isSubscribed && timeLeft && timeLeft > 0) {
    return (
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-green-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Subscription Active</h3>
              <p className="text-sm text-gray-600">Time remaining: {formatTime(timeLeft)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show purchase button if no access
  if (!hasAccess) {
    return (
      <Card className="border-rose-200 bg-gradient-to-r from-rose-50 to-red-50">
        <CardContent className="flex flex-col items-center justify-center gap-4 p-8 text-center md:flex-row md:justify-between">
          <div>
            <h3 className="mb-2 text-xl font-bold text-gray-900">Your trial has ended</h3>
            <p className="text-gray-600">Contact our admin on Telegram to purchase a subscription</p>
          </div>
          <Button size="lg" asChild className="bg-indigo-600 hover:bg-indigo-700">
            <a href={`https://t.me/${telegramUsername}`} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2 h-5 w-5" />
              Buy Subscription
            </a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return null
}
