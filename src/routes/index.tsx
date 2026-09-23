import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { siteContentQuery } from "@/lib/content.functions";
import { str } from "@/lib/site-types";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { About } from "@/components/site/About";
import { Services } from "@/components/site/Services";
import { Skills } from "@/components/site/Skills";
import { Portfolio } from "@/components/site/Portfolio";
import { WhyMe } from "@/components/site/WhyMe";
import { Process } from "@/components/site/Process";
import { Testimonials } from "@/components/site/Testimonials";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(siteContentQuery),
  head: ({ loaderData }) => {
    const settings = loaderData?.blocks?.["settings"];
    const title = str(settings, "seoTitle", "Faith — Virtual Assistant");
    const description = str(
      settings,
      "seoDescription",
      "Freelance virtual assistant offering organised, reliable support for founders and small teams.",
    );
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  errorComponent: () => (
    <div className="grid min-h-screen place-items-center px-6 text-center">
      <p className="text-sm text-muted-foreground">
        This page didn't load. Please refresh to try again.
      </p>
    </div>
  ),
  component: HomePage,
});

function HomePage() {
  const { data } = useSuspenseQuery(siteContentQuery);
  const { blocks } = data;
  const settings = blocks["settings"];

  return (
    <div className="min-h-screen bg-background">
      <Nav
        name={str(settings, "displayName", "Faith")}
        cta={str(blocks["hero"], "primaryCta", "Let's Work Together")}
      />
      <main>
        <Hero block={blocks["hero"]} name={str(settings, "displayName", "Faith")} />
        <About block={blocks["about"]} />
        <Services block={blocks["services_intro"]} services={data.services} />
        <Skills
          block={blocks["skills_intro"]}
          categories={data.skillCategories}
          skills={data.skills}
        />
        <Portfolio block={blocks["portfolio_intro"]} projects={data.projects} />
        <WhyMe block={blocks["why"]} />
        <Process block={blocks["process_intro"]} steps={data.processSteps} />
        <Testimonials block={blocks["testimonials_intro"]} items={data.testimonials} />
        <Contact block={blocks["contact"]} links={data.links} />
      </main>
      <Footer settings={settings} links={data.links} />
    </div>
  );
}
