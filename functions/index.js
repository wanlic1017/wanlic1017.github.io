const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret, defineString } = require("firebase-functions/params");

const admin = require("firebase-admin");
const Stripe = require("stripe");

admin.initializeApp();

// 🔐 Secrets
const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");
const stripeWebhookSecret = defineSecret("STRIPE_WEBHOOK_SECRET");
const appUrlParam = defineString("APP_URL", { default: "" });
const appAllowedOriginsParam = defineString("APP_ALLOWED_ORIGINS", {
  default: "",
});
const appCheckEnforcedParam = defineString("APP_CHECK_ENFORCED", {
  default: "false",
});
const QUESTION_DAILY_LIMIT = 20;
const EXPLANATION_DAILY_LIMIT = 3;
const APP_TIME_ZONE = "Pacific/Auckland";
const stripePriceMapJson = defineString("STRIPE_PRICE_MAP_JSON", {
  default: "{}",
});
const CHECKOUT_PRODUCTS = {
  practice: {
    priceIdEnv: "STRIPE_PRACTICE_PRICE_ID",
    mode: "subscription",
    plan: "practice",
    successPath: "/questions",
    trialPeriodDays: 1,
  },
  full: {
    priceIdEnv: "STRIPE_FULL_ACCESS_PRICE_ID",
    mode: "payment",
    plan: "materials",
    successPath: "/account",
  },
};
const MODULE_PRICE_ENV_KEYS = {
  "hubs191/tissues-and-movement": "STRIPE_MODULE_HUBS191_TISSUES_AND_MOVEMENT_PRICE_ID",
  "hubs191/musculoskeletal": "STRIPE_MODULE_HUBS191_MUSCULOSKELETAL_PRICE_ID",
  "hubs191/bio-statistics": "STRIPE_MODULE_HUBS191_BIO_STATISTICS_PRICE_ID",
  "hubs191/nervous-system": "STRIPE_MODULE_HUBS191_NERVOUS_SYSTEM_PRICE_ID",
  "hubs191/endocrine-system": "STRIPE_MODULE_HUBS191_ENDOCRINE_SYSTEM_PRICE_ID",
  "hubs191/immune-system": "STRIPE_MODULE_HUBS191_IMMUNE_SYSTEM_PRICE_ID",
  "cels191/Cell Structure & Diversity":
    "STRIPE_MODULE_CELS191_CELL_STRUCTURE_AND_DIVERSITY_PRICE_ID",
  "cels191/Molecular Biology & Genetics":
    "STRIPE_MODULE_CELS191_MOLECULAR_BIOLOGY_AND_GENETICS_PRICE_ID",
  "cels191/Human Molecular Genetics":
    "STRIPE_MODULE_CELS191_HUMAN_MOLECULAR_GENETICS_PRICE_ID",
  "cels191/Microbiology": "STRIPE_MODULE_CELS191_MICROBIOLOGY_PRICE_ID",
};
const PRICE_ID_ENV_KEYS = [
  CHECKOUT_PRODUCTS.practice.priceIdEnv,
  CHECKOUT_PRODUCTS.full.priceIdEnv,
  ...Object.values(MODULE_PRICE_ENV_KEYS),
];
const stripePriceParams = Object.fromEntries(
  PRICE_ID_ENV_KEYS.map((envKey) => [
    envKey,
    defineString(envKey, { default: "" }),
  ]),
);

const getAllowedOrigins = () => {
  const configured = (
    process.env.APP_ALLOWED_ORIGINS ||
    appAllowedOriginsParam.value() ||
    ""
  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (configured.length) {
    return Array.from(
      new Set([
        ...configured,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://haerenganz.com",
        "https://www.haerenganz.com",
        "https://wanlic1017.github.io",
      ]),
    );
  }

  const defaults = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://haerenganz.com",
    "https://www.haerenganz.com",
    "https://wanlic1017.github.io",
  ];

  try {
    return Array.from(new Set([getAppUrl(), ...defaults]));
  } catch {
    return defaults;
  }
};

