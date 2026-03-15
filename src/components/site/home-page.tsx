"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import { ProjectCard } from "@/components/site/project-card";
import type { ProjectSummary } from "@/lib/projects";
import type { WorkItemSummary } from "@/lib/work-items";
import { cn } from "@/lib/utils";

const navigationItems = [
  { href: "#work", label: "워크" },
  { href: "#projects", label: "프로젝트" },
  { href: "#pricing", label: "가격" },
  { href: "#features", label: "강점" },
  { href: "#contact", label: "문의" },
];

const metrics = [
  { value: "42+", label: "브랜드 런칭 및 리브랜딩" },
  { value: "93%", label: "재의뢰 및 장기 파트너십 비율" },
  { value: "4주", label: "MVP 랜딩 평균 제작 기간" },
];

const serviceHighlights = [
  "브랜드 전략과 카피 방향 동시 정리",
  "전환 흐름 중심의 랜딩 구조 설계",
  "디자인-개발 간극을 줄이는 구현 가이드",
];

const pricingPlans = [
  {
    name: "Starter Landing",
    price: "250만원",
    description: "빠르게 검증해야 하는 브랜드와 초기 제품을 위한 최소 구성 패키지",
    features: ["브랜드 방향성 정리", "랜딩 페이지 1종", "반응형 디자인", "기본 카피라이팅 가이드"],
    featured: false,
  },
  {
    name: "Growth Package",
    price: "480만원",
    description: "전환 설계와 콘텐츠 밀도를 함께 잡아야 하는 성장 단계 브랜드용 패키지",
    features: ["전환 중심 랜딩 페이지", "프로젝트 섹션 기획", "콘텐츠 구조 설계", "개발 적용 및 QA"],
    featured: true,
  },
  {
    name: "Signature System",
    price: "협의 후 제안",
    description: "브랜딩, 캠페인, 디자인 시스템까지 연결하는 통합 구축 패키지",
    features: ["브랜드 비주얼 시스템", "다중 페이지 설계", "콘텐츠 제작 협업", "월간 운영 가이드"],
    featured: false,
  },
];

const features = [
  {
    title: "전략부터 화면까지",
    description: "예쁜 시안에서 끝나지 않고, 타깃과 제안 메시지부터 구조화해 실제 전환에 맞는 랜딩을 만듭니다.",
  },
  {
    title: "브랜드 톤을 시각 언어로 번역",
    description: "브랜드가 말하는 방식, 제품의 결, 고객이 느껴야 할 온도를 화면 위에 일관된 리듬으로 담아냅니다.",
  },
  {
    title: "디자인과 개발의 간극 최소화",
    description: "Next.js 기반으로 실제 구현까지 고려한 구조를 설계해 출시 직전의 손실과 수정 비용을 줄입니다.",
  },
  {
    title: "빠른 제작, 높은 완성도",
    description: "짧은 일정에서도 우선순위를 선명하게 정리해 브랜드 첫 공개에 필요한 임팩트를 놓치지 않습니다.",
  },
];

const processSteps = [
  {
    step: "01",
    title: "진단 & 포지셔닝",
    description: "현재 브랜드 상황과 목표 고객을 정리하고, 페이지가 설득해야 할 핵심 메시지를 선명하게 잡습니다.",
  },
  {
    step: "02",
    title: "콘텐츠 구조 설계",
    description: "첫 화면에서 문의까지 자연스럽게 이어지도록 섹션 흐름, 정보 우선순위, CTA 위치를 구조화합니다.",
  },
  {
    step: "03",
    title: "디자인 & 구현",
    description: "브랜드 톤을 살린 시각 시스템을 만들고, 실제 배포 기준에서 흔들리지 않도록 개발 적용까지 연결합니다.",
  },
];

const contactItems = [
  { label: "이메일", value: "hello@phim.agency" },
  { label: "상담 채널", value: "카카오톡 / Zoom 미팅" },
  { label: "응답 시간", value: "영업일 기준 24시간 이내" },
];

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 18,
      mass: 0.8,
    },
  },
};

