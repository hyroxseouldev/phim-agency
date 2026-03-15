import { SiteNavMenu, type SiteNavItem } from "@/components/site/site-nav-menu";

const footerNavItems: SiteNavItem[] = [
  {
    href: "https://instagram.com/phim.agency",
    label: "instagram",
    external: true,
  },
  {
    href: "mailto:hello@phim.agency",
    label: "email",
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-[#10232b]/8 px-0 py-8 sm:py-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-[28rem]">
          <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.18em] text-[#143a46]">Footer</p>
          <h2 className="mt-4 font-serif text-[clamp(1.8rem,4vw,3.25rem)] leading-[0.98] tracking-[-0.04em] text-[#10232b]">
            함께 일하고 싶다면,
            <br className="max-sm:hidden" /> PHIM에게 편하게 연락해주세요.
          </h2>
        </div>

        <SiteNavMenu
          items={footerNavItems}
          ariaLabel="푸터 연락 메뉴"
          className="justify-start gap-5 text-[0.78rem] tracking-[0.14em] sm:gap-6 sm:text-[0.82rem] lg:justify-end"
          itemClassName="text-[#10232b]"
        />
      </div>
    </footer>
  );
}