const setCorsHeaders = (req, res) => {
  const origin = req.headers.origin;
  const allowedOrigins = getAllowedOrigins();

  if (origin && allowedOrigins.includes(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
    res.set("Vary", "Origin");
  }

  res.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.set(
    "Access-Control-Allow-Headers",
    "Authorization,Content-Type,X-Firebase-AppCheck,x-firebase-appcheck",
  );
};

const runCors = (req, res, next) => {
  setCorsHeaders(req, res);

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  const origin = req.headers.origin;
  const allowedOrigins = getAllowedOrigins();

  if (origin && !allowedOrigins.includes(origin)) {
    res.status(403).json({ error: "Origin not allowed by CORS" });
    return;
  }

  next();
};

const isAppCheckEnforced = () =>
  (process.env.APP_CHECK_ENFORCED || appCheckEnforcedParam.value() || "false")
    .trim()
    .toLowerCase() === "true";

const normalizePlan = (plan) => {
  const normalized =
    typeof plan === "string"
      ? plan.trim().toLowerCase().replace(/[\s_-]+/g, "-")
      : "free";

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

  if (normalized === "pro") {
    return "pro";
  }

  return "free";
};

const hasUnlimitedPractice = (plan) => {
  const normalized = normalizePlan(plan);
  return (
    normalized === "pro" ||
    normalized === "practice" ||
    normalized === "full"
  );
};

const getPlanLabel = (plan) => {
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
};

const toFirestoreDate = (unixSeconds) => {
  if (!unixSeconds || Number.isNaN(Number(unixSeconds))) {
    return null;
  }

  return admin.firestore.Timestamp.fromMillis(Number(unixSeconds) * 1000);
};

// ✅ Lazy Stripe init
let stripe;
const getStripe = () => {
  if (!stripe) {
    stripe = new Stripe(stripeSecretKey.value());
  }
  return stripe;
};

const getAppUrl = () => {
  const value = process.env.APP_URL || appUrlParam.value();

  if (!value || !value.trim()) {
    throw new Error("APP_URL is not configured.");
  }

  return value.trim().replace(/\/+$/, "");
};

const getConfiguredPriceMap = () => {
  const rawConfig = process.env.STRIPE_PRICE_MAP_JSON || stripePriceMapJson.value();

  if (!rawConfig || rawConfig.trim() === "{}") {
    return {};
  }

  try {
    return JSON.parse(rawConfig);
  } catch (error) {
    console.error("Invalid STRIPE_PRICE_MAP_JSON:", error);
    return {};
  }
};

const normalizePriceEntry = (entry, fallbackMode) => {
  if (typeof entry === "string") {
    return {
      priceId: entry,
      mode: fallbackMode,
    };
  }

  if (entry && typeof entry === "object") {
    return {
      priceId: entry.priceId || entry.price || "",
      mode: entry.mode || fallbackMode,
    };
  }

  return {
    priceId: "",
    mode: fallbackMode,
  };
};

const getPriceIdFromEnv = (envKey) =>
  envKey ? process.env[envKey] || stripePriceParams[envKey]?.value() || "" : "";

const getConfiguredPriceId = (mapEntry, envKey) =>
  normalizePriceEntry(mapEntry, "payment").priceId || getPriceIdFromEnv(envKey) || "";

const getPriceIdPurchases = () => {
  const priceMap = getConfiguredPriceMap();
  const purchases = {};

  const practicePriceId = getConfiguredPriceId(
    priceMap.practice,
    CHECKOUT_PRODUCTS.practice.priceIdEnv,
  );

  if (practicePriceId) {
    purchases[practicePriceId] = {
      purchaseType: "practice",
      plan: "practice",
    };
  }

  const fullPriceId = getConfiguredPriceId(
    priceMap.full,
    CHECKOUT_PRODUCTS.full.priceIdEnv,
  );

  if (fullPriceId) {
    purchases[fullPriceId] = {
      purchaseType: "full",
      plan: "materials",
    };
  }

  Object.entries(MODULE_PRICE_ENV_KEYS).forEach(([moduleKey, envKey]) => {
    const [subjectSlug, moduleSlug] = moduleKey.split("/");
    const modulePriceId = getConfiguredPriceId(
      priceMap.modules?.[moduleKey] || priceMap[moduleKey],
      envKey,
    );

    if (!modulePriceId) {
      return;
    }

    purchases[modulePriceId] = {
      purchaseType: "module",
      subjectSlug,
      moduleSlug,
      moduleKey,
    };
  });

  return purchases;
};

const getCheckoutConfig = (body = {}) => {
  const priceMap = getConfiguredPriceMap();
  const purchaseType =
    body.purchaseType === "module" ||
    body.purchaseType === "full" ||
    body.purchaseType === "practice"
      ? body.purchaseType
      : "practice";

  if (purchaseType === "module") {
    const subjectSlug = String(body.subjectSlug || "").trim();
    const moduleSlug = String(body.moduleSlug || "").trim();
    const moduleKey = `${subjectSlug}/${moduleSlug}`;
    const envKey = MODULE_PRICE_ENV_KEYS[moduleKey];
    const mapEntry = normalizePriceEntry(
      priceMap.modules?.[moduleKey] || priceMap[moduleKey],
      "payment",
    );
    const priceId = mapEntry.priceId || getPriceIdFromEnv(envKey) || "";

    if (!priceId) {
      throw new Error(`Missing Stripe price configuration for module ${moduleKey}.`);
    }

    return {
      purchaseType,
      subjectSlug,
      moduleSlug,
      moduleKey,
      priceId,
      mode: mapEntry.mode || "payment",
      successPath: `/${subjectSlug}/${moduleSlug}`,
      metadata: {
        purchaseType,
        subjectSlug,
        moduleSlug,
        moduleKey,
      },
    };
  }

  const product = CHECKOUT_PRODUCTS[purchaseType];
  const mapEntry = normalizePriceEntry(priceMap[purchaseType], product.mode);
  const priceId = mapEntry.priceId || getPriceIdFromEnv(product.priceIdEnv) || "";

  if (!priceId) {
    throw new Error(`Missing Stripe price configuration for purchase type ${purchaseType}.`);
  }

  return {
    purchaseType,
    priceId,
    mode: mapEntry.mode || product.mode,
    plan: product.plan,
    successPath: product.successPath,
    trialPeriodDays: product.trialPeriodDays,
    metadata: {
      purchaseType,
      plan: product.plan,
    },
  };
};

const mergePurchasedPlan = (currentPlan, purchasedPlan) => {
  const current = normalizePlan(currentPlan);
  const purchased = normalizePlan(purchasedPlan);

  if (current === "full" || purchased === "full") {
    return "full";
  }

  if (
    (current === "materials" && purchased === "practice") ||
    (current === "practice" && purchased === "materials") ||
    (current === "materials" && purchased === "pro") ||
    (current === "pro" && purchased === "materials")
  ) {
    return "full";
  }

  if (purchased !== "free") {
    return purchased;
  }

  return current;
};

const getPurchaseFromSession = async (stripeClient, session, metadata) => {
  if (metadata.purchaseType) {
    return metadata;
  }

  const lineItems = await stripeClient.checkout.sessions.listLineItems(
    session.id,
    { limit: 1, expand: ["data.price"] },
  );
  const priceId = lineItems.data?.[0]?.price?.id;

  return {
    priceId,
    ...(getPriceIdPurchases()[priceId] || {}),
  };
};

// ==============================
// 🔐 VERIFY USER
// ==============================
const verifyUser = async (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }

  const idToken = authHeader.split("Bearer ")[1];
  const decoded = await admin.auth().verifyIdToken(idToken);

  return { uid: decoded.uid };
};

