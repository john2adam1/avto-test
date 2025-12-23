import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TestInterface } from "@/components/test-interface"
import { getSubscriptionStatus } from "@/lib/supabase/subscription"

interface Question {
  id: string
  question_text: string
  image_url: string
  correct_answer: number
  answer_0: string
  answer_1: string
  answer_2: string
  answer_3: string
  order_index: number
}

interface Test {
  id: string
  title: string
  test_types: {
    name: string
    time_limit: number
  }
}

async function getTestWithQuestions(testId: string) {
  const supabase = await createClient()

  // Get test details with test type
  const { data: test, error: testError } = await supabase
    .from("tests")
    .select(
      `
      id,
      title,
      test_types (
        name,
        time_limit
      )
    `,
    )
    .eq("id", testId)
    .single()

  if (testError || !test) {
    console.error("Error fetching test:", testError)
    return null
  }

  // Get questions for this test
  const { data: questions, error: questionsError } = await supabase
    .from("questions")
    .select("*")
    .eq("test_id", testId)
    .order("order_index")

  if (questionsError) {
    console.error("Error fetching questions:", questionsError)
    return null
  }

  return {
    test: test as Test,
    questions: questions as Question[],
  }
}

export default async function TestPage({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const subscriptionStatus = await getSubscriptionStatus()

  if (!subscriptionStatus || !subscriptionStatus.hasAccess) {
    redirect("/dashboard")
  }

  const data = await getTestWithQuestions(testId)

  if (!data) {
    redirect("/dashboard")
  }

  const { test, questions } = data

  return (
    <TestInterface
      testId={test.id}
      testTitle={test.title}
      testTypeName={test.test_types.name}
      timeLimit={test.test_types.time_limit}
      questions={questions}
      userId={user.id}
    />
  )
}
