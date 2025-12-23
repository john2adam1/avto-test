import { redirect } from "next/navigation"
import { checkIsAdmin } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { TestTypeForm } from "@/components/admin/test-type-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

async function getTestType(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from("test_types").select("*").eq("id", id).single()

  if (error) {
    return null
  }

  return data
}

export default async function EditTestTypePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const isAdmin = await checkIsAdmin()

  if (!isAdmin) {
    redirect("/dashboard")
  }

  const testType = await getTestType(id)

  if (!testType) {
    redirect("/admin/test-types")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Edit Test Type</h1>
          <Button asChild variant="ghost">
            <Link href="/admin/test-types">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-6 py-12">
        <TestTypeForm testType={testType} />
      </main>
    </div>
  )
}
