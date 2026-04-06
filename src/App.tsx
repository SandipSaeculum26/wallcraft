import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { downloadImage } from "./utils/download";
import {
  LogoIcon,
  SearchIcon,
  FilterIcon,
  DownloadIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CategoryIcon,
} from "./assets/svg";
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
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const debouncedSearch = useDebounce(searchInput, 500);
  const activeQuery = debouncedSearch || category || "wallpaper";
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

  // Fetch when page changes but not page 1
  useEffect(() => {
    if (page === 1) return; 

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
  }, [page]); //query changes reset to page 1

  const handleCategoryClick = (cat: string) => {
    setSearchInput("");
    setCategory(cat);
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* ─── Header ─────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-gray-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500">
              <LogoIcon className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Wall<span className="text-indigo-400">Craft</span>
            </span>
          </Link>

          {/* Search */}
          <div className="relative w-72">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchInput}
              placeholder="Search wallpapers..."
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-all"
            />
          </div>
        </div>
      </header>

      {/* ─── Sticky Filter Bar ───────────────────────────── */}
      <div className="sticky top-[65px] z-40 border-b border-white/5 bg-gray-950/90 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-4">
          {/* Filter indicator icon + label */}
          <div className="flex items-center gap-1.5 text-gray-500 shrink-0">
            <FilterIcon className="h-4 w-4" />
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
                      : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200"
                  }`}
                >
                  <CategoryIcon className="h-4 w-4" path={f.icon} />
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
              <div key={i} className="animate-pulse rounded-2xl bg-gray-900 overflow-hidden">
                <div className="bg-white/5 aspect-[4/3]" />
                <div className="px-3 py-2.5">
                  <div className="h-4 w-3/4 rounded bg-white/5" />
                  <div className="h-3 w-1/2 rounded bg-white/5 mt-1.5" />
                </div>
              </div>
            ))}
          </div>
        ) : images.length === 0 ? (
          /* ─── Empty State ──────────────────────────── */
          <div className="flex flex-col items-center justify-center" style={{ minHeight: "calc(100vh - 200px)" }}>
            <LogoIcon className="h-16 w-16 text-gray-700 mb-4" />
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
                <div
                  key={img.id}
                  className="group overflow-hidden rounded-2xl bg-gray-900"
                >
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
                    <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-transparent to-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none">
                      {/* Bottom: photographer + download */}
                      <div className="flex items-center justify-between p-3 pointer-events-auto">
                        <span className="text-xs font-medium text-white/80 truncate max-w-[55%]">
                          {img.user}
                        </span>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            downloadImage(
                              img.previewURL.replace("_150.", "_1280."),
                              `wallpaper-${img.id}.jpg`,
                            );
                          }}
                          className="flex items-center gap-1 rounded-lg bg-indigo-500 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-400 cursor-pointer transition-colors"
                        >
                          <DownloadIcon className="h-3.5 w-3.5" />
                          Download
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Image info below the card */}
                  <div className="px-3 py-2.5">
                    {/* Title */}
                    <p className="text-sm font-medium text-white truncate capitalize">
                      {img.tags.split(",")[0].trim()}
                    </p>
                    {/* Size and dimensions */}
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
                      <span>
                        {img.imageWidth} x {img.imageHeight}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-700" />
                      <span>
                        {(img.imageSize / (1024 * 1024)).toFixed(1)} MB
                      </span>
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
            <ChevronLeftIcon className="h-4 w-4" />
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
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ─── Footer ─────────────────────────────────────── */}
      {images.length > 0 && (
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
      </footer>)}

      <style>{`@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>
    </div>
  );
}

export default App;
