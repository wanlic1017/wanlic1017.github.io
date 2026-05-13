import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";

import AccessGate from "../components/AccessGate";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { subjects } from "../data/subjects";
import { useAccessState } from "../hooks/useAccessState";
import { startCheckout } from "../services/checkoutService";

type ContentBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "bullets"; items: string[] }
  | { type: "table"; rows: string[][] };

type ResourceChapter = {
  id: string;
  title: string;
  blocks: ContentBlock[];
};

type ReaderResource = {
  id: string;
  title: string;
  sourcePath: string;
  chapters: ResourceChapter[];
};

type ReaderModule = {
  resources: ReaderResource[];
};

type ReaderLibrary = {
  version: number;
  subjects: Record<string, { modules: Record<string, ReaderModule> }>;
};

const toLibraryModuleSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const formatModuleCount = (count: number) =>
  count === 1 ? "1 chapter available" : `${count} chapters available`;

const sortResources = (resources: ReaderResource[]) =>
  [...resources].sort((a, b) => {
    const getResourceRank = (resource: ReaderResource) => {
      const title = resource.title.toLowerCase();

      if (title === "notes") return 0;
      if (title === "model answers") return 1;
      if (title === "common mistakes") return 2;
      if (title === "hormone table") return 3;
      if (title === "learning questions") return 4;
      return 5;
    };
    const rankDifference = getResourceRank(a) - getResourceRank(b);

    return rankDifference || a.title.localeCompare(b.title);
  });

const renderTopicText = (text: string) => {
  const topicMatch = text.match(/^([^:]{2,90}):\s+(.+)$/);

  if (!topicMatch) {
    return text;
  }

  return (
    <>
      <strong className="font-semibold text-[#1d1d1f]">{topicMatch[1]}:</strong>{" "}
      {topicMatch[2]}
    </>
  );
};

