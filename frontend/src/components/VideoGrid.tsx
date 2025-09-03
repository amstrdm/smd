import { useState, useEffect, useCallback } from "react";
// Import hooks and the Link component from react-router-dom
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import { RefreshCw, ArrowLeft, ArrowRight, Shuffle, List } from "lucide-react";
import api from "../lib/api";
import VideoCard from "./VideoCard";
import VideoCardSkeleton from "./VideoCardSkeleton";
import { Button } from "./ui/button";
import { useToast } from "../hooks/use-toast";

// Define types for the data we expect from the API
type ApiVideo = {
  url: string;
  title: string;
  poster_url: string;
  preview_id: string;
  preview_path: string;
};

// Define the type for the data we'll use in our component
type Video = {
  id: string;
  title: string;
  thumbnail: string;
  videoUrl: string;
  preview_id: string;
};

type ViewMode = "random" | "latest";

const VideoGrid = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  // Get URL parameters and location from react-router-dom
  const { pageNumber } = useParams<{ pageNumber?: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // Derive mode and page directly from the URL, removing the need for state
  const mode: ViewMode = location.pathname.startsWith("/latest")
    ? "latest"
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
    // Update the state to remove the video with the matching ID
    setVideos((currentVideos) =>
      currentVideos.filter((video) => video.id !== idToDelete)
    );
  };

  const fetchVideos = useCallback(async () => {
    window.scrollTo({ top: 0, behavior: "instant" });

    setIsLoading(true);
    try {
      let response;
      if (mode === "random") {
        response = await api.get<ApiVideo[]>("/videos/random");
        setVideos(response.data.map(mapApiVideoToComponent));
        setTotalPages(1);
      } else {
        response = await api.get(`/videos/latest?page=${currentPage}`);
        // Ensure you are accessing the correct properties from your API response
        setVideos(response.data.videos.map(mapApiVideoToComponent));
        setTotalPages(response.data.total_pages);
      }
    } catch (error) {
      console.error("Failed to fetch videos:", error);
      toast({
        title: "Failed to Load Videos",
        description: "Please try refreshing the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
    // The dependency array now uses the values derived from the URL
  }, [mode, currentPage, toast]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  useEffect(() => {
    // Only run this check after the API call is complete and we have a totalPages count
    if (mode === "latest" && totalPages > 0) {
      // If the current page is greater than the total, redirect to the last page
      if (currentPage > totalPages) {
        navigate(`/latest/${totalPages}`, { replace: true });
      }
      // Also handle invalid pages like 0 or negative numbers
      else if (currentPage < 1) {
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
    if (videos.length === 0) {
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
        {/* Mode Toggle Buttons now use <Link> for navigation */}
        <div className="flex justify-center gap-4 mb-8">
          <Button asChild variant={mode === "random" ? "default" : "secondary"}>
            <Link to="/random" className="retro-button">
              <Shuffle className="w-4 h-4 mr-2" /> Random
            </Link>
          </Button>
          <Button asChild variant={mode === "latest" ? "default" : "secondary"}>
            <Link to="/latest/1" className="retro-button">
              <List className="w-4 h-4 mr-2" /> Latest
            </Link>
          </Button>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {renderContent()}
        </div>

        {/* Controls at the bottom */}
        <div className="flex justify-center mt-12">
          {!isLoading && mode === "random" && videos.length > 0 && (
            <Button onClick={fetchVideos} className="retro-button">
              <RefreshCw className="w-4 h-4 mr-2" /> Load New Random Videos
            </Button>
          )}

          {!isLoading && mode === "latest" && totalPages > 1 && (
            <div className="flex items-center gap-4">
              {/* Pagination controls also use <Link> */}
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
