import { Quote } from "lucide-react";
import { Reveal, SectionHeading } from "./Reveal";
import { mediaUrl, str, type Block, type Testimonial } from "@/lib/site-types";

export function Testimonials({ block, items }: { block?: Block; items: Testimonial[] }) {
  if (items.length === 0) return null;

  return (
    <section className="bg-cream py-20 md:py-28">
      <div className="shell">
        <SectionHeading
          eyebrow={str(block, "eyebrow", "TESTIMONIALS")}
          title={str(block, "title")}
          subtitle={str(block, "subtitle")}
        />
        <ul className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => {
            const image = mediaUrl(item.image_url);
            return (
              <Reveal
                as="li"
                key={item.id}
                delay={index * 60}
                className="lift flex h-full flex-col rounded-2xl border border-border bg-background p-7"
              >
                <Quote className="h-5 w-5 text-border" aria-hidden />
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed whitespace-pre-line">
                  {item.quote}
                </blockquote>
                <div className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                  {image ? (
                    <img
                      src={image}
                      alt=""
                      loading="lazy"
                      className="h-10 w-10 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-cream text-sm font-medium">
                      {item.client_name.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.client_name}</p>
                    {item.client_role ? (
                      <p className="truncate text-xs text-muted-foreground">{item.client_role}</p>
                    ) : null}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