const verifyAppCheck = async (req) => {
  if (!isAppCheckEnforced()) {
    return null;
  }

  const token = req.headers["x-firebase-appcheck"];

  if (!token || typeof token !== "string") {
    throw new Error("Missing App Check token.");
  }

  return admin.appCheck().verifyToken(token);
};

const assertOptionalString = (value, field, maxLength = 120) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    throw new Error(`Invalid ${field}.`);
  }

  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
};

const assertEnum = (value, allowedValues, field) => {
  if (typeof value !== "string") {
    throw new Error(`Invalid ${field}.`);
  }

  const trimmed = value.trim();

  if (!allowedValues.includes(trimmed)) {
    throw new Error(`Invalid ${field}.`);
  }

  return trimmed;
};

const normalizeQuestionPayload = (questionDoc) => {
  const raw = questionDoc.data() || {};
  const normalizeOptionalText = (value) => {
    const normalized = typeof value === "string" ? value.trim() : "";
    return normalized && normalized.toLowerCase() !== "none" ? normalized : null;
  };

  return {
    id: questionDoc.id,
    question: String(raw.question ?? ""),
    options: Array.isArray(raw.options)
      ? raw.options.map((option) => String(option))
      : [],
    answer: Number(raw.answer ?? 0),
    explanation: String(raw.explanation ?? ""),
    answerWhy: normalizeOptionalText(raw.answerWhy),
    conceptFocus: normalizeOptionalText(raw.conceptFocus),
    commonTrap: normalizeOptionalText(raw.commonTrap),
    examTakeaway: normalizeOptionalText(raw.examTakeaway),
    proTips: normalizeOptionalText(raw.proTips),
    module: String(raw.module ?? "").trim(),
    difficulty: String(raw.difficulty ?? "unknown").trim().toLowerCase(),
    subject: raw.subject === "CELS191" ? "CELS191" : "HUBS191",
  };
};

