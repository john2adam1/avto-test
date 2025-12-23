import { createClient } from "./server"

export interface SubscriptionStatus {
  hasAccess: boolean
  isAdmin: boolean
  isTrial: boolean
  isSubscribed: boolean
  trialEndsAt: string | null
  subscriptionEndsAt: string | null
  timeRemaining: number | null // milliseconds remaining
}

export async function getSubscriptionStatus(): Promise<SubscriptionStatus | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("is_admin, trial_ends_at, subscription_ends_at")
    .eq("id", user.id)
    .single()

  // If columns don't exist yet, provide default values with admin access only
  if (error) {
    const { data: basicData } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

    return {
      hasAccess: basicData?.is_admin === true,
      isAdmin: basicData?.is_admin === true,
      isTrial: false,
      isSubscribed: false,
      trialEndsAt: null,
      subscriptionEndsAt: null,
      timeRemaining: null,
    }
  }

  if (!data) {
    return null
  }

  const now = new Date()
  const trialEnd = data.trial_ends_at ? new Date(data.trial_ends_at) : null
  const subscriptionEnd = data.subscription_ends_at ? new Date(data.subscription_ends_at) : null

  const isAdmin = data.is_admin === true
  const isTrial = trialEnd ? trialEnd > now : false
  const isSubscribed = subscriptionEnd ? subscriptionEnd > now : false
  const hasAccess = isAdmin || isTrial || isSubscribed

  let timeRemaining: number | null = null
  if (isTrial && trialEnd) {
    timeRemaining = trialEnd.getTime() - now.getTime()
  } else if (isSubscribed && subscriptionEnd) {
    timeRemaining = subscriptionEnd.getTime() - now.getTime()
  }

  return {
    hasAccess,
    isAdmin,
    isTrial,
    isSubscribed,
    trialEndsAt: data.trial_ends_at,
    subscriptionEndsAt: data.subscription_ends_at,
    timeRemaining,
  }
}

export async function getTelegramUsername(): Promise<string> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("settings").select("value").eq("key", "telegram_admin_username").single()

  if (error) {
    return "youradmin" // Default fallback
  }

  return data?.value || "youradmin"
}
