import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Clock, Trophy, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-indigo-600" />
            <span className="text-2xl font-bold text-gray-900">TestMaster</span>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="ghost">
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-6 py-20 text-center">
          <h1 className="mb-6 text-balance text-5xl font-bold leading-tight tracking-tight text-gray-900 md:text-6xl">
            Master Your Skills with
            <br />
            <span className="text-indigo-600">Interactive Tests</span>
          </h1>
          <p className="mb-10 text-pretty text-xl text-gray-600 md:text-2xl">
            Challenge yourself with timed tests across multiple topics. Track your progress and improve your knowledge.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="text-lg">
              <Link href="/auth/sign-up">Start Testing Now</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg bg-transparent">
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-6 py-16">
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
                  <Clock className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle className="text-xl">Timed Challenges</CardTitle>
                <CardDescription className="text-base">
                  Race against the clock to complete tests and improve your speed
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
                  <Trophy className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle className="text-xl">Track Progress</CardTitle>
                <CardDescription className="text-base">
                  View detailed statistics and see how you improve over time
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
                  <CheckCircle className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle className="text-xl">Multiple Topics</CardTitle>
                <CardDescription className="text-base">
                  Choose from various test types including Math, Programming, and more
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-20">
          <Card className="border-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <CardContent className="flex flex-col items-center gap-6 py-16 text-center">
              <h2 className="text-balance text-4xl font-bold">Ready to Test Your Knowledge?</h2>
              <p className="max-w-2xl text-pretty text-lg text-indigo-100">
                Join thousands of learners who are improving their skills every day
              </p>
              <Button asChild size="lg" variant="secondary" className="text-lg">
                <Link href="/auth/sign-up">Create Free Account</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-8 text-center text-sm text-gray-600">
          <p>© 2025 TestMaster. Built with Next.js and Supabase.</p>
        </div>
      </footer>
    </div>
  )
}
