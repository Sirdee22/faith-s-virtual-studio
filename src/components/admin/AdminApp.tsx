import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Briefcase,
  ExternalLink,
  Home,
  LayoutGrid,
  ListOrdered,
  Loader2,
  LogOut,
  Mail,
  MessageSquareQuote,
  Settings,
  Sparkles,
  User,
  Wrench,
} from "lucide-react";
import { adminGetContent, adminLogout, adminStatus } from "@/lib/admin.functions";
import type { Json } from "@/lib/site-types";
import { cn } from "@/lib/utils";
import { BlockEditor, BlockListEditor, CollectionManager } from "./editors";
import type { FieldDef } from "./fields";

type Section =
  | "overview"
  | "home"
  | "about"
  | "services"
  | "skills"
  | "portfolio"
  | "testimonials"
  | "process"
  | "contact"
  | "settings";

const NAV: { id: Section; label: string; icon: typeof Home }[] = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "home", label: "Home", icon: Home },
  { id: "about", label: "About", icon: User },
  { id: "services", label: "Services", icon: Briefcase },
  { id: "skills", label: "Skills", icon: Sparkles },
  { id: "portfolio", label: "Portfolio", icon: Wrench },
  { id: "testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { id: "process", label: "Work Process", icon: ListOrdered },
  { id: "contact", label: "Contact", icon: Mail },
  { id: "settings", label: "Settings", icon: Settings },
];

