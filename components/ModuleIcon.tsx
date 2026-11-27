import { Boxes, Bug, CodeXml, Crosshair, GraduationCap, Layers, Rocket, Server, Workflow, type LucideIcon } from "lucide-react";

const icons: Record<string, LucideIcon> = {
  foundations: Layers,
  languages: CodeXml,
  infrastructure: Server,
  appsec: Bug,
  cicd: Workflow,
  iac: Boxes,
  projects: Rocket,
  career: GraduationCap,
  offensive: Crosshair,
};

export function ModuleIcon({ name, className }: { name: string; className?: string }) {
  const Icon = icons[name] ?? Layers;
  return <Icon className={className} aria-hidden="true" />;
}
