export type ModuleItem = {
  slug: string;
  title: string;
  description: string;
  price: string;
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
        price: "$12 NZD",
      },
      {
        slug: "musculoskeletal",
        title: "Musculoskeletal",
        description:
          "Core musculoskeletal concepts, worked explanations, and structured exam-answer support.",
        price: "$12 NZD",
      },
      {
        slug: "nervous-system",
        title: "Nervous System",
        description:
          "High-yield support for neural signalling, system organisation, and the wording students need to explain it well.",
        price: "$12 NZD",
      },
      {
        slug: "endocrine-system",
        title: "Endocrine System",
        description:
          "Hormonal signalling, regulation, and endocrine integration broken down for faster revision and clearer answers.",
        price: "$12 NZD",
      },
      {
        slug: "immune-system",
        title: "Immune System",
        description:
          "Immune processes, defence mechanisms, and key distinctions organised into exam-friendly learning.",
        price: "$12 NZD",
      },
      {
        slug: "bio-statistics",
        title: "Bio-statistics",
        description:
          "Biostatistics support tailored to HSFY students who want more confidence with interpretation and application.",
        price: "$12 NZD",
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
        slug: "module-1",
        title: "Module 1",
        description:
          "Core CELS191 concepts presented in a more structured and exam-focused format.",
        price: "$12 NZD",
      },
      {
        slug: "module-2",
        title: "Module 2",
        description:
          "Worked explanations, clearer structure, and high-yield revision for the second module.",
        price: "$12 NZD",
      },
      {
        slug: "module-3",
        title: "Module 3",
        description:
          "Targeted support for major ideas, common mistakes, and better exam wording.",
        price: "$12 NZD",
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