import {
  Code,
  Settings,
  TrendingUp,
  Server,
  Globe,
  Zap,
  Shield,
  Clock,
  ArrowRight,
  LucideIcon
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  code: Code,
  settings: Settings,
  trending: TrendingUp,
  server: Server,
  globe: Globe,
  zap: Zap,
  shield: Shield,
  clock: Clock
};

interface ServiceCardProps {
  title: string;
  description: string;
  iconName: string;
}

export function ServiceCard({ title, description, iconName }: ServiceCardProps) {
  const Icon = ICON_MAP[iconName] || Settings;

  return (
    <div className="group h-full relative overflow-hidden transform-none">
      <div className="h-full flex flex-col bg-card border border-border rounded-lg p-6 transition-[opacity,background-color,border-color] duration-200 shadow-sm group-hover:border-[#C0F0FB]/25">
        <div className="w-11 h-11 rounded-md bg-secondary flex items-center justify-center mb-5 group-hover:bg-[#C0F0FB]/10 transition-colors">
          <Icon className="text-[#C0F0FB] w-[22px] h-[22px]" aria-hidden="true" />
        </div>
        <h3 className="text-[17px] font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground text-[14px] leading-[1.6] mb-5 flex-1">
          {description}
        </p>
        <div className="flex items-center gap-1.5 text-[#C0F0FB] text-[14px] font-semibold group-hover:gap-2.5 transition-all">
          Learn more <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
