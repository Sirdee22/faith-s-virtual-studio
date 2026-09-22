import { ArrowUpRight } from "lucide-react";
import { Reveal } from "./Reveal";
import { mediaUrl, str, type Block } from "@/lib/site-types";

export function About({ block }: { block?: Block }) {
  const image = mediaUrl(str(block, "image"));

  return (
    <section id="about" className="bg-cream py-20 md:py-28">
      <div className="shell grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <Reveal>
          <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-[2rem] bg-background">
            {image ? (
              <img
                src={image}
                alt="Portrait"
                loading="lazy"
                className="aspect-square w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            ) : (
              <div className="grid aspect-square place-items-center text-sm text-muted-foreground">
                Add a photo
              </div>
            )}
          </div>
        </Reveal>

        <div>
          <Reveal>
            <p className="eyebrow">{str(block, "eyebrow", "ABOUT")}</p>
            <h2 className="mt-3 text-3xl leading-[1.1] font-semibold sm:text-4xl md:text-[2.75rem]">
              {str(block, "title")}
            </h2>
          </Reveal>
          <Reveal delay={90}>
            <p className="mt-6 text-base leading-relaxed whitespace-pre-line text-muted-foreground">
              {str(block, "body")}
            </p>
          </Reveal>
          {str(block, "philosophy") ? (
            <Reveal delay={150}>
              <div className="mt-8 border-l-2 border-foreground pl-5">
                <h3 className="text-sm font-semibold">{str(block, "philosophyTitle", "How I work")}</h3>
                <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                  {str(block, "philosophy")}
                </p>
              </div>
            </Reveal>
          ) : null}
          {str(block, "ctaLabel") ? (
            <Reveal delay={210}>
              <a
                href="#contact"
                className="group mt-8 inline-flex items-center gap-2 text-sm font-medium"
              >
                {str(block, "ctaLabel")}
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </Reveal>
          ) : null}
        </div>
      </div>
    </section>
  );
}
