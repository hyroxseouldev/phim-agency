import { cn } from "@/lib/utils";

export type SiteNavItem = {
  href: string;
  label: string;
  external?: boolean;
};

type SiteNavMenuProps = {
  items: SiteNavItem[];
  ariaLabel: string;
  className?: string;
  itemClassName?: string;
};

const baseNavClassName = "flex items-center justify-end gap-2.5 text-[10px] font-medium tracking-[0.08em] text-[#10232b] sm:gap-3 sm:text-[11px] md:gap-5 lg:gap-6";
const baseItemClassName = "group relative inline-flex items-center py-0.5 lowercase text-[#10232b]/72 transition-colors duration-300 hover:text-[#10232b]";

export function SiteNavMenu({ items, ariaLabel, className, itemClassName }: SiteNavMenuProps) {
  return (
    <nav className={cn(baseNavClassName, className)} aria-label={ariaLabel}>
      {items.map((item) => (
        <a
          key={`${item.label}-${item.href}`}
          href={item.href}
          className={cn(baseItemClassName, itemClassName)}
          target={item.external ? "_blank" : undefined}
          rel={item.external ? "noreferrer" : undefined}
        >
          <span>{item.label}</span>
          <span
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-current transition-transform duration-300 ease-out group-hover:scale-x-100"
          />
        </a>
      ))}
    </nav>
  );
}
