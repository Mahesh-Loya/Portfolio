/**
 * Single source of truth for site content.
 * Every fact here comes from the resume — nothing is invented.
 */

export const profile = {
  name: "Mahesh Loya",
  role: "Full-stack & AI engineer",
  thesis: "I make noisy reality machine-readable.",
  /** Plain language, for someone deciding whether to hire. The thesis supports this, not the reverse. */
  pitch:
    "I build AI products that businesses actually use — WhatsApp assistants that handle voice notes and photos, voice agents that answer the phone, and search over your own data.",
  /** Surfaced in the hero so a recruiter sees the stack without scrolling. */
  heroStack: [
    "TypeScript",
    "Python",
    "React",
    "Next.js",
    "FastAPI",
    "PostgreSQL",
    "pgvector",
    "AWS",
  ],
  location: "Pune, India",
  email: "loyamahesh3@gmail.com",
  phone: "7620851007",
  github: "https://github.com/Mahesh-Loya",
  githubHandle: "Mahesh-Loya",
  linkedin: "https://www.linkedin.com/in/maheshloya",
  /** Derived label, so the visible handle can never drift from the href again. */
  linkedinHandle: "in/maheshloya",
  resumeUrl: "/mahesh-loya-resume.pdf",
  summary:
    "Final-year B.E. Information Technology student building AI-native software with real-world impact — owning products end to end, from architecture and data modelling through deployment and the iteration after launch.",
  status: {
    label: "Building Vyavsay Assist",
    detail: "Freelance · shipping weekly to a live dealership",
  },
} as const;

export type SignalPair = { noisy: string; structured: string };

/** The concept, stated as data: messy input on the left, structured action on the right. */
export const signalPairs: SignalPair[] = [
  { noisy: "A Hinglish voice note at 11pm", structured: "A booked test drive" },
  { noisy: "A customer's blurry car photo", structured: "Make, model, variant" },
  { noisy: "A phone call in Marathi", structured: "A qualified lead" },
  { noisy: "A paper queue of donor forms", structured: "A status workflow" },
];

