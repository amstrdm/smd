import { useState, useEffect, useRef } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import sonicPixel from "../assets/fortnite-dance-sonic.gif";
import spinningRing from "../assets/spinning-ring.gif";
import staticRing from "../assets/static-ring.png";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Plus, Settings, XCircle } from "lucide-react"; // Import XCircle icon

type HeaderProps = {
  onUploadClick: () => void;
  onSettingsClick: () => void;
};

const Header = ({ onUploadClick, onSettingsClick }: HeaderProps) => {
  const navigate = useNavigate();
  const { query: urlQuery } = useParams<{ query?: string }>();
  const [searchQuery, setSearchQuery] = useState(urlQuery || "");
  const searchInputRef = useRef<HTMLInputElement>(null); // Create a ref for the input

  useEffect(() => {
    setSearchQuery(urlQuery || "");
  }, [urlQuery]);

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      navigate(`/search/${trimmedQuery}`);
    }
  };

  // Function to clear the search and re-focus the input
  const handleClearSearch = () => {
    setSearchQuery("");
    searchInputRef.current?.focus();
  };

  // Handle key presses in the input, specifically the Escape key
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      handleClearSearch();
    }
  };

  return (
    <header className="sticky top-0 z-50 flex h-20 items-center border-b border-border/50 bg-card">
      <div className="container flex w-full items-center justify-between gap-4 px-4">
        {/* Left Side: Logo (unchanged) */}
        {/* ... */}
        <div className="relative flex items-center">
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

        {/* Center: The Interactive Search Bar */}
        <div className="hidden flex-1 justify-center px-4 sm:flex">
          <form
            onSubmit={handleSearchSubmit}
            className="group relative w-full max-w-md"
          >
            <div className="sonic-search-icon-container">
              <img src={staticRing} alt="" className="ring-static" />
              <img src={spinningRing} alt="" className="ring-spinning" />
            </div>

            <Input
              ref={searchInputRef} // Attach the ref here
              type="text"
              placeholder="Find a new zone..."
              className="sonic-search-bar h-11"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown} // Add the keydown handler
            />

            {/* 👇 The new clear button, only shows when there is text */}
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="search-clear-button"
                aria-label="Clear search"
              >
                <XCircle className="h-5 w-5" />
              </button>
            )}
          </form>
        </div>

        {/* Right Side: Action Buttons (unchanged) */}
        {/* ... */}
        <div className="flex items-center gap-2">
          <Button
            onClick={onSettingsClick}
            className="retro-3d-button bg-transparent hover:bg-transparent"
          >
            <Settings className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
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
