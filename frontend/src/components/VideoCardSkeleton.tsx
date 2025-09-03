const VideoCardSkeleton = () => {
  return (
    <div className="bg-card border border-border/50 p-3 flex flex-col gap-3 animate-pulse">
      <div className="aspect-video w-full bg-muted/50"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-muted/50 rounded w-3/4"></div>
        <div className="h-3 bg-muted/50 rounded w-1/2"></div>
      </div>
    </div>
  );
};

export default VideoCardSkeleton;
