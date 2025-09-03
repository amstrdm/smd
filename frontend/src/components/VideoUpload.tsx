import { useState } from "react";
import { Upload, Link, Plus } from "lucide-react";
import { AxiosError } from "axios"; // Import AxiosError for better type checking
import { Button } from "./ui/button";
import { useToast } from "../hooks/use-toast";
import { Input } from "./ui/input";
import { DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import Glitter from "./ui/glitter";
import api from "../lib/api";

const VideoUpload = ({ onUploadSuccess }: { onUploadSuccess?: () => void }) => {
  const [videoUrl, setVideoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showGlitter, setShowGlitter] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim()) return;

    setIsLoading(true);

    try {
      await api.post("/upload", { url: videoUrl }); // Using 'url' as fixed before

      // --- Success ---
      toast({
        title: "Video Added Successfully!",
        description: "Your video is now in the collection.",
      });

      setShowGlitter(true);
      setTimeout(() => setShowGlitter(false), 2500);

      setVideoUrl("");
      onUploadSuccess?.();
    } catch (error) {
      console.error("Upload failed:", error);

      let title = "Upload Failed";
      let description = "An unexpected error occurred.";

      // Check if the error is an Axios error with a response from the server
      if (error instanceof AxiosError && error.response) {
        const status = error.response.status;
        const responseData = error.response.data;

        // Set a more specific title with the status code
        title = `Error: ${status}`;

        // Extract the detail message from the FastAPI response body
        if (responseData && responseData.detail) {
          // Handles FastAPI validation errors (which are arrays of objects)
          if (
            Array.isArray(responseData.detail) &&
            responseData.detail[0]?.msg
          ) {
            description = responseData.detail[0].msg;
          }
          // Handles simple string detail messages
          else if (typeof responseData.detail === "string") {
            description = responseData.detail;
          }
        }
      } else if (error instanceof Error) {
        // Handles network errors where there is no response from the server
        description = error.message;
      }

      toast({
        title: title,
        description: description,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ... the rest of your JSX remains exactly the same
  return (
    <>
      <DialogHeader>
        {showGlitter && <Glitter />}
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
        {/* ...form JSX... */}
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
