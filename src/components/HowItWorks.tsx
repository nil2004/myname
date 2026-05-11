"use client";

import { useReveal } from "@/lib/useReveal";

const steps = [
  {
    number: "01",
    icon: "📍",
    iconBg: "bg-[rgba(107,63,160,0.10)]",
    title: "Tell us the basics",
    desc: "Budget, date, city — and any vibe you have in mind. Superhero theme? Unicorn party? Just tell us.",
  },
  {
    number: "02",
    icon: "✨",
    iconBg: "bg-[rgba(232,168,48,0.12)]",
    title: "AI matches best vendors",
    desc: "Our AI instantly shows you the top verified decorators, photographers, and cake artists in your budget — all rated by real parents.",
  },
  {
    number: "03",
    icon: "🎉",
    iconBg: "bg-[rgba(240,100,73,0.10)]",
    title: "Confirm and celebrate",
    desc: "Book in one tap. We send confirmation to the vendor and you — and if anything changes, we handle it for you.",
  },
];

export default function HowItWorks() {
  const { ref } = useReveal();

  return (
    <section
      id="how"
      ref={ref}
      className="reveal py-24 px-[5%] bg-[var(--warm-white)]"
    >
      <div className="text-center max-w-xl mx-auto mb-14">
        <span className="text-xs font-medium tracking-widest uppercase text-[var(--purple)] mb-3 block">
          How it works
        </span>
        <h2 className="font-playfair font-bold text-[clamp(2rem,4vw,3rem)] leading-[1.25] mb-3">
          From idea to booked — in minutes
        </h2>
        <p className="text-[var(--text-muted)] leading-[1.7]">
          No calls, no comparison headaches. Just 3 simple steps.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step) => (
          <StepCard key={step.number} {...step} />
        ))}
      </div>
    </section>
  );
}

function StepCard({
  number,
  icon,
  iconBg,
  title,
  desc,
}: (typeof steps)[0]) {
  const { ref } = useReveal();

  return (
    <div
      ref={ref}
      className="reveal bg-[var(--cream)] border border-[var(--border)] rounded-[20px] p-8 relative hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(107,63,160,0.12)] transition-all duration-300"
    >
      <span className="font-playfair text-[3.5rem] font-bold text-[rgba(107,63,160,0.12)] absolute top-4 right-6 leading-none">
        {number}
      </span>
      <div
        className={`w-[52px] h-[52px] rounded-[14px] flex items-center justify-center text-2xl mb-5 ${iconBg}`}
      >
        {icon}
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-sm text-[var(--text-muted)] leading-[1.65]">{desc}</p>
    </div>
  );
}
