import { Reveal, SectionHeading } from "./Reveal";
import { list, str, type Block } from "@/lib/site-types";

type Item = { title?: string; description?: string };

export function WhyMe({ block }: { block?: Block }) {
  const items = list<Item>(block, "items");
  if (items.length === 0) return null;

  return (
    <section className="py-20 md:py-28">
      <div className="shell">
        <SectionHeading
          eyebrow={str(block, "eyebrow", "WHY WORK WITH ME")}
          title={str(block, "title")}
          subtitle={str(block, "subtitle")}
        />
        <ul className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
          {items.map((item, index) => (
            <Reveal
              as="li"
              key={`${item.title}-${index}`}
              delay={index * 60}
              className="bg-background p-8 transition-colors duration-300 hover:bg-cream"
            >
              <span className="eyebrow">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
