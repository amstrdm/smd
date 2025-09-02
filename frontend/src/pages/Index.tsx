import Header from "../components/Header";
import VideoUpload from "../components/VideoUpload";
import VideoGrid from "../components/VideoGrid";

const Index = () => {
  return (
    <div className="min-h-screen bg-background crt-scanlines">
      <Header />
      <VideoUpload />
      <VideoGrid />

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16 border-t border-border/50">
        <div className="text-center text-muted-foreground text-sm">
          <p>&gt; SMD - Super Media Displayer v1.0</p>
          <p className="mt-1">Built with retro vibes and modern tech</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
