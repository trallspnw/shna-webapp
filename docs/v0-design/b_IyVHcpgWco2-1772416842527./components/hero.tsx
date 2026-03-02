import Image from "next/image"

export default function Hero() {
  return (
    <section className="relative flex min-h-[90vh] items-end" aria-label="Hero">
      {/* Background image */}
      <Image
        src="/images/hero-forest.jpg"
        alt="A lush Pacific Northwest forest trail with sword ferns and dappled sunlight"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"
        aria-hidden="true"
      />

      {/* Hero content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-16 pt-32 lg:px-8 lg:pb-24">
        <h1 className="font-serif text-4xl font-semibold leading-tight text-white text-balance md:text-5xl lg:text-6xl">
          A Place to Return To
        </h1>
        <p className="mt-4 max-w-xl font-sans text-lg text-white/85 leading-relaxed md:text-xl">
          Protecting Seminary Hill for Centralia&#39;s community — season after
          season.
        </p>
        <a
          href="#get-involved"
          className="mt-8 inline-block rounded-lg bg-rust px-8 py-3 font-sans text-base font-medium text-white shadow-lg transition-all hover:bg-rust/90 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
        >
          Get Involved
        </a>
      </div>
    </section>
  )
}
