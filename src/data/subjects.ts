export type ModuleFeature = {
  number: string;
  title: string;
  description?: string;
  bullets?: string[];
  badge?: string;
};

export type ModuleItem = {
  slug: string;
  title: string;
  description: string;
  price: string;
  link: string;
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
        link: "https://wanlic.gumroad.com/l/hubsmodule1_tissuesandmovement?wanted=true",
        features: [
          {
            number: "01",
            title: "Notes",
            bullets: ["Extensive lecture notes", "Common mistakes"],
          },
          {
            number: "02",
            title: "80 Practice Questions",
            description: "Word-based revision questions",
            badge: "80",
          },
          {
            number: "03",
            title: "MCQ Practice",
            description: "60 MCQ questions",
            badge: "60",
          },
        ],
      },
      {
        slug: "musculoskeletal",
        title: "Musculoskeletal",
        description:
          "Core musculoskeletal concepts, worked explanations, extensive MCQs and structured exam-answer support.",
        price: "$12 NZD",
        link: "https://wanlic.gumroad.com/l/hubsmodule2_musculoskeletal?wanted=true",
        features: [
          {
            number: "01",
            title: "Notes",
            bullets: ["Extensive lecture notes", "Common mistakes"],
          },
          {
            number: "02",
            title: "Model Answers",
            description: "5 major exam-style questions",
            badge: "5",
          },
          {
            number: "03",
            title: "MCQ Practice",
            description: "200 MCQ questions",
            badge: "200",
          },
          {
            number: "04",
            title: "Mind Map",
            description: "Full mindmap of lecture content",
            badge: "COMING SOON"
          },
        ],
      },
      {
        slug: "nervous-system",
        title: "Nervous System",
        description:
          "High-yield support for neural signalling, system organisation, and the wording students need to explain it well.",
        price: "$15 NZD",
        link: "https://wanlic.gumroad.com/l/module4_nervoussystem?wanted=true",
        features: [
          {
            number: "01",
            title: "Notes",
            bullets: ["High-yield summaries", "Common mistakes"],
            badge: "16-24"
          },
          {
            number: "02",
            title: "Model Answers",
            description: "Exam-style structured responses - 5 major groups of questions",
            badge: "05"
          },
          {
            number: "03",
            title: "MCQ Practice",
            description: "200 MCQ questions",
            badge: "200",
          },
          {
            number: "04",
            title: "Mind Map",
            description: "Two Full mindmaps of lecture content",
            badge: "2"
          },
        ],
      },
      {
        slug: "endocrine-system",
        title: "Endocrine System",
        description:
          "Hormonal signalling, regulation, and endocrine integration broken down for faster revision and clearer answers.",
        price: "$15 NZD",
        link: "https://wanlic.gumroad.com/l/module5_endocrinesystem?wanted=true",
        features: [
          {
            number: "01",
            title: "Notes",
            bullets: ["Concise summaries", "Common pitfalls"],
          },
          {
            number: "02",
            title: "Model Answers",
            description: "Core endocrine exam questions - long answers",
          },
          {
            number: "03",
            title: "MCQ Practice",
            description: "200 MCQ questions",
            badge: "200",
          },
          {
            number: "04",
            title: "Table",
            description: "Extensive hormone table, outlining all information you need to know",
            badge: "FULL LIST"
          },
          {
            number: "05",
            title: "Mind Map",
            description: "Full mindmap of lecture content",
            badge: "COMING SOON"
          },
        ],
      },
      {
        slug: "immune-system",
        title: "Immune System",
        description:
          "Immune processes, defence mechanisms, and key distinctions on the three barriers organised into exam-friendly learning.",
        price: "$12 NZD",
        link: "https://wanlic.gumroad.com/l/module6_immunesystem?wanted=true",
        features: [
          {
            number: "01",
            title: "Notes",
            bullets: ["Structured summaries", "Common mistakes"],
            badge: "30-38",
          },
          {
            number: "02",
            title: "Model Answers",
            description: "Immune system exam responses - FULL ESSAY",
            badge: "30-38",
          },
          {
            number: "03",
            title: "MCQ Practice",
            description: "200 MCQ questions",
            badge: "200",
          },
          {
            number: "04",
            title: "Mind Map",
            description: "Full mindmap of lecture content",
            badge: "COMING SOON"
          },
        ],
      },
      {
        slug: "bio-statistics",
        title: "Bio-statistics",
        description:
          "Biostatistics support tailored to HSFY students who want more confidence with interpretation and application.",
        price: "$10 NZD",
        link: "https://wanlic.gumroad.com/l/module3_biostatistics?wanted=true",
        features: [
          {
            number: "01",
            title: "Notes",
            description: "Extensive notes from Lecture 12 - 15, explaining everything in full details",
            badge: "12-15"
          },
          {
            number: "02",
            title: "Common mistakes",
            description: "Identify common mistakes students have when doing biostatistics",
            badge: "12-15"
          },
          {
            number: "03",
            title: "MCQ Practice",
            description: "200 MCQ questions, pinpointing difficult questions to tackle",
            badge: "200",
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
          "Module 1 of CELS191",
        price: "$15 NZD",
        link: "https://wanlic.gumroad.com/l/cels191module1_cellstructure_diversity?wanted=true",
        features: [
          {
            number: "01",
            title: "Notes",
            bullets: ["Structured summaries", "Common mistakes"],
            badge: "01-09",
          },
          {
            number: "02",
            title: "Model Answers",
            description: "CELS exam responses - model answers + what you need to know to answer questions well",
            badge: "01-09",
          },
          {
            number: "03",
            title: "MCQ Practice",
            description: "200 MCQ questions",
            badge: "200",
          },
          {
            number: "04",
            title: "Mind Map",
            description: "Full mindmap of lecture content",
            badge: "COMING SOON"
          },
        ],
      },
      {
        slug: "Molecular Biology & Genetics",
        title: "Molecular Biology & Genetics",
        description:
          "Module 2 of CELS191.",
        price: "$15 NZD",
        link: "https://wanlic.gumroad.com/l/cels191module2_MolecularBiology_Genetics?wanted=true",
        features: [
          {
            number: "01",
            title: "Notes",
            bullets: ["Structured summaries", "Common mistakes"],
            badge: "10-21",
          },
          {
            number: "02",
            title: "Model Answers",
            description: "CELS exam responses - model answers + what you need to know to answer questions well",
            badge: "10-21",
          },
          {
            number: "03",
            title: "MCQ Practice",
            description: "200 MCQ questions",
            badge: "200",
          },
          {
            number: "04",
            title: "Mind Map",
            description: "Full mindmap of lecture content",
            badge: "COMING SOON"
          },
        ],
      },
      {
        slug: "Human Molecular Genetics",
        title: "Human Molecular Genetics",
        description:
          "Module 3 of CELS191.",
        price: "$15 NZD",
        link: "https://wanlic.gumroad.com/l/cels191module3_HumanMolecularGenetics?wanted=true",
        features: [
          {
            number: "01",
            title: "Notes",
            bullets: ["Structured summaries", "Common mistakes"],
            badge: "22-27",
          },
          {
            number: "02",
            title: "Model Answers",
            description: "CELS exam responses - model answers + what you need to know to answer questions well",
            badge: "22-27",
          },
          {
            number: "03",
            title: "MCQ Practice",
            description: "200 MCQ questions",
            badge: "200",
          },
          {
            number: "04",
            title: "Mind Map",
            description: "Full mindmap of lecture content",
            badge: "COMING SOON"
          },
        ],
      },
      {
        slug: "Microbiology",
        title: "Microbiology",
        description:
          "Module 4 of CELS191.",
        price: "$15 NZD",
        link: "https://wanlic.gumroad.com/l/cels191module6microbiology?wanted=true",
        features: [
          {
            number: "01",
            title: "Notes",
            bullets: ["Structured summaries", "Common mistakes"],
            badge: "28-36",
          },
          {
            number: "02",
            title: "Model Answers",
            description: "CELS exam responses - model answers + what you need to know to answer questions well",
            badge: "28-36",
          },
          {
            number: "03",
            title: "MCQ Practice",
            description: "200 MCQ questions",
            badge: "200",
          },
          {
            number: "04",
            title: "Mind Map",
            description: "Full mindmap of lecture content",
            badge: "COMING SOON"
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