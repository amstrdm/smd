import sonicPixel from "../assets/fortnite-dance-sonic.gif";
import { Button } from "./ui/button";
import { Plus, Settings } from "lucide-react";

// No changes to props
type HeaderProps = {
  onUploadClick: () => void;
  onSettingsClick: () => void;
};

const Header = ({ onUploadClick, onSettingsClick }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 flex h-20 items-center border-b border-border/50 bg-card">
      <div className="container grid w-full grid-cols-3 items-center px-4">
        {/* Left Column: Settings Button (Updated) */}
        <div className="justify-self-start">
          <Button
            onClick={onSettingsClick}
            className="retro-3d-button bg-transparent hover:bg-transparent"
          >
            <Settings className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
        </div>

        {/* Center Column: Logo */}
        <div className="relative flex items-center justify-self-center">
          <a href="/" className="text-decoration-none">
            <div className="retro-title text-5xl leading-tight">SMD</div>
          </a>
          <img
            src={sonicPixel}
            alt="Pixelated Sonic"
            className="pixelated absolute -right-4 bottom-11 h-10 w-10"
            style={{ transform: "translateY(25%)" }}
          />
        </div>

        {/* Right Column: Add Video Button */}
        <div className="justify-self-end">
          <Button
            onClick={onUploadClick}
            className="retro-3d-button bg-transparent hover:bg-transparent"
          >
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Add Video</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
