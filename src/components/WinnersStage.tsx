import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import avuruduFamily from "@/assets/avurudu-family.jpg";

interface Winner {
  nic: string;
  full_name: string;
  photo_urls: string[] | null;
  votes: number;
}

const WinnersStage = () => {
  const [kumara, setKumara] = useState<Winner | null>(null);
  const [kumariya, setKumariya] = useState<Winner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchWinners(); }, []);

  const fetchWinners = async () => {
    const { data: votes } = await supabase.from("votes").select("*");
    const { data: contestants } = await supabase.from("contestants").select("*");
    const { data: profiles } = await supabase.from("profiles").select("nic, full_name, gender");
    if (!votes || !contestants || !profiles) { setLoading(false); return; }

    const getWinner = (category: string): Winner | null => {
      const catVotes = votes.filter((v) => v.category === category);
      const counts: Record<string, number> = {};
      catVotes.forEach((v) => { if (v.candidate_nic) counts[v.candidate_nic] = (counts[v.candidate_nic] || 0) + 1; });
      const topNic = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
      if (!topNic) return null;
      const profile = profiles.find((p) => p.nic === topNic[0]);
      const contestant = contestants.find((c) => c.nic === topNic[0]);
      return { nic: topNic[0], full_name: profile?.full_name || "Unknown", photo_urls: contestant?.photo_urls || null, votes: topNic[1] };
    };

    setKumara(getWinner("kumara"));
    setKumariya(getWinner("kumariya"));
    setLoading(false);
  };

  if (loading) return <div className="text-center py-10 text-muted-foreground font-body">Loading winners...</div>;

  return (
    <div className="space-y-10 animate-fade-in relative">
      {/* Festive background image */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-64 h-40 opacity-15 pointer-events-none">
        <img src={avuruduFamily} alt="" className="w-full h-full object-contain" />
      </div>

      <div className="text-center space-y-4 relative">
        <div className="text-6xl" style={{ animation: "crown-entrance 1s ease-out forwards" }}>👑</div>

        <p className="uppercase tracking-[0.3em] text-xs font-body font-medium text-cream/70">
          The votes are in. Behold your champions!
        </p>

        <h2
          className="text-4xl md:text-6xl font-heading font-black uppercase gold-text-gradient tracking-wide leading-tight"
          style={{ filter: "drop-shadow(0 0 30px hsl(43 76% 52% / 0.5))" }}
        >
          Ran Ruwan<br />Awurudu Abhiman
        </h2>

        <p className="font-heading font-bold text-2xl md:text-3xl uppercase tracking-[0.5em] gold-text-gradient">
          2026
        </p>

        <p className="font-heading italic text-lg md:text-xl text-white/90 tracking-wide">
          Swarna Kumara &amp; Kumariya
        </p>

        <div className="flex justify-center gap-3">
          {["🎆", "🎇", "✨", "🎇", "🎆"].map((e, i) => (
            <span key={i} className="text-2xl" style={{ animation: `float ${2 + i * 0.3}s ease-in-out infinite` }}>{e}</span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <WinnerCard title="Swarna Kumara" winner={kumara} emoji="🤴" />
        <WinnerCard title="Swarna Kumariya" winner={kumariya} emoji="👸" />
      </div>
    </div>
  );
};

const WinnerCard = ({ title, winner, emoji }: { title: string; winner: Winner | null; emoji: string }) => (
  <div className="bg-card/80 backdrop-blur-sm rounded-xl overflow-hidden gold-border card-glow text-center relative">
    <div className="absolute inset-0 shimmer pointer-events-none" />
    {winner ? (
      <>
        {winner.photo_urls?.[0] && (
          <div className="aspect-[3/4] overflow-hidden">
            <img src={winner.photo_urls[0]} alt={winner.full_name} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-8 space-y-4 relative">
          <div className="text-5xl">{emoji}</div>
          <h3 className="text-lg font-heading font-semibold uppercase tracking-[0.2em] text-gold">{title}</h3>
          <p
            className="text-3xl md:text-4xl font-heading font-black gold-text-gradient leading-tight"
            style={{ filter: "drop-shadow(0 0 20px hsl(43 76% 52% / 0.4))" }}
          >
            {winner.full_name}
          </p>
          <p className="text-muted-foreground font-body text-sm uppercase tracking-widest">{winner.votes} votes</p>
          <div className="flex justify-center gap-2">
            {["🎊", "✨", "🌟", "✨", "🎊"].map((e, i) => (
              <span key={i} className="text-lg">{e}</span>
            ))}
          </div>
        </div>
      </>
    ) : (
      <div className="p-12 space-y-4">
        <div className="text-5xl">{emoji}</div>
        <h3 className="text-lg font-heading font-semibold uppercase tracking-[0.2em] text-gold">{title}</h3>
        <p className="text-muted-foreground font-body">No winner determined yet</p>
      </div>
    )}
  </div>
);

export default WinnersStage;
