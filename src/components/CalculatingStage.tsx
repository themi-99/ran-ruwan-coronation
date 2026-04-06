import sunFace from "@/assets/sun-face.jpg";
import Fireworks from "@/components/Fireworks";

const CalculatingStage = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6 animate-fade-in relative">
    {/* Decorative sun */}
    <img src={sunFace} alt="" className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 opacity-20"
      style={{ animation: "float 4s ease-in-out infinite" }} />

    <div className="text-6xl" style={{ animation: "float 3s ease-in-out infinite" }}>🪔</div>
    <h2 className="text-3xl md:text-4xl font-heading font-bold gold-text-gradient">
      The spirits are tallying the votes...
    </h2>
    <p className="text-xl text-muted-foreground max-w-md">
      Winners being selected! Stay tuned. 🎊
    </p>
    <div className="flex gap-3">
      {["🌺", "✨", "🪷", "✨", "🌺"].map((e, i) => (
        <span key={i} className="text-2xl" style={{ animation: `float ${2 + i * 0.3}s ease-in-out infinite` }}>{e}</span>
      ))}
    </div>
    <div className="w-48 h-1 rounded-full gold-gradient shimmer" />
  </div>
);

export default CalculatingStage;
