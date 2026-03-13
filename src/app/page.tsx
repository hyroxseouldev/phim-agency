import Image from "next/image";

const navigationItems = [
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

const projects = [
  {
    category: "Brand Experience",
    title: "Aster Wellness",
    description:
      "웰니스 스타트업의 첫 인상을 설계한 리브랜딩 프로젝트. 브랜드 전략부터 상세 페이지, 예약 전환형 랜딩까지 통합 구축했습니다.",
    impact: "런칭 8주 만에 상담 전환율 2.3배 상승",
  },
  {
    category: "Product Launch",
    title: "Nudge Commerce",
    description:
      "SaaS 제품 공개를 위한 B2B 랜딩 페이지와 세일즈 키비주얼 시스템을 제작해 세일즈 데모 예약 흐름을 정리했습니다.",
    impact: "첫 달 데모 신청 180건 확보",
  },
  {
    category: "Campaign System",
    title: "Moment Hotel",
    description:
      "호텔 시즌 캠페인에 맞춰 메인 키아트, SNS 크리에이티브, 프로모션 페이지를 연결한 캠페인 세트를 구성했습니다.",
    impact: "프로모션 객실 예약 매출 64% 증가",
  },
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

const contactItems = [
  { label: "이메일", value: "hello@phim.agency" },
  { label: "상담 채널", value: "카카오톡 / Zoom 미팅" },
  { label: "응답 시간", value: "영업일 기준 24시간 이내" },
];

export default function Home() {
  return (
    <main className="page-shell">
      <div className="background-orb background-orb-left" aria-hidden="true" />
      <div className="background-orb background-orb-right" aria-hidden="true" />

      <header className="site-header">
        <div className="container header-inner">
          <a href="#top" className="brand-mark" aria-label="PHIM 홈으로 이동">
            <Image src="/phim-logo.png" alt="PHIM 로고" width={110} height={42} priority />
          </a>

          <nav className="nav-links" aria-label="섹션 이동">
            {navigationItems.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>

          <a href="#contact" className="button button-primary button-compact">
            상담 문의
          </a>
        </div>
      </header>

      <section id="top" className="hero-section">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">Creative Digital Agency</span>
            <h1>
              브랜드가 더 선명하게
              <br />
              팔리도록 디자인합니다.
            </h1>
            <p>
              PHIM은 브랜드 전략, 랜딩 페이지, 캠페인 비주얼을 하나의 흐름으로 연결해
              첫 인상부터 문의 전환까지 설계하는 디자인 에이전시입니다.
            </p>

            <div className="hero-actions">
              <a href="#projects" className="button button-primary">
                프로젝트 보기
              </a>
              <a href="#pricing" className="button button-secondary">
                패키지 확인
              </a>
            </div>

            <div className="hero-metrics">
              {metrics.map((item) => (
                <div key={item.label} className="metric-card">
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-panel">
            <div className="hero-panel-card hero-panel-main">
              <span>Selected Direction</span>
              <h2>감도 있는 브랜드를 위한 전환형 랜딩</h2>
              <p>
                비주얼 완성도와 비즈니스 목표를 동시에 다루는 구조로, 브랜드 소개가 아닌
                행동을 만드는 페이지를 제안합니다.
              </p>
            </div>

            <div className="hero-panel-stack">
              <div className="hero-panel-card">
                <span>Process</span>
                <p>브랜드 정리 → 콘텐츠 구조 → 디자인 → 개발 적용 → 런칭 QA</p>
              </div>
              <div className="hero-panel-card accent-card">
                <span>Best For</span>
                <p>런칭 준비 중인 스타트업, 리브랜딩이 필요한 서비스, 캠페인 집중 브랜드</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="projects" className="content-section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Projects</span>
            <h2>브랜드의 결과로 이어진 작업들</h2>
            <p>
              화면만 만드는 것이 아니라, 브랜드가 무엇을 말해야 하고 어떤 행동을 이끌어야
              하는지까지 함께 설계합니다.
            </p>
          </div>

          <div className="project-grid">
            {projects.map((project) => (
              <article key={project.title} className="project-card">
                <span className="card-label">{project.category}</span>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <div className="project-impact">{project.impact}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="content-section pricing-section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Pricing</span>
            <h2>브랜드 단계에 맞춘 제안</h2>
            <p>목표와 일정, 필요한 산출물의 깊이에 따라 가장 효율적인 구성으로 제안합니다.</p>
          </div>

          <div className="pricing-grid">
            {pricingPlans.map((plan) => (
              <article
                key={plan.name}
                className={plan.featured ? "pricing-card pricing-card-featured" : "pricing-card"}
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
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="content-section">
        <div className="container feature-layout">
          <div className="section-heading feature-heading">
            <span className="eyebrow">Features</span>
            <h2>PHIM이 만드는 차이</h2>
            <p>
              좋은 인상을 넘어 좋은 결과까지 연결되는 제작 방식을 기준으로 프로젝트를
              운영합니다.
            </p>
          </div>

          <div className="feature-grid">
            {features.map((feature) => (
              <article key={feature.title} className="feature-card">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="content-section contact-section">
        <div className="container contact-card">
          <div className="contact-copy">
            <span className="eyebrow">Contact</span>
            <h2>다음 런칭, PHIM과 같이 준비해볼까요?</h2>
            <p>
              브랜드의 현재 상황, 원하는 일정, 필요한 페이지 범위를 알려주시면 가장 적합한
              방식으로 빠르게 제안드립니다.
            </p>
            <div className="hero-actions">
              <a href="mailto:hello@phim.agency" className="button button-primary">
                이메일 보내기
              </a>
              <a href="tel:+8201023456789" className="button button-secondary">
                전화 상담
              </a>
            </div>
          </div>

          <div className="contact-meta">
            {contactItems.map((item) => (
              <div key={item.label} className="contact-item">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="container footer-inner">
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
        </div>
      </footer>
    </main>
  );
}
