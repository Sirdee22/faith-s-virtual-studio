import { ArrowRight } from "lucide-react";
import { Reveal } from "./Reveal";
import { mediaUrl, str, type Block } from "@/lib/site-types";

export function Hero({ block, name }: { block?: Block; name: string }) {
  const image = mediaUrl(str(block, "image"));

  return (
    <section id="home" className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-24">
      <div
        aria-hidden
        className="pointer-events-none absolute top-24 -right-40 h-[32rem] w-[32rem] rounded-full bg-cream md:-right-24"
      />
      <div className="shell relative grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <Reveal>
            <p className="eyebrow">{str(block, "eyebrow", "VIRTUAL ASSISTANT")}</p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-5 text-4xl leading-[1.04] font-semibold sm:text-5xl md:text-6xl lg:text-[4.25rem]">
              {str(block, "title")}
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {str(block, "description")}
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a
                href="#contact"
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition-transform duration-300 hover:-translate-y-0.5"
              >
                {str(block, "primaryCta", "Let's Work Together")}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <a
                href="#services"
                className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3.5 text-sm font-medium transition-colors duration-300 hover:border-foreground"
              >
                {str(block, "secondaryCta", "Explore My Services")}
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal delay={160} className="relative">
          <div className="relative mx-auto w-full max-w-md">
            <div
              aria-hidden
              className="absolute -top-4 -left-4 h-full w-full rounded-[2rem] border border-border"
            />
            <div className="relative overflow-hidden rounded-[2rem] bg-cream">
              {image ? (
                <img
                  src={image}
                  alt={`${name}, virtual assistant`}
                  className="aspect-[4/5] w-full object-cover transition-transform duration-700 hover:scale-[1.04]"
                  loading="eager"
                />
              ) : (
                <div className="grid aspect-[4/5] w-full place-items-center text-sm text-muted-foreground">
                  Add a profile photo in the dashboard
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
