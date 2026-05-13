export type ModuleFeature = {
  number: string;
  title: string;
  description?: string;
  bullets?: string[];
  badge?: string;
  resourceHref?: string;
  resourceLinks?: {
    label: string;
    href: string;
  }[];
};

export type ModuleItem = {
  slug: string;
  title: string;
  description: string;
  price: string;
  features: ModuleFeature[]; // ✅ 新增
};

export type SubjectItem = {
  slug: string;
  code: string;
  name: string;
  description: string;
  modules: ModuleItem[];
};

export const subjects: SubjectItem[] = [
  {
    slug: "hubs191",
    code: "HUBS191",
    name: "Human Body Systems",
    description:
      "Revision resources organised by module to help students understand systems clearly and write stronger exam answers.",
    modules: [
      {
        slug: "tissues-and-movement",
        title: "Tissues and Movement",
        description:
          "Foundational concepts, tissue structure, and movement-related principles explained in a clearer, exam-focused way.",
        price: "$8 NZD",
        features: [
          {
            number: "01",
            title: "Notes",
            bullets: ["Extensive lecture notes", "Common mistakes"],
            resourceLinks: [
              {
                label: "Open notes",
                href: "/materials/hubs191/tissues-and-movement/module-1-notes.pdf",
              },
            ],
          },
          {
            number: "02",
            title: "80 Practice Questions",
            description: "Word-based revision questions",
            badge: "80",
            resourceLinks: [
              {
                label: "Open 80 practice questions",
                href: "/materials/hubs191/tissues-and-movement/module-1-learning-questions.pdf",
              },
            ],
          },
        ],
      },
      {
        slug: "musculoskeletal",
        title: "Musculoskeletal",
        description:
          "Core musculoskeletal concepts, worked explanations, and structured exam-answer support.",
        price: "$12 NZD",
        features: [
          {
            number: "01",
            title: "Notes",
            bullets: ["Extensive lecture notes", "Common mistakes"],
            resourceLinks: [
              {
                label: "Open notes",
                href: "/materials/hubs191/musculoskeletal/module-2-notes.pdf",
              },
            ],
          },
          {
            number: "02",
            title: "Model Answers",
            description: "5 major exam-style questions",
            badge: "5",
            resourceLinks: [
              {
                label: "Open model answers",
                href: "/materials/hubs191/musculoskeletal/module-2-exam-style-write-up.pdf",
              },
            ],
          },
          {
            number: "03",
            title: "Mind Map",
            description: "Full mindmap of lecture content",
            badge: "ONLINE",
            resourceLinks: [
              {
                label: "Open mind map",
                href: "/hubs191/musculoskeletal/mind-map",
              },
            ],
          },
        ],
      },
      {
        slug: "bio-statistics",
        title: "Bio-statistics",
        description:
          "Biostatistics support tailored to HSFY students who want more confidence with interpretation and application.",
        price: "$10 NZD",
        features: [
          {
            number: "01",
            title: "Notes",
            description:
              "Extensive notes from Lecture 12 - 15, explaining everything in full details",
            badge: "12-15",
            resourceLinks: [
              {
                label: "Open notes",
                href: "/materials/hubs191/bio-statistics/module-3-notes.pdf",
              },
            ],
          },
          {
            number: "02",
            title: "Common mistakes",
            description:
              "Identify common mistakes students have when doing biostatistics",
            badge: "12-15",
            resourceLinks: [
              {
                label: "Open common mistakes",
                href: "/materials/hubs191/bio-statistics/module-3-common-mistakes.pdf",
              },
            ],
          },
        ],
      },
      {
        slug: "nervous-system",
        title: "Nervous System",
        description:
          "High-yield support for neural signalling, system organisation, and the wording students need to explain it well.",
        price: "$15 NZD",
        features: [
          {
            number: "01",
            title: "Notes",
            bullets: ["High-yield summaries", "Common mistakes"],
            badge: "16-24",
            resourceLinks: [
              {
                label: "Open notes",
                href: "/materials/hubs191/nervous-system/module-4-notes.pdf",
              },
            ],
          },
          {
            number: "02",
            title: "Model Answers",
            description:
              "Exam-style structured responses - 5 major groups of questions",
            badge: "05",
            resourceLinks: [
              {
                label: "Open write-up",
                href: "/materials/hubs191/nervous-system/module-4-exam-style-write-up.pdf",
              },
            ],
          },
          {
            number: "03",
            title: "Mind Map",
            description: "Two Full mindmaps of lecture content",
            badge: "ONLINE",
            resourceLinks: [
              {
                label: "Open mind map",
                href: "/hubs191/nervous-system/mind-map",
              },
            ],
          },
        ],
      },
      {
        slug: "endocrine-system",
        title: "Endocrine System",
        description:
          "Hormonal signalling, regulation, and endocrine integration broken down for faster revision and clearer answers.",
        price: "$15 NZD",
        features: [
          {
            number: "01",
            title: "Notes",
            bullets: ["Concise summaries", "Common pitfalls"],
            resourceLinks: [
              {
                label: "Open notes",
                href: "/materials/hubs191/endocrine-system/module-5-notes.pdf",
              },
            ],
          },
          {
            number: "02",
            title: "Model Answers",
            description: "Core endocrine exam questions - long answers",
            resourceLinks: [
              {
                label: "Open write-up",
                href: "/materials/hubs191/endocrine-system/module-5-exam-style-write-up.pdf",
              },
            ],
          },
          {
            number: "03",
            title: "Table",
            description:
              "Extensive hormone table, outlining all information you need to know",
            badge: "FULL LIST",
            resourceLinks: [
              {
                label: "Open hormone table",
                href: "/materials/hubs191/endocrine-system/module-5-hormone-table.pdf",
              },
            ],
          },
          {
            number: "04",
            title: "Mind Map",
            description: "Full mindmap of lecture content",
            badge: "ONLINE",
            resourceLinks: [
              {
                label: "Open mind map",
                href: "/hubs191/endocrine-system/mind-map",
              },
            ],
          },
        ],
      },
      {
        slug: "immune-system",
        title: "Immune System",
        description:
          "Immune defences and key barrier concepts organised for clearer exam answers.",
        price: "$12 NZD",
        features: [
          {
            number: "01",
            title: "Notes",
            bullets: ["Structured summaries", "Common mistakes"],
            badge: "30-38",
            resourceLinks: [
              {
                label: "Open notes",
                href: "/materials/hubs191/immune-system/module-6-notes.pdf",
              },
            ],
          },
          {
            number: "02",
            title: "Model Answers",
            description: "Immune system exam responses - FULL ESSAY",
            badge: "30-38",
            resourceLinks: [
              {
                label: "Open write-up",
                href: "/materials/hubs191/immune-system/module-6-exam-style-write-up.pdf",
              },
            ],
          },
          {
            number: "03",
            title: "Mind Map",
            description: "Three full mindmaps of lecture content",
            badge: "ONLINE",
            resourceLinks: [
              {
                label: "Open mind map",
                href: "/hubs191/immune-system/mind-map",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "cels191",
    code: "CELS191",
    name: "Cells and Molecular Biology",
    description:
      "Structured revision support for molecular biology concepts, biological processes, and exam-focused explanation.",
    modules: [
      {
        slug: "Cell Structure & Diversity",
        title: "Cell Structure & Diversity",
        description:
          "Cell architecture, membranes, organelles, and the diversity of prokaryotic and eukaryotic life.",
        price: "$15 NZD",
        features: [
          {
            number: "01",
            title: "Notes",
            bullets: ["Structured summaries", "Common mistakes"],
            badge: "01-09",
            resourceLinks: [
              {
                href: "/materials/cels191/cell-structure-and-diversity/module-1-notes.pdf",
                label: "Open notes",
              },
            ],
          },
          {
            number: "02",
            title: "Model Answers",
            description:
              "Word-based revision questions and model-answer support for stronger written responses",
            badge: "01-09",
            resourceLinks: [
              {
                href: "/materials/cels191/cell-structure-and-diversity/module-1-learning-questions.pdf",
                label: "Open model answers",
              },
            ],
          },
          {
            number: "03",
            title: "Mind Map",
            description: "Full mindmap of lecture content",
            badge: "ONLINE",
            resourceLinks: [
              {
                href: "/cels191/Cell%20Structure%20%26%20Diversity/mind-map",
                label: "Open mind map",
              },
            ],
          },
        ],
      },
      {
        slug: "Molecular Biology & Genetics",
        title: "Molecular Biology & Genetics",
        description:
          "DNA, gene expression, inheritance, and the molecular tools used to study genetic information.",
        price: "$15 NZD",
        features: [
          {
            number: "01",
            title: "Notes",
            bullets: ["Structured summaries", "Common mistakes"],
            badge: "10-21",
            resourceLinks: [
              {
                href: "/materials/cels191/molecular-biology-and-genetics/module-2-notes.pdf",
                label: "Open notes",
              },
            ],
          },
          {
            number: "02",
            title: "Model Answers",
            description:
              "Word-based revision questions and model-answer support for stronger written responses",
            badge: "10-21",
            resourceLinks: [
              {
                href: "/materials/cels191/molecular-biology-and-genetics/module-2-learning-questions.pdf",
                label: "Open model answers",
              },
            ],
          },
          {
            number: "03",
            title: "Mind Map",
            description: "Two full mindmaps of lecture content",
            badge: "ONLINE",
            resourceLinks: [
              {
                href: "/cels191/Molecular%20Biology%20%26%20Genetics/mind-map",
                label: "Open mind map",
              },
            ],
          },
        ],
      },
      {
        slug: "Human Molecular Genetics",
        title: "Human Molecular Genetics",
        description:
          "Human genetic variation, mutation, inheritance patterns, and the molecular basis of disease.",
        price: "$15 NZD",
        features: [
          {
            number: "01",
            title: "Notes",
            bullets: ["Structured summaries", "Common mistakes"],
            badge: "22-27",
            resourceLinks: [
              {
                href: "/materials/cels191/human-molecular-genetics/module-3-notes.pdf",
                label: "Open notes",
              },
            ],
          },
          {
            number: "02",
            title: "Model Answers",
            description:
              "Word-based revision questions and model-answer support for stronger written responses",
            badge: "22-27",
            resourceLinks: [
              {
                href: "/materials/cels191/human-molecular-genetics/module-3-learning-questions.pdf",
                label: "Open model answers",
              },
            ],
          },
          {
            number: "03",
            title: "Mind Map",
            description: "Full mindmap of lecture content",
            badge: "ONLINE",
            resourceLinks: [
              {
                href: "/cels191/Human%20Molecular%20Genetics/mind-map",
                label: "Open mind map",
              },
            ],
          },
        ],
      },
      {
        slug: "Microbiology",
        title: "Microbiology",
        description:
          "Microbial structure, growth, genetics, and how bacteria and viruses shape health and disease.",
        price: "$15 NZD",
        features: [
          {
            number: "01",
            title: "Notes",
            bullets: ["Structured summaries", "Common mistakes"],
            badge: "28-36",
            resourceLinks: [
              {
                href: "/materials/cels191/microbiology/module-4-notes.pdf",
                label: "Open notes",
              },
            ],
          },
          {
            number: "02",
            title: "Model Answers",
            description:
              "Word-based revision questions and model-answer support for stronger written responses",
            badge: "28-36",
            resourceLinks: [
              {
                href: "/materials/cels191/microbiology/module-4-learning-questions.pdf",
                label: "Open model answers",
              },
            ],
          },
          {
            number: "03",
            title: "Mind Map",
            description: "Full mindmap of lecture content",
            badge: "ONLINE",
            resourceLinks: [
              {
                href: "/cels191/Microbiology/mind-map",
                label: "Open mind map",
              },
            ],
          },
        ],
      },
    ],
  },
];

export function getSubjectBySlug(subjectSlug: string) {
  return subjects.find((subject) => subject.slug === subjectSlug);
}

export function getModuleBySlugs(subjectSlug: string, moduleSlug: string) {
  const subject = getSubjectBySlug(subjectSlug);
  if (!subject) return null;

  const module = subject.modules.find((item) => item.slug === moduleSlug);
  if (!module) return null;

  return { subject, module };
}
