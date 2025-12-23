import { redirect } from "next/navigation"
import { checkIsAdmin } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Plus, Pencil } from "lucide-react"
import { DeleteTestTypeButton } from "@/components/admin/delete-test-type-button"

async function getTestTypes() {
  const supabase = await createClient()
  const { data, error } = await supabase.from("test_types").select("*").order("name")

  if (error) {
    console.error("Error fetching test types:", error)
    return []
  }

  return data
}

export default async function TestTypesPage() {
  const isAdmin = await checkIsAdmin()

  if (!isAdmin) {
    redirect("/dashboard")
  }

  const testTypes = await getTestTypes()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Test Types Management</h1>
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
            <h2 className="text-3xl font-bold text-gray-900">Test Types</h2>
            <p className="text-gray-600">Manage test categories</p>
          </div>
          <Button asChild>
            <Link href="/admin/test-types/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Test Type
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testTypes.map((testType) => (
            <Card key={testType.id} className="border-2">
              <CardHeader>
                <CardTitle>{testType.name}</CardTitle>
                <CardDescription>{testType.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-gray-600">Time Limit: {Math.floor(testType.time_limit / 60)} minutes</p>
                <div className="flex gap-2">
                  <Button asChild size="sm" variant="outline" className="flex-1 bg-transparent">
                    <Link href={`/admin/test-types/${testType.id}/edit`}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </Button>
                  <DeleteTestTypeButton testTypeId={testType.id} testTypeName={testType.name} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {testTypes.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <p className="mb-4 text-lg text-gray-600">No test types created yet</p>
              <Button asChild>
                <Link href="/admin/test-types/create">Create First Test Type</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
