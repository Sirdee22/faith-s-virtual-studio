import {
  CalendarDays,
  ClipboardList,
  Mail,
  Search,
  MessageCircle,
  FileText,
  Sparkles,
  Share2,
  Database,
  Headphones,
  Clock,
  CheckCircle2,
  Users,
  Layers,
  PenLine,
  Briefcase,
  type LucideIcon,
} from "lucide-react";

export const ICONS: Record<string, LucideIcon> = {
  calendar: CalendarDays,
  clipboard: ClipboardList,
  mail: Mail,
  search: Search,
  message: MessageCircle,
  document: FileText,
  sparkles: Sparkles,
  social: Share2,
  data: Database,
  support: Headphones,
  clock: Clock,
  check: CheckCircle2,
  users: Users,
  layers: Layers,
  write: PenLine,
  briefcase: Briefcase,
};

export const ICON_NAMES = Object.keys(ICONS);

export function ContentIcon({ name, className }: { name?: string | null; className?: string }) {
  const Icon = (name && ICONS[name]) || Sparkles;
  return <Icon className={className} aria-hidden />;
}
