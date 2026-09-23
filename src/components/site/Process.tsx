import { Reveal, SectionHeading } from "./Reveal";
import { str, type Block, type ProcessStep } from "@/lib/site-types";

export function Process({ block, steps }: { block?: Block; steps: ProcessStep[] }) {
  if (steps.length === 0) return null;

  return (
    <section className="bg-cream py-20 md:py-28">
      <div className="shell">
        <SectionHeading
          eyebrow={str(block, "eyebrow", "WORK PROCESS")}
          title={str(block, "title")}
          subtitle={str(block, "subtitle")}
        />
        <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <Reveal
              as="li"
              key={step.id}
              delay={index * 70}
              className="lift relative rounded-2xl border border-border bg-background p-7"
            >
              <span className="font-display text-4xl font-semibold text-border transition-colors duration-300">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
              {step.description ? (
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              ) : null}
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
