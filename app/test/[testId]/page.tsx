import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TestInterface } from "@/components/test-interface"
import { getSubscriptionStatus } from "@/lib/supabase/subscription"

interface Test {
  id: string
  test_type_id: string
  question_text: string
  image_url: string | null
  correct_answer: number
  answer_0: string
  answer_1: string
  answer_2: string
  answer_3: string
  test_types: {
    name: string
    time_limit: number
  }
}

async function getTest(testId: string) {
  const supabase = await createClient()

  // Get test with question data and test type
  const { data: test, error: testError } = await supabase
    .from("tests")
    .select(
      `
      id,
      test_type_id,
      question_text,
      image_url,
      correct_answer,
      answer_0,
      answer_1,
      answer_2,
      answer_3,
      test_types (
        name,
        time_limit
      )
    `,
    )
    .eq("id", testId)
    .single()

  if (testError || !test) {
    if (testError) {
      const errorInfo = {
        message: testError.message || "Unknown error",
        details: testError.details || "No details available",
        hint: testError.hint || "No hint available",
        code: testError.code || "No code available",
      }
      console.error("Error fetching test:", errorInfo, "Full error:", JSON.stringify(testError, Object.getOwnPropertyNames(testError)))
    } else {
      console.error("Error fetching test: No test data returned")
    }
    return null
  }

  // Handle nested test_types - it might be an array from Supabase
  const testTypes = Array.isArray(test.test_types) ? test.test_types[0] : test.test_types

  return {
    ...test,
    test_types: testTypes,
  } as Test
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

  const test = await getTest(testId)

  if (!test) {
    redirect("/dashboard")
  }

  return (
    <TestInterface
      testId={test.id}
      testTypeName={test.test_types.name}
      timeLimit={test.test_types.time_limit}
      questionText={test.question_text}
      imageUrl={test.image_url}
      answer0={test.answer_0}
      answer1={test.answer_1}
      answer2={test.answer_2}
      answer3={test.answer_3}
      correctAnswer={test.correct_answer}
      userId={user.id}
    />
  )
}
