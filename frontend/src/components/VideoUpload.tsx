import { useState } from "react";
import { Upload, Link, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "../hooks/use-toast";
import { Input } from "./ui/input";
import { DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog"; // Import Dialog components for structure

// Add a prop to handle closing the modal on success
const VideoUpload = ({ onUploadSuccess }: { onUploadSuccess?: () => void }) => {
  const [videoUrl, setVideoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim()) return;

    setIsLoading(true);

    // Simulate upload process
    await new Promise((resolve) => setTimeout(resolve, 2000));

    toast({
      title: "Video Added Successfully!",
      description: "Your video has been processed and added to the collection.",
    });

    setVideoUrl("");
    setIsLoading(false);

    // Call the callback function to close the modal
    onUploadSuccess?.();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-foreground">
          <span className="text-primary">&gt;</span>
          <Upload className="w-5 h-5 text-primary" />
          Add New Video
        </DialogTitle>
        <DialogDescription className="text-left pt-2">
          Paste a URL from a supported platform. The system will automatically
          fetch the details.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4 pt-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="url"
              placeholder="Paste video URL here (YouTube, Vimeo, etc.)"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="pl-10 bg-background/50 border-border/50 focus:border-primary"
            />
          </div>
          <Button
            type="submit"
            disabled={!videoUrl.trim() || isLoading}
            className="retro-3d-button min-w-[120px] bg-transparent hover:bg-transparent"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Processing...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Video
              </div>
            )}
          </Button>
        </div>
      </form>
    </>
  );
};

export default VideoUpload;
