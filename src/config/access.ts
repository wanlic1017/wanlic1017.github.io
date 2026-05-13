export type UserPlan = "free" | "materials" | "practice" | "full" | "pro";
export type ModuleAccessMap = Record<
  string,
  Record<string, boolean | string | null | undefined>
>;
export type ModuleAccessRecord =
  | string[]
  | Record<
      string,
      | boolean
      | string
      | string[]
      | Record<string, boolean | string | null | undefined>
      | null
      | undefined
    >
  | null
  | undefined;

export const moduleAccessTemplate = {
  hubs191: {
    "tissues-and-movement": false,
    musculoskeletal: false,
    "nervous-system": false,
    "endocrine-system": false,
    "immune-system": false,
    "bio-statistics": false,
  },
  cels191: {
    "Cell Structure & Diversity": false,
    "Molecular Biology & Genetics": false,
    "Human Molecular Genetics": false,
    Microbiology: false,
  },
} satisfies ModuleAccessMap;

export function normalizePlan(plan: unknown): UserPlan {
  const normalized =
    typeof plan === "string"
      ? plan.trim().toLowerCase().replace(/[\s_-]+/g, "-")
      : plan;

  if (
    normalized === "materials" ||
    normalized === "material-access" ||
    normalized === "materials-access" ||
    normalized === "material" ||
    normalized === "materials-only"
  ) {
    return "materials";
  }

  if (
    normalized === "practice" ||
    normalized === "practice-pro" ||
    normalized === "practice-only" ||
    normalized === "unlimited-practice"
  ) {
    return "practice";
  }

  if (
    normalized === "full" ||
    normalized === "full-site" ||
    normalized === "full-access" ||
    normalized === "fullsite" ||
    normalized === "premium" ||
    normalized === "all-access"
  ) {
    return "full";
  }

  if (
    normalized === "pro"
  ) {
    return normalized;
  }

  return "free";
}

export function canAccessMaterials(plan: unknown) {
  const normalized = normalizePlan(plan);
  return normalized === "materials" || normalized === "full";
}

export function hasUnlimitedPractice(plan: unknown) {
  const normalized = normalizePlan(plan);
  return (
    normalized === "practice" ||
    normalized === "full" ||
    normalized === "pro"
  );
}

export function getPlanLabel(plan: unknown) {
  const normalized = normalizePlan(plan);

  switch (normalized) {
    case "materials":
      return "Materials";
    case "practice":
      return "Practice Pro";
    case "full":
      return "Full Site";
    case "pro":
      return "Practice Pro";
    default:
      return "Free";
  }
}

export function getPlanAdminHint(plan: unknown) {
  const normalized = normalizePlan(plan);

  switch (normalized) {
    case "materials":
      return "Materials only";
    case "practice":
      return "Unlimited practice only";
    case "full":
      return "Materials + unlimited practice";
    case "pro":
      return "Legacy Practice Pro";
    default:
      return "Free access";
  }
}

export function getModuleAccessKey(subjectSlug: string, moduleSlug: string) {
  return `${subjectSlug}/${moduleSlug}`;
}

export function buildDefaultModuleAccess(): ModuleAccessMap {
  return Object.fromEntries(
    Object.entries(moduleAccessTemplate).map(([subjectSlug, modules]) => [
      subjectSlug,
      { ...modules },
    ]),
  );
}

function isModuleAccessValue(value: unknown) {
  return value === true || value === "materials" || value === "full";
}

export function mergeWithDefaultModuleAccess(
  moduleAccess: ModuleAccessRecord,
): ModuleAccessMap {
  const nextAccess = buildDefaultModuleAccess();

  const grantModule = (subjectSlug: string, moduleSlug: string) => {
    nextAccess[subjectSlug] = {
      ...(nextAccess[subjectSlug] ?? {}),
      [moduleSlug]: true,
    };
  };

  if (Array.isArray(moduleAccess)) {
    moduleAccess.forEach((accessKey) => {
      const [subjectSlug, moduleSlug] = accessKey.includes("/")
        ? accessKey.split("/")
        : ["hubs191", accessKey];

      if (subjectSlug && moduleSlug) {
        grantModule(subjectSlug, moduleSlug);
      }
    });

    return nextAccess;
  }

  if (!moduleAccess || typeof moduleAccess !== "object") {
    return nextAccess;
  }

  Object.entries(moduleAccess).forEach(([subjectSlug, accessValue]) => {
    if (Array.isArray(accessValue)) {
      accessValue.forEach((moduleSlug) => grantModule(subjectSlug, moduleSlug));
      return;
    }

    if (
      accessValue &&
      typeof accessValue === "object" &&
      !Array.isArray(accessValue)
    ) {
      Object.entries(accessValue).forEach(([moduleSlug, moduleValue]) => {
        if (moduleValue !== undefined) {
          nextAccess[subjectSlug] = {
            ...(nextAccess[subjectSlug] ?? {}),
            [moduleSlug]: isModuleAccessValue(moduleValue),
          };
        }
      });

      return;
    }

    if (isModuleAccessValue(accessValue)) {
      const [nestedSubjectSlug, moduleSlug] = subjectSlug.includes("/")
        ? subjectSlug.split("/")
        : ["hubs191", subjectSlug];

      if (nestedSubjectSlug && moduleSlug) {
        grantModule(nestedSubjectSlug, moduleSlug);
      }
    }
  });

  return nextAccess;
}

export function hasModuleAccess(
  moduleAccess: ModuleAccessRecord,
  subjectSlug: string,
  moduleSlug: string,
) {
  const moduleKey = getModuleAccessKey(subjectSlug, moduleSlug);

  if (Array.isArray(moduleAccess)) {
    return moduleAccess.includes(moduleKey) || moduleAccess.includes(moduleSlug);
  }

  if (!moduleAccess || typeof moduleAccess !== "object") {
    return false;
  }

  const possibleValues = [
    moduleAccess[moduleKey],
    moduleAccess[moduleSlug],
    moduleAccess[subjectSlug],
  ];

  return possibleValues.some((value) => {
    if (isModuleAccessValue(value)) {
      return true;
    }

    if (Array.isArray(value)) {
      return value.includes(moduleSlug);
    }

    return (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      isModuleAccessValue(value[moduleSlug])
    );
  });
}
