interface Props {
  maleVotesCast: number;
  femaleVotesCast: number;
  limit: number;
  activeCategory?: "kumara" | "kumariya";
}

const JudgeBallotCounter = ({ maleVotesCast, femaleVotesCast, limit, activeCategory }: Props) => {
  const cast = activeCategory === "kumariya" ? femaleVotesCast : maleVotesCast;
  const label = activeCategory === "kumariya" ? "Swarna Kumariya" : "Swarna Kumara";
  const progress = (cast / limit) * 100;
  const isFull = cast >= limit;

  return (
    <div className="relative bg-white/5 backdrop-blur-xl border border-gold/30 rounded-2xl p-5 md:p-6 overflow-hidden">
      <div className="absolute inset-0 rounded-2xl border border-gold/10 pointer-events-none" />

      <div className="flex items-center justify-center gap-2 mb-4">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold/60" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gold" />
        </span>
        <h3
          className="text-lg md:text-xl font-heading font-bold gold-text-gradient uppercase tracking-widest"
          style={{ filter: "drop-shadow(0 0 10px hsl(43 76% 52% / 0.3))" }}
        >
          ⚖️ Judge's Ballot
        </h3>
      </div>

      <div className="text-center space-y-2">
        <p className="text-xs font-heading text-foreground/70 uppercase tracking-wide">
          👑 {label}
        </p>
        <p className="text-3xl md:text-4xl font-heading font-black gold-text-gradient tabular-nums"
          style={{ filter: "drop-shadow(0 0 8px hsl(43 76% 52% / 0.3))" }}>
          {cast}<span className="text-foreground/40 text-lg">/{limit}</span>
        </p>
        <div className="h-1.5 bg-foreground/10 rounded-full overflow-hidden mx-auto max-w-[160px]">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isFull ? "bg-green-500" : "gold-gradient"}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[10px] text-foreground/50 font-body">
          {isFull ? "✅ Complete" : `${limit - cast} remaining`}
        </p>
      </div>
    </div>
  );
};

export default JudgeBallotCounter;
