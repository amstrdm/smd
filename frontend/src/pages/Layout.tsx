import { useState } from "react";
import { Outlet } from "react-router-dom"; // Import Outlet
import Header from "../components/Header";
import VideoUpload from "../components/VideoUpload";
import { Dialog, DialogContent } from "../components/ui/dialog";

const Layout = () => {
  // Renamed from Index
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background crt-scanlines">
      <Header onUploadClick={() => setIsUploadModalOpen(true)} />

      {/* Main content now renders the active route */}
      <main className="container py-8">
        <Outlet /> {/* VideoGrid will be rendered here by the router */}
      </main>

      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="bg-card/80 backdrop-blur-sm border-border/50">
          <VideoUpload onUploadSuccess={() => setIsUploadModalOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-border/50">
        <div className="text-center text-muted-foreground text-sm">
          <p>&gt; SMD - Sonic Media Displayer v1.0</p>
          <p className="mt-1 justify-center max-w-xl mx-auto">
            Sonic don’t diversify your portfolio with derivatives to shield
            against downside risk while speculating on the Large Swine futures
            market!
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
