// PrePair Presentation Slides Configuration
const presentationSlides = [
  {
    id: "home-hook",
    pageId: "home",
    key: "1",
    label: "SLIDE 1 - HOOK: INTERNSHIPS ARE HARD TO GET",
    scrollTargetSelector: null,
    visualSrc: "/visuals/hook.png",
    visualAlt: "Broken staircase showing why internships feel out of reach",
    pages: [
      {
        id: "home-hook-1",
        heading: "Internships are hard to get",
        intro: "This slide hooks the audience by exposing the contradiction at the heart of the internship system.",
        bullets: [
          "Hook – Internships are HARD to get",
          "Increased number of competition and decreased number of available positions",
          "Require a certain amount of prior experience",
          "Helps differentiate you from other candidates (this doesn't really favor me)",
          "There is a clear contradiction in the current internship system",
          "How can someone claim that an internship is a first step if it favors experience?",
          "The answer is simple: it is no longer the first step students take to get into the professional world",
          "We feel we have come up with a viable solution: that solution is PrePair"
        ],
        visualHint: "Optional: a small vertical diagram hinting at steps, with 'PrePair' sitting before 'Internship' as the first block."
      }
    ]
  },

  // Home - Agenda
  {
    id: "home-agenda",
    pageId: "home",
    key: "2",
    label: "SLIDE 2 - AGENDA",
    scrollTargetSelector: null,
    visualKind: "agendaTimeline",
    visualPlacement: "inlineAfterIntro",
    visualData: {
      steps: [
        "Intro & Hook",
        "Company & Market",
        "Competition",
        "HR & ESG",
        "Operations",
        "Financials",
        "Key Takeaways"
      ]
    },
    pages: [
      {
        id: "home-agenda-1",
        heading: "Agenda",
        intro: "This slide gives a quick overview of what we will cover.",
        bullets: [
          "Introduction and business description.",
          "Industry, market and competitive analyses.",
          "Human Resources and ESG.",
          "User journey and marketing strategy for students and businesses.",
          "Operational model and legal structure.",
          "Financial projections.",
          "Key takeaways."
        ],
        visualHint: "Simple clean list, no extra visual needed. Keep it minimal for speed."
      }
    ]
  },

  // Home - Key Takeaways
  {
    id: "home-key-takeaways",
    pageId: "home",
    key: "k",
    label: "SLIDE 3 - KEY TAKEAWAYS",
    scrollTargetSelector: null,
    visualKind: "takeawaysStack",
    visualPlacement: "inlineAfterIntro",
    visualData: {
      layers: [
        "Local & accessible",
        "Educational and ethical",
        "First-step experience"
      ],
      flagText: "Invest in yourself"
    },
    pages: [
      {
        id: "home-key-takeaways-1",
        heading: "Key takeaways",
        intro: "This slide closes the loop by summarizing what PrePair offers and why it matters.",
        bullets: [
          "PrePair is a local, streamlined, affordable and educational platform.",
          "It creates a ground floor 'first step' for students before they enter the internship race.",
          "Students gain real, mentored project experience; small businesses get meaningful low-cost support.",
          "Instead of trying to cheat the internship system, we adapt to it and make early experience more accessible.",
          "PrePair is a way to invest in yourself before the internship race even starts."
        ],
        visualHint: "Optional: a subtle icon or small illustration suggesting 'growth' or 'upward path' next to the final 'invest in yourself' line."
      }
    ]
  },

  // About - Company background and description
  {
    id: "about-company",
    pageId: "about",
    key: "1",
    label: "ABOUT - COMPANY BACKGROUND AND DESCRIPTION",
    scrollTargetSelector: "#about-company",
    visualSrc: "/visuals/streamlined.png",
    visualAlt: "Four-pillar foundation illustration representing local, streamlined, affordable, educational",
    visualPlacement: "bottom",
    pages: [
      {
        id: "about-company-1",
        heading: "PrePair: local, streamlined, affordable, educational",
        intro: "This slide describes what PrePair is and how it fills the gap before internships.",
        bullets: [
          "PrePair is a local, streamlined, affordable and educational digital platform.",
          "**Local**: local businesses need help and local students need practical, real-world experience.",
          "Through unpaid, mentorship-style projects, students gain valuable hands-on experience while small and medium-sized enterprises receive local credibility and low-cost support.",
          "**Streamlined**: PrePair is a digital marketspace designed specifically for students and local small businesses to make the experience simple and focused.",
          "**Affordable**: students pay about $2 per month and small businesses pay about $20 per month.",
          "**Educational**: students are assigned a mentor at the host business and meet at the start and end of projects to discuss logistics and feedback, with a mid-project check-in on longer engagements.",
          "PrePair aims to be the ground floor for 'first step' professional experiences for students, especially when internships are not guaranteed.",
          "Clearly there is a hole in the market for entry-level students and small local businesses.",
          "As it stands, PrePair hopes to establish itself as the ground floor for all \"first step\" professional experiences, especially when internships are not guaranteed.",
          "At PrePair, we value well-roundedness and want students to explore different types of projects.",
          "PrePair projects help students demonstrate professionalism and accountability in real work settings."
        ],
        visualHint: "A small four-quadrant label or icons for Local, Streamlined, Affordable, Educational could sit near the heading."
      }
    ]
  },

  // About - Industry and Competitive Analysis (Combined)
  {
    id: "about-market-competition",
    pageId: "about",
    key: "2",
    label: "ABOUT – INDUSTRY & COMPETITIVE POSITION",
    scrollTargetSelector: "#about-market",
    visualKind: "marketBullseye",
    visualPlacement: "inlineAfterIntro",
    visualData: {
      outerLabel: "Freelance platforms",
      innerLabel: "Online internship platforms",
      centerLabel: "PrePair niche",
      freelanceMarket: "≈ $5.58B",
      freelanceGrowth: "~18% / year",
      internshipMarket: "≈ $1.82B"
    },
    pages: [
      {
        id: "about-market-competition-1",
        heading: "Industry context and where PrePair fits",
        intro: "This combined slide shows the fast-growing markets we operate in and the specific gap PrePair is built to fill.",
        bullets: [
          "PrePair operates in the fast-growing freelance platforms industry and the emerging online internship marketplace.",
          "The global freelance platforms market is projected to reach about $5.58 billion in 2024, growing around 18 percent per year.",
          "The virtual internship platforms market was valued at around $1.82 billion in 2024, reflecting rising demand for online internship experiences.",
          "Major platforms such as Upwork, Fiverr, LinkedIn and Handshake mainly serve experienced professionals or larger companies.",
          "PrePair is the only platform built exclusively for managing project-based partnerships of this kind",
          "Students are the primary beneficiaries of this educational experience",
          "Our mission is to prepare students and pair them with opportunity",
          "PrePair is emerging as a niche within the competition heavy markets highlighted in our Industry and Market analysis",
          "- The goal is not to compete but to complement",
          "- We want to function as a stepping stone for students looking to enter the internship market",
          "We don't want to get rid of internships",
          "There will always be a place for LinkedIn but we feel there will always be a place for PrePair"
        ]
      }
    ]
  },

  // About - HR / Organization and Management
  {
    id: "about-hr",
    pageId: "about",
    key: "4",
    label: "ABOUT - ORGANIZATION AND MANAGEMENT",
    scrollTargetSelector: "#about-team",
    visualKind: "teamRow",
    visualPlacement: "inlineAfterIntro",
    visualData: {
      roles: [
        { tag: "CEO", label: "Strategy" },
        { tag: "CTO", label: "Tech & product" },
        { tag: "CMO", label: "Marketing" },
        { tag: "CFO", label: "Finance" },
        { tag: "CIO", label: "Experience" }
      ],
      futureNote: "Future: 15+ team, legal & security"
    },
    pages: [
      {
        id: "about-hr-1",
        heading: "Lean founding team and flexible structure",
        intro: "This slide shows how roles are divided to keep PrePair efficient, low cost and ready to grow.",
        bullets: [
          "PrePair uses a simple, flexible structure as a small, early-stage digital startup.",
          "Roles are divided by strengths to keep everything efficient and low cost.",
          "**CEO (Daniel)**: makes strategic decisions and represents PrePair publicly.",
          "**CTO (Shota)**: oversees website development, technology maintenance and security.",
          "**CMO (Seanna)**: manages marketing, communication and outreach to both students and businesses.",
          "**CFO (Faye)**: handles budgeting, payroll planning and cash flow forecasting.",
          "**CIO (Mia)**: focuses on customer experience, quality control and platform improvement.",
          "Founders earn modest stipends to keep payroll low; part-time help is hired only when needed.",
          "Quality control is supported through verified student profiles, reviewed business postings and post-project surveys.",
          "As PrePair scales, the plan is to grow to 15 plus employees and add legal advisors, cybersecurity experts and additional developers."
        ],
        visualHint: "Use the background team masthead as the main visual; the slide itself can stay mostly textual."
      }
    ]
  },

  // About - ESG
  {
    id: "about-esg",
    pageId: "about",
    key: "5",
    label: "ABOUT - ESG",
    scrollTargetSelector: "#about-esg",
    visualKind: "esgPillars",
    visualPlacement: "inlineAfterIntro",
    visualData: {
      items: [
        { letter: "E", title: "Environmental", note: "Fully digital, low travel" },
        { letter: "S", title: "Social", note: "Access & equity for students" },
        { letter: "G", title: "Governance", note: "Clear roles & data protection" }
      ]
    },
    pages: [
      {
        id: "about-esg-1",
        heading: "ESG - Environmental, Social and Governance",
        intro: "This slide highlights how PrePair operates responsibly as a fully digital, socially focused platform.",
        bullets: [
          "**Environmental**: PrePair is fully digital, which reduces paper use and cuts down on unnecessary in-person trips.",
          "**Social**: the very low cost model, with students paying around $1 to $3 per month, keeps the platform accessible to all students, including international students and those with limited resources.",
          "Mentorship-style projects give students practical experience without long unpaid internships, while local businesses receive support without overspending.",
          "**Governance**: roles are clearly defined so that students act as **Participants**, businesses act as **Hosts** and PrePair acts as the **Facilitator**.",
          "We protect user data and uphold strict privacy standards.",
          "By operating transparently and inclusively, PrePair contributes to broader goals around inclusive growth and equal opportunity."
        ],
        visualHint: "Optional: a simple three column layout inside the slide labeled Environmental, Social, Governance with one key point under each."
      }
    ]
  },

  // For Students page slide
  {
    id: "students-marketing",
    pageId: "students",
    key: "1",
    label: "FOR STUDENTS - MARKETING AND JOURNEY",
    scrollTargetSelector: "#students-hero",
    pages: [
      {
        id: "students-marketing-1",
        heading: "From the student point of view",
        intro: "This slide explains how PrePair reaches students and what the experience feels like from their side.",
        bullets: [
          "PrePair bridges the gap between students who need experience and local businesses that need support.",
          "**Target students**: college students in New York City, especially ages 18 to 24 at Fordham and similar campuses.",
          "Students use PrePair to gain career exposure, build their resumes and test interests through short projects.",
          "**Marketing channels**: classroom visits, partnerships with student groups, collaboration with career offices and presence at campus events.",
          "Once on the platform, students see real project examples and can browse opportunities that match their interests and schedule.",
          "**Retention** is supported through onboarding, real project examples, reviews and referral rewards, along with feedback loops and follow-up sessions.",
          "These pieces together create a shared space where students can build skills before internships while still staying inside an educational frame."
        ],
        visualHint: "The page itself is the main visual; the slide text can stay clean."
      }
    ]
  },

  // For Businesses page slide
  {
    id: "businesses-marketing",
    pageId: "businesses",
    key: "1",
    label: "FOR BUSINESSES - MARKETING AND 4PS",
    scrollTargetSelector: "#businesses-hero",
    visualKind: "fourPs",
    visualPlacement: "inlineAfterIntro",
    visualData: {
      product: "Student project work",
      price: "$2 students / $20 businesses",
      place: "Online, local focus",
      promotion: "Testimonials & referrals"
    },
    pages: [
      {
        id: "businesses-marketing-1",
        heading: "From the small business point of view",
        intro: "This slide shows how PrePair presents itself to local businesses and how the classic 4Ps apply.",
        bullets: [
          "**4Ps of marketing**",
          "**Product**: relevant and easy",
          "**Price**: affordable, low subscription costs",
          "**Place**: online, accessible, communication (w/ app development in the future)",
          "**Promotion**: both digital (social media) and face-to-face",
          "**Students**: direct email outreach, classroom/lecture hall visits, in-person campus activities and collaboration",
          "Content created by students, including project highlights, tool walkthroughs, or personal achievements, adding authenticity",
          "**Small businesses**: local trade associations, commercial districts, community boards, and small-business support centers",
          "Increase visibility and keep existing users engaged, while blending community presence"
        ],
        visualHint: "Optional: a compact 4P mini grid inside the slide with Product, Price, Place, Promotion labels."
      }
    ]
  },

  // App - Operations and legal micro demo
  {
    id: "app-operations",
    pageId: "app",
    key: "1",
    label: "APP - OPERATIONS AND LEGAL STRUCTURE",
    scrollTargetSelector: "#app-signup",
    pages: [
      {
        id: "app-operations-1",
        heading: "How PrePair operates day to day",
        intro: "This page explains how the platform runs and how we structure things legally to protect everyone.",
        bullets: [
          "The platform is developed in-house by the CTO and internal staff.",
          "PrePair operates as a remote-first digital platform with no physical inventory.",
          "All data is stored on secure cloud servers.",
          "The initial hub is based at Fordham University while the platform is in early stages.",
          "PrePair uses an LLC or similar limited-liability structure to protect founders and manage contractual relationships with students and businesses.",
          "The legal structure supports compliance with data security standards and labor guidelines.",
          
        ],
        visualHint: "Text only on this page; the next page of the slide will hold the visual agreement preview."
      },
      {
        id: "app-operations-2",
        heading: "Sample agreement structure",
        intro: "This page gives a simple visual of how the Participant, Host and Facilitator roles are defined in a project agreement.",
        bullets: [
          "**Participant**: the student who completes the project as a learning experience.",
          "**Host**: the small business or organization that defines the project and mentors the student.",
          "**Facilitator**: PrePair, which provides the platform, structure and support.",
          "Each side understands their responsibilities before a project starts.",
          "The agreement emphasizes that projects are educational externships and not a substitute for paid employment."
        ],
        visualHint: "Important: include a card-like visual of a short sample agreement inside the slide, with three labeled sections (Participant, Host, Facilitator) and placeholder signature lines. This should look like a stylized document, not a full legal text."
      }
    ]
  },

  // App - Financials
  {
    id: "app-financials",
    pageId: "app",
    key: "2",
    label: "APP - FINANCIAL PROJECTIONS",
    scrollTargetSelector: "#app-dashboard",
    visualKind: "financialSummary",
    visualPlacement: "inlineAfterIntro",
    visualData: {
      initialInvestment: "$100,000",
      monthlyCosts: "$3.4k–$4.3k",
      mrrQ1: "$5,000 MRR by Q1 end",
      breakEven: "Break-even ≈ month 5",
      yearEndCash: "$188,750 projected cash"
    },
    pages: [
      {
        id: "app-financials-1",
        heading: "Financial projections and break-even",
        intro: "This slide summarizes PrePair's startup costs, operating costs and revenue path.",
        bullets: [
          "PrePair launched with a **$100,000** owner investment.",
          "Because the platform is remote-first, there are no rent costs for office space.",
          "Monthly operating costs range from about **$3,400 to $4,300**, driven mainly by modest founder stipends, part-time developer support and software subscriptions.",
          "Startup costs total about **$8,650**, mainly technology build, LLC setup, branding, software upgrades and launch marketing.",
          "With subscriptions at **$2 per student** and **$20 per business**, early projections estimate about **$5,000** in monthly revenue by the end of the first quarter based on Fordham outreach.",
          "PrePair reaches **break-even in the fifth month**, once recurring revenue surpasses monthly costs.",
          "By the end of the first fiscal year, the projected cash balance is around **$188,750**, creating a strong base for expansion."
        ],
        visualHint: "Optional: a minimal bar or line graphic hinting at costs vs revenue over time inside the slide; this can be done with simple CSS, no complex chart library needed."
      }
    ]
  }
];

// Make available globally for static HTML environment
if (typeof window !== 'undefined') {
  window.presentationSlides = presentationSlides;
}

// Also support module exports if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = presentationSlides;
}