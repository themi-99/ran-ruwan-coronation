import celestialHourglass from "@/assets/celestial-hourglass.png";

const CalculatingStage = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-8 animate-fade-in relative">
    {/* Celestial hourglass */}
    <img
      src={celestialHourglass}
      alt="Celestial vote-counting device"
      className="w-48 h-auto md:w-64 drop-shadow-[0_0_30px_hsl(43_76%_52%_/_0.4)]"
      style={{ animation: "float 4s ease-in-out infinite" }}
      width={768}
      height={1024}
    />

    <div className="space-y-4">
      <h2
        className="text-3xl md:text-5xl font-heading font-black uppercase gold-text-gradient tracking-wide"
        style={{ filter: "drop-shadow(0 0 20px hsl(43 76% 52% / 0.4))" }}
      >
        The spirits are tallying<br />the votes...
      </h2>
      <p className="text-lg md:text-xl font-body text-foreground/80 max-w-md mx-auto leading-relaxed"
        style={{ animation: "pulse-gold 3s ease-in-out infinite" }}
      >
        Winners being selected! Stay tuned. 🎊
      </p>
    </div>

    <div className="flex gap-4">
      {["🌺", "✨", "🪷", "✨", "🌺"].map((e, i) => (
        <span key={i} className="text-3xl" style={{ animation: `float ${2 + i * 0.3}s ease-in-out infinite` }}>{e}</span>
      ))}
    </div>

    <div className="w-64 h-1 rounded-full gold-gradient shimmer" />
  </div>
);

export default CalculatingStage;
