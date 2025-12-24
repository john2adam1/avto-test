import { createClient } from "@/lib/supabase/server"
import { checkIsAdmin } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Verify the requester is an admin
    const isAdmin = await checkIsAdmin()
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 })
    }

    const body = await request.json()
    const { userId, isAdmin: newAdminStatus } = body

    if (!userId || typeof newAdminStatus !== "boolean") {
      return NextResponse.json({ error: "Invalid request: userId and isAdmin required" }, { status: 400 })
    }

    // Prevent admins from removing their own admin status
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user && user.id === userId && !newAdminStatus) {
      return NextResponse.json(
        { error: "Cannot remove your own admin status. Ask another admin to do it." },
        { status: 400 },
      )
    }

    // Update the user's admin status
    const { data, error } = await supabase
      .from("profiles")
      .update({ is_admin: newAdminStatus })
      .eq("id", userId)
      .select()
      .single()

    if (error) {
      console.error("Error updating admin status:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      return NextResponse.json({ error: error.message || "Failed to update admin status" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Admin status ${newAdminStatus ? "granted" : "revoked"} successfully`,
      data,
    })
  } catch (error) {
    console.error("Unexpected error in toggle-admin route:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}

