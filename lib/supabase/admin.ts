import { createClient } from "./server"

export async function checkIsAdmin(): Promise<boolean> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  const { data, error } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

  if (error || !data) {
    return false
  }

  return data.is_admin === true
}

export async function getAdminStats() {
  const supabase = await createClient()

  // Get total users
  const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

  // Get total tests
  const { count: totalTests } = await supabase.from("tests").select("*", { count: "exact", head: true })

  // Get total test types
  const { count: totalTestTypes } = await supabase.from("test_types").select("*", { count: "exact", head: true })

  // Get total attempts
  const { count: totalAttempts } = await supabase
    .from("user_test_attempts")
    .select("*", { count: "exact", head: true })
    .not("completed_at", "is", null)

  // Get recent attempts
  const { data: recentAttempts } = await supabase
    .from("user_test_attempts")
    .select(
      `
      id,
      score,
      passed,
      completed_at,
      profiles (email),
      tests (title)
    `,
    )
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false })
    .limit(10)

  return {
    totalUsers: totalUsers || 0,
    totalTests: totalTests || 0,
    totalTestTypes: totalTestTypes || 0,
    totalAttempts: totalAttempts || 0,
    recentAttempts: recentAttempts || [],
  }
}
