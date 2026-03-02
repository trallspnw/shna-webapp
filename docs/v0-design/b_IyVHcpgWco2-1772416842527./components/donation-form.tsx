"use client"

import { useState } from "react"
import { Heart } from "lucide-react"

export default function DonationForm() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    console.log("Donation:", Object.fromEntries(data))
    setSubmitted(true)
  }

  const inputClasses =
    "rounded-lg border border-border bg-parchment/50 px-3 py-2.5 font-sans text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-rust focus:ring-2 focus:ring-rust/20 focus:outline-none"

  return (
    <div className="flex h-full flex-col rounded-xl bg-card p-6 shadow-md ring-1 ring-border/60 md:p-8">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-rust/15">
        <Heart className="h-6 w-6 text-rust" aria-hidden="true" />
      </div>
      <h3 className="font-serif text-xl font-semibold text-card-foreground">
        Make a Donation
      </h3>
      <p className="mt-2 font-sans text-sm leading-relaxed text-muted-foreground">
        Every dollar goes directly toward trail maintenance, habitat
        restoration, and community programs.
      </p>

      {submitted ? (
        <div className="mt-6 flex flex-1 items-center justify-center rounded-lg bg-secondary/10 p-4">
          <p className="text-center font-sans text-sm font-medium text-secondary">
            Thank you for your generous donation!
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 flex flex-1 flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="donate-email" className="font-sans text-sm font-medium text-card-foreground">
              Email <span className="text-rust" aria-hidden="true">*</span>
              <span className="sr-only">(required)</span>
            </label>
            <input id="donate-email" name="email" type="email" required placeholder="you@example.com" className={inputClasses} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="donate-name" className="font-sans text-sm font-medium text-card-foreground">
              Name
            </label>
            <input id="donate-name" name="name" type="text" placeholder="Jane Doe" className={inputClasses} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="donate-phone" className="font-sans text-sm font-medium text-card-foreground">
              Phone
            </label>
            <input id="donate-phone" name="phone" type="tel" placeholder="(360) 555-0123" className={inputClasses} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="donate-address" className="font-sans text-sm font-medium text-card-foreground">
              Address
            </label>
            <input id="donate-address" name="address" type="text" placeholder="123 Main St, Centralia, WA" className={inputClasses} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="donate-amount" className="font-sans text-sm font-medium text-card-foreground">
              Amount (USD) <span className="text-rust" aria-hidden="true">*</span>
              <span className="sr-only">(required)</span>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-sans text-sm text-muted-foreground">
                $
              </span>
              <input
                id="donate-amount"
                name="amount"
                type="number"
                min="1"
                step="0.01"
                required
                placeholder="25.00"
                className={`${inputClasses} w-full pl-7`}
              />
            </div>
          </div>

          <div className="mt-auto pt-2">
            <button
              type="submit"
              className="w-full rounded-lg bg-rust px-5 py-2.5 font-sans text-sm font-medium text-white transition-colors hover:bg-rust/90 focus-visible:ring-2 focus-visible:ring-rust focus-visible:ring-offset-2"
            >
              Donate
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