const safeTimestampToIso = (value) => {
  if (!value || typeof value !== "object" || typeof value.toDate !== "function") {
    return null;
  }

  const date = value.toDate();
  return date instanceof Date && !Number.isNaN(date.getTime())
    ? date.toISOString()
    : null;
};

const getModuleAccessRecord = (data) => {
  const nestedModuleAccess =
    data?.moduleAccess && typeof data.moduleAccess === "object"
      ? data.moduleAccess
      : null;

  if (!data) {
    return nestedModuleAccess;
  }

  const legacyModuleAccess = Object.fromEntries(
    Object.entries(data)
      .filter(
        ([key, value]) =>
          key.startsWith("moduleAccess.") && value !== undefined,
      )
      .map(([key, value]) => [key.replace(/^moduleAccess\./, ""), value]),
  );

  if (!Object.keys(legacyModuleAccess).length) {
    return nestedModuleAccess;
  }

  return {
    ...(nestedModuleAccess &&
    typeof nestedModuleAccess === "object" &&
    !Array.isArray(nestedModuleAccess)
      ? nestedModuleAccess
      : {}),
    ...legacyModuleAccess,
  };
};

const serialiseUserAccessState = (data = {}) => {
  const plan = normalizePlan(data.plan);

  return {
    plan,
    planLabel: getPlanLabel(plan),
    materialsAccess: plan === "materials" || plan === "full",
    unlimitedPractice: hasUnlimitedPractice(plan),
    practiceSubscriptionCurrentPeriodEnd: safeTimestampToIso(
      data.practiceSubscriptionCurrentPeriodEnd,
    ),
    moduleAccess: getModuleAccessRecord(data),
  };
};

const serialiseUserPracticeState = (data = {}) => {
  const quota = buildQuotaState(data).state;
  const progress =
    data.progress && typeof data.progress === "object" ? data.progress : {};

  return {
    plan: normalizePlan(data.plan),
    unlimitedPractice: hasUnlimitedPractice(data.plan),
    progress,
    quota,
  };
};

const serialiseAccountPlanState = (data = {}) => {
  const plan = normalizePlan(data.plan);

  return {
    plan,
    planLabel: getPlanLabel(plan),
    accessSource:
      typeof data.accessSource === "string" ? data.accessSource : null,
  };
};

const getUserDocData = async (uid) => {
  const userRef = admin.firestore().collection("users").doc(uid);
  const userDoc = await userRef.get();
  return userDoc.data() || {};
};

const getTodayKey = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
  }).format(new Date());

const buildDefaultUserDocument = (email, overrides = {}) => ({
  email,
  emailVerified: overrides.emailVerified === true,
  ...(overrides.firstName ? { firstName: overrides.firstName } : {}),
  ...(overrides.lastName ? { lastName: overrides.lastName } : {}),
  ...(Object.prototype.hasOwnProperty.call(overrides, "phone")
    ? { phone: overrides.phone }
    : {}),
  plan: "free",
  accessSource: "free",
  moduleAccess: {},
  progress: {
    All: 0,
  },
  quota: {
    dailyQuestionsUsed: 0,
    dailyQuestionsLimit: QUESTION_DAILY_LIMIT,
    dailyExplanationsUsed: 0,
    dailyExplanationsLimit: EXPLANATION_DAILY_LIMIT,
    lastResetDate: null,
  },
  createdAt: admin.firestore.FieldValue.serverTimestamp(),
  updatedAt: admin.firestore.FieldValue.serverTimestamp(),
});

const normaliseOptionalString = (value, maxLength = 120) => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  return trimmed.slice(0, maxLength);
};

