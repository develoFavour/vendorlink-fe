import { HeroSection } from "@/components/HeroSection";
import { AboutSection } from "@/components/AboutSection";
import { TopSellingProducts } from "@/components/TopSellingProducts";
import { CategoriesSection } from "@/components/CategoriesSection";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <HeroSection />
      <AboutSection />
      <TopSellingProducts />
      <CategoriesSection />
      <Footer />
    </main>
  );
}