export type CaseStudy = {
  slug: string;
  title: string;
  kicker: string;
  period: string;
  role: string;
  context: string;
  /** The single sentence that makes the work matter. */
  premise: string;
  stack: string[];
  metrics: { value: string; label: string }[];
  /** Ordered pipeline stages, rendered as the steppable architecture diagram. */
  pipeline: {
    id: string;
    label: string;
    detail: string;
    tech: string;
  }[];
  /** The engineering decisions worth reading. */
  decisions: {
    title: string;
    problem: string;
    solution: string;
    insight: string;
  }[];
  /** Only set these when the link has been checked — a dead link costs more than none. */
  live?: string;
  repo?: string;
  /** A real screenshot of the shipped product. Proof beats description. */
  shot?: { src: string; alt: string };
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "vyavsay-assist",
    shot: {
      src: "/shots/vyavsay-desktop.jpg",
      alt: "The VyavsayAssist product page, showing a WhatsApp conversation in Hinglish where a customer asks a car's price and the assistant books a test drive.",
    },
    live: "https://vyavsayassist.app",
    repo: "https://github.com/Mahesh-Loya/Vyavsay_Assist",
    title: "Vyavsay Assist",
    kicker: "An AI sales copilot in daily use at a car dealership",
    period: "Feb 2026 — Present",
    role: "Freelance software developer · Girija Motors, Pune",
    context:
      "On-site discovery at the dealership showed high-intent leads were being lost to after-hours WhatsApp enquiries that nobody answered. A buyer messages at 11pm, gets nothing back, and buys elsewhere by morning.",
    premise:
      "Customers don't send clean queries. They send voice notes in Hinglish and photos of cars they saw on the road. The system has to meet them there.",
    stack: [
      "TypeScript",
      "Fastify",
      "PostgreSQL",
      "pgvector",
      "GPT-4o Vision",
      "Whisper",
      "React",
      "Vite",
      "AWS EC2",
      "Docker",
      "Nginx",
    ],
    metrics: [
      { value: "1st", label: "MVPM Hackathon 2026" },
      { value: "₹1,00,000", label: "Prize won" },
      { value: "1536-dim", label: "HNSW-indexed embeddings" },
      { value: "Daily", label: "In production use" },
    ],
    pipeline: [
      {
        id: "in",
        label: "Multimodal intake",
        detail:
          "Text, Hindi/Hinglish voice notes and customer-sent car photos all enter one conversational pipeline rather than three separate flows.",
        tech: "WhatsApp · Fastify",
      },
      {
        id: "asr",
        label: "Speech to text",
        detail:
          "Whisper transcribes voice notes, including code-mixed Hindi and English in the same utterance.",
        tech: "Whisper",
      },
      {
        id: "vision",
        label: "Vision",
        detail:
          "GPT-4o Vision identifies make and model from a photo the customer took themselves — often at an angle, often in poor light.",
        tech: "GPT-4o Vision",
      },
      {
        id: "retrieve",
        label: "Hybrid retrieval",
        detail:
          "Semantic search over live dealer inventory fused with SQL filters, so numeric constraints are enforced exactly rather than approximated.",
        tech: "pgvector · HNSW",
      },
      {
        id: "tools",
        label: "Tool calling",
        detail:
          "Inventory search, appointment booking and human escalation are exposed as tools the model can invoke.",
        tech: "Function calling",
      },
      {
        id: "crm",
        label: "Dealer CRM",
        detail:
          "A dashboard where the sales team sees every conversation, takes over any thread, and tracks what converted.",
        tech: "React · Vite",
      },
    ],
    decisions: [
      {
        title: "Exact constraints, not approximate ones",
        problem:
          "Pure vector search treats “under 6 lakh” as a direction, not a boundary. It will happily return a ₹6.4L car because the sentence embedding is close. For a price ceiling, close is wrong.",
        solution:
          "Semantic search narrows to candidates by meaning; a SQL WHERE clause then enforces price and year as hard predicates. The two run fused, not sequentially bolted together.",
        insight:
          "Embeddings are good at what a customer means and bad at what they require. Numbers belong in the database, not the latent space.",
      },
      {
        title: "One pipeline, three modalities",
        problem:
          "The obvious build is three handlers — one for text, one for audio, one for images — each with its own prompt and its own idea of conversation state.",
        solution:
          "Every modality normalises to a single message representation before it reaches the model, so context is continuous when a customer sends a photo and then asks about it in a voice note.",
        insight:
          "Modality is an input detail. Treating it as an architectural boundary fragments the conversation the user is actually having.",
      },
    ],
  },
  {
    slug: "voice-ai-receptionist",
    title: "Voice AI Receptionist",
    kicker: "A real-time multilingual voice pipeline for missed calls",
    period: "2025 — 2026",
    role: "Built the real-time pipeline",
    context:
      "Small businesses lose inbound enquiries to calls nobody answers, and a missed call leaves no record behind — no name, no number, no idea what the caller wanted.",
    premise:
      "Real-time voice is unforgiving. Every architectural mistake shows up as an awkward pause the caller can hear.",
    stack: [
      "Python",
      "FastAPI",
      "WebSockets",
      "PostgreSQL",
      "SQLAlchemy",
      "Alembic",
      "Redis",
      "Docker",
    ],
    metrics: [
      { value: "3", label: "Languages qualified" },
      { value: "7-table", label: "Tenant-scoped schema" },
      { value: "12", label: "Recorded test fixtures" },
      { value: "0", label: "Telephony accounts needed to test" },
    ],
    pipeline: [
      {
        id: "vad",
        label: "Voice activity detection",
        detail:
          "Decides when the caller is actually speaking, so the system isn't transcribing silence or line noise.",
        tech: "VAD",
      },
      {
        id: "stt",
        label: "Speech to text",
        detail:
          "Streaming transcription in Hindi, Marathi and English — callers switch between them mid-sentence.",
        tech: "STT",
      },
      {
        id: "llm",
        label: "Qualification",
        detail:
          "An LLM qualifies the caller against tenant-specific criteria and decides what to ask next.",
        tech: "LLM",
      },
      {
        id: "tts",
        label: "Speech synthesis",
        detail: "The reply is synthesised and streamed back while it is still being generated.",
        tech: "TTS",
      },
      {
        id: "bridge",
        label: "Media bridge",
        detail:
          "A FastAPI service bridges carrier audio and the pipeline over WebSockets, in both directions, continuously.",
        tech: "FastAPI · WebSockets",
      },
    ],
    decisions: [
      {
        title: "Barge-in: the bug was downstream of where it looked",
        problem:
          "When a caller interrupted, the bot kept talking over them. The obvious fix — halt generation — didn't work, and it wasn't obvious why.",
        solution:
          "Halting generation stops new audio being produced but leaves the playout buffer still draining whatever was already queued. The fix was an explicit clear control frame that flushes the buffer, not just the generator.",
        insight:
          "In a streaming pipeline, stopping production is not the same as stopping output. The queue between them is a component, and it has its own state.",
      },
      {
        title: "A cache TTL as a correctness control",
        problem:
          "A DID→tenant cache is normally a performance optimisation. But phone numbers get reassigned between tenants, and a stale entry means one business's calls routed to another's receptionist.",
        solution:
          "The TTL was made mandatory and bounded, so a reassigned number can never keep routing to its previous tenant for longer than the bound.",
        insight:
          "Some caches are load-bearing for correctness, not speed. Those deserve a stated bound and a reason, not a default.",
      },
      {
        title: "Testing telephony without telephony",
        problem:
          "Validating real-time voice behaviour normally means a carrier account, real phone numbers, and slow manual calls for every change.",
        solution:
          "A mock-carrier harness replays 12 recorded fixtures through the real pipeline, so interruption and language-switching cases are verified deterministically in CI.",
        insight:
          "If a behaviour can only be tested by hand, it will stop being tested. Recording the hard cases once buys every future change.",
      },
    ],
  },
  {
    slug: "blood-donation-drive",
    shot: {
      src: "/shots/bdd-desktop.jpg",
      alt: "The live blood donation platform, showing per-year donor totals and a live blood-group inventory broken down by group.",
    },
    live: "https://bdd.pictoreal.in",
    title: "Blood Donation Drive Management System",
    kicker: "Paper queues replaced by a workflow, live at PICT",
    period: "2025",
    role: "Full-stack developer",
    context:
      "PICT's blood donation drives ran on paper. Donors queued to fill forms by hand, and organisers tracked turnout on printed sheets with no way to see the day as it happened.",
    premise:
      "Digitising a process is only worth it if you model the process, not just the form.",
    stack: ["React", "Node.js", "Express", "MongoDB", "Passport.js"],
    metrics: [
      { value: "231+", label: "Donor registrations processed" },
      { value: "Live", label: "On the Pictoreal domain" },
      { value: "Hours → 1", label: "Coordination to one dashboard" },
    ],
    pipeline: [
      {
        id: "signup",
        label: "Online sign-up",
        detail: "Donors register before the drive instead of queueing to fill a form on the day.",
        tech: "React",
      },
      {
        id: "auth",
        label: "Session auth",
        detail:
          "Passport.js local strategy with salted password hashing and sessions persisted in MongoDB.",
        tech: "Passport.js",
      },
      {
        id: "screen",
        label: "Eligibility screening",
        detail:
          "Age and weight validated server-side, so the rules can't be bypassed from the client.",
        tech: "Express",
      },
      {
        id: "workflow",
        label: "Status workflow",
        detail:
          "The donor schema is modelled around pending → approved → completed/rejected, with a timestamp recorded per transition.",
        tech: "MongoDB",
      },
      {
        id: "report",
        label: "Reporting",
        detail:
          "Aggregation pipelines ($match + $group) give organisers turnout and blood-group breakdowns as the drive runs.",
        tech: "Aggregation",
      },
    ],
    decisions: [
      {
        title: "The schema is the workflow",
        problem:
          "The naive model is a donor record with an “approved” boolean — which loses when the state changed, who moved it, and every state that isn't binary.",
        solution:
          "Donors were modelled around an explicit status workflow with a timestamp per transition, making the drive's history queryable rather than inferred.",
        insight:
          "A boolean is a state machine that has forgotten it has states. Write the states down and the reporting comes free.",
      },
      {
        title: "Validation belongs on the server",
        problem:
          "Eligibility rules are easiest to enforce in the form, where you can show the error instantly.",
        solution:
          "Age and weight checks run server-side as the authority, with the client validation existing only for feedback.",
        insight:
          "Client-side validation is a courtesy to the user. Server-side validation is the actual rule.",
      },
    ],
  },
];

