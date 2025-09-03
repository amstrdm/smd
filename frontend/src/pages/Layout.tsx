import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import VideoUpload from "../components/VideoUpload";
import SettingsDialog from "../components/SettingsDialog"; // Import the new dialog
import { Dialog, DialogContent } from "../components/ui/dialog";
import { useSettings } from "../contexts/SettingsContext"; // Import the hook

const Layout = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { setIsSettingsOpen } = useSettings(); // Get the setter from context

  return (
    <div className="min-h-screen bg-background crt-scanlines">
      <Header
        onUploadClick={() => setIsUploadModalOpen(true)}
        onSettingsClick={() => setIsSettingsOpen(true)} // Wire up the settings button
      />
      <main className="container py-8">
        <Outlet />
      </main>
      {/* Upload Dialog */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="bg-card/80 backdrop-blur-sm border-border/50">
          <VideoUpload onUploadSuccess={() => setIsUploadModalOpen(false)} />
        </DialogContent>
      </Dialog>
      {/* Settings Dialog */}
      <SettingsDialog /> {/* Render the settings dialog */}
      <footer className="container mx-auto px-4 py-8 border-t border-border/50">
        {/* ... footer content ... */}
      </footer>
    </div>
  );
};

export default Layout;
