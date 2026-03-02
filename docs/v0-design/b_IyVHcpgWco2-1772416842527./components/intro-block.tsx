export default function IntroBlock() {
  return (
    <section
      id="about"
      className="bg-parchment px-4 py-20 lg:px-8 lg:py-28"
      aria-label="Welcome"
    >
      {/* Decorative amber divider */}
      <div className="mx-auto mb-12 flex max-w-[700px] items-center gap-4">
        <span className="h-px flex-1 bg-amber/40" aria-hidden="true" />
        <svg
          className="h-5 w-5 text-amber"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 2C9.5 2 7.5 4 7.5 6.5c0 1.5.7 2.8 1.8 3.7-.3.2-.6.5-.9.8C6.5 12.5 5 15 5 17.5c0 1.4 1.1 2.5 2.5 2.5h9c1.4 0 2.5-1.1 2.5-2.5 0-2.5-1.5-5-3.4-6.5-.3-.3-.6-.6-.9-.8 1.1-.9 1.8-2.2 1.8-3.7C16.5 4 14.5 2 12 2zm0 2c1.4 0 2.5 1.1 2.5 2.5S13.4 9 12 9s-2.5-1.1-2.5-2.5S10.6 4 12 4z" />
        </svg>
        <span className="h-px flex-1 bg-amber/40" aria-hidden="true" />
      </div>

      <div className="mx-auto max-w-[700px] text-center">
        <h2 className="font-serif text-3xl font-semibold text-foreground md:text-4xl text-balance">
          Welcome
        </h2>
        <p className="mt-6 font-sans text-base leading-relaxed text-sage md:text-lg">
          Seminary Hill Natural Area is a 55-acre community nature preserve
          nestled in the heart of Centralia, Washington. Featuring old-growth
          stumps, native wildflowers, and a network of gentle walking trails,
          the hill has been a gathering place for generations of Lewis County
          residents.
        </p>
        <p className="mt-4 font-sans text-base leading-relaxed text-sage md:text-lg">
          The Friends of Seminary Hill Natural Area is a volunteer-led nonprofit
          dedicated to protecting, restoring, and sharing this irreplaceable
          green space. Through community stewardship, environmental education,
          and habitat restoration, we work to ensure Seminary Hill remains a
          living refuge — open and free — for everyone.
        </p>
      </div>
    </section>
  )
}
