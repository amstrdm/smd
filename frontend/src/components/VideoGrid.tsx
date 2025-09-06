import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import {
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Shuffle,
  List,
  Search,
} from "lucide-react"; // Import Search icon
import api from "../lib/api";
import VideoCard from "./VideoCard";
import VideoCardSkeleton from "./VideoCardSkeleton";
import { Button } from "./ui/button";
import { useToast } from "../hooks/use-toast";

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

// 👇 ADD "search" TO THE VIEWMODE TYPE
type ViewMode = "random" | "latest" | "search";

const VideoGrid = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  // 👇 GET THE 'query' PARAM FROM THE URL
  const { pageNumber, query } = useParams<{
    pageNumber?: string;
    query?: string;
  }>();
  const location = useLocation();
  const navigate = useNavigate();

  // 👇 UPDATE MODE DERIVATION LOGIC
  const mode: ViewMode = location.pathname.startsWith("/latest")
    ? "latest"
    : location.pathname.startsWith("/search")
    ? "search"
    : "random";
  const currentPage = parseInt(pageNumber || "1", 10);

  const mapApiVideoToComponent = (video: ApiVideo): Video => {
    // ... (This function remains unchanged)
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
    window.scrollTo({ top: 0, behavior: "instant" });
    setIsLoading(true);
    setVideos([]); // Clear previous results

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
        // Handle search mode
        if (!query) {
          // If no query, don't fetch, just show the initial empty state
          setIsLoading(false);
          return;
        }
        response = await api.get<ApiVideo[]>(`/videos/search?query=${query}`);
        setVideos(response.data.map(mapApiVideoToComponent));
        setTotalPages(1); // Assuming search isn't paginated for now
      }
    } catch (error) {
      console.error("Failed to fetch videos:", error);
      toast({
        title: "Failed to Load Videos",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [mode, currentPage, toast, query]); // 👇 ADD 'query' TO DEPENDENCY ARRAY

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

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
    if (isLoading) {
      return Array.from({ length: 10 }).map((_, index) => (
        <VideoCardSkeleton key={index} />
      ));
    }

    // 👇 ADD SPECIAL MESSAGES FOR SEARCH MODE
    if (videos.length === 0) {
      if (mode === "search" && !query) {
        return (
          <div className="sm:col-span-2 text-center py-16">
            <div className="text-6xl mb-4 opacity-50">
              <Search />
            </div>
            <p className="text-muted-foreground text-lg">Search for Videos</p>
            <p className="text-sm text-muted-foreground mt-2">
              &gt; Use the search bar above to find specific videos
            </p>
          </div>
        );
      }
      if (mode === "search" && query) {
        return (
          <div className="sm:col-span-2 text-center py-16">
            <div className="text-6xl mb-4 opacity-50">🧐</div>
            <p className="text-muted-foreground text-lg">
              No results for "{query}"
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              &gt; Try searching for something else
            </p>
          </div>
        );
      }
      return (
        <div className="sm:col-span-2 text-center py-16">
          <div className="text-6xl mb-4 opacity-50">📹</div>
          <p className="text-muted-foreground text-lg">No videos found</p>
          <p className="text-sm text-muted-foreground mt-2">
            &gt; Try uploading a video or changing the mode
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

  return (
    <section className="container mx-auto px-4 mb-12">
      <div className="max-w-5xl mx-auto">
        {/* Mode Toggle Buttons */}
        {/* 👇 HIDE BUTTONS IN SEARCH MODE TO AVOID CONFUSION */}
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

        {/* 👇 ADD A HEADER FOR SEARCH RESULTS */}
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

        {/* Controls at the bottom (will be hidden in search mode) */}
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
