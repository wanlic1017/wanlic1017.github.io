import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import AccessGate from "../components/AccessGate";
import { getModuleBySlugs } from "../data/subjects";

type OpenSeadragonModule = typeof import("openseadragon");
type OpenSeadragonViewer = ReturnType<OpenSeadragonModule>;

type MindMapSource = {
  id: string;
  label: string;
  dzi: string;
};

const mindMapSources: Record<string, MindMapSource[]> = {
  "hubs191/musculoskeletal": [
    {
      id: "part-1",
      label: "Part 1",
      dzi: "/materials/hubs191/musculoskeletal/mind-map-dzi/part-1.dzi",
    },
    {
      id: "part-2",
      label: "Part 2",
      dzi: "/materials/hubs191/musculoskeletal/mind-map-dzi/part-2.dzi",
    },
  ],
  "hubs191/nervous-system": [
    {
      id: "part-1",
      label: "Part 1",
      dzi: "/materials/hubs191/nervous-system/mind-map-dzi/part-1.dzi",
    },
    {
      id: "part-2",
      label: "Part 2",
      dzi: "/materials/hubs191/nervous-system/mind-map-dzi/part-2.dzi",
    },
  ],
  "hubs191/endocrine-system": [
    {
      id: "part-1",
      label: "Mind Map",
      dzi: "/materials/hubs191/endocrine-system/mind-map-dzi/part-1.dzi",
    },
  ],
  "hubs191/immune-system": [
    {
      id: "part-1",
      label: "Part 1",
      dzi: "/materials/hubs191/immune-system/mind-map-dzi/part-1.dzi",
    },
    {
      id: "part-2",
      label: "Part 2",
      dzi: "/materials/hubs191/immune-system/mind-map-dzi/part-2.dzi",
    },
    {
      id: "part-3",
      label: "Part 3",
      dzi: "/materials/hubs191/immune-system/mind-map-dzi/part-3.dzi",
    },
  ],
  "cels191/Human Molecular Genetics": [
    {
      id: "part-1",
      label: "Mind Map",
      dzi: "/materials/cels191/human-molecular-genetics/mind-map-dzi/part-1.dzi",
    },
  ],
  "cels191/Cell Structure & Diversity": [
    {
      id: "part-1",
      label: "Mind Map",
      dzi: "/materials/cels191/cell-structure-and-diversity/mind-map-dzi/part-1.dzi",
    },
  ],
  "cels191/Molecular Biology & Genetics": [
    {
      id: "part-1",
      label: "Part 1",
      dzi: "/materials/cels191/molecular-biology-and-genetics/mind-map-dzi/part-1.dzi",
    },
    {
      id: "part-2",
      label: "Part 2",
      dzi: "/materials/cels191/molecular-biology-and-genetics/mind-map-dzi/part-2.dzi",
    },
  ],
  "cels191/Microbiology": [
    {
      id: "part-1",
      label: "Mind Map",
      dzi: "/materials/cels191/microbiology/mind-map-dzi/part-1.dzi",
    },
  ],
};