const buildQuotaState = (data = {}) => {
  const quota = data.quota || {};
  const today = getTodayKey();
  const lastResetDate = quota.lastResetDate || null;
  const shouldReset = lastResetDate !== today;

  return {
    today,
    shouldReset,
    state: {
      dailyQuestionsUsed: shouldReset
        ? 0
        : Number(quota.dailyQuestionsUsed ?? data.questionsUsed ?? 0),
      dailyQuestionsLimit: Number(
        quota.dailyQuestionsLimit ?? QUESTION_DAILY_LIMIT,
      ),
      dailyExplanationsUsed: shouldReset
        ? 0
        : Number(quota.dailyExplanationsUsed ?? data.explanationsUsed ?? 0),
      dailyExplanationsLimit: Number(
        quota.dailyExplanationsLimit ?? EXPLANATION_DAILY_LIMIT,
      ),
      lastResetDate: today,
    },
  };
};

const serialiseUsage = (data = {}) => {
  const { state } = buildQuotaState(data);

  return {
    questionsAnswered: state.dailyQuestionsUsed,
    explanationsUsed: state.dailyExplanationsUsed,
    unlimited: hasUnlimitedPractice(data.plan),
    quota: state,
  };
};

const syncQuotaDocument = async (userRef) => {
  return admin.firestore().runTransaction(async (transaction) => {
    const userDoc = await transaction.get(userRef);
    const data = userDoc.data() || {};
    const { state, shouldReset } = buildQuotaState(data);
    const needsMigration =
      !data.quota ||
      shouldReset ||
      data.questionsUsed !== undefined ||
      data.explanationsUsed !== undefined;

    if (needsMigration) {
      transaction.set(
        userRef,
        {
          quota: state,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          questionsUsed: admin.firestore.FieldValue.delete(),
          explanationsUsed: admin.firestore.FieldValue.delete(),
        },
        { merge: true },
      );
    }

    return {
      plan: data.plan || "free",
      quota: state,
    };
  });
};

exports.upsertUserProfile = onRequest(async (req, res) => {
  runCors(req, res, async () => {
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      await verifyAppCheck(req);
      const { uid } = await verifyUser(req);
      const userRef = admin.firestore().collection("users").doc(uid);
      const userDoc = await userRef.get();
      const body = req.body || {};
      const email = normaliseOptionalString(body.email, 320);

      if (!email && !userDoc.exists) {
        return res.status(400).json({ error: "Email is required." });
      }

      const firstName = normaliseOptionalString(body.firstName, 80);
      const lastName = normaliseOptionalString(body.lastName, 80);
      const phone =
        body.phone === null ? null : normaliseOptionalString(body.phone, 40);
      const emailVerified = body.emailVerified === true;

      if (!userDoc.exists) {
        await userRef.set(
          buildDefaultUserDocument(email, {
            firstName: firstName || undefined,
            lastName: lastName || undefined,
            phone,
            emailVerified,
          }),
          { merge: true },
        );

        return res.json({ ok: true });
      }

      const data = userDoc.data() || {};
      const updates = {
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      if (!data.email && email) {
            updates.email = email;
          }

      if (emailVerified !== Boolean(data.emailVerified)) {
        updates.emailVerified = emailVerified;
      }

      if (firstName && !data.firstName) {
        updates.firstName = firstName;
      }

      if (lastName && !data.lastName) {
        updates.lastName = lastName;
      }

      if (phone !== undefined && data.phone === undefined) {
        updates.phone = phone;
      }

      await userRef.set(updates, { merge: true });
      res.json({ ok: true });
    } catch (error) {
      console.error("upsertUserProfile failed:", error);
      res.status(401).json({ error: error.message || "Unauthorized" });
    }
  });
});

