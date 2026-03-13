"use client";

import { useEffect, useState, type PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import { type ProjectSummary } from "@/lib/projects";
import { createClient } from "@/lib/supabase/browser";

type WorkItem = {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  coverImagePath: string;
  coverImageUrl: string;
};

const supabase = createClient();

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
    description:
      "예쁜 시안에서 끝나지 않고, 타깃과 제안 메시지부터 구조화해 실제 전환에 맞는 랜딩을 만듭니다.",
  },
  {
    title: "브랜드 톤을 시각 언어로 번역",
    description:
      "브랜드가 말하는 방식, 제품의 결, 고객이 느껴야 할 온도를 화면 위에 일관된 리듬으로 담아냅니다.",
  },
  {
    title: "디자인과 개발의 간극 최소화",
    description:
      "Next.js 기반으로 실제 구현까지 고려한 구조를 설계해 출시 직전의 손실과 수정 비용을 줄입니다.",
  },
  {
    title: "빠른 제작, 높은 완성도",
    description:
      "짧은 일정에서도 우선순위를 선명하게 정리해 브랜드 첫 공개에 필요한 임팩트를 놓치지 않습니다.",
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

function ProjectTiltCard({
  project,
  shouldReduceMotion,
}: {
  project: ProjectSummary;
  shouldReduceMotion: boolean;
}) {
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const sheenX = useTransform(rotateY, [-8, 8], ["40%", "60%"]);
  const sheenY = useTransform(rotateX, [-8, 8], ["42%", "58%"]);
  const [hasImageError, setHasImageError] = useState(false);

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (shouldReduceMotion) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const offsetX = (event.clientX - rect.left) / rect.width - 0.5;
    const offsetY = (event.clientY - rect.top) / rect.height - 0.5;

    rotateX.set(offsetY * -10);
    rotateY.set(offsetX * 10);
  };

  const resetTilt = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <Link href={`/projects/${project.slug}`} className="project-card-link" aria-label={`${project.title} 프로젝트 보기`}>
      <motion.article
        className="project-card"
        variants={cardVariants}
        whileHover={getHoverLift(shouldReduceMotion)}
        onPointerMove={handlePointerMove}
        onPointerLeave={resetTilt}
        onPointerCancel={resetTilt}
        style={
          shouldReduceMotion
            ? undefined
            : {
                rotateX,
                rotateY,
                transformPerspective: 1200,
              }
        }
      >
        <div className="project-card-image-shell">
          {project.thumbnailImageUrl && !hasImageError ? (
            <div className="project-card-image">
              <Image
                src={project.thumbnailImageUrl}
                alt={`${project.title} 썸네일 이미지`}
                fill
                sizes="(max-width: 980px) 100vw, 33vw"
                className="project-card-image-element"
                onError={() => setHasImageError(true)}
              />
            </div>
          ) : (
            <div className="project-card-image project-card-image-fallback" aria-hidden="true">
              <span>{project.category}</span>
              <strong>{project.title}</strong>
            </div>
          )}
        </div>
        <motion.div
          className="project-card-sheen"
          aria-hidden="true"
          style={shouldReduceMotion ? undefined : { x: sheenX, y: sheenY }}
        />
        <span className="card-label">{project.category}</span>
        <h3>{project.title}</h3>
        <p>{project.summary}</p>
        <div className="project-impact">{project.impact}</div>
      </motion.article>
    </Link>
  );
}

function WorkCard({
  item,
  index,
  shouldReduceMotion,
}: {
  item: WorkItem;
  index: number;
  shouldReduceMotion: boolean;
}) {
  const [hasImageError, setHasImageError] = useState(false);

  return (
    <motion.article className="work-card" variants={cardVariants} whileHover={getHoverLift(shouldReduceMotion)}>
      <div className="work-card-image-shell">
        {item.coverImageUrl && !hasImageError ? (
          <div className="work-card-image">
            <Image
              src={item.coverImageUrl}
              alt={`${item.title} 대표 이미지`}
              fill
              sizes="(max-width: 980px) 100vw, 33vw"
              className="work-card-image-element"
              onError={() => setHasImageError(true)}
            />
          </div>
        ) : (
          <div className="work-card-image work-card-image-fallback" aria-hidden="true">
            <span>{item.category}</span>
            <strong>{item.title}</strong>
          </div>
        )}
      </div>

      <div className="work-card-meta">
        <span className="work-index">0{index + 1}</span>
        <span className="card-label">{item.category}</span>
      </div>
      <h3>{item.title}</h3>
      <p>{item.summary}</p>
    </motion.article>
  );
}

