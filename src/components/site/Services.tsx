import { ArrowUpRight, Check } from "lucide-react";
import { Reveal, SectionHeading } from "./Reveal";
import { ContentIcon } from "./icons";
import { mediaUrl, str, type Block, type Service } from "@/lib/site-types";

export function Services({ block, services }: { block?: Block; services: Service[] }) {
  return (
    <section id="services" className="py-20 md:py-28">
      <div className="shell">
        <SectionHeading
          eyebrow={str(block, "eyebrow", "SERVICES")}
          title={str(block, "title")}
          subtitle={str(block, "subtitle")}
        />

        {services.length === 0 ? (
          <Reveal className="mt-12 rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            Services will appear here once they are added in the dashboard.
          </Reveal>
        ) : (
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => {
              const image = mediaUrl(service.image_url);
              return (
                <Reveal as="li" key={service.id} delay={index * 60} className="h-full">
                  <article className="lift group flex h-full flex-col rounded-2xl border border-border bg-background p-7">
                    {image ? (
                      <div className="mb-6 overflow-hidden rounded-xl">
                        <img
                          src={image}
                          alt=""
                          loading="lazy"
                          className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <span className="mb-6 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-cream transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                        <ContentIcon name={service.icon} className="h-5 w-5" />
                      </span>
                    )}

                    <h3 className="text-lg font-semibold">{service.title}</h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                      {service.description}
                    </p>

                    {service.items?.length ? (
                      <ul className="mt-5 space-y-2">
                        {service.items.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-foreground" aria-hidden />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    {service.cta_label ? (
                      <a
                        href={service.cta_url || "#contact"}
                        className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium"
                      >
                        {service.cta_label}
                        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </a>
                    ) : null}
                  </article>
                </Reveal>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
