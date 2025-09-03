interface VideoCardProps {
  id: string;
  title: string;
  thumbnail: string;
  videoUrl: string;
  description?: string;
}

const VideoCard = ({ title, thumbnail, videoUrl }: VideoCardProps) => {
  return (
    <a
      href={videoUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block aspect-video w-full overflow-hidden rounded-lg"
    >
      {/* Thumbnail Image */}
      <div
        className="h-full w-full bg-cover bg-center"
        style={{ backgroundImage: `url(${thumbnail})` }}
      />

      {/* Hover Banner - Styled to exactly match the reference site */}
      <div
        // The reference site uses rgba(0,0,0,0.7) and 2% padding.
        className="absolute bottom-0 left-0 right-0 bg-[rgba(0,0,0,0.7)] p-[2%] text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      >
        {/* Title text - Styled to exactly match the reference site */}
        <h3 className="truncate font-bold text-base font-['Arial']">{title}</h3>
      </div>
    </a>
  );
};

export default VideoCard;
