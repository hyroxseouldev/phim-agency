"use client";

import { useState } from "react";
import Image from "next/image";
import {
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

const containerClass = "w-full px-4 sm:px-6 md:px-8 2xl:px-10";
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
  const heroY = useTransform(scrollYProgress, [0, 1], [0, shouldReduceMotion ? 0 : -36]);
  const orbLeftY = useTransform(scrollYProgress, [0, 1], [0, shouldReduceMotion ? 0 : -72]);
  const orbRightY = useTransform(scrollYProgress, [0, 1], [0, shouldReduceMotion ? 0 : 96]);
  const revealProps = getRevealProps(shouldReduceMotion);
  const hoverLift = getHoverLift(shouldReduceMotion);

  return (
    <main
      id="main-content"
      className="relative overflow-x-hidden bg-[linear-gradient(180deg,#ffffff_0%,#fcfcfc_100%)] pt-[4.25rem] text-[#10232b] sm:pt-[4.75rem]"
    >
      <motion.div className="pointer-events-none absolute left-[-120px] top-24 h-80 w-80 rounded-full bg-black/[0.04] blur-xl" aria-hidden="true" style={{ y: orbLeftY }} />
      <motion.div className="pointer-events-none absolute right-[-120px] top-[420px] h-96 w-96 rounded-full bg-black/[0.05] blur-xl" aria-hidden="true" style={{ y: orbRightY }} />

      <motion.section id="top" className="scroll-mt-28 w-full border-b border-[#10232b]/8 bg-transparent pb-12 pt-12 sm:pb-14 sm:pt-14 md:pb-18 md:pt-24" style={{ y: heroY }} variants={sectionVariants} {...revealProps}>
        <motion.div
          variants={cardVariants}
          className="flex min-h-[calc(100vh-9rem)] w-full items-center px-4 sm:px-6 md:px-8"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="w-full max-w-[72rem]">
            <span className="inline-flex items-center gap-2 text-[0.78rem] font-extrabold uppercase tracking-[0.18em] text-[#10232b]/68">PHIM Studio</span>
            <div className="mt-6 w-40 border-t border-[#10232b]/10" aria-hidden="true" />
            <h1 className="mt-8 max-w-[11ch] text-balance font-serif text-[clamp(3rem,8vw,7rem)] leading-[0.94] tracking-[-0.065em] text-[#10232b]">
              조용하지만
              <br />
              선명한 첫인상을 만듭니다.
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-[#5f7278] sm:text-[1.05rem]">
              PHIM Studio는 브랜드 디렉션, 비주얼 아이덴티티, 디지털 경험을 차분한 밀도와 분명한 태도로 설계하는 미니멀 크리에이티브 스튜디오입니다.
            </p>
            <p className="mt-5 text-sm font-semibold tracking-[0.08em] text-[#10232b]/64">
              새로운 프로젝트 의뢰를 받고 있습니다.
            </p>
          </div>
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

          <motion.div className="mt-8 grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]" variants={sectionVariants}>
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

          <motion.div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4" variants={sectionVariants}>
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

          <motion.div className="mt-8 grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]" variants={sectionVariants}>
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
        <div className={cn(containerClass, "grid items-start gap-6 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.2fr)]")}>
          <motion.div variants={cardVariants}>
            <SectionHeading
              eyebrow="Features"
              title="PHIM이 만드는 차이"
              body="좋은 인상을 넘어 좋은 결과까지 연결되는 제작 방식을 기준으로 프로젝트를 운영합니다."
            />
          </motion.div>

          <motion.div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]" variants={sectionVariants}>
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
        <motion.div className={cn(containerClass, glassCardClass, "grid gap-6 rounded-[2.25rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(255,255,255,0.62)),linear-gradient(120deg,rgba(199,143,98,0.12),rgba(20,58,70,0.08))] p-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,420px)]")} variants={cardVariants} whileHover={hoverLift}>
          <motion.div variants={cardVariants}>
            <span className={eyebrowClass}>Contact</span>
            <h2 className="mt-4 font-serif text-[clamp(2.2rem,4vw,4rem)] leading-[1.02] tracking-[-0.04em] text-[#10232b]">다음 런칭, PHIM과 같이 준비해볼까요?</h2>
            <p className="mt-4 max-w-3xl text-sm leading-8 text-[#5f7278] sm:text-base">
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
    </main>
  );
}