export default function ResourceLibraryPage() {
  const { subjectSlug } = useParams();
  const access = useAccessState();
  const [searchParams, setSearchParams] = useSearchParams();
  const [library, setLibrary] = useState<ReaderLibrary | null>(null);
  const [loadingLibrary, setLoadingLibrary] = useState(true);
  const [checkoutPending, setCheckoutPending] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const contentPanelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [subjectSlug]);

  useEffect(() => {
    let active = true;

    fetch("/library-data/resources.json")
      .then((response) => response.json())
      .then((data: ReaderLibrary) => {
        if (active) {
          setLibrary(data);
          setLoadingLibrary(false);
        }
      })
      .catch((error) => {
        console.error("Failed to load library data:", error);
        if (active) {
          setLoadingLibrary(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const subject = subjects.find((item) => item.slug === subjectSlug) ?? null;
  const subjectLibrary =
    subjectSlug && library ? library.subjects[subjectSlug] ?? null : null;

  const modulesForSubject = useMemo(() => {
    if (!subject || !subjectLibrary) return [];

    return subject.modules.map((module) => {
      const librarySlug = subjectLibrary.modules[module.slug]
        ? module.slug
        : toLibraryModuleSlug(module.slug);

      return {
        module,
        librarySlug,
        resourceModule: {
          resources: sortResources(
            subjectLibrary.modules[librarySlug]?.resources ?? [],
          ),
        },
        hasAccess: access.canAccessModule(subject.slug, module.slug),
      };
    });
  }, [subject, subjectLibrary, access]);

  const requestedModuleSlug = searchParams.get("module");
  const requestedResourceId = searchParams.get("resource");
  const requestedChapterId = searchParams.get("chapter");

  const defaultModule = modulesForSubject.find((item) => item.hasAccess && item.resourceModule.resources.length > 0)
    ?? modulesForSubject.find((item) => item.resourceModule.resources.length > 0)
    ?? null;

  const activeModuleEntry =
    modulesForSubject.find(
      (item) =>
        item.module.slug === requestedModuleSlug ||
        item.librarySlug === requestedModuleSlug,
    ) ?? defaultModule;
  const activeModule = activeModuleEntry?.module ?? null;
  const moduleHasAccess = activeModuleEntry?.hasAccess ?? false;
  const resources = activeModuleEntry?.resourceModule.resources ?? [];
  const activeResource =
    resources.find((item) => item.id === requestedResourceId) ?? resources[0] ?? null;
  const activeChapter =
    activeResource?.chapters.find((item) => item.id === requestedChapterId) ??
    activeResource?.chapters[0] ??
    null;
  const activeModuleNumber = activeModule
    ? (subject?.modules.findIndex((item) => item.slug === activeModule.slug) ?? -1) + 1
    : 0;
  const practiceSearchParams = new URLSearchParams({
    subject: subject?.code ?? "HUBS191",
    difficulty: "Mixed",
  });

  if (activeModuleNumber > 0) {
    practiceSearchParams.set("module", `Module ${activeModuleNumber}`);
  }

  if (activeChapter) {
    practiceSearchParams.set("chapter", activeChapter.id);
  }

  const practiceLink = `/questions?${practiceSearchParams.toString()}`;

  useEffect(() => {
    contentPanelRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [activeModule?.slug, activeResource?.id, activeChapter?.id]);

  useEffect(() => {
    if (!activeModule || !activeResource || !activeChapter) return;

    const next = new URLSearchParams(searchParams);
    let changed = false;

    if (next.get("module") !== activeModule.slug) {
      next.set("module", activeModule.slug);
      changed = true;
    }
    if (next.get("resource") !== activeResource.id) {
      next.set("resource", activeResource.id);
      changed = true;
    }
    if (next.get("chapter") !== activeChapter.id) {
      next.set("chapter", activeChapter.id);
      changed = true;
    }

    if (changed) {
      setSearchParams(next, { replace: true });
    }
  }, [activeModule, activeResource, activeChapter, searchParams, setSearchParams]);

  const handleModuleCheckout = async (moduleSlug: string) => {
    if (!subjectSlug) return;

    try {
      setCheckoutPending(moduleSlug);
      await startCheckout({
        purchaseType: "module",
        subjectSlug,
        moduleSlug,
      });
    } catch (error) {
      console.error("Module checkout failed:", error);
      alert("Failed to start module checkout. Please try again.");
      setCheckoutPending(null);
    }
  };

  const handleCheckout = async (purchaseType: "practice" | "full") => {
    try {
      setCheckoutPending(purchaseType);
      await startCheckout({ purchaseType });
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("Failed to start checkout. Please try again.");
      setCheckoutPending(null);
    }
  };

  const selectResource = (moduleSlug: string, resourceId: string, chapterId?: string) => {
    const next = new URLSearchParams(searchParams);
    next.set("module", moduleSlug);
    next.set("resource", resourceId);
    if (chapterId) next.set("chapter", chapterId);
    setSearchParams(next);
  };

  const selectMobileResource = (moduleSlug: string, resourceId: string, chapterId?: string) => {
    selectResource(moduleSlug, resourceId, chapterId);
  };

  const selectMobileChapter = (moduleSlug: string, resourceId: string, chapterId: string) => {
    selectResource(moduleSlug, resourceId, chapterId);
    setMobileMenuOpen(false);
  };

  if (!subject) {
    return <div className="p-10">Subject not found.</div>;
  }

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f]">
      <Navbar />

      <main className="mx-auto max-w-[1600px] px-4 pb-10 pt-4 sm:px-6">
        <div className="lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((previous) => !previous)}
            className="mb-4 flex w-full items-center justify-between rounded-2xl border border-[#ececf0] bg-[#fbfbfd] px-4 py-3 text-left text-sm font-semibold text-[#1d1d1f] shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
          >
            <span className="min-w-0 truncate">
              {activeModule?.title ?? "Modules"} · {activeResource?.title ?? "Resources"} ·{" "}
              {activeChapter?.title ?? "Chapter"}
            </span>
            <span className="ml-3 shrink-0 text-xs text-[#6e6e73]">
              {mobileMenuOpen ? "Hide" : "Show"}
            </span>
          </button>

          {mobileMenuOpen ? (
            <div className="mb-5 max-h-[60svh] overflow-y-auto rounded-[1.6rem] bg-[#fbfbfd] p-4 shadow-[0_14px_44px_rgba(15,23,42,0.08)] [scrollbar-gutter:stable]">
              <div className="space-y-3">
                {modulesForSubject.map(({ module, resourceModule, hasAccess }) => (
                  <div
                    key={module.slug}
                    className={`rounded-[1.2rem] border p-3 ${
                      activeModule?.slug === module.slug
                        ? "border-[#d7c9ff] bg-white"
                        : "border-transparent bg-white/80"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-[#1d1d1f]">
                        {module.title}
                      </div>
                      <span className="rounded-full bg-[#f5f5f7] px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-[#6e6e73]">
                        {hasAccess ? "Open" : "Locked"}
                      </span>
                    </div>

                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                      {resourceModule.resources.map((resource) => (
                        <button
                          key={resource.id}
                          type="button"
                          onClick={() =>
                            hasAccess &&
                            selectMobileResource(
                              module.slug,
                              resource.id,
                              resource.chapters[0]?.id,
                            )
                          }
                          disabled={!hasAccess}
                          className={`flex-none rounded-full px-4 py-2 text-sm font-medium ${
                            activeModule?.slug === module.slug && activeResource?.id === resource.id
                              ? "bg-[#1d1d1f] text-white"
                              : "bg-[#f5f5f7] text-[#424245]"
                          } disabled:opacity-45`}
                        >
                          {resource.title}
                        </button>
                      ))}
                    </div>

                    {hasAccess && activeModule?.slug === module.slug && activeResource ? (
                      <div className="mt-3 flex gap-2 overflow-x-auto border-t border-[#ececf0] pt-3">
                        {activeResource.chapters.map((chapter) => (
                          <button
                            key={chapter.id}
                            type="button"
                            onClick={() =>
                              selectMobileChapter(
                                module.slug,
                                activeResource.id,
                                chapter.id,
                              )
                            }
                            className={`flex-none rounded-full px-4 py-2 text-sm font-medium ${
                              chapter.id === activeChapter?.id
                                ? "bg-[#eef5ff] text-[#1677d2]"
                                : "bg-white text-[#424245]"
                            }`}
                          >
                            {chapter.title}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <section className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
          <aside className="hidden rounded-[2rem] bg-[#fbfbfd] p-4 lg:sticky lg:top-[5rem] lg:block lg:h-[calc(100svh-5rem-0.4cm)] lg:overflow-y-auto lg:[scrollbar-gutter:stable] lg:p-5 lg:pb-[calc(2rem+0.2cm)] lg:[&::-webkit-scrollbar-thumb]:rounded-full lg:[&::-webkit-scrollbar-thumb]:bg-[#d2d2d7] lg:[&::-webkit-scrollbar]:w-2">
            <div className="text-sm font-semibold tracking-[0.16em] text-[#6e6e73]">
              Modules
            </div>
            <div className="mt-4 space-y-3">
              {modulesForSubject.map(({ module, resourceModule, hasAccess }) => {
                const isActive = module.slug === activeModule?.slug;

                return (
                  <div
                    key={module.slug}
                    className={`rounded-[1.4rem] border p-4 ${
                      isActive
                        ? "border-[#d7c9ff] bg-white"
                        : "border-transparent bg-white/70"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-[#1d1d1f]">
                          {module.title}
                        </div>
                        <div className="mt-1 text-xs text-[#6e6e73]">
                          {formatModuleCount(
                            resourceModule.resources.reduce(
                              (sum, resource) => sum + resource.chapters.length,
                              0,
                            ),
                          )}
                        </div>
                      </div>
                      <div
                        className={`rounded-full px-3 py-1 text-[0.68rem] font-semibold tracking-[0.08em] ${
                          hasAccess
                            ? "bg-[#eaf7ee] text-[#1d7a3e]"
                            : "bg-[#f5f5f7] text-[#6e6e73]"
                        }`}
                      >
                        {hasAccess ? "OPEN" : "LOCKED"}
                      </div>
                    </div>

                    <div className="mt-3 space-y-2">
                      {resourceModule.resources.map((resource) => (
                        <div key={resource.id} className="rounded-[1rem] bg-[#fbfbfd] px-3 py-3">
                          <button
                            type="button"
                            onClick={() =>
                              hasAccess &&
                              selectResource(
                                module.slug,
                                resource.id,
                                resource.chapters[0]?.id,
                              )
                            }
                            disabled={!hasAccess}
                            className={`w-full text-left text-sm font-medium ${
                              hasAccess
                                ? "text-[#1d1d1f]"
                                : "cursor-not-allowed text-[#8b8b90]"
                            }`}
                          >
                            {resource.title}
                          </button>

                          {hasAccess && activeModule?.slug === module.slug && activeResource?.id === resource.id ? (
                            <div className="mt-3 space-y-1 border-t border-[#ececf0] pt-3">
                              {resource.chapters.map((chapter) => (
                                <button
                                  key={chapter.id}
                                  type="button"
                                  onClick={() =>
                                    selectResource(module.slug, resource.id, chapter.id)
                                  }
                                  className={`block w-full rounded-[0.85rem] px-3 py-2 text-left text-sm transition ${
                                    chapter.id === activeChapter?.id
                                      ? "bg-[#eef5ff] font-semibold text-[#1677d2]"
                                      : "text-[#424245] hover:bg-[#f5f5f7]"
                                  }`}
                                >
                                  {chapter.title}
                                </button>
                              ))}
                            </div>
                          ) : null}

                          {!hasAccess ? (
                            <button
                              type="button"
                              onClick={() => handleModuleCheckout(module.slug)}
                              disabled={checkoutPending !== null}
                              className="mt-3 rounded-full bg-[#1d1d1f] px-4 py-2 text-[0.72rem] font-semibold tracking-[0.08em] text-white transition hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {checkoutPending === module.slug ? "OPENING..." : `GET ACCESS ${module.price}`}
                            </button>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>

          <div
            ref={contentPanelRef}
            className="rounded-[2rem] bg-[#fbfbfd] p-6 pb-[calc(2.5rem+0.2cm)] sm:p-8 sm:pb-[calc(2.5rem+0.2cm)] lg:sticky lg:top-[5rem] lg:h-[calc(100svh-5rem-0.4cm)] lg:overflow-y-auto lg:[scrollbar-gutter:stable] lg:p-10 lg:pb-[calc(2.5rem+0.2cm)] lg:[&::-webkit-scrollbar-thumb]:rounded-full lg:[&::-webkit-scrollbar-thumb]:bg-[#d2d2d7] lg:[&::-webkit-scrollbar]:w-2"
          >
            {loadingLibrary ? (
              <div className="text-[#6e6e73]">Loading library...</div>
            ) : !activeModule || !activeResource ? (
              <div className="text-[#6e6e73]">No resource found for this subject yet.</div>
            ) : !moduleHasAccess ? (
              <div className="rounded-[1.8rem] bg-white p-8 text-center">
                <div className="text-sm font-semibold tracking-[0.16em] text-[#6e6e73]">
                  Locked
                </div>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
                  Unlock {activeModule.title}.
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-[1.02rem] leading-7 text-[#6e6e73]">
                  Buy this module to read every chapter online, then move
                  straight into Question Hub using the same material.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleModuleCheckout(activeModule.slug)}
                    disabled={checkoutPending !== null}
                    className="rounded-full bg-[#1d1d1f] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {checkoutPending === activeModule.slug
                      ? "Opening checkout..."
                      : `Get access ${activeModule.price}`}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCheckout("full")}
                    disabled={checkoutPending !== null}
                    className="rounded-full border border-[#d2d2d7] bg-white px-6 py-3 text-sm font-semibold text-[#1d1d1f] transition hover:bg-[#f5f5f7] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {checkoutPending === "full" ? "Opening checkout..." : "Get full access"}
                  </button>
                </div>
              </div>
            ) : (
              <AccessGate require="materials" subjectSlug={subject.slug} moduleSlug={activeModule.slug}>
                <article
                  className="select-none"
                  onCopy={(event) => event.preventDefault()}
                  onCut={(event) => event.preventDefault()}
                  onContextMenu={(event) => event.preventDefault()}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold tracking-[0.16em] text-[#6e6e73]">
                        {activeModule.title} · {activeResource.title}
                      </div>
                      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                        {activeChapter?.title}
                      </h2>
                    </div>
                    <Link
                      to={practiceLink}
                      className="rounded-full bg-[#1d1d1f] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-85"
                    >
                      Practise this chapter
                    </Link>
                  </div>

                  <div className="mt-8 space-y-5">
                    {activeChapter?.blocks.map((block, index) => {
                      if (block.type === "heading") {
                        return (
                          <h3
                            key={`${block.type}-${index}`}
                            className="text-[1.06rem] font-semibold leading-7 tracking-[-0.02em] text-[#1d1d1f]"
                          >
                            {block.text}
                          </h3>
                        );
                      }

                      if (block.type === "bullets") {
                        return (
                          <div
                            key={`${block.type}-${index}`}
                            className="rounded-[1.4rem] bg-white px-5 py-4"
                          >
                            <div className="space-y-3">
                              {block.items.map((item, itemIndex) => (
                                <div
                                  key={`${itemIndex}-${item.slice(0, 24)}`}
                                  className="flex items-start gap-3 text-[1.02rem] leading-7 text-[#424245]"
                                >
                                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#1d1d1f]" />
                                  <span>{renderTopicText(item)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }

                      if (block.type === "table") {
                        return (
                          <div
                            key={`${block.type}-${index}`}
                            className="overflow-hidden rounded-[1.4rem] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
                          >
                            <table className="w-full table-fixed border-collapse text-left text-[0.68rem] leading-4 text-[#424245] sm:text-[0.72rem]">
                              <tbody>
                                {block.rows.map((row, rowIndex) => (
                                  <tr
                                    key={`${rowIndex}-${row.join("-").slice(0, 24)}`}
                                    className={rowIndex === 0 ? "bg-[#f1f6ff]" : "border-t border-[#ececf0]"}
                                  >
                                    {row.map((cell, cellIndex) => (
                                      <td
                                        key={`${cellIndex}-${cell.slice(0, 16)}`}
                                        className={`break-words whitespace-pre-line px-2 py-2 align-top leading-4 ${
                                          rowIndex === 0 || cellIndex === 0
                                            ? "font-semibold text-[#1d1d1f]"
                                            : ""
                                        }`}
                                      >
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        );
                      }

                      return (
                        <p
                          key={`${block.type}-${index}`}
                          className="text-[1.05rem] leading-8 tracking-[-0.02em] text-[#424245]"
                        >
                          {renderTopicText(block.text)}
                        </p>
                      );
                    })}
                  </div>

                  <div className="mt-10 rounded-[1.6rem] bg-white px-6 py-5">
                    <div className="text-sm font-semibold tracking-[0.16em] text-[#6e6e73]">
                      Next step
                    </div>
                    <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
                      Lock it in with practice.
                    </h3>
                    <p className="mt-3 max-w-3xl text-[1.02rem] leading-7 text-[#6e6e73]">
                      Move straight into Question Hub while this chapter is
                      still active in memory.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <Link
                        to={practiceLink}
                        className="rounded-full bg-[#1d1d1f] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-85"
                      >
                        Go to Question Hub
                      </Link>
                      {access.unlimitedPractice ? null : (
                        <button
                          type="button"
                          onClick={() => handleCheckout("practice")}
                          disabled={checkoutPending !== null}
                          className="rounded-full border border-[#d2d2d7] bg-white px-6 py-3 text-sm font-semibold text-[#1d1d1f] transition hover:bg-[#f5f5f7] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {checkoutPending === "practice"
                            ? "Opening checkout..."
                            : "Get Question Hub Premium"}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              </AccessGate>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