export const skills = [
  { group: "Languages", items: ["C++", "JavaScript", "TypeScript", "Python", "SQL"] },
  { group: "Frontend", items: ["React", "Next.js", "HTML/CSS"] },
  {
    group: "Backend",
    items: ["FastAPI", "Node.js", "Fastify", "Express", "REST", "WebSockets", "SQLAlchemy", "Alembic"],
  },
  { group: "Databases", items: ["PostgreSQL", "pgvector", "MongoDB", "Redis"] },
  {
    group: "AI / LLM",
    items: [
      "GPT-4o",
      "Claude",
      "Gemini",
      "RAG",
      "Vector search",
      "Embeddings",
      "Prompt & context engineering",
      "Agentic tool use",
    ],
  },
  { group: "Cloud", items: ["AWS", "Docker", "Nginx", "Linux", "Git", "CI/CD"] },
];

export const education = [
  {
    institution: "Pune Institute of Computer Technology",
    credential: "B.E. Information Technology",
    detail: "CGPA 8.66 / 10",
    period: "Nov 2023 — May 2027",
    coursework:
      "Data Structures & Algorithms, DBMS, Operating Systems, Computer Networks, OOP",
  },
];

export type Achievement = {
  title: string;
  detail: string;
  /** The headline number, when the result has one worth setting in type. */
  figure?: string;
  weight: "major" | "minor";
};

