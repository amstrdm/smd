import { useState } from "react";

interface VideoCardProps {
  id: string;
  title: string;
  thumbnail: string;
  videoUrl: string;
  description?: string;
}

const VideoCard = ({
  title,
  thumbnail,
  videoUrl,
  description,
}: VideoCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="video-card relative group bg-card rounded-lg overflow-hidden border border-border cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail/Video Preview */}
      <div className="relative aspect-video bg-muted">
        {isHovered ? (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <div className="text-center animate-fade-in">
              <p className="text-sm text-primary font-medium">
                Click to Preview
              </p>
            </div>
          </div>
        ) : (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover"
          />
        )}

        {/* Hover Overlay */}
        <div
          className={`
          absolute inset-x-0 bottom-0 p-4 transition-all duration-300
          ${
            isHovered
              ? "video-overlay"
              : "bg-gradient-to-t from-black/60 to-transparent"
          }
        `}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h3
                className={`font-medium truncate transition-colors duration-300 ${
                  isHovered ? "text-video-overlay-text" : "text-white"
                }`}
              >
                {title}
              </h3>
              {description && (
                <p
                  className={`text-xs mt-1 transition-colors duration-300 ${
                    isHovered ? "text-video-overlay-text/80" : "text-white/80"
                  }`}
                >
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Retro glow effect on hover */}
      <div
        className={`
        absolute inset-0 pointer-events-none transition-opacity duration-300
        ${isHovered ? "opacity-100" : "opacity-0"}
        bg-gradient-to-r from-transparent via-primary/5 to-transparent
      `}
      />
    </div>
  );
};

export default VideoCard;
