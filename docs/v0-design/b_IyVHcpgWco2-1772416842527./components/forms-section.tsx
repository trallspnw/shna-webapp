import SubscribeForm from "@/components/subscribe-form"
import MembershipForm from "@/components/membership-form"
import DonationForm from "@/components/donation-form"

export default function FormsSection() {
  return (
    <section
      id="get-involved"
      className="bg-muted/50 px-4 py-20 lg:px-8 lg:py-28"
      aria-label="Get involved"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="font-serif text-3xl font-semibold text-foreground md:text-4xl text-balance">
            Get Involved
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-sans text-base leading-relaxed text-sage">
            Whether you subscribe, become a member, or make a donation — every
            bit of support helps keep Seminary Hill thriving.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          <SubscribeForm />
          <MembershipForm />
          <DonationForm />
        </div>
      </div>
    </section>
  )
}
