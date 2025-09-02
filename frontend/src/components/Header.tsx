import sonicPixel from "../assets/fortnite-dance-sonic.gif";

const Header = () => {
  return (
    <header className="w-full py-8 mb-12 text-center">
      <div className="container mx-auto px-4">
        {/* ASCII Art Logo */}
        <div className="retro-title text-center mb-4 leading-tight">SMD!</div>

        <div className="flex items-center justify-center gap-4 mb-6">
          <img
            src={sonicPixel}
            alt="Pixelated Sonic"
            className="pixelated animate-pixel-bounce w-16 h-16"
          />
          <div className="text-center">
            <h1 className="text-xl md:text-2xl font-bold text-primary">
              Super Media Displayer
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              &gt; Upload, browse, and preview your favorite videos
            </p>
          </div>
          <img
            src={sonicPixel}
            alt="Pixelated Sonic"
            className="pixelated animate-pixel-bounce w-16 h-16 scale-x-[-1]"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
      </div>
    </header>
  );
};

export default Header;
