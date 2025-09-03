import sonicPixel from "../assets/fortnite-dance-sonic.gif";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";

const Header = ({ onUploadClick }: { onUploadClick: () => void }) => {
  return (
    <header className="sticky top-0 z-50 flex h-20 items-center border-b border-border/50 bg-card">
      <div className="container grid w-full grid-cols-3 items-center px-4">
        {/* Left Column: Kept empty for spacing */}
        <div className="justify-self-start"></div>

        {/* Center Column: The logo group with absolute positioning for Sonic */}
        {/* CHANGE: Added a relative wrapper for SMD! and Sonic to allow absolute positioning */}
        <div className="relative flex items-center justify-self-center">
          <a href="/" className="text-decoration-none">
            {/* CHANGE: Added back the '!' */}
            <div className="retro-title text-5xl leading-tight">SMD</div>
          </a>
          <img
            src={sonicPixel}
            alt="Pixelated Sonic"
            // CHANGE: Absolute positioning for Sonic
            className="pixelated w-10 h-10 absolute bottom-11 -right-4" // Adjusted `right` for overlap
            style={{ transform: "translateY(25%)" }} // Fine-tune vertical position
          />
        </div>

        {/* Right Column: The action button */}
        <div className="justify-self-end">
          <Button
            onClick={onUploadClick}
            className="retro-3d-button bg-transparent hover:bg-transparent"
          >
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Add Video</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