export default function MindMapPage() {
  const { subjectSlug, moduleSlug } = useParams();
  const viewerRef = useRef<OpenSeadragonViewer | null>(null);
  const [viewerElement, setViewerElement] = useState<HTMLDivElement | null>(
    null,
  );
  const [activeIndex, setActiveIndex] = useState(0);

  const data =
    subjectSlug && moduleSlug
      ? getModuleBySlugs(subjectSlug, moduleSlug)
      : null;
  const mapKey = subjectSlug && moduleSlug ? `${subjectSlug}/${moduleSlug}` : "";
  const sources = mindMapSources[mapKey] ?? [];
  const activeSource = sources[activeIndex] ?? sources[0];

  useEffect(() => {
    if (!viewerElement || !activeSource) return;

    const originalViewport = document
      .querySelector('meta[name="viewport"]')
      ?.getAttribute("content");
    let viewportMeta = document.querySelector('meta[name="viewport"]');

    if (!viewportMeta) {
      viewportMeta = document.createElement("meta");
      viewportMeta.setAttribute("name", "viewport");
      document.head.appendChild(viewportMeta);
    }

    viewportMeta.setAttribute(
      "content",
      "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no",
    );

    const preventBrowserZoomOutsideViewer = (event: Event) => {
      const target = event.target;

      if (!(target instanceof Node) || !viewerElement.contains(target)) {
        event.preventDefault();
      }
    };
    const preventCtrlWheelZoomOutsideViewer = (event: WheelEvent) => {
      const target = event.target;

      if (
        event.ctrlKey &&
        (!(target instanceof Node) || !viewerElement.contains(target))
      ) {
        event.preventDefault();
      }
    };

    window.addEventListener("wheel", preventCtrlWheelZoomOutsideViewer, {
      capture: true,
      passive: false,
    });
    window.addEventListener("gesturestart", preventBrowserZoomOutsideViewer, {
      capture: true,
      passive: false,
    });
    window.addEventListener("gesturechange", preventBrowserZoomOutsideViewer, {
      capture: true,
      passive: false,
    });

    let cancelled = false;
    let viewer: OpenSeadragonViewer | null = null;
    let lastGestureScale = 1;

    const getGestureScale = (event: Event) =>
      (event as Event & { scale?: number }).scale ?? 1;

    const zoomByGestureScale = (event: Event) => {
      const scale = getGestureScale(event);
      const zoomFactor = scale / lastGestureScale;

      if (Number.isFinite(zoomFactor) && zoomFactor > 0) {
        viewer?.viewport.zoomBy(zoomFactor);
        viewer?.viewport.applyConstraints();
      }

      lastGestureScale = scale;
    };

    const handleViewerGestureStart = (event: Event) => {
      event.preventDefault();
      lastGestureScale = getGestureScale(event);
    };

    const handleViewerGestureChange = (event: Event) => {
      event.preventDefault();
      zoomByGestureScale(event);
    };

    viewerElement.addEventListener("gesturestart", handleViewerGestureStart, {
      capture: true,
      passive: false,
    });
    viewerElement.addEventListener("gesturechange", handleViewerGestureChange, {
      capture: true,
      passive: false,
    });

    const openViewer = async () => {
      const OpenSeadragon = (await import("openseadragon")).default;

      if (cancelled) return;

      viewer = OpenSeadragon({
      element: viewerElement,
      tileSources: activeSource.dzi,
      showNavigationControl: false,
      showNavigator: false,
      preserveViewport: false,
      constrainDuringPan: true,
      visibilityRatio: 0.8,
      minZoomImageRatio: 0.8,
      maxZoomPixelRatio: 2.2,
      imageLoaderLimit: 6,
      maxTilesPerFrame: 8,
      immediateRender: true,
      blendTime: 0,
      animationTime: 0.18,
      springStiffness: 8,
      zoomPerScroll: 1.18,
      homeFillsViewer: false,
      drawer: "canvas",
      gestureSettingsTouch: {
        pinchToZoom: true,
        flickEnabled: true,
        dragToPan: true,
        clickToZoom: false,
        dblClickToZoom: false,
      },
      gestureSettingsMouse: {
        scrollToZoom: true,
        dragToPan: true,
        clickToZoom: false,
        dblClickToZoom: false,
      },
      });

      const resetToImage = () => {
        viewer?.viewport.resize(viewer.viewport.getContainerSize(), true);
        viewer?.viewport.goHome(true);
        viewer?.viewport.applyConstraints();
        viewer?.forceRedraw();
      };

      viewer.addHandler("open", () => {
        window.requestAnimationFrame(resetToImage);
        window.setTimeout(resetToImage, 80);
      });

      viewerRef.current = viewer;
    };

    openViewer();

    return () => {
      cancelled = true;
      if (originalViewport) {
        viewportMeta.setAttribute("content", originalViewport);
      }
      window.removeEventListener("wheel", preventCtrlWheelZoomOutsideViewer, {
        capture: true,
      });
      window.removeEventListener("gesturestart", preventBrowserZoomOutsideViewer, {
        capture: true,
      });
      window.removeEventListener("gesturechange", preventBrowserZoomOutsideViewer, {
        capture: true,
      });
      viewerElement.removeEventListener("gesturestart", handleViewerGestureStart, {
        capture: true,
      });
      viewerElement.removeEventListener("gesturechange", handleViewerGestureChange, {
        capture: true,
      });
      viewer?.destroy();
      viewerRef.current = null;
    };
  }, [activeSource, viewerElement]);

  if (!data || !subjectSlug || !moduleSlug || !activeSource) {
    return <div className="p-10">Mind map not found.</div>;
  }

  const { subject, module } = data;
  const moduleIndex = subject.modules.findIndex((item) => item.slug === module.slug);
  const moduleLabel = moduleIndex >= 0 ? `Module ${moduleIndex + 1}` : `${subject.code} Module`;

  const openSource = (index: number) => {
    const nextSource = sources[index];
    if (!nextSource) return;

    setActiveIndex(index);
  };

  const zoomBy = (factor: number) => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    viewer.viewport.zoomBy(factor);
    viewer.viewport.applyConstraints();
  };

  const resetView = () => {
    viewerRef.current?.viewport.goHome(false);
  };

  return (
    <div className="h-screen overflow-hidden bg-white text-[#1d1d1f]">
      <AccessGate
        require="materials"
        subjectSlug={subjectSlug}
        moduleSlug={moduleSlug}
      >
        <div className="grid h-screen bg-white md:grid-cols-[232px_1fr]">
          <aside className="z-20 flex h-full flex-col border-r border-[#e8e8ed] bg-white/96 px-4 py-4 shadow-[16px_0_50px_rgba(15,23,42,0.06)] backdrop-blur-xl max-md:absolute max-md:inset-x-3 max-md:bottom-3 max-md:h-auto max-md:rounded-[1.4rem] max-md:border max-md:py-3">
            <div className="max-md:hidden">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8b8b90]">
                {subject.code} {moduleLabel}
              </div>
              <h1 className="mt-2 text-2xl font-semibold tracking-[-0.05em]">
                {module.title} Mind Map
              </h1>
              <p className="mt-3 text-sm leading-6 text-[#6e6e73]">
                Drag to move, scroll or pinch to zoom.
              </p>
            </div>

            <div className="mt-5 grid gap-2 max-md:mt-0 max-md:grid-cols-2">
              {sources.map((source, index) => (
                <button
                  key={source.id}
                  type="button"
                  onClick={() => openSource(index)}
                  className={`rounded-[1.1rem] border px-4 py-3 text-left text-sm font-semibold transition ${
                    activeIndex === index
                      ? "border-[#1d1d1f] bg-[#1d1d1f] text-white"
                      : "border-[#d2d2d7] bg-white text-[#424245] hover:bg-[#f5f5f7]"
                  }`}
                >
                  {source.label}
                </button>
              ))}
            </div>

            <div className="mt-auto grid gap-2 pt-5 max-md:hidden">
              <button
                type="button"
                onClick={() => zoomBy(1.25)}
                className="rounded-full bg-[#1d1d1f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-black"
              >
                Zoom in
              </button>
              <button
                type="button"
                onClick={() => zoomBy(0.8)}
                className="rounded-full border border-[#d2d2d7] bg-white px-4 py-2.5 text-sm font-semibold transition hover:bg-[#f5f5f7]"
              >
                Zoom out
              </button>
              <button
                type="button"
                onClick={resetView}
                className="rounded-full border border-[#d2d2d7] bg-white px-4 py-2.5 text-sm font-semibold transition hover:bg-[#f5f5f7]"
              >
                Reset view
              </button>
              <Link
                to={`/${subject.slug}/${module.slug}`}
                className="rounded-full bg-[#f5f5f7] px-4 py-2.5 text-center text-sm font-semibold transition hover:bg-[#e8e8ed]"
              >
                Back to module
              </Link>
            </div>
          </aside>

          <div className="relative h-screen min-w-0 overflow-hidden bg-white">
            <div
              ref={setViewerElement}
              className="h-full w-full touch-none overscroll-contain bg-white"
            />

            <div className="pointer-events-none absolute right-4 top-4 rounded-full border border-[#d2d2d7] bg-white/88 px-4 py-2 text-xs font-semibold text-[#424245] shadow-[0_14px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl max-md:top-3">
              {activeSource.label}
            </div>

            <div className="absolute bottom-4 right-4 z-20 flex gap-2 md:hidden">
              <button
                type="button"
                onClick={() => zoomBy(0.8)}
                className="rounded-full border border-[#d2d2d7] bg-white px-4 py-2 text-sm font-semibold shadow-[0_14px_40px_rgba(15,23,42,0.1)]"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => zoomBy(1.25)}
                className="rounded-full bg-[#1d1d1f] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(15,23,42,0.1)]"
              >
                +
              </button>
              <button
                type="button"
                onClick={resetView}
                className="rounded-full border border-[#d2d2d7] bg-white px-4 py-2 text-sm font-semibold shadow-[0_14px_40px_rgba(15,23,42,0.1)]"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </AccessGate>
    </div>
  );
}