const containerClass = "mx-auto w-full max-w-7xl px-4 sm:px-6";
const eyebrowClass = "inline-flex items-center gap-2 text-[0.78rem] font-extrabold uppercase tracking-[0.18em] text-[#143a46]";
const sectionTitleClass = "font-serif text-[clamp(2.2rem,4vw,4rem)] leading-[0.98] tracking-[-0.04em] text-[#10232b]";
const sectionCopyClass = "text-sm leading-7 text-[#5f7278] sm:text-base";
const glassCardClass =
  "rounded-[1.9rem] border border-black/8 bg-[rgba(255,255,255,0.82)] shadow-[0_20px_60px_rgba(0,0,0,0.06)] backdrop-blur-[14px]";
const panelCopyClass = "text-sm leading-7 text-[#5f7278] sm:text-base";

function getRevealProps(shouldReduceMotion: boolean) {
  if (shouldReduceMotion) {
    return {
      initial: false,
      whileInView: undefined,
      viewport: undefined,
      transition: { duration: 0 },
    };
  }

  return {
    initial: "hidden" as const,
    whileInView: "visible" as const,
    viewport: { once: true, amount: 0.2 },
  };
}

function getHoverLift(shouldReduceMotion: boolean) {
  return shouldReduceMotion
    ? undefined
    : {
        y: -8,
        scale: 1.01,
        transition: {
          type: "spring" as const,
          stiffness: 260,
          damping: 18,
        },
      };
}

function SectionHeading({ eyebrow, title, body, className }: { eyebrow: string; title: string; body: string; className?: string }) {
  return (
    <div className={cn("max-w-3xl", className)}>
      <span className={eyebrowClass}>{eyebrow}</span>
      <h2 className={cn("mt-4 text-balance", sectionTitleClass)}>{title}</h2>
      <p className={cn("mt-4", sectionCopyClass)}>{body}</p>
    </div>
  );
}

function ActionLink({ href, label, kind = "primary" }: { href: string; label: string; kind?: "primary" | "secondary" }) {
  return (
    <motion.a
      href={href}
      className={cn(
        "inline-flex min-h-13 items-center justify-center rounded-full px-6 text-sm font-bold transition",
        kind === "primary"
          ? "bg-[#143a46] !text-[#fffdf9] hover:!text-[#fffdf9] focus-visible:!text-[#fffdf9] active:!text-[#fffdf9]"
          : "border border-[#10232b]/12 bg-white/50 text-[#10232b] backdrop-blur",
      )}
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
    >
      {label}
    </motion.a>
  );
}