exports.recordQuestionProgress = onRequest(async (req, res) => {
  runCors(req, res, async () => {
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      await verifyAppCheck(req);
      const { uid } = await verifyUser(req);
      const body = req.body || {};
      const subject = normaliseOptionalString(body.subject, 80);
      const moduleName = normaliseOptionalString(body.module, 120);
      const difficulty = normaliseOptionalString(body.difficulty, 40);
      const questionId = normaliseOptionalString(body.questionId, 120);
      const progressKey = normaliseOptionalString(body.progressKey, 120);
      const lastPractisedAt = normaliseOptionalString(body.lastPractisedAt, 80);

      if (!subject || !moduleName || !questionId || !progressKey) {
        return res.status(400).json({ error: "Missing progress payload." });
      }

      const userRef = admin.firestore().collection("users").doc(uid);

      await userRef.set(
        {
          progress: {
            All: admin.firestore.FieldValue.increment(1),
            [progressKey]: admin.firestore.FieldValue.increment(1),
          },
          recentPractice: {
            subject,
            module: moduleName,
            ...(difficulty ? { difficulty } : {}),
            questionId,
            lastPractisedAt: lastPractisedAt || new Date().toISOString(),
          },
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      res.json({ ok: true });
    } catch (error) {
      console.error("recordQuestionProgress failed:", error);
      res.status(401).json({ error: error.message || "Unauthorized" });
    }
  });
});

// ==============================
// 📊 GET USAGE (DISPLAY)
// ==============================
exports.getUsage = onRequest(async (req, res) => {
  runCors(req, res, async () => {
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    try {
      await verifyAppCheck(req);
      const { uid } = await verifyUser(req);
      const userRef = admin.firestore().collection("users").doc(uid);
      const data = await syncQuotaDocument(userRef);

      res.json(
        serialiseUsage({
          plan: data.plan,
          quota: data.quota,
        }),
      );
    } catch (err) {
      res.status(401).json({ error: "Unauthorized" });
    }
  });
});

// ==============================
// 🚫 CHECK QUOTA (BLOCKER)
// ==============================
exports.checkQuota = onRequest(async (req, res) => {
  runCors(req, res, async () => {
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    try {
      await verifyAppCheck(req);
      const { uid } = await verifyUser(req);
      const userRef = admin.firestore().collection("users").doc(uid);
      const data = await syncQuotaDocument(userRef);
      const usage = serialiseUsage({
        plan: data.plan,
        quota: data.quota,
      });
      const type = req.body?.type;

      if (usage.unlimited) {
        return res.json({
          allowed: true,
          usage,
        });
      }

      if (
        type === "explanation" &&
        usage.explanationsUsed >= usage.quota.dailyExplanationsLimit
      ) {
        return res.json({
          allowed: false,
          reason: "explanations_limit",
          usage,
        });
      }

      if (usage.questionsAnswered >= usage.quota.dailyQuestionsLimit) {
        return res.json({
          allowed: false,
          reason: "questions_limit",
          usage,
        });
      }

      return res.json({
        allowed: true,
        usage,
      });
    } catch (err) {
      console.error(err);
      res.status(401).json({ error: "Unauthorized" });
    }
  });
});

// ==============================
// ➕ INCREMENT USAGE
// ==============================
exports.incrementUsage = onRequest(async (req, res) => {
  runCors(req, res, async () => {
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    try {
      await verifyAppCheck(req);
      const { uid } = await verifyUser(req);
      const { type } = req.body;

      const userRef = admin.firestore().collection("users").doc(uid);
      const result = await admin.firestore().runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        const data = userDoc.data() || {};
        const { state } = buildQuotaState(data);
        const isPro = hasUnlimitedPractice(data.plan);

        let allowed = true;
        let reason = null;

        if (!isPro && type === "question") {
          if (state.dailyQuestionsUsed >= state.dailyQuestionsLimit) {
            allowed = false;
            reason = "questions_limit";
          } else {
            state.dailyQuestionsUsed += 1;
          }
        }

        if (!isPro && type === "explanation") {
          if (state.dailyExplanationsUsed >= state.dailyExplanationsLimit) {
            allowed = false;
            reason = "explanations_limit";
          } else {
            state.dailyExplanationsUsed += 1;
          }
        }

        transaction.set(
          userRef,
          {
            quota: state,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            questionsUsed: admin.firestore.FieldValue.delete(),
            explanationsUsed: admin.firestore.FieldValue.delete(),
          },
          { merge: true },
        );

        return {
          allowed,
          reason,
          usage: serialiseUsage({
            plan: data.plan,
            quota: state,
          }),
        };
      });

      return res.json(
        result.allowed
          ? {
              success: true,
              allowed: true,
              usage: result.usage,
            }
          : {
              allowed: false,
              reason: result.reason,
              usage: result.usage,
            },
      );
    } catch (err) {
      console.error(err);
      res.status(401).json({ error: "Unauthorized" });
    }
  });
});

exports.getQuestions = onRequest(async (req, res) => {
  runCors(req, res, async () => {
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      await verifyAppCheck(req);
      await verifyUser(req);

      const body = req.body || {};
      const subject = assertEnum(body.subject, ["HUBS191", "CELS191"], "subject");
      const moduleName = assertOptionalString(body.module, "module", 120);

      let questionsQuery = admin
        .firestore()
        .collection("questions")
        .where("subject", "==", subject);

      if (moduleName) {
        questionsQuery = questionsQuery.where("module", "==", moduleName);
      }

      const snapshot = await questionsQuery.get();

      res.json({
        questions: snapshot.docs.map(normalizeQuestionPayload),
      });
    } catch (error) {
      console.error("getQuestions failed:", error);
      const message = error && error.message ? error.message : "Request failed";
      const status =
        message === "Unauthorized" || message === "Missing App Check token."
          ? 401
          : message.startsWith("Invalid ") || message.startsWith("Missing ")
            ? 400
            : 500;

      res.status(status).json({ error: message });
    }
  });
});

