import { redirect } from "next/navigation"
import { checkIsAdmin } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Plus, Pencil, ImageIcon } from "lucide-react"
import { DeleteQuestionButton } from "@/components/admin/delete-question-button"

async function getTest(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from("tests").select("*, test_types(name)").eq("id", id).single()

  if (error) {
    return null
  }

  return data
}

async function getQuestions(testId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from("questions").select("*").eq("test_id", testId).order("order_index")

  if (error) {
    return []
  }

  return data
}

export default async function QuestionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const isAdmin = await checkIsAdmin()

  if (!isAdmin) {
    redirect("/dashboard")
  }

  const [test, questions] = await Promise.all([getTest(id), getQuestions(id)])

  if (!test) {
    redirect("/admin/tests")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{test.title}</h1>
            <p className="text-sm text-gray-600">{test.test_types?.name}</p>
          </div>
          <Button asChild variant="ghost">
            <Link href="/admin/tests">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tests
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Questions</h2>
            <p className="text-gray-600">Manage questions for this test</p>
          </div>
          <Button asChild>
            <Link href={`/admin/tests/${id}/questions/create`}>
              <Plus className="mr-2 h-4 w-4" />
              Add Question
            </Link>
          </Button>
        </div>

        <div className="space-y-4">
          {questions.map((question: any, index: number) => (
            <Card key={question.id} className="border-2">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      Question {index + 1}
                      {question.image_url && <ImageIcon className="ml-2 inline h-5 w-5 text-purple-600" />}
                    </CardTitle>
                    <CardDescription className="mt-2">{question.question_text}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/tests/${id}/questions/${question.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <DeleteQuestionButton questionId={question.id} testId={id} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className={question.correct_answer === 0 ? "font-semibold text-green-600" : ""}>
                    A: {question.answer_0}
                  </div>
                  <div className={question.correct_answer === 1 ? "font-semibold text-green-600" : ""}>
                    B: {question.answer_1}
                  </div>
                  <div className={question.correct_answer === 2 ? "font-semibold text-green-600" : ""}>
                    C: {question.answer_2}
                  </div>
                  <div className={question.correct_answer === 3 ? "font-semibold text-green-600" : ""}>
                    D: {question.answer_3}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {questions.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <p className="mb-4 text-lg text-gray-600">No questions added yet</p>
              <Button asChild>
                <Link href={`/admin/tests/${id}/questions/create`}>Add First Question</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
