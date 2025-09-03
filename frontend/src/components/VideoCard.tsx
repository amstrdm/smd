import { useState, useRef } from "react";
import api from "../lib/api";
import { ImageOff } from "lucide-react";

type VideoCardProps = {
  title: string | null;
  thumbnail: string | null;
  preview_id: string | null;
  videoUrl: string | null;
};

const VideoCard = ({
  title,
  thumbnail,
  preview_id,
  videoUrl,
}: VideoCardProps) => {
  const [isHovering, setIsHovering] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const previewUrl = preview_id
    ? `${api.defaults.baseURL}/preview/${preview_id}`
    : null;

  // This determines if the card should be a link or a plain div
  const isClickable = !!videoUrl;

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
    if (thumbnail) {
      return (
        <img
          src={thumbnail}
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
  const WrapperComponent = isClickable ? "a" : "div";

  // Define the props for the wrapper component
  const wrapperProps = {
    className: `video-card group bg-card border border-border/50 p-3 flex flex-col gap-4 relative ${
      isClickable ? "cursor-pointer" : "cursor-default"
    }`,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    // Add link-specific attributes only if it's clickable
    ...(isClickable && {
      href: videoUrl!, // The '!' asserts videoUrl is not null here
      target: "_blank",
      rel: "noopener noreferrer",
    }),
  };

  return (
    // Use the dynamic WrapperComponent with its corresponding props
    <WrapperComponent {...wrapperProps}>
      <div className="aspect-video w-full overflow-hidden relative bg-muted pointer-events-none">
        {renderThumbnail()}
        {previewUrl && (
          <video
            ref={videoRef}
            src={previewUrl}
            loop
            muted
            playsInline
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              isHovering ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
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
  );
};

export default VideoCard;
