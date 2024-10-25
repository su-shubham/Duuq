import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function Homepage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="font-bold text-xl">Duuq</div>
          <nav className="hidden md:flex space-x-4">
            <a href="#pricing" className="text-foreground/60 hover:text-foreground">Pricing</a>
            <a href="#blog" className="text-foreground/60 hover:text-foreground">Blog</a>
            <a href="#contact" className="text-foreground/60 hover:text-foreground">Contact</a>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost">Login</Button>
          <Button>Sign Up</Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 text-center">
        <div className="inline-block mb-6 rounded-full bg-muted px-3 py-1 text-sm">
          We&apos;ve raised $69M seed funding
        </div>
        <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
          Generate Images, Text and Videos with AI
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-foreground/60">
          Everything AI seamlessly integrated all the modern AI generation tools
          into one platform so that you can generate content with a single click.
        </p>
        <div className="flex justify-center space-x-4">
          <Button size="lg">Get started</Button>
          <Button size="lg" variant="outline">Contact us</Button>
        </div>
      </main>

      <section className="container mx-auto px-4 py-16">
        <h2 className="mb-8 text-2xl font-bold text-center">Packed with thousands of features</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {[
            "Generate images with text",
            "Create simple chatbots",
            "Support for various AI models",
            "Built-in moderation",
            "Easy to use interface",
            "24/7 Customer Support",
            "Money back guarantee",
            "Data privacy focus"
          ].map((feature, index) => (
            <div key={index} className="flex items-center space-x-3 rounded-lg border p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                <svg
                  className="h-6 w-6 text-primary-foreground"
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="font-medium">{feature}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-muted py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to signup and join the waitlist?</h2>
          <p className="mb-8 text-foreground/60">
            Get instant access to our state of the art project and join the waitlist.
          </p>
          <div className="flex justify-center">
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input type="email" placeholder="Enter your email" />
              <Button type="submit">Join Waitlist</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}