exports.getUserAccessState = onRequest(async (req, res) => {
  runCors(req, res, async () => {
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "GET") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      await verifyAppCheck(req);
      const { uid } = await verifyUser(req);
      const data = await getUserDocData(uid);

      res.json(serialiseUserAccessState(data));
    } catch (error) {
      console.error("getUserAccessState failed:", error);
      res.status(401).json({ error: error.message || "Unauthorized" });
    }
  });
});

exports.getUserPracticeState = onRequest(async (req, res) => {
  runCors(req, res, async () => {
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "GET") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      await verifyAppCheck(req);
      const { uid } = await verifyUser(req);
      const userRef = admin.firestore().collection("users").doc(uid);
      const data = await syncQuotaDocument(userRef);
      const userDoc = await userRef.get();
      const userData = userDoc.data() || {};

      res.json(
        serialiseUserPracticeState({
          ...userData,
          plan: data.plan,
          quota: data.quota,
        }),
      );
    } catch (error) {
      console.error("getUserPracticeState failed:", error);
      res.status(401).json({ error: error.message || "Unauthorized" });
    }
  });
});

exports.getAccountPlanState = onRequest(async (req, res) => {
  runCors(req, res, async () => {
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "GET") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      await verifyAppCheck(req);
      const { uid } = await verifyUser(req);
      const data = await getUserDocData(uid);

      res.json(serialiseAccountPlanState(data));
    } catch (error) {
      console.error("getAccountPlanState failed:", error);
      res.status(401).json({ error: error.message || "Unauthorized" });
    }
  });
});

// ==============================
// 💳 CREATE CHECKOUT SESSION
// ==============================
exports.createCheckoutSession = onRequest(
  {
    secrets: [stripeSecretKey],
  },
  async (req, res) => {
    runCors(req, res, async () => {
      if (req.method === "OPTIONS") {
        res.status(204).send("");
        return;
      }

      try {
        await verifyAppCheck(req);
        const { uid } = await verifyUser(req);
        const checkoutConfig = getCheckoutConfig(req.body);

        if (!checkoutConfig.priceId) {
          return res.status(400).json({
            error: `Stripe price is not configured for ${checkoutConfig.purchaseType}.`,
          });
        }

        if (
          checkoutConfig.purchaseType === "module" &&
          (!checkoutConfig.subjectSlug || !checkoutConfig.moduleSlug)
        ) {
          return res.status(400).json({ error: "Missing module checkout target." });
        }

        const sessionParams = {
          mode: checkoutConfig.mode,
          payment_method_types: ["card"],
          allow_promotion_codes: true,
          automatic_tax: {
            enabled: true,
          },
          billing_address_collection: "auto",
          line_items: [
            {
              price: checkoutConfig.priceId,
              quantity: 1,
            },
          ],
          success_url: `${getAppUrl()}${checkoutConfig.successPath}?checkout=success`,
          cancel_url: `${getAppUrl()}${checkoutConfig.successPath}?checkout=cancelled`,
          metadata: {
            uid,
            ...checkoutConfig.metadata,
          },
        };

        if (checkoutConfig.mode === "subscription") {
          sessionParams.subscription_data = {
            metadata: sessionParams.metadata,
          };

          if (checkoutConfig.trialPeriodDays) {
            sessionParams.subscription_data.trial_period_days =
              checkoutConfig.trialPeriodDays;
          }
        }

        const session = await getStripe().checkout.sessions.create(sessionParams);

        res.json({ url: session.url });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
      }
    });
  },
);

