import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { downloadImage } from "./utils/download";
import "./index.css";

// ─── API Config ─────────────────────────────────────────────
const API_KEY = import.meta.env.VITE_PIXABAY_API_KEY;
const PER_PAGE = 8;

// ─── Fetch images from Pixabay API ─────────────────────────
const fetchImages = async (query: string, page: number) => {
  try {
    const res = await fetch(
      `https://pixabay.com/api/?key=${API_KEY}&q=${query}&image_type=photo&page=${page}&per_page=${PER_PAGE}`,
    );
    const data = await res.json();
    return { hits: data.hits, totalHits: data.totalHits };
  } catch (error) {
    console.error("Error fetching images:", error);
    return { hits: [], totalHits: 0 };
  }
};

// ─── Filter config with SVG icons ───────────────────────────
const filterConfig = [
  {
    label: "Nature",
    value: "nature",
    icon: "M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66L7 18.5C9 17 12 15.5 17 15.5V20l7-8.5L17 3v5z",
  },
  {
    label: "Technology",
    value: "technology",
    icon: "M9 3v2H6v2H4V3h5zm6 0h5v4h-2V5h-3V3zM4 17v4h5v-2H6v-2H4zm16 0v2h-3v2h5v-4h-2zM7 7h10v10H7V7zm2 2v6h6V9H9z",
  },
  {
    label: "People",
    value: "people",
    icon: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
  },
  {
    label: "Animals",
    value: "animals",
    icon: "M4.5 11a2.5 2.5 0 110-5 2.5 2.5 0 010 5zm5-4a2.5 2.5 0 110-5 2.5 2.5 0 010 5zm5 0a2.5 2.5 0 110-5 2.5 2.5 0 010 5zm5 4a2.5 2.5 0 110-5 2.5 2.5 0 010 5zM12 13.5c-2.33 0-4.31 1.46-5.11 3.5-.48 1.21.19 2.5 1.5 3 .49.19 1.05 0 1.37-.4.73-.9 1.42-1.6 2.24-1.6s1.51.7 2.24 1.6c.32.4.88.59 1.37.4 1.31-.5 1.98-1.79 1.5-3-.8-2.04-2.78-3.5-5.11-3.5z",
  },
  {
    label: "Travel",
    value: "travel",
    icon: "M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z",
  },
];

