import VideoCard from "./VideoCard";
import videoThumb1 from "../assets/video-thumb-1.png";

// Placeholder video data
const placeholderVideos = [
  {
    id: "1",
    title: "Urban Sunset Timelapse",
    thumbnail: videoThumb1,
    videoUrl: "https://example.com/video1",
    description: "Beautiful cityscape at golden hour",
  },
  {
    id: "2",
    title: "Mountain Lake Serenity",
    thumbnail: videoThumb1,
    videoUrl: "https://example.com/video2",
    description: "Peaceful nature documentary",
  },
  {
    id: "3",
    title: "Coffee Shop Ambience",
    thumbnail: videoThumb1,
    videoUrl: "https://example.com/video3",
    description: "Cozy workspace vibes",
  },
  {
    id: "4",
    title: "Street Art Chronicles",
    thumbnail: videoThumb1,
    videoUrl: "https://example.com/video4",
    description: "Urban creativity showcase",
  },
  {
    id: "5",
    title: "Minimalist Workspace Tour",
    thumbnail: videoThumb1,
    videoUrl: "https://example.com/video5",
    description: "Clean setup inspiration",
  },
  {
    id: "6",
    title: "Retro Gaming Nostalgia",
    thumbnail: videoThumb1,
    videoUrl: "https://example.com/video6",
    description: "Classic arcade memories",
  },
];

const VideoGrid = () => {
  return (
    <section className="container mx-auto px-4 mb-12">
      <div className="flex items-center gap-2 mb-8">
        <span className="text-primary font-bold">&gt;</span>
        <h2 className="text-xl font-bold text-foreground">Video Collection</h2>
        <div className="flex-1 h-px bg-gradient-to-r from-primary/50 to-transparent ml-4"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {placeholderVideos.map((video, index) => (
          <div
            key={video.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <VideoCard {...video} />
          </div>
        ))}
      </div>

      {placeholderVideos.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4 opacity-50">📹</div>
          <p className="text-muted-foreground text-lg">
            No videos uploaded yet
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            &gt; Start by uploading your first video above
          </p>
        </div>
      )}
    </section>
  );
};

export default VideoGrid;