export const achievements: Achievement[] = [
  {
    title: "Winner — MVPM Hackathon 2026",
    detail: "First prize for Vyavsay Assist, an AI WhatsApp sales copilot for Indian SMBs.",
    figure: "₹1,00,000",
    weight: "major",
  },
  {
    title: "Best Event Coordinator — Pictofest 2025",
    detail: "Awarded for directing the festival's event operations.",
    weight: "minor",
  },
  {
    title: "Competitive programming",
    detail: "2-Star on CodeChef · 100+ DSA problems solved on LeetCode.",
    weight: "minor",
  },
];

export const leadership = [
  {
    role: "Overall Event Coordinator",
    org: "Pictofest, PICT Pune",
    period: "Oct 2024 — Feb 2025",
    detail:
      "Directed 500+ volunteers across 20+ events for 2,000+ attendees from 22+ colleges, and secured ₹1,00,000 in sponsorships.",
  },
  {
    role: "Photography Team Head",
    org: "Pictoreal, PICT Pune",
    period: "Jul 2025 — Present",
    detail: "Lead the media team and mentor junior photographers.",
  },
];

export type BuildLogEntry = {
  name: string;
  blurb: string;
  tech: string[];
  repo?: string;
  live?: string;
  shot?: { src: string; alt: string };
  /** Explicit bento width on a 6-column grid, so reading order is never a side effect of layout. */
  span?: 2 | 3 | 4 | 6;
};

/**
 * Selected work beyond the three case studies. Curated rather than a dump of
 * every repository — and every blurb is drawn from the project's own README,
 * never invented.
 */
export const buildLog: BuildLogEntry[] = [
  {
    name: "YojnaMitra",
    blurb:
      "Government agricultural schemes are hard to find and harder to qualify for. This answers eight questions over WhatsApp — state, occupation, land ownership, age, category and more — and returns the schemes a farmer is actually eligible for, rather than a list they have to filter themselves. Built with a team of four.",
    tech: ["TypeScript", "WhatsApp", "Twilio", "React", "Node.js"],
    repo: "https://github.com/ManasYeola/YojnaMitra",
    live: "https://yojnamitra-lac.vercel.app",
    shot: {
      src: "/shots/yojnamitra-desktop.jpg",
      alt: "The YojnaMitra landing page, explaining that answering eight questions on WhatsApp returns a personalised list of agricultural schemes.",
    },
    span: 4,
  },
  {
    name: "Anvesha",
    blurb:
      "An interactive descent through Pictoreal Volume 28 — the college magazine rebuilt as something you play rather than scroll. Shipped for the media team I lead.",
    tech: ["JavaScript", "Interactive"],
    repo: "https://github.com/Mahesh-Loya/anvesha-pictoreal",
    live: "https://vol283d.pictoreal.in",
    shot: {
      src: "/shots/anvesha-desktop.jpg",
      alt: "The Anvesha title screen, inviting the visitor to press Space to begin.",
    },
    span: 2,
  },
  {
    name: "BA Support Agent",
    blurb:
      "Given an inbound customer tweet, it classifies intent, drafts a reply grounded in how the airline actually resolved similar issues before, and then decides whether that reply is safe to send automatically or belongs with a human — stating its reason either way. Built on ~3M tweets from the Kaggle customer-support dataset.",
    tech: ["Python", "LLM", "RAG", "Classification"],
    repo: "https://github.com/Mahesh-Loya/ba-support-agent",
    span: 6,
  },
];

