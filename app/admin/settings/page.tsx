import { redirect } from "next/navigation"
import { checkIsAdmin } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Settings } from "lucide-react"
import { TelegramSettingsForm } from "@/components/admin/telegram-settings-form"

async function getTelegramUsername() {
  const supabase = await createClient()

  const { data } = await supabase.from("settings").select("value").eq("key", "telegram_admin_username").single()

  return data?.value || "youradmin"
}

export default async function SettingsPage() {
  const isAdmin = await checkIsAdmin()

  if (!isAdmin) {
    redirect("/dashboard")
  }

  const telegramUsername = await getTelegramUsername()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Settings className="h-8 w-8 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          </div>
          <Button asChild variant="ghost">
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Application Settings</h2>
          <p className="text-gray-600">Configure system-wide settings</p>
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>Telegram Contact</CardTitle>
            <CardDescription>
              Set your Telegram username where users can contact you to purchase subscriptions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TelegramSettingsForm initialUsername={telegramUsername} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
