import { redirect } from "next/navigation"
import { checkIsAdmin } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { TestFormSimple } from "@/components/admin/test-form-simple"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

async function getTestTypes() {
  const supabase = await createClient()
  const { data, error } = await supabase.from("test_types").select("*").order("name")

  if (error) {
    return []
  }

  return data || []
}

export default async function CreateTestPage() {
  const isAdmin = await checkIsAdmin()

  if (!isAdmin) {
    redirect("/dashboard")
  }

  const testTypes = await getTestTypes()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Create Test</h1>
          <Button asChild variant="ghost">
            <Link href="/admin/tests">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-6 py-12">
        <TestFormSimple testTypes={testTypes} />
      </main>
    </div>
  )
}
