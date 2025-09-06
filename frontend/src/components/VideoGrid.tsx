import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import {
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Shuffle,
  List,
  Settings, // 👈 Import an icon for settings
} from "lucide-react";
import api from "../lib/api";
import VideoCard from "./VideoCard";
import VideoCardSkeleton from "./VideoCardSkeleton";
import { Button } from "./ui/button";
import { useSettings } from "../contexts/SettingsContext"; // 👈 1. Import useSettings
import sonicError from "../assets/sonic-error.gif";
import sonicConfused from "../assets/sonic-confused.png";

type ApiVideo = {
  url: string;
  title: string;
  poster_url: string;
  preview_id: string;
  preview_path: string;
};

type Video = {
  id: string;
  title: string;
  thumbnail: string;
  videoUrl: string;
  preview_id: string;
};

type ViewMode = "random" | "latest" | "search";

const VideoGrid = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const { serverUrl } = useSettings(); // 👈 2. Get serverUrl from context
  const [error, setError] = useState<string | null>(null); // 👈 3. Add state for fetch errors

  const { pageNumber, query } = useParams<{
    pageNumber?: string;
    query?: string;
  }>();
  const location = useLocation();
  const navigate = useNavigate();

  const mode: ViewMode = location.pathname.startsWith("/latest")
    ? "latest"
    : location.pathname.startsWith("/search")
    ? "search"
    : "random";
  const currentPage = parseInt(pageNumber || "1", 10);

  const mapApiVideoToComponent = (video: ApiVideo): Video => {
    const thumbnailUrl = video.poster_url || "";
    return {
      id: video.preview_id,
      title: video.title,
      thumbnail: thumbnailUrl.startsWith("//")
        ? `https:${thumbnailUrl}`
        : thumbnailUrl,
      videoUrl: video.url,
      preview_id: video.preview_id,
    };
  };

  const handleDeleteVideo = (idToDelete: string) => {
    setVideos((currentVideos) =>
      currentVideos.filter((video) => video.id !== idToDelete)
    );
  };

  const fetchVideos = useCallback(async () => {
    // Don't fetch if the server URL isn't set.
    if (!serverUrl) {
      setIsLoading(false);
      return;
    }

    window.scrollTo({ top: 0, behavior: "instant" });
    setIsLoading(true);
    setError(null); // 👈 4. Clear previous errors on a new fetch
    setVideos([]);

    try {
      let response;
      if (mode === "random") {
        response = await api.get<ApiVideo[]>("/videos/random");
        setVideos(response.data.map(mapApiVideoToComponent));
        setTotalPages(1);
      } else if (mode === "latest") {
        response = await api.get(`/videos/latest?page=${currentPage}`);
        setVideos(response.data.videos.map(mapApiVideoToComponent));
        setTotalPages(response.data.total_pages);
      } else if (mode === "search") {
        if (!query) {
          setIsLoading(false);
          return;
        }
        response = await api.get<ApiVideo[]>(`/videos/search?query=${query}`);
        setVideos(response.data.map(mapApiVideoToComponent));
        setTotalPages(1);
      }
    } catch (err) {
      // 👈 5. Catch the error and update state
      console.error("Failed to fetch videos. Detailed error:", err);
      setError(
        "Could not connect to the server. Please verify the address in settings and check your network connection."
      );
    } finally {
      setIsLoading(false);
    }
  }, [mode, currentPage, query, serverUrl]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // ... (other useEffect remains unchanged)
  useEffect(() => {
    if (mode === "latest" && totalPages > 0) {
      if (currentPage > totalPages) {
        navigate(`/latest/${totalPages}`, { replace: true });
      } else if (currentPage < 1) {
        navigate("/latest/1", { replace: true });
      }
    }
  }, [totalPages, currentPage, mode, navigate]);

  const renderContent = () => {
    // 👈 6. Render custom UI based on the new error state
    if (error) {
      return (
        <div className="sm:col-span-2 text-center py-16 text-destructive">
          <img
            src={sonicError}
            alt="Error animation"
            className="pixelated mx-auto mb-4 h-35 w-35 opacity-75 -translate-x-6"
          />
          <p className="font-bold text-lg">An Error Occurred</p>
          <p className="text-sm mt-2">{error}</p>
          <p className="text-xs text-muted-foreground mt-2">
            &gt; Check the developer console for more details.
          </p>
        </div>
      );
    }

    if (isLoading) {
      return Array.from({ length: 10 }).map((_, index) => (
        <VideoCardSkeleton key={index} />
      ));
    }

    if (videos.length === 0) {
      // ... (search messages remain the same) ...
      return (
        <div className="sm:col-span-2 text-center py-16">
          <img
            src={sonicConfused}
            alt="No videos found"
            className="pixelated mx-auto mb-4 h-48 w-auto" // Resized and centered
          />
          {/* Made the text bolder and more prominent */}
          <p className="font-bold text-xl text-foreground">No Videos Found</p>
          {/* Added a helpful sub-message */}
          <p className="text-sm text-muted-foreground mt-2">
            &gt; Try uploading a video or using a different filter.
          </p>
        </div>
      );
    }

    return videos.map((video, index) => (
      <div
        key={video.id}
        className="animate-fade-in"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <VideoCard {...video} onDelete={handleDeleteVideo} />
      </div>
    ));
  };

  // 👈 7. Add a top-level check for the server URL
  if (!serverUrl && !isLoading) {
    return (
      <section className="container mx-auto px-4 mb-12">
        <div className="max-w-5xl mx-auto">
          <div className="sm:col-span-2 text-center py-16 text-primary">
            <div className="text-6xl mb-4 opacity-50 mx-auto w-fit">
              <Settings />
            </div>
            <p className="font-bold text-lg">Server Address Not Set</p>
            <p className="text-sm text-muted-foreground mt-2">
              &gt; Please configure the server URL in the settings to begin.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 mb-12">
      <div className="max-w-5xl mx-auto">
        {mode !== "search" && (
          <div className="flex justify-center gap-4 mb-8">
            <Button
              asChild
              variant={mode === "random" ? "default" : "secondary"}
            >
              <Link to="/random" className="retro-button">
                <Shuffle className="w-4 h-4 mr-2" /> Random
              </Link>
            </Button>
            <Button
              asChild
              variant={mode === "latest" ? "default" : "secondary"}
            >
              <Link to="/latest/1" className="retro-button">
                <List className="w-4 h-4 mr-2" /> Latest
              </Link>
            </Button>
          </div>
        )}

        {mode === "search" && query && (
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold">
              Search Results for:{" "}
              <span className="font-mono p-1 bg-muted rounded">"{query}"</span>
            </h2>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {renderContent()}
        </div>

        <div className="flex justify-center mt-12">
          {!isLoading && mode === "random" && videos.length > 0 && (
            <Button onClick={fetchVideos} className="retro-button">
              <RefreshCw className="w-4 h-4 mr-2" /> Load New Random Videos
            </Button>
          )}

          {!isLoading && mode === "latest" && totalPages > 1 && (
            // ... (Pagination remains unchanged)
            <div className="flex items-center gap-4">
              <Button asChild disabled={currentPage <= 1}>
                <Link to={`/latest/${currentPage - 1}`}>
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </Button>
              <span className="font-mono">
                Page {currentPage} of {totalPages}
              </span>
              <Button asChild disabled={currentPage >= totalPages}>
                <Link to={`/latest/${currentPage + 1}`}>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default VideoGrid;
