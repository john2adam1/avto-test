import { redirect } from "next/navigation"
import { checkIsAdmin } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { QuestionForm } from "@/components/admin/question-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

async function getQuestion(questionId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from("questions").select("*").eq("id", questionId).single()

  if (error) {
    return null
  }

  return data
}

export default async function EditQuestionPage({ params }: { params: Promise<{ id: string; questionId: string }> }) {
  const { id, questionId } = await params
  const isAdmin = await checkIsAdmin()

  if (!isAdmin) {
    redirect("/dashboard")
  }

  const question = await getQuestion(questionId)

  if (!question) {
    redirect(`/admin/tests/${id}/questions`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Edit Question</h1>
          <Button asChild variant="ghost">
            <Link href={`/admin/tests/${id}/questions`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-6 py-12">
        <QuestionForm testId={id} question={question} orderIndex={question.order_index} />
      </main>
    </div>
  )
}