// ─── Debounce hook ──────────────────────────────────────────
function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ─── Main App ───────────────────────────────────────────────
function App() {
  const [images, setImages] = useState<any[]>([]);
  const [totalHits, setTotalHits] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState("nature");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [lightboxImg, setLightboxImg] = useState<any>(null);
  const [zoomed, setZoomed] = useState(false);

  const debouncedSearch = useDebounce(searchInput, 500);
  const activeQuery = debouncedSearch || category;
  const totalPages = Math.ceil(totalHits / PER_PAGE);

  // Reset page AND fetch in one effect to avoid race conditions
  useEffect(() => {
    let cancelled = false;

    // Always reset to page 1 when query changes
    setPage(1);

    const load = async () => {
      setLoading(true);
      const data = await fetchImages(activeQuery, 1);
      if (cancelled) return;
      setImages(data.hits);
      setTotalHits(data.totalHits);
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [activeQuery]);

  // Fetch when page changes (but not page 1 — that's handled above)
  useEffect(() => {
    if (page === 1) return; // already fetched by the query effect

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const data = await fetchImages(activeQuery, page);
      if (cancelled) return;
      setImages(data.hits);
      setTotalHits(data.totalHits);
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [page]); // intentionally no activeQuery dep — query changes reset to page 1

  const handleCategoryClick = (cat: string) => {
    setSearchInput("");
    setCategory(cat);
  };

  // Lock body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = lightboxImg ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightboxImg]);

  // Close lightbox on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setLightboxImg(null); setZoomed(false); }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950">
      {/* ─── Header ─────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-gray-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Wall<span className="text-indigo-400">Craft</span>
            </span>
          </Link>

          {/* Search */}
          <div className="relative w-72">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchInput}
              placeholder="Search wallpapers..."
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>
      </header>

      {/* ─── Sticky Filter Bar ───────────────────────────── */}
      <div className="sticky top-[65px] z-40 border-b border-white/5 bg-gray-950/90 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-4">
          {/* Filter indicator icon + label */}
          <div className="flex items-center gap-1.5 text-gray-500 shrink-0">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="white"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <span className="text-xs font-semibold uppercase tracking-wider hidden sm:inline text-white">
              Filters
            </span>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-white/10 shrink-0" />

          {/* Category buttons */}
          <div className="flex gap-2.5 overflow-x-auto">
            {filterConfig.map((f) => {
              const isActive = category === f.value && !searchInput;
              return (
                <button
                  key={f.value}
                  onClick={() => handleCategoryClick(f.value)}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium cursor-pointer transition-all ${
                    isActive
                      ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                      : "bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10 hover:text-gray-200"
                  }`}
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d={f.icon} />
                  </svg>
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Main ───────────────────────────────────────── */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* ─── Loading Skeleton ───────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
            {Array.from({ length: PER_PAGE }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl bg-white/5 aspect-[4/3]"
              />
            ))}
          </div>
        ) : images.length === 0 ? (
          /* ─── Empty State ──────────────────────────── */
          <div className="flex flex-col items-center justify-center py-24 h-96">
            <svg
              className="h-16 w-16 text-gray-700 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-gray-400 text-lg font-medium">
              No wallpapers found
            </p>
            <p className="text-gray-600 text-sm mt-1">
              Try a different search or category
            </p>
          </div>
        ) : (
          <>
            {/* ─── Image Grid ────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
              {images.map((img: any) => (
                <div key={img.id} className="group overflow-hidden rounded-2xl bg-gray-900">
                  {/* Image with hover overlay */}
                  <div className="relative overflow-hidden">
                    <Link to={`/image/${img.id}`}>
                      <img
                        src={img.previewURL.replace("_150.", "_640.")}
                        alt={img.tags}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/70 via-transparent to-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none">
                      {/* Top: fullscreen button */}
                      <div className="flex justify-end p-2.5 pointer-events-auto">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setLightboxImg(img);
                          }}
                          className="rounded-full bg-white/15 p-2 backdrop-blur-sm hover:bg-white/30 cursor-pointer transition-colors"
                          title="View full size"
                        >
                          <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                          </svg>
                        </button>
                      </div>
                      {/* Bottom: photographer + download */}
                      <div className="flex items-center justify-between p-3 pointer-events-auto">
                        <span className="text-xs font-medium text-white/80 truncate max-w-[55%]">{img.user}</span>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            downloadImage(img.previewURL.replace("_150.", "_1280."), `wallpaper-${img.id}.jpg`);
                          }}
                          className="flex items-center gap-1 rounded-lg bg-indigo-500 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-400 cursor-pointer transition-colors"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Image info below the card */}
                  <div className="px-3 py-2.5">
                    {/* Title — use the first tag as the image name */}
                    <p className="text-sm font-medium text-white truncate capitalize">
                      {img.tags.split(",")[0].trim()}
                    </p>
                    {/* Size and dimensions */}
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
                      <span>{img.imageWidth} x {img.imageHeight}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-700" />
                      <span>{(img.imageSize / (1024 * 1024)).toFixed(1)} MB</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
      {/* ─── Pagination ────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 py-4">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 text-gray-300 text-sm font-medium cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Prev
          </button>

          <div className="px-4 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <span className="text-sm font-bold text-white">{page}</span>
            <span className="text-sm text-gray-500 mx-1">/</span>
            <span className="text-sm text-gray-500">{totalPages}</span>
          </div>

          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page === totalPages}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 text-gray-300 text-sm font-medium cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
          >
            Next
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      )}

      {/* ─── Footer ─────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-6 text-center">
        <p className="text-xs text-gray-600">
          powered by{" "}
          <a
            href="https://pixabay.com/api/docs/"
            target="_blank"
            className="text-indigo-500 hover:underline"
          >
            Pixabay API
          </a>
        </p>
      </footer>

      {/* ─── Fullscreen Lightbox ────────────────────────── */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95"
          style={{ animation: "fadeIn 0.2s ease-out" }}
          onClick={() => { setLightboxImg(null); setZoomed(false); }}
        >
          {/* Close button */}
          <button
            onClick={() => { setLightboxImg(null); setZoomed(false); }}
            className="absolute top-4 right-4 z-10 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image title + info (top-left) */}
          <div className="absolute top-4 left-4 z-10">
            <p className="text-sm font-medium text-white capitalize">{lightboxImg.tags.split(",")[0].trim()}</p>
            <p className="text-xs text-white/50 mt-0.5">
              {lightboxImg.imageWidth} x {lightboxImg.imageHeight} · {(lightboxImg.imageSize / (1024 * 1024)).toFixed(1)} MB · by {lightboxImg.user}
            </p>
          </div>

          {/* Bottom hint */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 rounded-full bg-white/10 px-4 py-2 text-xs text-white/50 backdrop-blur-sm">
            {zoomed ? "Click to fit" : "Click to zoom"} · Esc to close
          </div>

          {/* Zoomable image */}
          <div
            className={`h-full w-full flex items-center justify-center ${
              zoomed ? "overflow-auto cursor-zoom-out" : "overflow-hidden cursor-zoom-in"
            }`}
            onClick={(e) => { e.stopPropagation(); setZoomed((z) => !z); }}
          >
            <img
              src={lightboxImg.previewURL.replace("_150.", "_1280.")}
              alt={lightboxImg.tags}
              referrerPolicy="no-referrer"
              className={`transition-all duration-300 ${
                zoomed ? "max-w-none max-h-none" : "max-w-[95vw] max-h-[95vh] object-contain"
              }`}
            />
          </div>
        </div>
      )}

      <style>{`@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>
    </div>
  );
}

export default App;
