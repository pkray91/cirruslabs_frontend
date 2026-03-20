import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#f8fafc]">
      <Navbar />
      
      <section className="relative w-full h-screen">
        <HeroSection />
      </section>
      
      <div className="relative z-20">
        <FeaturesSection />
      </div>
    </main>
  );
}
