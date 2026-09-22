import portrait from "@/assets/faith-portrait.png.asset.json";
import type { Blocks, SitePayload } from "./site-types";

/**
 * Editable placeholder copy. Everything here can be replaced from /admin.
 * No claims about experience, clients or results are made anywhere.
 */
export const DEFAULT_BLOCKS: Blocks = {
  settings: {
    displayName: "Faith",
    siteTitle: "Faith — Virtual Assistant",
    tagline: "Virtual Assistant supporting busy founders and small teams.",
    footerText:
      "Virtual assistant services for founders, small teams and busy professionals.",
    seoTitle: "Faith — Virtual Assistant Portfolio",
    seoDescription:
      "Freelance virtual assistant offering administrative support, inbox and calendar management, research and customer support.",
    profileImage: portrait.url,
  },
  hero: {
    eyebrow: "VIRTUAL ASSISTANT",
    title: "Reliable support behind your business",
    description:
      "I help founders and small teams stay organised, so the everyday admin never gets in the way of the work that matters. This introduction is placeholder copy and can be edited at any time.",
    primaryCta: "Let's Work Together",
    secondaryCta: "Explore My Services",
    image: portrait.url,
  },
  about: {
    eyebrow: "ABOUT",
    title: "Organised support, delivered with care",
    body: "This is placeholder biography copy. Replace it with a short introduction in Faith's own words — who she enjoys working with, the kind of tasks she takes on, and what a working week with her looks like.",
    philosophyTitle: "How I work",
    philosophy:
      "Clear communication, agreed priorities and steady follow-through. You'll always know what has been done and what's next.",
    ctaLabel: "Start a conversation",
    image: portrait.url,
  },
  services_intro: {
    eyebrow: "SERVICES",
    title: "How I can support you",
    subtitle:
      "A flexible set of services shaped around what your business actually needs.",
  },
  skills_intro: {
    eyebrow: "SKILLS",
    title: "Capabilities at a glance",
    subtitle: "The tools and strengths I bring to day-to-day support work.",
  },
  portfolio_intro: {
    eyebrow: "PORTFOLIO",
    title: "Selected work",
    subtitle: "A closer look at the kind of projects I take on.",
  },
  why: {
    eyebrow: "WHY WORK WITH ME",
    title: "Support you can plan around",
    subtitle: "A simple, dependable way of working.",
    items: [
      { title: "Organised support", description: "Tasks tracked, prioritised and never left hanging." },
      { title: "Clear communication", description: "Regular updates in plain language, at a rhythm that suits you." },
      { title: "Attention to detail", description: "Careful, accurate work — checked before it reaches you." },
      { title: "Flexible hours", description: "Support shaped around your workload rather than a fixed template." },
    ],
  },
  process_intro: {
    eyebrow: "WORK PROCESS",
    title: "Simple from the first message",
    subtitle: "Four steps from first conversation to delivered work.",
  },
  testimonials_intro: {
    eyebrow: "TESTIMONIALS",
    title: "Kind words from clients",
    subtitle: "",
  },
  contact: {
    eyebrow: "CONTACT",
    title: "Let's make your workload lighter.",
    description:
      "Tell me what's taking up your time and I'll come back with how I can help. Placeholder copy — edit any time.",
    email: "",
    buttonLabel: "Send a message",
  },
};

export const DEFAULT_PROCESS = [
  { title: "Discuss", description: "Understand your needs, tasks and priorities." },
  { title: "Plan", description: "Agree scope, expectations and how we'll work together." },
  { title: "Work", description: "Handle the agreed tasks and keep you updated." },
  { title: "Deliver", description: "Complete and hand over the work as agreed." },
];

export function withDefaults(payload: SitePayload): SitePayload {
  const blocks: Blocks = {};
  for (const key of Object.keys(DEFAULT_BLOCKS)) {
    blocks[key] = { ...DEFAULT_BLOCKS[key], ...(payload.blocks?.[key] ?? {}) };
  }
  for (const [key, value] of Object.entries(payload.blocks ?? {})) {
    if (!blocks[key]) blocks[key] = value;
  }
  return { ...payload, blocks };
}

export const EMPTY_PAYLOAD: SitePayload = {
  blocks: {},
  services: [],
  skillCategories: [],
  skills: [],
  projects: [],
  testimonials: [],
  processSteps: [],
  links: [],
};
