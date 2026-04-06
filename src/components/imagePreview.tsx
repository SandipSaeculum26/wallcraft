import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { downloadImage } from "../utils/download";
import {
  LogoIcon,
  ChevronLeftIcon,
  DownloadIcon,
  WarningIcon,
  ExpandIcon,
  CloseIcon,
  StatsIcon,
} from "../assets/svg";

const API_KEY = import.meta.env.VITE_PIXABAY_API_KEY;

interface PixabayImage {
  id: number;
  tags: string;
  previewURL: string;
  imageWidth: number;
  imageHeight: number;
  imageSize: number;
  views: number;
  downloads: number;
  likes: number;
  comments: number;
  user: string;
  userImageURL: string;
  pageURL: string;
}

const ImagePreview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [image, setImage] = useState<PixabayImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setImgLoaded(false);
      try {
        const res = await fetch(
          `https://pixabay.com/api/?key=${API_KEY}&id=${id}&image_type=photo`,
        );
        const data = await res.json();
        if (data.hits?.length > 0) {
          const img = data.hits[0];
          setImage(img);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    document.body.style.overflow = fullscreen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [fullscreen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const handleDownload = async () => {
    if (!image || downloading) return;
    setDownloading(true);
    try {
      await downloadImage(
        image.previewURL.replace("_150.", "_1280."),
        `wallpaper-${image.id}.jpg`,
      );
    } catch {
      window.open(image.previewURL.replace("_150.", "_1280."), "_blank");
    } finally {
      setDownloading(false);
    }
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-800 border-t-indigo-500" />
      </div>
    );

  if (error || !image)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-950">
        <WarningIcon className="h-16 w-16 text-gray-700" />
        <p className="text-lg font-medium text-gray-300">
          Failed to load image
        </p>
        <button
          onClick={() => navigate(-1)}
          className="rounded-xl bg-indigo-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400 cursor-pointer"
        >
          Go Back
        </button>
      </div>
    );

  const cdnUrl = image.previewURL.replace("_150.", "_1280.");
  const imageName = image.tags.split(",")[0].trim();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-gray-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Back
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500">
              <LogoIcon className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Wall<span className="text-indigo-400">Craft</span>
            </span>
          </Link>
          <div className="w-20" />
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_410px]">
          {/* Image */}
          <div
            className="group/img relative cursor-pointer overflow-hidden rounded-2xl bg-gray-900 border border-white/5 flex items-center justify-center"
            onClick={() => setFullscreen(true)}
          >
            {!imgLoaded && (
              <img
                src={image.previewURL}
                alt=""
                className="absolute inset-0 h-full w-full object-cover blur-lg scale-105"
              />
            )}
            <img
              src={cdnUrl}
              alt={image.tags}
              referrerPolicy="no-referrer"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgLoaded(true)}
              className={`w-full object-cover transition-opacity duration-500 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
              style={{ maxHeight: "75vh" }}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover/img:bg-black/30">
              <div className="flex items-center gap-2 rounded-xl bg-white/15 px-5 py-2.5 text-sm font-semibold text-white opacity-0 backdrop-blur-md transition-all group-hover/img:opacity-100 scale-90 group-hover/img:scale-100">
                <ExpandIcon className="h-4 w-4" />
                View Full Size
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col gap-4 border border-white/5 rounded-2xl bg-gray-900 p-6">
            {/* Image Name */}
            <div className="rounded-2xl bg-white/5 border border-white/5 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 pb-1">
                Image Name
              </p>
              <p className="text-lg font-bold text-white capitalize">
                {imageName}
              </p>
            </div>

            {/* Photographer */}
            <div className="rounded-2xl bg-white/5 border border-white/5 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 pb-2">
                Photographer
              </p>
              <div className="flex items-center gap-3">
                {image.userImageURL && (
                  <img
                    src={image.userImageURL}
                    alt={image.user}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-white/10"
                  />
                )}
                <span className="text-base font-semibold text-white">
                  {image.user}
                </span>
              </div>
            </div>

            {/* Dimensions + Size */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/5 border border-white/5 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 pb-1">
                  Dimensions
                </p>
                <p className="text-base font-semibold text-white">
                  {image.imageWidth} &times; {image.imageHeight}
                </p>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/5 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 pb-1">
                  File Size
                </p>
                <p className="text-base font-semibold text-white">
                  {(image.imageSize / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "Views",
                  value: image.views,
                  icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
                },
                {
                  label: "Downloads",
                  value: image.downloads,
                  icon: "M12 4v12m0 0l-4-4m4 4l4-4M5 17v2a1 1 0 001 1h12a1 1 0 001-1v-2",
                },
                {
                  label: "Likes",
                  value: image.likes,
                  icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
                },
              ].map((states) => (
                <div
                  key={states?.label}
                  className="rounded-2xl bg-white/5 border border-white/5 p-3 text-center flex flex-col gap-1"
                >
                  <p className="text-base font-bold text-white">
                    {states?.value?.toLocaleString()}
                  </p>
                  <div className="flex items-center justify-center gap-1">
                    <StatsIcon
                      className="h-4 w-4 text-gray-600"
                      path={states?.icon}
                    />
                    <p className="text-[10px] uppercase tracking-wider text-gray-500">
                      {states?.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-500 py-3 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-50 transition-colors"
              >
                {downloading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <DownloadIcon className="h-4 w-4" />
                )}
                {downloading ? "Downloading..." : "Download"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95"
          style={{ animation: "fadeIn 0.2s ease-out" }}
        >
          <button
            onClick={() => setFullscreen(false)}
            className="absolute top-4 right-4 z-10 cursor-pointer rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20 transition-colors"
          >
            <CloseIcon className="h-5 w-5" />
          </button>

          <div className={`h-full w-full flex items-center justify-center`}>
            <img
              src={cdnUrl}
              alt={image.tags}
              referrerPolicy="no-referrer"
              className={`transition-all duration-300 `}
            />
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default ImagePreview;
