import { createClient } from "@/lib/supabase/server"
import { checkIsAdmin } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const isAdmin = await checkIsAdmin()

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { key, value } = await request.json()

    if (!key || !value) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Upsert the setting
    const { error } = await supabase
      .from("settings")
      .upsert({ key, value, updated_by: user.id, updated_at: new Date().toISOString() }, { onConflict: "key" })

    if (error) {
      const errorInfo = {
        message: error.message || "Unknown error",
        details: error.details || "No details available",
        hint: error.hint || "No hint available",
        code: error.code || "No code available",
      }
      console.error("Error updating setting:", errorInfo, "Full error:", JSON.stringify(error, Object.getOwnPropertyNames(error)))
      return NextResponse.json({ error: error.message || "Failed to update setting" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in update-settings route:", error instanceof Error ? error.message : "Unknown error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
