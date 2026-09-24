import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { SignalStrip } from "@/components/signal-strip";
import { ProofStrip } from "@/components/proof-strip";
import { Offers } from "@/components/offers";
import GlassBox from "@/components/glass-box";
import { Work } from "@/components/work";
import { Notes } from "@/components/notes";
import { CapabilityMap } from "@/components/capability-map";
import { Credentials } from "@/components/credentials";
import { Contact } from "@/components/contact";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        {/* The claim. */}
        <Hero />

        {/* Evidence, before anything is claimed about it. */}
        <ProofStrip />
        <SignalStrip />

        {/* The offer: what someone can actually hire him to build. */}
        <Offers />

        {/* The proof: the claim, running, with its machinery visible. */}
        <GlassBox />

        {/* The record: every project in one place, each running where it can. */}
        <Work />
        <Notes />
        <CapabilityMap />
        <Credentials />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