/** Smaller repositories, listed as facts only — no invented descriptions. */
export const alsoOnGithub: { name: string; language: string; repo: string }[] = [
  {
    name: "invoice_extractor",
    language: "Python",
    repo: "https://github.com/Mahesh-Loya/invoice_extractor",
  },
  {
    name: "job-critique",
    language: "Python",
    repo: "https://github.com/Mahesh-Loya/job-critique",
  },
  {
    name: "Hostel-Finder",
    language: "JavaScript",
    repo: "https://github.com/Mahesh-Loya/Hostel-Finder",
  },
  {
    name: "Lab_Management_System",
    language: "JavaScript",
    repo: "https://github.com/Mahesh-Loya/Lab_Management_System",
  },
];


/** Hard numbers, scannable in three seconds. Every one is verifiable on this site. */
export const proofPoints: { value: string; label: string; note: string }[] = [
  { value: "₹1,00,000", label: "1st prize", note: "MVPM Hackathon 2026" },
  { value: "Daily", label: "In production", note: "At a Pune dealership" },
  { value: "231+", label: "Registrations processed", note: "Blood donation platform" },
  { value: "3", label: "Languages handled", note: "Hindi · Marathi · English" },
];

export type Offer = {
  title: string;
  /** Written for the person deciding, not for a peer reviewing architecture. */
  blurb: string;
  tech: string[];
  proofLabel: string;
  proofHref: string;
};

/** What someone can actually hire him to build, each backed by something on this site. */
export const offers: Offer[] = [
  {
    title: "AI assistants that handle real customer messages",
    blurb:
      "Customers don't write clean queries. They send voice notes in Hinglish, photos of what they saw, and half a question at midnight. I build assistants that understand all of it and take the next action — answer, book, or hand over to a human.",
    tech: ["GPT-4o", "Whisper", "WhatsApp API", "TypeScript", "Fastify"],
    proofLabel: "See Vyavsay Assist",
    proofHref: "/work/vyavsay-assist",
  },
  {
    title: "Voice agents that answer the phone",
    blurb:
      "A missed call leaves no record of who wanted what. I build real-time voice agents that pick up, qualify the caller in their own language, and leave you a written lead — including handling the caller interrupting mid-sentence.",
    tech: ["Python", "FastAPI", "WebSockets", "Redis", "STT/TTS"],
    proofLabel: "See the voice pipeline",
    proofHref: "/work/voice-ai-receptionist",
  },
  {
    title: "Search over your own data",
    blurb:
      "Semantic search alone will happily return a ₹6.4 lakh car when someone asked for under ₹6 lakh. I build retrieval that understands what someone means while enforcing what they require — exactly, in the database.",
    tech: ["pgvector", "HNSW", "Embeddings", "PostgreSQL", "RAG"],
    proofLabel: "Try it running",
    proofHref: "/#demo",
  },
  {
    title: "Full products, end to end",
    blurb:
      "Schema and data modelling through API, interface, deployment and the iteration after launch. I've taken a paper process to a live platform in daily use, and I stay with it once real people depend on it.",
    tech: ["React", "Node.js", "MongoDB", "Docker", "Nginx", "AWS"],
    proofLabel: "See the platform",
    proofHref: "/work/blood-donation-drive",
  },
];
