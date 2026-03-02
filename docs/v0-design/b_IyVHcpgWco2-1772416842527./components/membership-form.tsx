"use client"

import { useState } from "react"
import { Users } from "lucide-react"

export default function MembershipForm() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    console.log("Membership:", Object.fromEntries(data))
    setSubmitted(true)
  }

  const inputClasses =
    "rounded-lg border border-border bg-parchment/50 px-3 py-2.5 font-sans text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-rust focus:ring-2 focus:ring-rust/20 focus:outline-none"

  return (
    <div className="flex h-full flex-col rounded-xl bg-card p-6 shadow-md ring-1 ring-border/60 md:p-8">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/15">
        <Users className="h-6 w-6 text-secondary" aria-hidden="true" />
      </div>
      <h3 className="font-serif text-xl font-semibold text-card-foreground">
        Become a Member
      </h3>
      <p className="mt-2 font-sans text-sm leading-relaxed text-muted-foreground">
        Join the Friends of Seminary Hill and help sustain this community
        treasure.
      </p>

      {submitted ? (
        <div className="mt-6 flex flex-1 items-center justify-center rounded-lg bg-secondary/10 p-4">
          <p className="text-center font-sans text-sm font-medium text-secondary">
            Welcome to the Friends of Seminary Hill!
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 flex flex-1 flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="member-email" className="font-sans text-sm font-medium text-card-foreground">
              Email <span className="text-rust" aria-hidden="true">*</span>
              <span className="sr-only">(required)</span>
            </label>
            <input id="member-email" name="email" type="email" required placeholder="you@example.com" className={inputClasses} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="member-name" className="font-sans text-sm font-medium text-card-foreground">
              Name <span className="text-rust" aria-hidden="true">*</span>
              <span className="sr-only">(required)</span>
            </label>
            <input id="member-name" name="name" type="text" required placeholder="Jane Doe" className={inputClasses} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="member-phone" className="font-sans text-sm font-medium text-card-foreground">
              Phone
            </label>
            <input id="member-phone" name="phone" type="tel" placeholder="(360) 555-0123" className={inputClasses} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="member-address" className="font-sans text-sm font-medium text-card-foreground">
              Address
            </label>
            <input id="member-address" name="address" type="text" placeholder="123 Main St, Centralia, WA" className={inputClasses} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="member-plan" className="font-sans text-sm font-medium text-card-foreground">
              Plan
            </label>
            <select
              id="member-plan"
              name="plan"
              defaultValue="individual"
              className={`${inputClasses} appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%234a5a3f%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10`}
            >
              <option value="individual">{"Individual \u2014 $10.00"}</option>
              <option value="family">{"Family \u2014 $20.00"}</option>
            </select>
          </div>

          <div className="mt-auto pt-2">
            <button
              type="submit"
              className="w-full rounded-lg bg-rust px-5 py-2.5 font-sans text-sm font-medium text-white transition-colors hover:bg-rust/90 focus-visible:ring-2 focus-visible:ring-rust focus-visible:ring-offset-2"
            >
              Join
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
