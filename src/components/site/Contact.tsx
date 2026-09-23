import { ArrowUpRight, Mail } from "lucide-react";
import { Reveal } from "./Reveal";
import { str, type Block, type PlatformLink } from "@/lib/site-types";

export function Contact({ block, links }: { block?: Block; links: PlatformLink[] }) {
  const email = str(block, "email");
  const platforms = links.filter((link) => link.kind !== "social");
  const socials = links.filter((link) => link.kind === "social");

  return (
    <section id="contact" className="py-20 md:py-28">
      <div className="shell">
        <Reveal className="rounded-[2rem] border border-border p-8 sm:p-12 md:p-16">
          <p className="eyebrow">{str(block, "eyebrow", "CONTACT")}</p>
          <h2 className="mt-4 max-w-2xl text-3xl leading-[1.08] font-semibold sm:text-4xl md:text-5xl">
            {str(block, "title")}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
            {str(block, "description")}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            {email ? (
              <a
                href={`mailto:${email}`}
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition-transform duration-300 hover:-translate-y-0.5"
              >
                <Mail className="h-4 w-4" aria-hidden />
                {str(block, "buttonLabel", "Send a message")}
              </a>
            ) : null}
            {platforms.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noreferrer noopener"
                className="group inline-flex items-center gap-2 rounded-full border border-border px-6 py-3.5 text-sm font-medium transition-colors duration-300 hover:border-foreground"
              >
                {link.name}
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            ))}
          </div>

          {email ? (
            <p className="mt-6 text-sm text-muted-foreground">
              Or email directly:{" "}
              <a href={`mailto:${email}`} className="underline underline-offset-4">
                {email}
              </a>
            </p>
          ) : null}

          {socials.length ? (
            <ul className="mt-8 flex flex-wrap gap-4 border-t border-border pt-6">
              {socials.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}
