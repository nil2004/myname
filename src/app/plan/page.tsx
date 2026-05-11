import type { Metadata } from "next";
import PlanForm from "@/components/PlanForm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Plan a Birthday — UtsavAI",
  description: "Tell us your budget, date, and city. We'll match you with the best vendors instantly.",
};

export default function PlanPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[var(--cream)] pt-28 pb-20 px-[5%]">
        <div className="max-w-2xl mx-auto">
          <span className="text-xs font-medium tracking-widest uppercase text-[var(--purple)] mb-3 block">
            Let&apos;s plan your party
          </span>
          <h1 className="font-playfair font-bold text-[clamp(2rem,4vw,3rem)] leading-[1.25] mb-3">
            Tell us about the birthday
          </h1>
          <p className="text-[var(--text-muted)] leading-[1.7] mb-10">
            Fill in the details below and our AI will instantly match you with the best verified vendors in your budget.
          </p>
          <PlanForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