export default function Home() {
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
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);

  useEffect(() => {
    const sectionIds = ["top", "work", "projects", "pricing", "features", "contact"];
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

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

  useEffect(() => {
    let isMounted = true;

    async function loadWorkItems() {
      const { data, error } = await supabase
        .from("work_items")
        .select("id, slug, title, category, summary, cover_image_path")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) {
        console.error("Failed to load work items", error);
        return;
      }

      if (!isMounted || !data) {
        return;
      }

      setWorkItems(
        data.map((item) => ({
          id: item.id,
          slug: item.slug,
          title: item.title,
          category: item.category,
          summary: item.summary,
          coverImagePath: item.cover_image_path,
          coverImageUrl: item.cover_image_path
            ? supabase.storage.from("work-media").getPublicUrl(item.cover_image_path).data.publicUrl
            : "",
        })),
      );
    }

    loadWorkItems();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadProjects() {
      const { data, error } = await supabase
        .from("projects")
        .select("id, slug, title, category, summary, description, impact, thumbnail_image_path")
        .eq("is_active", true)
        .eq("is_featured", true)
        .order("sort_order", { ascending: true });

      if (error) {
        console.error("Failed to load projects", error);
        return;
      }

      if (!isMounted || !data) {
        return;
      }

      setProjects(
        data.map((item) => ({
          id: item.id,
          slug: item.slug,
          title: item.title,
          category: item.category,
          summary: item.summary,
          description: item.description,
          impact: item.impact,
          thumbnailImagePath: item.thumbnail_image_path,
          thumbnailImageUrl: item.thumbnail_image_path
            ? supabase.storage.from("project-media").getPublicUrl(item.thumbnail_image_path).data.publicUrl
            : "",
        })),
      );
    }

    loadProjects();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main id="main-content" className="page-shell">
      <motion.div className="scroll-progress" style={{ scaleX: progressScale }} aria-hidden="true" />
      <motion.div
        className="background-orb background-orb-left"
        aria-hidden="true"
        style={{ y: orbLeftY }}
      />
      <motion.div
        className="background-orb background-orb-right"
        aria-hidden="true"
        style={{ y: orbRightY }}
      />

      <header className="site-header">
        <motion.div
          className="container header-inner"
          initial={shouldReduceMotion ? false : { opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.a
            href="#top"
            className="brand-mark"
            aria-label="PHIM 홈으로 이동"
            onClick={() => setActiveSection("#top")}
            whileHover={shouldReduceMotion ? undefined : { y: -2, scale: 1.02 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
          >
            <Image src="/phim-logo.png" alt="PHIM 로고" width={110} height={42} priority />
          </motion.a>

          <LayoutGroup id="desktop-nav">
            <nav className="nav-links" aria-label="섹션 이동">
              {navigationItems.map((item) => {
                const isActive = activeSection === item.href;

                return (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    className={isActive ? "is-active" : undefined}
                    onClick={() => setActiveSection(item.href)}
                    whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                    whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                  >
                    {isActive ? (
                      <motion.span layoutId="nav-active-pill" className="nav-active-pill" aria-hidden="true" />
                    ) : null}
                    <span className="nav-link-label">{item.label}</span>
                  </motion.a>
                );
              })}
            </nav>
          </LayoutGroup>

          <motion.button
            type="button"
            className="mobile-menu-toggle"
            aria-label={isMobileMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
          >
            <motion.span animate={isMobileMenuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }} />
            <motion.span animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }} />
            <motion.span animate={isMobileMenuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }} />
          </motion.button>

          <motion.a
            href="#contact"
            className="button button-primary button-compact"
            onClick={() => setActiveSection("#contact")}
            whileHover={shouldReduceMotion ? undefined : { y: -2, scale: 1.01 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
          >
            상담 문의
          </motion.a>
        </motion.div>

        <AnimatePresence initial={false}>
          {isMobileMenuOpen ? (
            <motion.div
              id="mobile-navigation"
              className="mobile-menu-panel"
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <LayoutGroup id="mobile-nav">
                <nav className="mobile-nav-links" aria-label="모바일 섹션 이동">
                  {navigationItems.map((item) => {
                    const isActive = activeSection === item.href;

                    return (
                      <motion.a
                        key={item.href}
                        href={item.href}
                        className={isActive ? "is-active" : undefined}
                        onClick={() => {
                          setActiveSection(item.href);
                          setIsMobileMenuOpen(false);
                        }}
                        whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                      >
                        {isActive ? (
                          <motion.span
                            layoutId="mobile-nav-active-pill"
                            className="mobile-nav-active-pill"
                            aria-hidden="true"
                          />
                        ) : null}
                        <span className="nav-link-label">{item.label}</span>
                      </motion.a>
                    );
                  })}
                  <motion.a
                    href="#contact"
                    className="mobile-menu-cta"
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

      <motion.section id="top" className="hero-section" style={{ y: heroY }}>
        <motion.div className="container hero-grid" variants={sectionVariants} {...revealProps}>
          <motion.div className="hero-copy" variants={cardVariants}>
            <span className="eyebrow">Creative Digital Agency</span>
            <motion.h1
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              브랜드가 더 선명하게
              <br />
              팔리도록 디자인합니다.
            </motion.h1>
            <motion.p variants={cardVariants}>
              PHIM은 브랜드 전략, 랜딩 페이지, 캠페인 비주얼을 하나의 흐름으로 연결해
              첫 인상부터 문의 전환까지 설계하는 디자인 에이전시입니다.
            </motion.p>

            <motion.ul className="hero-highlight-list" aria-label="핵심 제공 가치" variants={sectionVariants}>
              {serviceHighlights.map((item) => (
                <motion.li key={item} variants={cardVariants}>
                  {item}
                </motion.li>
              ))}
            </motion.ul>

            <motion.div className="hero-actions" variants={cardVariants}>
              <motion.a
                href="#projects"
                className="button button-primary"
                whileHover={shouldReduceMotion ? undefined : { y: -3, scale: 1.01 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              >
                프로젝트 보기
              </motion.a>
              <motion.a
                href="#pricing"
                className="button button-secondary"
                whileHover={shouldReduceMotion ? undefined : { y: -3, scale: 1.01 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              >
                패키지 확인
              </motion.a>
            </motion.div>

            <motion.div className="hero-metrics" aria-label="주요 성과 지표" variants={sectionVariants}>
              {metrics.map((item) => (
                <motion.article
                  key={item.label}
                  className="metric-card"
                  variants={cardVariants}
                  whileHover={hoverLift}
                >
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </motion.article>
              ))}
            </motion.div>
          </motion.div>

          <motion.div className="hero-panel" variants={sectionVariants}>
            <motion.div
              className="hero-panel-card hero-panel-main"
              variants={cardVariants}
              whileHover={hoverLift}
            >
              <span>Selected Direction</span>
              <h2>감도 있는 브랜드를 위한 전환형 랜딩</h2>
              <p>
                비주얼 완성도와 비즈니스 목표를 동시에 다루는 구조로, 브랜드 소개가 아닌
                행동을 만드는 페이지를 제안합니다.
              </p>
              <dl className="hero-panel-meta">
                <div>
                  <dt>추천 대상</dt>
                  <dd>초기 런칭, 리브랜딩, 캠페인 전환 최적화</dd>
                </div>
                <div>
                  <dt>평균 리드 타임</dt>
                  <dd>전략 포함 3-6주</dd>
                </div>
              </dl>
            </motion.div>

            <motion.div className="hero-panel-stack" variants={sectionVariants}>
              <motion.div className="hero-panel-card" variants={cardVariants} whileHover={hoverLift}>
                <span>Process</span>
                <p>브랜드 정리 → 콘텐츠 구조 → 디자인 → 개발 적용 → 런칭 QA</p>
              </motion.div>
              <motion.div
                className="hero-panel-card accent-card"
                variants={cardVariants}
                whileHover={hoverLift}
              >
                <span>Best For</span>
                <p>런칭 준비 중인 스타트업, 리브랜딩이 필요한 서비스, 캠페인 집중 브랜드</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.section>

      <motion.section
        className="content-section process-section"
        aria-labelledby="process-heading"
        variants={sectionVariants}
        {...revealProps}
      >
        <div className="container">
          <motion.div className="section-heading process-heading" variants={cardVariants}>
            <span className="eyebrow">Process</span>
            <h2 id="process-heading">빠르게 만들되, 설득 구조는 더 치밀하게</h2>
            <p>
              첫 미팅부터 런칭 직전 QA까지, 브랜드 메시지와 화면 구조가 같은 방향을 보도록
              프로젝트를 운영합니다.
            </p>
          </motion.div>

          <motion.div className="process-grid" variants={sectionVariants}>
            {processSteps.map((step) => (
              <motion.article
                key={step.step}
                className="process-card"
                variants={cardVariants}
                whileHover={hoverLift}
              >
                <span className="process-step">{step.step}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        id="work"
        className="content-section work-section"
        aria-labelledby="work-heading"
        variants={sectionVariants}
        {...revealProps}
      >
        <div className="container">
          <motion.div className="section-heading" variants={cardVariants}>
            <span className="eyebrow">Work</span>
            <h2 id="work-heading">현재 확장 중인 작업 분야</h2>
            <p>
              공간, 피트니스, 브랜드 아이덴티티까지 PHIM이 실제로 확장하고 있는 작업 분야를
              한눈에 볼 수 있도록 정리했습니다.
            </p>
          </motion.div>

          <motion.div className="work-grid" variants={sectionVariants}>
            {workItems.map((item, index) => (
              <WorkCard key={item.id} item={item} index={index} shouldReduceMotion={shouldReduceMotion} />
            ))}
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        id="projects"
        className="content-section"
        variants={sectionVariants}
        {...revealProps}
      >
        <div className="container">
          <motion.div className="section-heading" variants={cardVariants}>
            <span className="eyebrow">Projects</span>
            <h2>브랜드의 결과로 이어진 작업들</h2>
            <p>
              화면만 만드는 것이 아니라, 브랜드가 무엇을 말해야 하고 어떤 행동을 이끌어야
              하는지까지 함께 설계합니다.
            </p>
          </motion.div>

          <motion.div className="project-grid" variants={sectionVariants}>
            {projects.map((project) => (
              <ProjectTiltCard key={project.title} project={project} shouldReduceMotion={shouldReduceMotion} />
            ))}
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        id="pricing"
        className="content-section pricing-section"
        variants={sectionVariants}
        {...revealProps}
      >
        <div className="container">
          <motion.div className="section-heading" variants={cardVariants}>
            <span className="eyebrow">Pricing</span>
            <h2>브랜드 단계에 맞춘 제안</h2>
            <p>목표와 일정, 필요한 산출물의 깊이에 따라 가장 효율적인 구성으로 제안합니다.</p>
          </motion.div>

          <motion.div className="pricing-grid" variants={sectionVariants}>
            {pricingPlans.map((plan) => (
              <motion.article
                key={plan.name}
                className={plan.featured ? "pricing-card pricing-card-featured" : "pricing-card"}
                variants={cardVariants}
                whileHover={hoverLift}
              >
                <span className="card-label">{plan.featured ? "Most Popular" : "Package"}</span>
                <h3>{plan.name}</h3>
                <strong className="price-value">{plan.price}</strong>
                <p>{plan.description}</p>
                <ul>
                  {plan.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        id="features"
        className="content-section"
        variants={sectionVariants}
        {...revealProps}
      >
        <div className="container feature-layout">
          <motion.div className="section-heading feature-heading" variants={cardVariants}>
            <span className="eyebrow">Features</span>
            <h2>PHIM이 만드는 차이</h2>
            <p>
              좋은 인상을 넘어 좋은 결과까지 연결되는 제작 방식을 기준으로 프로젝트를
              운영합니다.
            </p>
          </motion.div>

          <motion.div className="feature-grid" variants={sectionVariants}>
            {features.map((feature) => (
              <motion.article
                key={feature.title}
                className="feature-card"
                variants={cardVariants}
                whileHover={hoverLift}
              >
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        id="contact"
        className="content-section contact-section"
        variants={sectionVariants}
        {...revealProps}
      >
        <motion.div className="container contact-card" variants={cardVariants} whileHover={hoverLift}>
          <motion.div className="contact-copy" variants={cardVariants}>
            <span className="eyebrow">Contact</span>
            <h2>다음 런칭, PHIM과 같이 준비해볼까요?</h2>
            <p>
              브랜드의 현재 상황, 원하는 일정, 필요한 페이지 범위를 알려주시면 가장 적합한
              방식으로 빠르게 제안드립니다.
            </p>
            <motion.div className="hero-actions" variants={cardVariants}>
              <motion.a
                href="mailto:hello@phim.agency"
                className="button button-primary"
                whileHover={shouldReduceMotion ? undefined : { y: -3, scale: 1.01 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              >
                이메일 보내기
              </motion.a>
              <motion.a
                href="tel:+8201023456789"
                className="button button-secondary"
                whileHover={shouldReduceMotion ? undefined : { y: -3, scale: 1.01 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              >
                전화 상담
              </motion.a>
            </motion.div>
          </motion.div>

          <motion.div className="contact-meta" variants={sectionVariants}>
            {contactItems.map((item) => (
              <motion.div
                key={item.label}
                className="contact-item"
                variants={cardVariants}
                whileHover={hoverLift}
              >
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.section>

      <footer className="site-footer">
        <motion.div
          className="container footer-inner"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={shouldReduceMotion ? undefined : { once: true, amount: 0.6 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="footer-brand">
            <Image src="/phim-logo.png" alt="PHIM 로고" width={100} height={38} />
            <p>브랜드의 첫 인상을 전환으로 연결하는 디자인 에이전시 PHIM.</p>
          </div>

          <div className="footer-links">
            <a href="#projects">프로젝트</a>
            <a href="#pricing">가격</a>
            <a href="#features">강점</a>
            <a href="#contact">문의</a>
          </div>

          <p className="footer-copy">© 2026 PHIM Agency. All rights reserved.</p>
        </motion.div>
      </footer>
    </main>
  );
}