function WorkCard({ item, index, shouldReduceMotion }: { item: WorkItemSummary; index: number; shouldReduceMotion: boolean }) {
  const [hasImageError, setHasImageError] = useState(false);

  return (
    <motion.article
      className="flex items-center gap-4 border-b border-[#10232b]/10 bg-transparent py-5 last:border-b-0 max-sm:items-start"
      variants={cardVariants}
      whileHover={getHoverLift(shouldReduceMotion)}
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-[linear-gradient(135deg,rgba(20,58,70,0.2),rgba(199,143,98,0.24))] max-sm:h-16 max-sm:w-16">
        {item.coverImageUrl && !hasImageError ? (
          <Image
            src={item.coverImageUrl}
            alt={`${item.title} 대표 이미지`}
            fill
            sizes="80px"
            className="object-cover"
            onError={() => setHasImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full flex-col justify-end gap-1 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_28%),linear-gradient(135deg,rgba(8,25,31,0.98),rgba(199,143,98,0.8))] p-3 text-[#f8f4ee]">
            <span className="text-[0.58rem] font-extrabold uppercase tracking-[0.12em] opacity-80">{item.category}</span>
            <strong className="max-w-[7ch] font-serif text-sm leading-[0.95]">{item.title}</strong>
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3 max-sm:flex-col max-sm:items-start">
          <div className="flex items-center gap-3">
            <span className="text-sm font-extrabold tracking-[0.14em] text-[#5f7278]">{String(index + 1).padStart(2, "0")}</span>
            <span className={cn(eyebrowClass, "text-[0.7rem]")}>{item.category}</span>
          </div>
          <h3 className="text-xl leading-tight font-semibold text-[#10232b] sm:text-2xl">{item.title}</h3>
        </div>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-[#5f7278] sm:text-base">{item.summary}</p>
      </div>
    </motion.article>
  );
}

export function HomePage({ workItems, projects }: { workItems: WorkItemSummary[]; projects: ProjectSummary[] }) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll();
  const progressScale = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, shouldReduceMotion ? 0 : -36]);
  const orbLeftY = useTransform(scrollYProgress, [0, 1], [0, shouldReduceMotion ? 0 : -72]);
  const orbRightY = useTransform(scrollYProgress, [0, 1], [0, shouldReduceMotion ? 0 : 96]);
  const revealProps = getRevealProps(shouldReduceMotion);
  const hoverLift = getHoverLift(shouldReduceMotion);
  const [activeSection, setActiveSection] = useState("#top");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const sectionIds = ["top", "work", "projects", "pricing", "features", "contact"];
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          setActiveSection(`#${visible.target.id}`);
        }
      },
      {
        rootMargin: "-28% 0px -48% 0px",
        threshold: [0.2, 0.35, 0.5, 0.7],
      },
    );

    elements.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <main
      id="main-content"
      className="relative overflow-x-hidden bg-[linear-gradient(180deg,#ffffff_0%,#fcfcfc_100%)] text-[#10232b]"
    >
      <motion.div className="fixed inset-x-0 top-0 z-50 h-1 origin-left bg-[linear-gradient(90deg,#c78f62,#143a46)] shadow-[0_6px_18px_rgba(20,58,70,0.16)]" style={{ scaleX: progressScale }} aria-hidden="true" />
      <motion.div className="pointer-events-none absolute left-[-120px] top-24 h-80 w-80 rounded-full bg-black/[0.04] blur-xl" aria-hidden="true" style={{ y: orbLeftY }} />
      <motion.div className="pointer-events-none absolute right-[-120px] top-[420px] h-96 w-96 rounded-full bg-black/[0.05] blur-xl" aria-hidden="true" style={{ y: orbRightY }} />

      <header className="sticky top-0 z-40 border-b border-black/8 bg-white/80 backdrop-blur-[18px] max-md:static">
        <motion.div
          className={cn(containerClass, "flex min-h-[88px] items-center justify-between gap-6 max-md:min-h-[76px]")}
          initial={shouldReduceMotion ? false : { opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.a
            href="#top"
            aria-label="PHIM 홈으로 이동"
            onClick={() => setActiveSection("#top")}
            className="inline-flex items-center"
            whileHover={shouldReduceMotion ? undefined : { y: -2, scale: 1.02 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
          >
            <Image src="/phim-logo.png" alt="PHIM 로고" width={110} height={42} priority />
          </motion.a>

          <LayoutGroup id="desktop-nav">
            <nav className="hidden items-center gap-3 text-[0.95rem] text-[#5f7278] lg:flex" aria-label="섹션 이동">
              {navigationItems.map((item) => {
                const isActive = activeSection === item.href;

                return (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    onClick={() => setActiveSection(item.href)}
                    className={cn(
                      "relative rounded-full px-4 py-2.5 transition",
                      isActive ? "text-[#10232b]" : "hover:bg-white/60 hover:text-[#10232b]",
                    )}
                    whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                    whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                  >
                    {isActive ? <motion.span layoutId="nav-active-pill" className="absolute inset-0 rounded-full border border-[#143a46]/8 bg-[#143a46]/10" aria-hidden="true" /> : null}
                    <span className="relative z-10">{item.label}</span>
                  </motion.a>
                );
              })}
            </nav>
          </LayoutGroup>

          <div className="flex items-center gap-3">
            <motion.button
              type="button"
              className="relative flex size-12 items-center justify-center rounded-full border border-[#10232b]/10 bg-white/60 text-[#10232b] lg:hidden"
              aria-label={isMobileMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
            >
              <motion.span className="absolute left-[13px] top-4 h-0.5 w-5 rounded-full bg-current" animate={isMobileMenuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }} />
              <motion.span className="absolute left-[13px] top-[23px] h-0.5 w-5 rounded-full bg-current" animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }} />
              <motion.span className="absolute left-[13px] top-[30px] h-0.5 w-5 rounded-full bg-current" animate={isMobileMenuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }} />
            </motion.button>

            <motion.a
              href="#contact"
              className="hidden min-h-11 items-center justify-center rounded-full bg-[#143a46] px-5 text-sm font-bold !text-[#fffdf9] hover:!text-[#fffdf9] focus-visible:!text-[#fffdf9] active:!text-[#fffdf9] md:inline-flex"
              onClick={() => setActiveSection("#contact")}
              whileHover={shouldReduceMotion ? undefined : { y: -2, scale: 1.01 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            >
              상담 문의
            </motion.a>
          </div>
        </motion.div>

        <AnimatePresence initial={false}>
          {isMobileMenuOpen ? (
            <motion.div
              id="mobile-navigation"
              className={cn(containerClass, "mb-3 rounded-[1.75rem] border border-black/8 bg-white/95 shadow-[0_24px_60px_rgba(0,0,0,0.08)] backdrop-blur-[20px] lg:hidden")}
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <LayoutGroup id="mobile-nav">
                <nav className="grid gap-2 p-3" aria-label="모바일 섹션 이동">
                  {navigationItems.map((item) => {
                    const isActive = activeSection === item.href;

                    return (
                      <motion.a
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "relative inline-flex min-h-13 items-center justify-center rounded-full font-bold",
                          isActive ? "text-[#10232b]" : "hover:bg-white/60",
                        )}
                        onClick={() => {
                          setActiveSection(item.href);
                          setIsMobileMenuOpen(false);
                        }}
                        whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                      >
                        {isActive ? <motion.span layoutId="mobile-nav-active-pill" className="absolute inset-0 rounded-full bg-white/60" aria-hidden="true" /> : null}
                        <span className="relative z-10">{item.label}</span>
                      </motion.a>
                    );
                  })}
                  <motion.a
                    href="#contact"
                    className="inline-flex min-h-13 items-center justify-center rounded-full bg-[#143a46] font-bold !text-[#fffdf9] hover:!text-[#fffdf9] focus-visible:!text-[#fffdf9] active:!text-[#fffdf9]"
                    onClick={() => {
                      setActiveSection("#contact");
                      setIsMobileMenuOpen(false);
                    }}
                    whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                  >
                    상담 문의
                  </motion.a>
                </nav>
              </LayoutGroup>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>

      <motion.section id="top" className="scroll-mt-28 px-0 pb-10 pt-8 md:pt-18" style={{ y: heroY }}>
        <motion.div className={cn(containerClass, "grid items-stretch gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]")} variants={sectionVariants} {...revealProps}>
          <motion.div variants={cardVariants} className="[content-visibility:auto]">
            <span className={eyebrowClass}>Creative Digital Agency</span>
            <motion.h1
              className="mt-5 max-w-[10ch] font-serif text-[clamp(3.2rem,8vw,6.2rem)] leading-[0.95] tracking-[-0.05em] text-balance text-[#10232b] max-md:max-w-none"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              브랜드가 더 선명하게
              <br />
              팔리도록 디자인합니다.
            </motion.h1>
            <motion.p variants={cardVariants} className="mt-5 max-w-2xl text-sm leading-8 text-[#5f7278] sm:text-base">
              PHIM은 브랜드 전략, 랜딩 페이지, 캠페인 비주얼을 하나의 흐름으로 연결해 첫 인상부터 문의 전환까지 설계하는 디자인 에이전시입니다.
            </motion.p>

            <motion.ul className="mt-8 grid gap-3" aria-label="핵심 제공 가치" variants={sectionVariants}>
              {serviceHighlights.map((item) => (
                <motion.li key={item} variants={cardVariants} className="flex items-center gap-3 font-semibold text-[#10232b]">
                  <span className="size-2 rounded-full bg-[linear-gradient(180deg,#c78f62,#143a46)] shadow-[0_0_0_6px_rgba(199,143,98,0.12)]" />
                  {item}
                </motion.li>
              ))}
            </motion.ul>

            <motion.div className="mt-8 flex flex-wrap gap-3" variants={cardVariants}>
              <ActionLink href="#projects" label="프로젝트 보기" />
              <ActionLink href="#pricing" label="패키지 확인" kind="secondary" />
            </motion.div>

            <motion.div className="mt-12 grid gap-4 md:grid-cols-3" aria-label="주요 성과 지표" variants={sectionVariants}>
              {metrics.map((item) => (
                <motion.article key={item.label} className={cn(glassCardClass, "p-6 [content-visibility:auto]")} variants={cardVariants} whileHover={hoverLift}>
                  <strong className="block text-[2rem] font-semibold">{item.value}</strong>
                  <span className="mt-2 block text-sm leading-6 text-[#5f7278]">{item.label}</span>
                </motion.article>
              ))}
            </motion.div>
          </motion.div>

          <motion.div className="grid gap-4 [content-visibility:auto]" variants={sectionVariants}>
            <motion.div
              className={cn(
                glassCardClass,
                "flex min-h-[320px] flex-col justify-end bg-[linear-gradient(180deg,rgba(255,255,255,0.42),rgba(255,255,255,0.86)),linear-gradient(135deg,rgba(20,58,70,0.14),rgba(199,143,98,0.2))] p-7",
              )}
              variants={cardVariants}
              whileHover={hoverLift}
            >
              <span className={eyebrowClass}>Selected Direction</span>
              <h2 className="mt-4 font-serif text-[clamp(1.9rem,4vw,3rem)] leading-none tracking-[-0.04em] text-[#10232b]">감도 있는 브랜드를 위한 전환형 랜딩</h2>
              <p className={cn("mt-4", panelCopyClass)}>
                비주얼 완성도와 비즈니스 목표를 동시에 다루는 구조로, 브랜드 소개가 아닌 행동을 만드는 페이지를 제안합니다.
              </p>
              <dl className="mt-7 grid gap-4 md:grid-cols-2 md:gap-5 max-md:grid-cols-1">
                <div className="border-t border-[#10232b]/10 pt-4">
                  <dt className="text-sm text-[#5f7278]">추천 대상</dt>
                  <dd className="mt-2 font-bold leading-7 text-[#10232b]">초기 런칭, 리브랜딩, 캠페인 전환 최적화</dd>
                </div>
                <div className="border-t border-[#10232b]/10 pt-4">
                  <dt className="text-sm text-[#5f7278]">평균 리드 타임</dt>
                  <dd className="mt-2 font-bold leading-7 text-[#10232b]">전략 포함 3-6주</dd>
                </div>
              </dl>
            </motion.div>

            <motion.div className="grid gap-4 md:grid-cols-2 max-md:grid-cols-1" variants={sectionVariants}>
              <motion.div className={cn(glassCardClass, "p-7")} variants={cardVariants} whileHover={hoverLift}>
                <span className={eyebrowClass}>Process</span>
                <p className={cn("mt-4", panelCopyClass)}>브랜드 정리 → 콘텐츠 구조 → 디자인 → 개발 적용 → 런칭 QA</p>
              </motion.div>
              <motion.div className="rounded-[1.9rem] bg-[linear-gradient(180deg,rgba(20,58,70,0.96),rgba(12,41,49,0.96))] p-7 text-[#f4efe8] shadow-[0_24px_80px_rgba(10,29,35,0.14)]" variants={cardVariants} whileHover={hoverLift}>
                <span className="inline-flex items-center gap-2 text-[0.78rem] font-extrabold uppercase tracking-[0.18em] text-[#f4efe8]">Best For</span>
                <p className="mt-4 text-sm leading-7 text-[#f4efe8]">런칭 준비 중인 스타트업, 리브랜딩이 필요한 서비스, 캠페인 집중 브랜드</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.section>

      <motion.section className="px-0 pb-12 pt-3" aria-labelledby="process-heading" variants={sectionVariants} {...revealProps}>
        <div className={containerClass}>
          <motion.div variants={cardVariants}>
            <SectionHeading
              eyebrow="Process"
              title="빠르게 만들되, 설득 구조는 더 치밀하게"
              body="첫 미팅부터 런칭 직전 QA까지, 브랜드 메시지와 화면 구조가 같은 방향을 보도록 프로젝트를 운영합니다."
            />
          </motion.div>

          <motion.div className="mt-8 grid gap-5 lg:grid-cols-3" variants={sectionVariants}>
            {processSteps.map((step) => (
              <motion.article
                key={step.step}
                className={cn(glassCardClass, "relative overflow-hidden p-7 [content-visibility:auto]", "bg-[linear-gradient(180deg,rgba(255,255,255,0.76),rgba(255,255,255,0.58)),linear-gradient(180deg,rgba(199,143,98,0.08),rgba(20,58,70,0.04))]")}
                variants={cardVariants}
                whileHover={hoverLift}
              >
                <span className={eyebrowClass}>{step.step}</span>
                <h3 className="mt-5 text-2xl leading-tight font-semibold text-[#10232b]">{step.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[#5f7278] sm:text-base">{step.description}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <motion.section id="work" className="scroll-mt-28 px-0 py-12" aria-labelledby="work-heading" variants={sectionVariants} {...revealProps}>
        <div className={containerClass}>
          <motion.div variants={cardVariants}>
            <SectionHeading
              eyebrow="Work"
              title="현재 확장 중인 작업 분야"
              body="공간, 피트니스, 브랜드 아이덴티티까지 PHIM이 실제로 확장하고 있는 작업 분야를 한눈에 볼 수 있도록 정리했습니다."
            />
          </motion.div>

          <motion.div className="mt-8" variants={sectionVariants}>
            {workItems.map((item, index) => (
              <WorkCard key={item.id} item={item} index={index} shouldReduceMotion={shouldReduceMotion} />
            ))}
          </motion.div>
        </div>
      </motion.section>

      <motion.section id="projects" className="scroll-mt-28 px-0 py-12" variants={sectionVariants} {...revealProps}>
        <div className={containerClass}>
          <motion.div variants={cardVariants}>
            <SectionHeading
              eyebrow="Projects"
              title="브랜드의 결과로 이어진 작업들"
              body="화면만 만드는 것이 아니라, 브랜드가 무엇을 말해야 하고 어떤 행동을 이끌어야 하는지까지 함께 설계합니다."
            />
          </motion.div>

          <motion.div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4" variants={sectionVariants}>
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} shouldReduceMotion={shouldReduceMotion} variants={cardVariants} />
            ))}
          </motion.div>
        </div>
      </motion.section>

      <motion.section id="pricing" className="scroll-mt-28 px-0 pb-12 pt-16" variants={sectionVariants} {...revealProps}>
        <div className={containerClass}>
          <motion.div variants={cardVariants}>
            <SectionHeading eyebrow="Pricing" title="브랜드 단계에 맞춘 제안" body="목표와 일정, 필요한 산출물의 깊이에 따라 가장 효율적인 구성으로 제안합니다." />
          </motion.div>

          <motion.div className="mt-8 grid gap-5 lg:grid-cols-3" variants={sectionVariants}>
            {pricingPlans.map((plan) => (
              <motion.article
                key={plan.name}
                className={cn(
                  glassCardClass,
                  "flex flex-col p-7",
                  plan.featured && "-translate-y-2 border-transparent bg-[linear-gradient(180deg,rgba(20,58,70,0.97),rgba(12,41,49,0.97))] text-[#f4efe8] max-lg:translate-y-0",
                )}
                variants={cardVariants}
                whileHover={hoverLift}
              >
                <span className={cn(eyebrowClass, plan.featured && "text-[#f4efe8]/82")}>{plan.featured ? "Most Popular" : "Package"}</span>
                <h3 className="mt-4 text-2xl leading-tight font-semibold text-balance">{plan.name}</h3>
                <strong className="mt-5 block text-[2rem] leading-none">{plan.price}</strong>
                <p className={cn("mt-4", panelCopyClass, plan.featured && "text-[#f4efe8]/82")}>{plan.description}</p>
                <ul className="mt-7 grid gap-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className={cn("leading-6 text-[#5f7278]", plan.featured && "text-[#f4efe8]/82")}>
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <motion.section id="features" className="scroll-mt-28 px-0 py-12" variants={sectionVariants} {...revealProps}>
        <div className={cn(containerClass, "grid items-start gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]")}>
          <motion.div variants={cardVariants}>
            <SectionHeading
              eyebrow="Features"
              title="PHIM이 만드는 차이"
              body="좋은 인상을 넘어 좋은 결과까지 연결되는 제작 방식을 기준으로 프로젝트를 운영합니다."
            />
          </motion.div>

          <motion.div className="grid gap-5 md:grid-cols-2" variants={sectionVariants}>
            {features.map((feature) => (
              <motion.article key={feature.title} className={cn(glassCardClass, "p-7 [content-visibility:auto]")} variants={cardVariants} whileHover={hoverLift}>
                <h3 className="text-2xl leading-tight font-semibold text-[#10232b] text-balance">{feature.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[#5f7278] sm:text-base">{feature.description}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <motion.section id="contact" className="scroll-mt-28 px-0 pb-18 pt-12" variants={sectionVariants} {...revealProps}>
        <motion.div className={cn(containerClass, glassCardClass, "grid gap-6 rounded-[2.25rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(255,255,255,0.62)),linear-gradient(120deg,rgba(199,143,98,0.12),rgba(20,58,70,0.08))] p-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]")} variants={cardVariants} whileHover={hoverLift}>
          <motion.div variants={cardVariants}>
            <span className={eyebrowClass}>Contact</span>
            <h2 className="mt-4 font-serif text-[clamp(2.2rem,4vw,4rem)] leading-[1.02] tracking-[-0.04em] text-[#10232b]">다음 런칭, PHIM과 같이 준비해볼까요?</h2>
            <p className="mt-4 text-sm leading-8 text-[#5f7278] sm:text-base">
              브랜드의 현재 상황, 원하는 일정, 필요한 페이지 범위를 알려주시면 가장 적합한 방식으로 빠르게 제안드립니다.
            </p>
            <motion.div className="mt-8 flex flex-wrap gap-3" variants={cardVariants}>
              <ActionLink href="mailto:hello@phim.agency" label="이메일 보내기" />
              <ActionLink href="tel:+8201023456789" label="전화 상담" kind="secondary" />
            </motion.div>
          </motion.div>

          <motion.div className="grid gap-4" variants={sectionVariants}>
            {contactItems.map((item) => (
              <motion.div key={item.label} className={cn(glassCardClass, "rounded-[1.5rem] p-6")} variants={cardVariants} whileHover={hoverLift}>
                <span className={eyebrowClass}>{item.label}</span>
                <strong className="mt-3 block text-lg leading-7 text-[#10232b]">{item.value}</strong>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.section>

      <footer className="border-t border-[#10232b]/8 px-0 py-8">
        <motion.div
          className={cn(containerClass, "flex flex-col gap-5 text-sm text-[#5f7278] lg:flex-row lg:items-center lg:justify-between")}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={shouldReduceMotion ? undefined : { once: true, amount: 0.6 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-5">
            <Image src="/phim-logo.png" alt="PHIM 로고" width={100} height={38} />
            <p>브랜드의 첫 인상을 전환으로 연결하는 디자인 에이전시 PHIM.</p>
          </div>

          <div className="flex flex-wrap gap-5">
            <a href="#projects">프로젝트</a>
            <a href="#pricing">가격</a>
            <a href="#features">강점</a>
            <a href="#contact">문의</a>
          </div>

          <p>© 2026 PHIM Agency. All rights reserved.</p>
        </motion.div>
      </footer>
    </main>
  );
}
