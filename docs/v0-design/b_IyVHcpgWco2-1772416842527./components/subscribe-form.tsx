"use client"

import { useState } from "react"
import { Mail } from "lucide-react"

export default function SubscribeForm() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    console.log("Subscribe:", Object.fromEntries(data))
    setSubmitted(true)
  }

  return (
    <div className="flex h-full flex-col rounded-xl bg-card p-6 shadow-md ring-1 ring-border/60 md:p-8">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-amber/15">
        <Mail className="h-6 w-6 text-amber" aria-hidden="true" />
      </div>
      <h3 className="font-serif text-xl font-semibold text-card-foreground">
        Stay Connected
      </h3>
      <p className="mt-2 font-sans text-sm leading-relaxed text-muted-foreground">
        Get seasonal updates on trails, events, and stewardship opportunities.
      </p>

      {submitted ? (
        <div className="mt-6 flex flex-1 items-center justify-center rounded-lg bg-secondary/10 p-4">
          <p className="text-center font-sans text-sm font-medium text-secondary">
            Thank you for subscribing!
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 flex flex-1 flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="subscribe-email" className="font-sans text-sm font-medium text-card-foreground">
              Email <span className="text-rust" aria-hidden="true">*</span>
              <span className="sr-only">(required)</span>
            </label>
            <input
              id="subscribe-email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="rounded-lg border border-border bg-parchment/50 px-3 py-2.5 font-sans text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-rust focus:ring-2 focus:ring-rust/20 focus:outline-none"
            />
          </div>
          <div className="mt-auto pt-2">
            <button
              type="submit"
              className="w-full rounded-lg bg-rust px-5 py-2.5 font-sans text-sm font-medium text-white transition-colors hover:bg-rust/90 focus-visible:ring-2 focus-visible:ring-rust focus-visible:ring-offset-2"
            >
              Subscribe
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
