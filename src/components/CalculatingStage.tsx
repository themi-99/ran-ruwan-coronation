import sunFace from "@/assets/sun-face.jpg";

const CalculatingStage = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-8 animate-fade-in relative">
    {/* Decorative sun */}
    <img src={sunFace} alt="" className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 opacity-20"
      style={{ animation: "float 4s ease-in-out infinite" }} />

    <div className="text-7xl" style={{ animation: "float 3s ease-in-out infinite" }}>🪔</div>

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