// ==============================
// 🔔 STRIPE WEBHOOK
// ==============================
exports.stripeWebhook = onRequest(
  {
    cors: true,
    secrets: [stripeWebhookSecret, stripeSecretKey],
  },
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    if (!sig || !req.rawBody) {
      return res.status(400).send("Webhook Error");
    }

    let event;

    try {
      event = getStripe().webhooks.constructEvent(
        req.rawBody,
        sig,
        stripeWebhookSecret.value(),
      );
    } catch (err) {
      return res.status(400).send(err.message);
    }

    try {
      // ✅ UPGRADE
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const metadata = session.metadata || {};
        const purchase = await getPurchaseFromSession(
          getStripe(),
          session,
          metadata,
        );
        const uid = metadata.uid || session.client_reference_id;

        if (!uid) {
          throw new Error("Missing checkout session uid metadata.");
        }

        if (!purchase.purchaseType) {
          throw new Error(
            `Unrecognised checkout purchase for session ${session.id}. ` +
              `price=${purchase.priceId || "unknown"} ` +
              `payment_link=${session.payment_link || "none"}`,
          );
        }

        const update = {
          accessSource: "stripe",
          stripeCustomerId: session.customer,
          stripeLastCheckoutSessionId: session.id,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        if (session.subscription) {
          update.stripeSubscriptionId = session.subscription;
        } else if (purchase.purchaseType !== "module") {
          update.stripeSubscriptionId = admin.firestore.FieldValue.delete();
        }

        const userRef = admin.firestore().collection("users").doc(uid);

        if (purchase.purchaseType === "module") {
          if (!purchase.subjectSlug || !purchase.moduleSlug) {
            throw new Error("Missing module checkout metadata.");
          }

          update.moduleAccess = {
            [purchase.subjectSlug]: {
              [purchase.moduleSlug]: true,
            },
          };
        } else {
          const purchasedPlan = normalizePlan(purchase.plan || "practice");
          const userDoc = await userRef.get();
          const currentData = userDoc.data() || {};

          update.plan = mergePurchasedPlan(currentData.plan, purchasedPlan);

          if (purchasedPlan === "materials") {
            update.materialAccessPurchased = true;
          }

          if (purchasedPlan === "practice") {
            update.practiceSubscriptionActive = true;

            if (session.subscription) {
              const subscription = await getStripe().subscriptions.retrieve(
                session.subscription,
              );
              update.practiceSubscriptionCurrentPeriodEnd =
                toFirestoreDate(subscription.current_period_end);
            }
          }
        }

        await userRef.set(update, { merge: true });
      }

      if (event.type === "customer.subscription.updated") {
        const subscription = event.data.object;

        const snap = await admin
          .firestore()
          .collection("users")
          .where("stripeSubscriptionId", "==", subscription.id)
          .limit(1)
          .get();

        if (!snap.empty) {
          await snap.docs[0].ref.set(
            {
              practiceSubscriptionActive: subscription.status === "active" || subscription.status === "trialing",
              practiceSubscriptionCurrentPeriodEnd: toFirestoreDate(
                subscription.current_period_end,
              ),
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true },
          );
        }
      }

      // ✅ DOWNGRADE
      if (event.type === "customer.subscription.deleted") {
        const subscription = event.data.object;

        const snap = await admin
          .firestore()
          .collection("users")
          .where("stripeSubscriptionId", "==", subscription.id)
          .limit(1)
          .get();

        if (!snap.empty) {
          const userData = snap.docs[0].data() || {};

          await snap.docs[0].ref.update({
            plan: userData.materialAccessPurchased ? "materials" : "free",
            accessSource: userData.materialAccessPurchased ? "stripe" : "free",
            practiceSubscriptionActive: false,
            practiceSubscriptionCurrentPeriodEnd: null,
            stripeSubscriptionId: null,
          });
        }
      }

      res.sendStatus(200);
    } catch (err) {
      console.error("Stripe webhook failed:", err);
      res.status(500).send("Webhook failed");
    }
  },
);

// ==============================
// 💼 STRIPE PORTAL (CANCEL)
// ==============================
exports.createPortalSession = onRequest(
  {
    secrets: [stripeSecretKey],
  },
  async (req, res) => {
    runCors(req, res, async () => {
      if (req.method === "OPTIONS") {
        res.status(204).send("");
        return;
      }

      try {
        await verifyAppCheck(req);
        const { uid } = await verifyUser(req);

        const userDoc = await admin
          .firestore()
          .collection("users")
          .doc(uid)
          .get();
        const customerId = userDoc.data()?.stripeCustomerId;

        if (!customerId) {
          return res.status(400).json({ error: "No customer ID" });
        }

        const session = await getStripe().billingPortal.sessions.create({
          customer: customerId,
          return_url: `${getAppUrl()}/account`,
        });

        res.json({ url: session.url });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });
  },
);