const INTRO: FieldDef[] = [
  { name: "eyebrow", label: "Small label above the heading", type: "text" },
  { name: "title", label: "Heading", type: "text" },
  { name: "subtitle", label: "Short introduction", type: "textarea" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRows = any[];

export function AdminApp() {
  const [section, setSection] = useState<Section>("overview");
  const [openNew, setOpenNew] = useState<Section | null>(null);
  const getContent = useServerFn(adminGetContent);
  const getStatus = useServerFn(adminStatus);
  const logout = useServerFn(adminLogout);
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-content"],
    queryFn: () => getContent(),
  });
  const { data: status } = useQuery({
    queryKey: ["admin-status"],
    queryFn: () => getStatus(),
  });

  const go = (s: Section, create = false) => {
    setSection(s);
    setOpenNew(create ? s : null);
    window.scrollTo({ top: 0 });
  };

  const handled = () => setOpenNew(null);

  const signOut = async () => {
    await logout();
    qc.clear();
    window.location.href = "/admin";
  };

  return (
    <div className="min-h-screen bg-cream/40">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div>
            <p className="font-display font-semibold">Website editor</p>
            {status?.email ? (
              <p className="text-xs text-muted-foreground">Signed in as {status.email}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm hover:border-foreground sm:inline-flex"
            >
              View website <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <button
              type="button"
              onClick={signOut}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
        <nav aria-label="Editor sections" className="overflow-x-auto border-t border-border lg:hidden">
          <ul className="flex gap-1 px-3 py-2">
            {NAV.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => go(item.id)}
                  aria-current={section === item.id ? "page" : undefined}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-sm whitespace-nowrap",
                    section === item.id ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                  )}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8 sm:px-6">
        <nav aria-label="Editor sections" className="hidden w-56 shrink-0 lg:block">
          <ul className="sticky top-24 space-y-1">
            {NAV.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => go(item.id)}
                  aria-current={section === item.id ? "page" : undefined}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-colors",
                    section === item.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-background hover:text-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" /> {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <main className="min-w-0 flex-1 space-y-6">
          {isLoading ? (
            <div className="grid place-items-center py-24">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error || !data ? (
            <p className="text-sm text-muted-foreground">
              Your content couldn't be loaded. Please refresh, or log in again.
            </p>
          ) : (
            <>
              {section === "overview" ? (
                <Overview
                  counts={{
                    services: data.services.filter((r) => r.published).length,
                    skills: data.skills.filter((r) => r.published).length,
                    projects: data.projects.filter((r) => r.published).length,
                    testimonials: data.testimonials.filter((r) => r.published).length,
                  }}
                  go={go}
                />
              ) : null}

              {section === "home" ? (
                <BlockEditor
                  blockKey="hero"
                  block={data.blocks["hero"]}
                  title="Home — top of the page"
                  description="The first thing visitors see."
                  fields={[
                    { name: "eyebrow", label: "Small label (e.g. VIRTUAL ASSISTANT)", type: "text" },
                    { name: "title", label: "Main headline", type: "text" },
                    { name: "description", label: "Short introduction", type: "textarea" },
                    { name: "primaryCta", label: "Main button text", type: "text" },
                    { name: "secondaryCta", label: "Second button text", type: "text" },
                    { name: "image", label: "Photo", type: "image" },
                  ]}
                />
              ) : null}

              {section === "about" ? (
                <>
                  <BlockEditor
                    blockKey="about"
                    block={data.blocks["about"]}
                    title="About me"
                    fields={[
                      { name: "eyebrow", label: "Small label", type: "text" },
                      { name: "title", label: "Heading", type: "text" },
                      { name: "body", label: "Biography", type: "textarea" },
                      { name: "philosophyTitle", label: "Working philosophy — heading", type: "text" },
                      { name: "philosophy", label: "Working philosophy — text", type: "textarea" },
                      { name: "ctaLabel", label: "Button text", type: "text" },
                      { name: "image", label: "Profile photo", type: "image" },
                    ]}
                  />
                  <BlockEditor
                    blockKey="why"
                    block={data.blocks["why"]}
                    title="Why work with me — heading"
                    fields={INTRO}
                  />
                  <BlockListEditor
                    blockKey="why"
                    block={data.blocks["why"]}
                    listKey="items"
                    title="Why work with me — points"
                    description="Short reasons clients might choose you."
                  />
                </>
              ) : null}

              {section === "services" ? (
                <>
                  <CollectionManager
                    table="services"
                    rows={data.services as AnyRows}
                    title="Services"
                    singular="service"
                    primaryField="title"
                    imageField="image_url"
                    openNew={openNew === "services"}
                    onOpenNewHandled={handled}
                    fields={[
                      { name: "title", label: "Service name", type: "text" },
                      { name: "description", label: "Short description", type: "textarea" },
                      { name: "items", label: "Tasks included (one per line, optional)", type: "lines" },
                      { name: "icon", label: "Icon (optional)", type: "icon" },
                      { name: "image_url", label: "Image (optional — replaces the icon)", type: "image" },
                      { name: "cta_label", label: "Button text (optional)", type: "text" },
                      { name: "cta_url", label: "Button link (optional)", type: "text", placeholder: "#contact" },
                    ]}
                  />
                  <BlockEditor blockKey="services_intro" block={data.blocks["services_intro"]} title="Services — section heading" fields={INTRO} />
                </>
              ) : null}

              {section === "skills" ? (
                <>
                  <CollectionManager
                    table="skills"
                    rows={data.skills as AnyRows}
                    title="Skills"
                    singular="skill"
                    primaryField="name"
                    openNew={openNew === "skills"}
                    onOpenNewHandled={handled}
                    secondary={(r) => data.skillCategories.find((c) => c.id === r["category_id"])?.name}
                    fields={[
                      { name: "name", label: "Skill name", type: "text" },
                      { name: "description", label: "Short description (optional)", type: "textarea" },
                      {
                        name: "category_id",
                        label: "Category (optional)",
                        type: "select",
                        options: [
                          { value: "", label: "No category" },
                          ...data.skillCategories.map((c) => ({ value: c.id, label: c.name })),
                        ],
                      },
                      {
                        name: "proficiency",
                        label: "Proficiency 0–100 (optional)",
                        type: "number",
                        help: "Leave empty to show no level on the website.",
                      },
                      { name: "icon", label: "Icon (optional)", type: "icon" },
                    ]}
                  />
                  <CollectionManager
                    table="skill_categories"
                    rows={data.skillCategories as AnyRows}
                    title="Skill categories"
                    description="Group your skills (e.g. Tools, Communication)."
                    singular="category"
                    primaryField="name"
                    fields={[{ name: "name", label: "Category name", type: "text" }]}
                  />
                  <BlockEditor blockKey="skills_intro" block={data.blocks["skills_intro"]} title="Skills — section heading" fields={INTRO} />
                </>
              ) : null}

              {section === "portfolio" ? (
                <>
                  <CollectionManager
                    table="projects"
                    rows={data.projects as AnyRows}
                    title="Portfolio projects"
                    singular="project"
                    primaryField="title"
                    imageField="image_url"
                    openNew={openNew === "portfolio"}
                    onOpenNewHandled={handled}
                    secondary={(r) => (r["category"] as string) || null}
                    fields={[
                      { name: "title", label: "Project title", type: "text" },
                      { name: "category", label: "Category", type: "text", placeholder: "e.g. Admin support" },
                      { name: "summary", label: "Short description", type: "textarea" },
                      { name: "body", label: "Full description", type: "textarea" },
                      { name: "image_url", label: "Main image", type: "image" },
                      { name: "gallery", label: "More images", type: "gallery" },
                      { name: "tools", label: "Tools used (one per line)", type: "lines" },
                      { name: "link_url", label: "Project link (optional)", type: "text", placeholder: "https://" },
                    ]}
                  />
                  <BlockEditor blockKey="portfolio_intro" block={data.blocks["portfolio_intro"]} title="Portfolio — section heading" fields={INTRO} />
                </>
              ) : null}

              {section === "testimonials" ? (
                <>
                  <CollectionManager
                    table="testimonials"
                    rows={data.testimonials as AnyRows}
                    title="Testimonials"
                    description="Only add genuine words from real clients. The section is hidden until at least one is visible."
                    singular="testimonial"
                    primaryField="client_name"
                    imageField="image_url"
                    openNew={openNew === "testimonials"}
                    onOpenNewHandled={handled}
                    fields={[
                      { name: "client_name", label: "Client name", type: "text" },
                      { name: "client_role", label: "Role or business", type: "text" },
                      { name: "quote", label: "What they said", type: "textarea" },
                      { name: "image_url", label: "Photo (optional)", type: "image" },
                    ]}
                  />
                  <BlockEditor blockKey="testimonials_intro" block={data.blocks["testimonials_intro"]} title="Testimonials — section heading" fields={INTRO} />
                </>
              ) : null}

              {section === "process" ? (
                <>
                  <CollectionManager
                    table="process_steps"
                    rows={data.processSteps as AnyRows}
                    title="Work process steps"
                    singular="step"
                    primaryField="title"
                    fields={[
                      { name: "title", label: "Step name", type: "text" },
                      { name: "description", label: "Short description", type: "textarea" },
                    ]}
                  />
                  <BlockEditor blockKey="process_intro" block={data.blocks["process_intro"]} title="Work process — section heading" fields={INTRO} />
                </>
              ) : null}

              {section === "contact" ? (
                <>
                  <BlockEditor
                    blockKey="contact"
                    block={data.blocks["contact"]}
                    title="Contact section"
                    fields={[
                      { name: "eyebrow", label: "Small label", type: "text" },
                      { name: "title", label: "Headline", type: "text" },
                      { name: "description", label: "Short invitation", type: "textarea" },
                      { name: "email", label: "Email address", type: "text", placeholder: "you@example.com", help: "The contact button appears once this is filled in." },
                      { name: "buttonLabel", label: "Contact button text", type: "text" },
                    ]}
                  />
                  <CollectionManager
                    table="platform_links"
                    rows={data.links as AnyRows}
                    title="Freelance & social links"
                    description="Fiverr, Upwork, Freelancer.com, LinkedIn and so on."
                    singular="link"
                    primaryField="name"
                    defaults={{ kind: "platform" } as Record<string, Json>}
                    secondary={(r) => (r["kind"] === "social" ? "Social" : "Freelance platform")}
                    fields={[
                      { name: "name", label: "Name", type: "text", placeholder: "e.g. Upwork" },
                      { name: "url", label: "Link", type: "text", placeholder: "https://" },
                      {
                        name: "kind",
                        label: "Type",
                        type: "select",
                        options: [
                          { value: "platform", label: "Freelance platform" },
                          { value: "social", label: "Social media" },
                        ],
                      },
                    ]}
                  />
                </>
              ) : null}

              {section === "settings" ? (
                <BlockEditor
                  blockKey="settings"
                  block={data.blocks["settings"]}
                  title="Settings"
                  fields={[
                    { name: "displayName", label: "Your name (shown in the menu and footer)", type: "text" },
                    { name: "footerText", label: "Footer description", type: "textarea" },
                    { name: "seoTitle", label: "Website title (browser tab & Google)", type: "text" },
                    { name: "seoDescription", label: "Website description (Google & link previews)", type: "textarea" },
                    { name: "profileImage", label: "Profile image", type: "image" },
                  ]}
                />
              ) : null}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function Overview({
  counts,
  go,
}: {
  counts: { services: number; skills: number; projects: number; testimonials: number };
  go: (s: Section, create?: boolean) => void;
}) {
  const stats = [
    { label: "Services", value: counts.services, s: "services" as const },
    { label: "Skills", value: counts.skills, s: "skills" as const },
    { label: "Projects", value: counts.projects, s: "portfolio" as const },
    { label: "Testimonials", value: counts.testimonials, s: "testimonials" as const },
  ];
  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Everything on your website can be changed from here.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => go(s.s)}
            className="lift rounded-2xl border border-border bg-background p-5 text-left"
          >
            <p className="text-3xl font-semibold">{s.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.label} visible</p>
          </button>
        ))}
      </div>
      <section className="rounded-2xl border border-border bg-background p-6">
        <h2 className="text-lg font-semibold">Quick actions</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { label: "Add Service", s: "services" as const },
            { label: "Add Skill", s: "skills" as const },
            { label: "Add Project", s: "portfolio" as const },
            { label: "Add Testimonial", s: "testimonials" as const },
          ].map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={() => go(a.s, true)}
              className="rounded-full border border-border px-5 py-2.5 text-sm hover:border-foreground"
            >
              + {a.label}
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
