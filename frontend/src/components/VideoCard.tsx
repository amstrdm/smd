import { useState, useRef, useEffect } from "react";
import api from "../lib/api";
import { ImageOff, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { useToast } from "../hooks/use-toast";
import { useSettings } from "../contexts/SettingsContext";

type VideoCardProps = {
  title: string | null;
  thumbnail: string | null;
  preview_id: string | null;
  videoUrl: string | null;
  onDelete: (id: string) => void;
};

const VideoCard = ({
  title,
  thumbnail,
  preview_id,
  videoUrl,
  onDelete,
}: VideoCardProps) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [thumbnailSrc, setThumbnailSrc] = useState<string | null>(thumbnail);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const { serverUrl } = useSettings();

  const previewUrl = preview_id ? `${serverUrl}/preview/${preview_id}` : null;

  useEffect(() => {
    // Generate thumbnail from video if no thumbnail is provided
    if (!thumbnail && previewUrl && videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      // Set a small timeout to ensure the video has loaded enough to have a frame
      video.addEventListener(
        "loadeddata",
        () => {
          // Find a suitable frame for the thumbnail (e.g., a frame near the beginning)
          video.currentTime = Math.min(1, video.duration); // Use a frame from the first second

          // Wait for the video to seek to the new time
          video.addEventListener(
            "seeked",
            () => {
              if (context) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(
                  video,
                  0,
                  0,
                  video.videoWidth,
                  video.videoHeight
                );
                setThumbnailSrc(canvas.toDataURL("image/jpeg"));
              }
            },
            { once: true }
          );
        },
        { once: true }
      );
    }
  }, [thumbnail, previewUrl]);

  const handleDelete = async () => {
    if (!preview_id) return;
    try {
      await api.delete(`/delete/${preview_id}`);
      toast({
        title: "Video Deleted",
        description: "The video has been removed successfully.",
      });
      onDelete(preview_id); // Notify parent component to update UI
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: "Could not delete the video. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const renderThumbnail = () => {
    if (thumbnailSrc) {
      return (
        <img
          src={thumbnailSrc}
          alt={title || "Video thumbnail"}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      );
    }
    return (
      <div className="w-full h-full bg-muted/50 flex items-center justify-center">
        <ImageOff className="w-12 h-12 text-muted-foreground" />
      </div>
    );
  };

  // Conditionally choose the wrapper component
  const isClickable = !!videoUrl;
  const WrapperComponent = isClickable ? "a" : "div";

  // Define the props for the wrapper component
  const wrapperProps = {
    className: `video-card group bg-card border border-border/50 p-3 flex flex-col gap-4 relative ${
      isClickable ? "cursor-pointer" : "cursor-default"
    }`,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    ...(isClickable && {
      href: videoUrl!,
      target: "_blank",
      rel: "noopener noreferrer",
    }),
  };

  return (
    <>
      <WrapperComponent {...wrapperProps}>
        {preview_id && (
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-4 right-4 z-10 h-8 w-8 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity ${
              isHovering ? "opacity-100" : "opacity-0"
            }`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsAlertOpen(true);
            }}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        )}
        <div className="aspect-video w-full overflow-hidden relative bg-muted pointer-events-none">
          {renderThumbnail()}
          {previewUrl && (
            <video
              ref={videoRef}
              src={previewUrl}
              loop
              muted
              playsInline
              crossOrigin="anonymous" // Required for toDataURL
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                isHovering ? "opacity-100" : "opacity-0"
              }`}
            />
          )}
          <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
        <div
          className="absolute bottom-3 left-3 right-3 h-2/5 bg-gradient-to-t from-black/80 to-transparent p-3 flex items-end
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-b-md"
        >
          <h3 className="font-semibold text-base text-white line-clamp-2">
            {title || "Untitled Video"}
          </h3>
        </div>
      </WrapperComponent>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              video record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default VideoCard;
