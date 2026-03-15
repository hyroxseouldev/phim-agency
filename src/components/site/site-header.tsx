import Link from "next/link";
import Image from "next/image";
import { SiteNavMenu, type SiteNavItem } from "@/components/site/site-nav-menu";

const navigationItems: SiteNavItem[] = [
  { href: "/#projects", label: "project" },
  { href: "/#work", label: "work" },
  { href: "/#projects", label: "photograph" },
  { href: "/#features", label: "about" },
  { href: "/#contact", label: "contact" },
];

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 w-full border-b border-black/5 bg-white/82 backdrop-blur-[18px]">
      <div className="flex w-full items-center justify-between gap-4 px-4 py-3 sm:px-6 md:px-8">
        <Link
          href="/"
          aria-label="PHIM 홈으로 이동"
          className="inline-flex items-center"
        >
          <Image src="/phim-logo.png" alt="PHIM 로고" width={90} height={34} priority />
        </Link>

        <SiteNavMenu items={navigationItems} ariaLabel="섹션 이동" />
      </div>
    </header>
  );
}
