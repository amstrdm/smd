import React, { useState } from "react";
import { useSettings } from "../contexts/SettingsContext";
import { useToast } from "../hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Settings, Server, Save } from "lucide-react"; // Import new icons

const SettingsDialog = () => {
  const { serverUrl, setServerUrl, isSettingsOpen, setIsSettingsOpen } =
    useSettings();
  const [localUrl, setLocalUrl] = useState(serverUrl);
  const { toast } = useToast();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page reload on form submission
    setServerUrl(localUrl);
    setIsSettingsOpen(false);
    toast({
      title: "Settings Saved",
      description: "The API server URL has been updated.",
    });
    // Optional: Reload the page to reflect changes immediately
    window.location.reload();
  };

  return (
    <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
      <DialogContent className="sm:max-w-[525px] border-border/50 bg-card/80 backdrop-blur-sm">
        {/* Header styled like VideoUpload */}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <span className="text-primary">&gt;</span>
            <Settings className="h-5 w-5 text-primary" />
            Server Settings
          </DialogTitle>
          <DialogDescription className="pt-2 text-left">
            Enter the base URL of the API server you want to connect to. Changes
            will require a page reload.
          </DialogDescription>
        </DialogHeader>

        {/* Form styled like VideoUpload */}
        <form onSubmit={handleSave} className="space-y-4 pt-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Server className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                id="server-url"
                value={localUrl}
                onChange={(e) => setLocalUrl(e.target.value)}
                className="border-border/50 bg-background/50 pl-10 focus:border-primary"
                placeholder="e.g., http://127.0.0.1:8000"
              />
            </div>
            <Button
              type="submit"
              className="retro-3d-button min-w-[150px] bg-transparent hover:bg-transparent"
            >
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </div>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
