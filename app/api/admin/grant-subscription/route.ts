import { createClient } from "@/lib/supabase/server"
import { checkIsAdmin } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const isAdmin = await checkIsAdmin()

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { userId, months } = await request.json()

    if (!userId || !months || typeof months !== "number") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get current subscription end date
    const { data: profile } = await supabase.from("profiles").select("subscription_ends_at").eq("id", userId).single()

    // Calculate new subscription end date
    const now = new Date()
    const currentSubEnd = profile?.subscription_ends_at ? new Date(profile.subscription_ends_at) : null

    // If they have an active subscription, extend it; otherwise start from now
    const startDate = currentSubEnd && currentSubEnd > now ? currentSubEnd : now
    const newSubEnd = new Date(startDate)
    newSubEnd.setMonth(newSubEnd.getMonth() + months)

    // Update the user's subscription
    const { error } = await supabase
      .from("profiles")
      .update({ subscription_ends_at: newSubEnd.toISOString() })
      .eq("id", userId)

    if (error) {
      console.error("Error updating subscription:", error)
      return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in grant-subscription route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
