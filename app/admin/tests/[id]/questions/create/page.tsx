import { redirect } from "next/navigation"
import { checkIsAdmin } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { QuestionForm } from "@/components/admin/question-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

async function getTest(id: string) {
  const supabase = await createClient()
  const { data } = await supabase.from("tests").select("title").eq("id", id).single()
  return data
}

async function getNextOrderIndex(testId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("questions")
    .select("order_index")
    .eq("test_id", testId)
    .order("order_index", { ascending: false })
    .limit(1)

  return data && data.length > 0 ? data[0].order_index + 1 : 0
}

export default async function CreateQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const isAdmin = await checkIsAdmin()

  if (!isAdmin) {
    redirect("/dashboard")
  }

  const [test, nextOrderIndex] = await Promise.all([getTest(id), getNextOrderIndex(id)])

  if (!test) {
    redirect("/admin/tests")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add Question</h1>
            <p className="text-sm text-gray-600">{test.title}</p>
          </div>
          <Button asChild variant="ghost">
            <Link href={`/admin/tests/${id}/questions`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-6 py-12">
        <QuestionForm testId={id} orderIndex={nextOrderIndex} />
      </main>
    </div>
  )
}
