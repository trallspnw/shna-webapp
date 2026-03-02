import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import IntroBlock from "@/components/intro-block"
import FormsSection from "@/components/forms-section"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <IntroBlock />
      <FormsSection />
      <Footer />
    </main>
  )
}
