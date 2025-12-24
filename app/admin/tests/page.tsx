import { redirect } from "next/navigation"
import { checkIsAdmin } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Plus, Pencil } from "lucide-react"
import { DeleteTestButton } from "@/components/admin/delete-test-button"

async function getTests() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("tests")
    .select(
      `
      *,
      test_types (name)
    `,
    )
    .order("created_at", { ascending: false })

  if (error) {
    const errorInfo = {
      message: error.message || "Unknown error",
      details: error.details || "No details available",
      hint: error.hint || "No hint available",
      code: error.code || "No code available",
    }
    console.error("Error fetching tests:", errorInfo, "Full error:", JSON.stringify(error, Object.getOwnPropertyNames(error)))
    return []
  }

  if (!data) {
    return []
  }

  // Handle nested test_types
  return data.map((test: any) => ({
    ...test,
    test_types: Array.isArray(test.test_types) ? test.test_types[0] : test.test_types,
  }))
}

export default async function TestsManagementPage() {
  const isAdmin = await checkIsAdmin()

  if (!isAdmin) {
    redirect("/dashboard")
  }

  const tests = await getTests()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Tests Management</h1>
          <Button asChild variant="ghost">
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">All Tests</h2>
            <p className="text-gray-600">Manage tests (one test per category)</p>
          </div>
          <Button asChild>
            <Link href="/admin/tests/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Test
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tests.map((test: any) => (
            <Card key={test.id} className="border-2">
              <CardHeader>
                <CardTitle className="truncate">{test.test_types?.name || "Unknown Category"}</CardTitle>
                <CardDescription className="line-clamp-2">{test.question_text}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-gray-600">Question: {test.question_text.substring(0, 50)}...</p>
                <div className="flex gap-2">
                  <Button asChild size="sm" variant="outline" className="flex-1 bg-transparent">
                    <Link href={`/admin/tests/${test.id}/edit`}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </Button>
                  <DeleteTestButton testId={test.id} testTitle={test.test_types?.name || "Test"} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {tests.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <p className="mb-4 text-lg text-gray-600">No tests created yet</p>
              <Button asChild>
                <Link href="/admin/tests/create">Create First Test</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
