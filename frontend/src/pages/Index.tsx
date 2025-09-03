import { useState } from "react";
import Header from "../components/Header";
import VideoUpload from "../components/VideoUpload";
import VideoGrid from "../components/VideoGrid";
import { Dialog, DialogContent } from "../components/ui/dialog";

const Index = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background crt-scanlines">
      <Header onUploadClick={() => setIsUploadModalOpen(true)} />

      {/* Main content wrapper with top padding */}
      <main className="container py-8">
        <VideoGrid />
      </main>

      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="bg-card/80 backdrop-blur-sm border-border/50">
          <VideoUpload onUploadSuccess={() => setIsUploadModalOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-border/50">
        <div className="text-center text-muted-foreground text-sm">
          <p>&gt; SMD - Super Media Displayer v1.0</p>
          <p className="mt-1">Built with retro vibes and modern tech</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
