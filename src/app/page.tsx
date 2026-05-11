import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ExperienceStories from "@/components/ExperienceStories";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import Vendors from "@/components/Vendors";
import VendorGallery from "@/components/VendorGallery";
import Partners from "@/components/Partners";
import PricePromise from "@/components/PricePromise";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ExperienceStories />
        <HowItWorks />
        <Features />
        <Vendors />
        <VendorGallery />
        <Partners />
        <PricePromise />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
